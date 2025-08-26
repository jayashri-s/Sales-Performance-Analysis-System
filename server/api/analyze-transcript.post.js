import OpenAI from "openai";

// Local analysis functions
const analyzeTranscriptLocally = (transcript) => {
  const analysis = {
    strengths: [],
    improvements: [],
    metrics: {},
    recommendations: []
  }

  const lowerTranscript = transcript.toLowerCase()

  // Analyze strengths
  if (lowerTranscript.includes('value proposition')) {
    analysis.strengths.push('Clearly communicated value propositions')
  }
  if (lowerTranscript.includes('reassured') || lowerTranscript.includes('addressed concerns')) {
    analysis.strengths.push('Effectively handled customer concerns')
  }
  if (lowerTranscript.includes('flexible') || lowerTranscript.includes('customizable')) {
    analysis.strengths.push('Highlighted product flexibility')
  }
  if (lowerTranscript.includes('timeline') || lowerTranscript.includes('plan')) {
    analysis.strengths.push('Provided clear implementation timeline')
  }
  if (lowerTranscript.includes('demo') || lowerTranscript.includes('demonstration')) {
    analysis.strengths.push('Scheduled product demonstration')
  }

  // Analyze areas for improvement
  if (!lowerTranscript.includes('budget') && !lowerTranscript.includes('pricing')) {
    analysis.improvements.push('Discuss budget constraints early')
  }
  if (!lowerTranscript.includes('competitor') && !lowerTranscript.includes('alternative')) {
    analysis.improvements.push('Address competitive differentiation')
  }
  if (!lowerTranscript.includes('success') && !lowerTranscript.includes('case study')) {
    analysis.improvements.push('Include customer success stories')
  }

  // Extract metrics
  const words = transcript.split(' ')
  analysis.metrics.wordCount = words.length
  analysis.metrics.sentenceCount = transcript.split(/[.!?]/).filter(s => s.trim()).length
  analysis.metrics.avgWordsPerSentence = Math.round(analysis.metrics.wordCount / analysis.metrics.sentenceCount)

  // Key phrase detection
  const keyPhrases = {
    'product_features': ['features', 'functionality', 'capabilities', 'support'],
    'customer_concerns': ['concerns', 'worried', 'questions', 'issues'],
    'closing_attempts': ['next step', 'move forward', 'proceed', 'decision'],
    'relationship_building': ['understand', 'appreciate', 'help', 'assist']
  }

  Object.entries(keyPhrases).forEach(([category, phrases]) => {
    const count = phrases.reduce((acc, phrase) => {
      return acc + (lowerTranscript.match(new RegExp(phrase, 'g')) || []).length
    }, 0)
    analysis.metrics[category] = count
  })

  // Generate recommendations
  if (analysis.metrics.product_features < 3) {
    analysis.recommendations.push('Emphasize more product features and benefits')
  }
  if (analysis.metrics.closing_attempts < 1) {
    analysis.recommendations.push('Include clear call-to-action and next steps')
  }
  if (analysis.metrics.relationship_building < 2) {
    analysis.recommendations.push('Build stronger rapport with the customer')
  }
  if (analysis.metrics.avgWordsPerSentence > 20) {
    analysis.recommendations.push('Use shorter, clearer sentences for better comprehension')
  }

  // Calculate effectiveness score
  let score = 50
  score += analysis.strengths.length * 10
  score -= analysis.improvements.length * 5
  score += Math.min(analysis.metrics.product_features * 5, 20)
  score += Math.min(analysis.metrics.closing_attempts * 10, 20)
  score = Math.min(Math.max(score, 0), 100)

  analysis.effectivenessScore = score

  return analysis
}

const formatLocalAnalysis = (analysis) => {
  let formatted = `SALES CALL ANALYSIS REPORT\n`
  formatted += `${'='.repeat(50)}\n\n`
  
  formatted += `Effectiveness Score: ${analysis.effectivenessScore}/100\n\n`
  
  if (analysis.strengths.length > 0) {
    formatted += `STRENGTHS IDENTIFIED:\n`
    analysis.strengths.forEach(s => {
      formatted += `✓ ${s}\n`
    })
    formatted += '\n'
  }
  
  if (analysis.improvements.length > 0) {
    formatted += `AREAS FOR IMPROVEMENT:\n`
    analysis.improvements.forEach(i => {
      formatted += `• ${i}\n`
    })
    formatted += '\n'
  }
  
  formatted += `CALL METRICS:\n`
  formatted += `• Word Count: ${analysis.metrics.wordCount}\n`
  formatted += `• Average Sentence Length: ${analysis.metrics.avgWordsPerSentence} words\n`
  formatted += `• Product Features Mentioned: ${analysis.metrics.product_features}\n`
  formatted += `• Closing Attempts: ${analysis.metrics.closing_attempts}\n`
  formatted += `• Relationship Building Phrases: ${analysis.metrics.relationship_building}\n\n`
  
  if (analysis.recommendations.length > 0) {
    formatted += `RECOMMENDATIONS:\n`
    analysis.recommendations.forEach((r, i) => {
      formatted += `${i + 1}. ${r}\n`
    })
  }
  
  return formatted
}

const apiKey = process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
}) : null;

async function generateCallAnalysisWithGemini(callTranscript) {
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
• Use timestamps in evidence when audio available (e.g., "[02:10]" or "approx 2:10"). If audio timestamps aren’t available, use transcript snippets as evidence.
• Tone: supportive, non-judgmental, coach-like.
• When giving examples, wrap transcript quotes in double quotes.  

Here is the transcript to analyze:  

${callTranscript}
`;

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash-exp",
    messages: [
      { role: "system", content: "You are a helpful sales assistant." },
      { role: "user", content: prompt }
    ]
  });
  console.log(response.choices[0].message.content);

  return response.choices[0].message.content;
}

export default defineEventHandler(async (event) => {
  let transcript;
  try {
    const body = await readBody(event);
    transcript = body.transcript;
    
    if (!transcript) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transcript is required'
      });
    }

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, using local analysis');
      const localAnalysis = analyzeTranscriptLocally(transcript);
      const formattedAnalysis = formatLocalAnalysis(localAnalysis);
      
      return {
        analysis: `${formattedAnalysis}

Note: This analysis was generated using local algorithms. 
For AI-powered analysis:
1. Get a Gemini API key from Google AI Studio
2. Add NUXT_GEMINI_API_KEY=your_key to your .env file
3. Restart the development server`,
        isLocal: true
      };
    }
    console.log('Using AI analysis');

    const analysis = await generateCallAnalysisWithGemini(transcript);
    
    return {
      analysis
    };
  } catch (error) {
    console.error('Analysis error:', error);
    
    if (error.message?.includes('API key')) {
      // Fallback to local analysis on API key error
      const localAnalysis = analyzeTranscriptLocally(transcript);
      const formattedAnalysis = formatLocalAnalysis(localAnalysis);
      
      return {
        analysis: `${formattedAnalysis}

Note: AI analysis failed, using local analysis instead.
Error: ${error.message}`,
        isLocal: true,
        error: error.message
      };
    }
    
    // For other errors, also fallback to local analysis
    try {
      if (transcript) {
        const localAnalysis = analyzeTranscriptLocally(transcript);
        const formattedAnalysis = formatLocalAnalysis(localAnalysis);
        
        return {
          analysis: `${formattedAnalysis}

Note: AI analysis failed, using local analysis instead.
Error: ${error.message}`,
          isLocal: true,
          error: error.message
        };
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'Transcript is required'
        });
      }
    } catch (fallbackError) {
      throw createError({
        statusCode: 500,
        statusMessage: `Both AI and local analysis failed: ${error.message}`
      });
    }
  }
});