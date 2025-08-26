import { GoogleGenerativeAI } from '@google/generative-ai'
import multiparty from 'multiparty'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY)

export default defineEventHandler(async (event) => {
  // Check if API key is available
  if (!process.env.GEMINI_API_KEY && !process.env.NUXT_GEMINI_API_KEY) {
    setResponseStatus(event, 400)
    return 'Error: Gemini API key not configured. Please set GEMINI_API_KEY environment variable.'
  }

  return new Promise((resolve, reject) => {
    const form = new multiparty.Form()
    
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        console.error('Multiparty error:', err)
        resolve(createResponse(event, 'Error parsing form data', 400))
        return
      }

      try {
        const audioFile = files.audio?.[0]
        if (!audioFile) {
          resolve(createResponse(event, 'No audio file provided', 400))
          return
        }

        console.log('Processing audio file:', audioFile.originalFilename)

        // Read the audio file
        const audioBuffer = fs.readFileSync(audioFile.path)
        const audioBase64 = audioBuffer.toString('base64')

        // Create the AI prompt for audio analysis
        const prompt = `You are a friendly, expert Sales Call Analysis Assistant. You will accept either:
  • an audio attachment (voice note) which you must first transcribe, OR
  • a plain text transcript.

For audio: transcribe the speech to text first, detect language (English, Tamil, or Hindi), produce a confident transcript and then analyze it. If transcription is uncertain, include an estimated transcription confidence (0–1).

Then produce TWO outputs:
  A) A machine-readable JSON object (see schema below). This is the primary output and must be valid JSON only (no extra commentary).
  B) A human-friendly textual report (friendly coach tone) summarizing key points for display in UI.

Analysis requirements (apply in both cases):
1. Create an **Overall Effectiveness Score (0–100)** and break it down into four category scores that sum to 100:
   - Rapport Building (0–25)
   - Product Knowledge (0–25)
   - Objection Handling (0–25)
   - Closing Techniques / Next Steps (0–25)

   For each category include:
   - numeric score,
   - short justification (1–2 sentences),
   - at least one concrete example/quote or approximate timestamp from the transcript (if audio provided).

2. Identify **Top 4 Strengths** (short bullet list) — what the agent did well, with transcript excerpts or timestamps.

3. Identify **Top 6 Areas for Improvement** (short bullet list) — specific missed opportunities or weak spots, with excerpts.

4. Provide **Actionable Recommendations** (3–6 items) prioritized (High / Medium / Low). Each recommendation should be precise (what to say/do) and why it helps.

5. Extract **Top Keywords / Phrases** (5–10) from the transcript relevant to sales (product features, objections, next steps).

6. Provide **Suggested Next Steps** to move the deal forward (e.g., send proposal, schedule demo, pricing follow-up), with a recommended time window.

7. Provide an estimated **Confidence Score (0–1)** for the analysis based on transcript quality and audio clarity.

Output formatting:
• First output must be valid JSON exactly matching the schema below.
• After the JSON, output a human-friendly report (natural language) in a friendly, encouraging tone — suitable for showing to the sales agent.

JSON schema (fields required):
{
  "callId": string|null,
  "salesAgentName": string|null,
  "language": string,
  "transcript": string,
  "transcriptionConfidence": number,           // 0–1, null if not applicable
  "overallScore": number,                      // 0–100
  "categoryScores": {
    "rapportBuilding": { "score": number, "justification": string, "example": string },
    "productKnowledge": { "score": number, "justification": string, "example": string },
    "objectionHandling": { "score": number, "justification": string, "example": string },
    "closingTechniques": { "score": number, "justification": string, "example": string }
  },
  "strengths": [ { "point": string, "evidence": string } ],
  "improvements": [ { "point": string, "evidence": string } ],
  "recommendations": [ { "priority": "High|Medium|Low", "text": string } ],
  "keywords": [ string ],
  "suggestedNextSteps": [ { "text": string, "timeframe": string } ],
  "analysisConfidence": number,                // 0–1
  "notes": string|null
}

Rules & style:
• Keep JSON concise but complete. After delivering JSON, also provide the friendly report with examples and actionable coaching.
• Use timestamps in evidence when audio available (e.g., "[02:10]" or "approx 2:10"). If audio timestamps aren't available, use transcript snippets as evidence.
• Tone: supportive, non-judgmental, coach-like.
• When giving examples, wrap transcript quotes in double quotes.

Please analyze the following audio file:`

        // Determine MIME type from file extension or original filename
        const mimeType = getMimeType(audioFile.originalFilename || 'audio.webm')
        
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          }
        ])

        const response = await result.response
        const text = response.text()

        console.log('AI Response received, length:', text.length)

        // Clean up temporary file
        fs.unlinkSync(audioFile.path)

        // Set appropriate headers
        setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
        resolve(text)

      } catch (error) {
        console.error('Audio analysis error:', error)
        
        // Clean up any temporary files
        if (files.audio?.[0]?.path) {
          try {
            fs.unlinkSync(files.audio[0].path)
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError)
          }
        }

        // Handle specific error types
        let errorMessage = `Analysis failed: ${error.message}`
        let statusCode = 500

        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
          errorMessage = 'API quota exceeded. The free tier limit has been reached. Please wait a few minutes and try again, or consider upgrading to a paid plan.'
          statusCode = 429
        } else if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your Gemini API key configuration.'
          statusCode = 401
        }

        resolve(createResponse(event, errorMessage, statusCode))
      }
    })
  })
})

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac'
  }
  return mimeTypes[ext] || 'audio/webm'
}

function createResponse(event, message, status = 200) {
  setResponseStatus(event, status)
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return message
}