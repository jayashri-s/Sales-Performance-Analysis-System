import multiparty from 'multiparty'
import fs from 'fs'

export default defineEventHandler(async (event) => {
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

        console.log('Processing demo audio analysis for:', audioFile.originalFilename)

        // Clean up temporary file
        fs.unlinkSync(audioFile.path)

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Return demo analysis result
        const demoAnalysis = `{
  "callId": "demo_${Date.now()}",
  "salesAgentName": "Demo Agent",
  "language": "English",
  "transcript": "This is a demo transcript. The sales call analysis feature is working correctly, but using demo data due to API quota limits.",
  "transcriptionConfidence": 0.95,
  "overallScore": 78,
  "categoryScores": {
    "rapportBuilding": {
      "score": 20,
      "justification": "Agent demonstrated good listening skills and built connection with customer.",
      "example": "Great opening with warm greeting and personal connection"
    },
    "productKnowledge": {
      "score": 18,
      "justification": "Solid understanding of product features, could provide more technical details.",
      "example": "Explained key benefits clearly but missed advanced features"
    },
    "objectionHandling": {
      "score": 19,
      "justification": "Addressed customer concerns effectively with empathy.",
      "example": "Acknowledged pricing concern and provided value justification"
    },
    "closingTechniques": {
      "score": 21,
      "justification": "Strong close with clear next steps and urgency.",
      "example": "Proposed clear timeline and follow-up actions"
    }
  },
  "strengths": [
    {"point": "Excellent active listening", "evidence": "Paraphrased customer needs accurately"},
    {"point": "Clear value proposition", "evidence": "Connected features to customer benefits"},
    {"point": "Professional tone", "evidence": "Maintained confidence throughout call"},
    {"point": "Good follow-up plan", "evidence": "Scheduled concrete next meeting"}
  ],
  "improvements": [
    {"point": "Discovery questions", "evidence": "Could have asked more qualifying questions"},
    {"point": "Product demos", "evidence": "Missed opportunity to show visual demonstration"},
    {"point": "Competitor comparison", "evidence": "Didn't address competitive concerns"},
    {"point": "ROI calculation", "evidence": "Could have provided specific cost savings"},
    {"point": "Urgency creation", "evidence": "Limited time-sensitive incentives offered"},
    {"point": "Reference stories", "evidence": "Few customer success stories shared"}
  ],
  "recommendations": [
    {"priority": "High", "text": "Implement discovery framework (SPIN/BANT) for better qualification"},
    {"priority": "High", "text": "Prepare interactive product demonstrations for visual learners"},
    {"priority": "Medium", "text": "Develop competitive comparison sheets"},
    {"priority": "Medium", "text": "Create ROI calculator tool for customer meetings"},
    {"priority": "Low", "text": "Build library of customer success stories by industry"}
  ],
  "keywords": ["product demo", "pricing", "value proposition", "next steps", "timeline"],
  "suggestedNextSteps": [
    {"text": "Send personalized proposal with pricing options", "timeframe": "Within 24 hours"},
    {"text": "Schedule product demonstration", "timeframe": "Within 3 days"},
    {"text": "Provide customer references", "timeframe": "Within 1 week"}
  ],
  "analysisConfidence": 0.85,
  "notes": "Demo analysis - replace with actual AI analysis when API quota is available"
}

---

## 📊 Sales Call Analysis Report

**Overall Performance: 78/100** - Good performance with room for improvement

### 🎯 **Strengths (What you did well)**
- **Excellent Active Listening**: You showed great attention to customer needs by paraphrasing their requirements accurately
- **Clear Value Proposition**: Successfully connected product features to customer benefits
- **Professional Tone**: Maintained confidence and professionalism throughout the entire call
- **Good Follow-up Plan**: Scheduled concrete next meeting with clear agenda

### 🔧 **Areas for Improvement**
- **Discovery Questions**: Consider asking more qualifying questions to better understand customer needs
- **Product Demonstrations**: Missed opportunity to show visual demonstration of key features  
- **Competitor Comparison**: Didn't address how your solution compares to alternatives
- **ROI Calculation**: Could have provided specific cost savings and return on investment figures
- **Urgency Creation**: Limited use of time-sensitive incentives to encourage faster decision-making
- **Reference Stories**: Few customer success stories were shared to build credibility

### 📋 **Action Plan (Prioritized Recommendations)**

**🔴 HIGH Priority:**
1. **Implement Discovery Framework** - Use SPIN or BANT methodology for better customer qualification
2. **Prepare Interactive Demos** - Create visual presentations for different customer types

**🟡 MEDIUM Priority:**  
3. **Develop Competitive Sheets** - Build comparison documents highlighting your advantages
4. **Create ROI Calculator** - Tool to show specific financial benefits to customers

**🟢 LOW Priority:**
5. **Success Story Library** - Collect and organize customer testimonials by industry

### 📞 **Next Steps**
- **Within 24 hours**: Send personalized proposal with pricing options
- **Within 3 days**: Schedule product demonstration  
- **Within 1 week**: Provide customer references

**Great job on this call! You showed strong fundamentals and with these improvements, you'll close more deals. Keep up the excellent work! 🚀**`

        setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
        resolve(demoAnalysis)

      } catch (error) {
        console.error('Demo analysis error:', error)
        
        // Clean up any temporary files
        if (files.audio?.[0]?.path) {
          try {
            fs.unlinkSync(files.audio[0].path)
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError)
          }
        }

        resolve(createResponse(event, `Demo analysis failed: ${error.message}`, 500))
      }
    })
  })
})

function createResponse(event, message, status = 200) {
  setResponseStatus(event, status)
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return message
}