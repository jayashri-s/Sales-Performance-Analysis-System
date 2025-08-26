import OpenAI from "openai";
import { extractAgentSpeech, generateAgentAnalysisPrompt } from '~/utils/agentAnalysis.js';

const analyzeAgentTranscriptLocally = (agentTranscript, agentId) => {
  const analysis = {
    agentId,
    strengths: [],
    improvements: [],
    metrics: {},
    recommendations: [],
    keyStatements: [],
    toneAnalysis: 'professional',
    speechRate: 0,
    leadQuality: 'medium',
    objections: [],
    effectivenessScore: 0,
    categoryScores: {
      rapportBuilding: 0,
      productKnowledge: 0,
      objectionHandling: 0,
      closingTechniques: 0
    }
  }

  if (!agentTranscript || agentTranscript.trim().length === 0) {
    analysis.improvements.push('No speech data found for this agent');
    analysis.effectivenessScore = 0;
    return analysis;
  }

  const lowerTranscript = agentTranscript.toLowerCase();
  
  // Analyze strengths
  if (lowerTranscript.includes('value') || lowerTranscript.includes('benefit')) {
    analysis.strengths.push('Communicated value propositions');
    analysis.categoryScores.productKnowledge += 5;
  }
  if (lowerTranscript.includes('understand') || lowerTranscript.includes('appreciate')) {
    analysis.strengths.push('Showed empathy and understanding');
    analysis.categoryScores.rapportBuilding += 5;
  }
  if (lowerTranscript.includes('solution') || lowerTranscript.includes('help')) {
    analysis.strengths.push('Focused on problem-solving');
    analysis.categoryScores.productKnowledge += 3;
  }
  if (lowerTranscript.includes('next step') || lowerTranscript.includes('follow up')) {
    analysis.strengths.push('Provided clear next steps');
    analysis.categoryScores.closingTechniques += 8;
  }

  // Analyze areas for improvement
  if (!lowerTranscript.includes('question') && !lowerTranscript.includes('tell me')) {
    analysis.improvements.push('Ask more discovery questions');
    analysis.categoryScores.rapportBuilding -= 2;
  }
  if (!lowerTranscript.includes('budget') && !lowerTranscript.includes('investment')) {
    analysis.improvements.push('Discuss budget and investment early');
    analysis.categoryScores.closingTechniques -= 3;
  }
  if (lowerTranscript.includes('um') || lowerTranscript.includes('uh')) {
    analysis.improvements.push('Reduce filler words for clearer communication');
  }

  // Extract key statements
  const sentences = agentTranscript.split(/[.!?]/).filter(s => s.trim().length > 20);
  analysis.keyStatements = sentences.slice(0, 3).map(s => s.trim());

  // Tone analysis
  if (lowerTranscript.includes('excited') || lowerTranscript.includes('great') || lowerTranscript.includes('fantastic')) {
    analysis.toneAnalysis = 'enthusiastic';
  } else if (lowerTranscript.includes('understand') || lowerTranscript.includes('concerns')) {
    analysis.toneAnalysis = 'empathetic';
  } else {
    analysis.toneAnalysis = 'professional';
  }

  // Speech rate estimation (rough)
  const words = agentTranscript.split(' ').length;
  const estimatedMinutes = Math.max(1, Math.round(words / 150)); // Assuming average speaking rate
  analysis.speechRate = Math.round(words / estimatedMinutes);

  // Lead quality assessment
  if (lowerTranscript.includes('interested') || lowerTranscript.includes('sounds good')) {
    analysis.leadQuality = 'high';
  } else if (lowerTranscript.includes('maybe') || lowerTranscript.includes('think about')) {
    analysis.leadQuality = 'medium';
  } else {
    analysis.leadQuality = 'low';
  }

  // Identify objections
  if (lowerTranscript.includes('expensive') || lowerTranscript.includes('cost')) {
    analysis.objections.push('Price concerns');
  }
  if (lowerTranscript.includes('time') || lowerTranscript.includes('busy')) {
    analysis.objections.push('Time constraints');
  }
  if (lowerTranscript.includes('competitor') || lowerTranscript.includes('other option')) {
    analysis.objections.push('Competitive alternatives');
  }

  // Generate recommendations
  if (analysis.categoryScores.rapportBuilding < 10) {
    analysis.recommendations.push({ priority: 'High', text: 'Focus on building stronger rapport with prospects' });
  }
  if (analysis.categoryScores.closingTechniques < 10) {
    analysis.recommendations.push({ priority: 'High', text: 'Improve closing techniques and next step clarity' });
  }
  if (analysis.objections.length > 0 && analysis.categoryScores.objectionHandling < 5) {
    analysis.recommendations.push({ priority: 'Medium', text: 'Develop better objection handling strategies' });
  }

  // Calculate effectiveness score
  const totalCategoryScore = Object.values(analysis.categoryScores).reduce((sum, score) => sum + Math.max(0, score), 0);
  analysis.effectivenessScore = Math.min(100, Math.max(0, 50 + totalCategoryScore));

  return analysis;
};

const formatAgentAnalysis = (analysis) => {
  let formatted = `SINGLE AGENT SALES ANALYSIS REPORT\n`;
  formatted += `${'='.repeat(50)}\n\n`;
  
  formatted += `Agent ID: ${analysis.agentId}\n`;
  formatted += `Effectiveness Score: ${analysis.effectivenessScore}/100\n\n`;
  
  formatted += `CATEGORY SCORES:\n`;
  formatted += `• Rapport Building: ${analysis.categoryScores.rapportBuilding}/25\n`;
  formatted += `• Product Knowledge: ${analysis.categoryScores.productKnowledge}/25\n`;
  formatted += `• Objection Handling: ${analysis.categoryScores.objectionHandling}/25\n`;
  formatted += `• Closing Techniques: ${analysis.categoryScores.closingTechniques}/25\n\n`;
  
  if (analysis.keyStatements.length > 0) {
    formatted += `KEY STATEMENTS:\n`;
    analysis.keyStatements.forEach((statement, i) => {
      formatted += `${i + 1}. "${statement}"\n`;
    });
    formatted += '\n';
  }
  
  formatted += `COMMUNICATION ANALYSIS:\n`;
  formatted += `• Tone: ${analysis.toneAnalysis}\n`;
  formatted += `• Speech Rate: ~${analysis.speechRate} words/minute\n`;
  formatted += `• Lead Quality: ${analysis.leadQuality}\n\n`;
  
  if (analysis.strengths.length > 0) {
    formatted += `STRENGTHS:\n`;
    analysis.strengths.forEach(s => {
      formatted += `✓ ${s}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.improvements.length > 0) {
    formatted += `AREAS FOR IMPROVEMENT:\n`;
    analysis.improvements.forEach(i => {
      formatted += `• ${i}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.objections.length > 0) {
    formatted += `OBJECTIONS IDENTIFIED:\n`;
    analysis.objections.forEach(obj => {
      formatted += `• ${obj}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.recommendations.length > 0) {
    formatted += `RECOMMENDATIONS:\n`;
    analysis.recommendations.forEach((r, i) => {
      formatted += `${i + 1}. [${r.priority}] ${r.text}\n`;
    });
  }
  
  return formatted;
};

const apiKey = process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
}) : null;

async function generateAgentAnalysisWithGemini(agentTranscript, agentId) {
  const prompt = `You are a sales performance analyst focusing on individual agent evaluation. 

Agent ID: ${agentId}
Agent's filtered transcript:
${agentTranscript}

Provide a comprehensive single-agent analysis in JSON format followed by a friendly coaching report.

JSON Schema:
{
  "agentId": "${agentId}",
  "overallScore": number (0-100),
  "categoryScores": {
    "rapportBuilding": {"score": number (0-25), "justification": string, "example": string},
    "productKnowledge": {"score": number (0-25), "justification": string, "example": string},
    "objectionHandling": {"score": number (0-25), "justification": string, "example": string},
    "closingTechniques": {"score": number (0-25), "justification": string, "example": string}
  },
  "keyStatements": [string, string, string],
  "toneAnalysis": string,
  "speechRate": number,
  "leadQuality": string,
  "objections": [string],
  "strengths": [{"point": string, "evidence": string}],
  "improvements": [{"point": string, "evidence": string}],
  "recommendations": [{"priority": "High|Medium|Low", "text": string}],
  "analysisConfidence": number (0-1)
}

After the JSON, provide a friendly coaching report focusing on this agent's specific performance and growth opportunities.`;

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash-exp",
    messages: [
      { role: "system", content: "You are a helpful sales coaching assistant specializing in individual agent analysis." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transcript, agentId } = body;
    
    if (!transcript || !agentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Both transcript and agentId are required'
      });
    }

    // Extract agent-specific speech from the full transcript
    const { filteredTranscript, metadata } = extractAgentSpeech(transcript, agentId, true);
    
    if (!filteredTranscript || filteredTranscript.trim().length === 0) {
      return {
        analysis: `No speech data found for Agent ${agentId} in the provided transcript.
        
Please check:
1. Agent ID format matches the transcript format
2. Agent actually participated in this conversation
3. Transcript contains proper agent identifiers

Metadata: ${JSON.stringify(metadata, null, 2)}`,
        isLocal: true,
        agentId,
        metadata
      };
    }

    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, using local analysis');
      const localAnalysis = analyzeAgentTranscriptLocally(filteredTranscript, agentId);
      const formattedAnalysis = formatAgentAnalysis(localAnalysis);
      
      return {
        analysis: `${formattedAnalysis}

Note: This analysis was generated using local algorithms.
Agent participation: ${metadata.agentParticipationRate}% of conversation

For AI-powered analysis:
1. Get a Gemini API key from Google AI Studio
2. Add NUXT_GEMINI_API_KEY=your_key to your .env file
3. Restart the development server`,
        isLocal: true,
        agentId,
        metadata,
        filteredTranscript
      };
    }

    console.log(`Using AI analysis for Agent ${agentId}`);
    const analysis = await generateAgentAnalysisWithGemini(filteredTranscript, agentId);
    
    return {
      analysis,
      agentId,
      metadata,
      filteredTranscript
    };
  } catch (error) {
    console.error('Agent analysis error:', error);
    
    const { transcript, agentId } = await readBody(event);
    
    if (transcript && agentId) {
      // Fallback to local analysis
      const { filteredTranscript, metadata } = extractAgentSpeech(transcript, agentId, true);
      
      if (filteredTranscript && filteredTranscript.trim().length > 0) {
        const localAnalysis = analyzeAgentTranscriptLocally(filteredTranscript, agentId);
        const formattedAnalysis = formatAgentAnalysis(localAnalysis);
        
        return {
          analysis: `${formattedAnalysis}

Note: AI analysis failed, using local analysis instead.
Error: ${error.message}`,
          isLocal: true,
          error: error.message,
          agentId,
          metadata,
          filteredTranscript
        };
      }
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Agent analysis failed: ${error.message}`
    });
  }
});