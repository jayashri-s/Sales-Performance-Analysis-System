import OpenAI from "openai";
import { filterCallsByAgent, aggregateAgentTranscripts } from '~/utils/agentAnalysis.js';
import fs from 'fs';
import path from 'path';

const analyzeAgentFromDataLocally = (aggregatedTranscript, salesAgentName, callsCount) => {
  const analysis = {
    salesAgentName,
    callsAnalyzed: callsCount,
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

  if (!aggregatedTranscript || aggregatedTranscript.trim().length === 0) {
    analysis.improvements.push('No call transcripts found for this agent');
    analysis.effectivenessScore = 0;
    return analysis;
  }

  const lowerTranscript = aggregatedTranscript.toLowerCase();
  
  // Analyze strengths based on LMES sales approach
  if (lowerTranscript.includes('value proposition') || lowerTranscript.includes('key benefits')) {
    analysis.strengths.push('Clearly communicates LMES value propositions');
    analysis.categoryScores.productKnowledge += 8;
  }
  if (lowerTranscript.includes('lms') && lowerTranscript.includes('features')) {
    analysis.strengths.push('Effectively explains LMS features and capabilities');
    analysis.categoryScores.productKnowledge += 6;
  }
  if (lowerTranscript.includes('reassured') || lowerTranscript.includes('addressed concerns')) {
    analysis.strengths.push('Handles customer concerns professionally');
    analysis.categoryScores.objectionHandling += 7;
  }
  if (lowerTranscript.includes('flexible pricing') || lowerTranscript.includes('migration assistance')) {
    analysis.strengths.push('Emphasizes support and flexibility');
    analysis.categoryScores.rapportBuilding += 5;
  }
  if (lowerTranscript.includes('pilot') && lowerTranscript.includes('timeline')) {
    analysis.strengths.push('Provides clear implementation timeline');
    analysis.categoryScores.closingTechniques += 8;
  }
  if (lowerTranscript.includes('next step') || lowerTranscript.includes('follow')) {
    analysis.strengths.push('Establishes clear next steps');
    analysis.categoryScores.closingTechniques += 6;
  }

  // Analyze areas for improvement
  if (callsCount > 1 && !lowerTranscript.includes('previous') && !lowerTranscript.includes('last time')) {
    analysis.improvements.push('Better leverage conversation history in follow-up calls');
  }
  if (!lowerTranscript.includes('budget') && !lowerTranscript.includes('investment')) {
    analysis.improvements.push('Discuss budget and investment requirements earlier');
    analysis.categoryScores.closingTechniques -= 2;
  }
  if (!lowerTranscript.includes('competitor') && !lowerTranscript.includes('alternative')) {
    analysis.improvements.push('Address competitive differentiation more proactively');
    analysis.categoryScores.productKnowledge -= 3;
  }
  if (!lowerTranscript.includes('success story') && !lowerTranscript.includes('case study')) {
    analysis.improvements.push('Include more customer success examples');
    analysis.categoryScores.rapportBuilding -= 2;
  }

  // Extract key statements from the aggregated transcript
  const sentences = aggregatedTranscript.split(/[.!?]/).filter(s => s.trim().length > 30);
  analysis.keyStatements = sentences.slice(0, 3).map(s => s.trim().substring(0, 200));

  // Tone analysis based on language patterns
  if (lowerTranscript.includes('excited') || lowerTranscript.includes('fantastic') || lowerTranscript.includes('great opportunity')) {
    analysis.toneAnalysis = 'enthusiastic';
  } else if (lowerTranscript.includes('understand') || lowerTranscript.includes('appreciate') || lowerTranscript.includes('concerns')) {
    analysis.toneAnalysis = 'empathetic';
  } else if (lowerTranscript.includes('professional') || lowerTranscript.includes('business')) {
    analysis.toneAnalysis = 'professional';
  } else {
    analysis.toneAnalysis = 'conversational';
  }

  // Speech rate estimation (rough calculation)
  const words = aggregatedTranscript.split(' ').length;
  const estimatedMinutes = Math.max(1, callsCount * 5); // Assume 5 min average per call
  analysis.speechRate = Math.round(words / estimatedMinutes);

  // Lead quality assessment based on outcomes mentioned
  if (lowerTranscript.includes('interested') || lowerTranscript.includes('demo') || lowerTranscript.includes('payment')) {
    analysis.leadQuality = 'high';
  } else if (lowerTranscript.includes('follow-up') || lowerTranscript.includes('think about')) {
    analysis.leadQuality = 'medium';
  } else {
    analysis.leadQuality = 'low';
  }

  // Identify common objections in LMS sales
  const objectionPatterns = [
    { pattern: /pricing|cost|expensive|budget/g, objection: 'Price concerns' },
    { pattern: /integration|existing system|compatibility/g, objection: 'Integration challenges' },
    { pattern: /time|busy|schedule|timeline/g, objection: 'Time constraints' },
    { pattern: /onboarding|training|adoption|learning curve/g, objection: 'Onboarding concerns' },
    { pattern: /support|help|assistance|sla/g, objection: 'Support expectations' }
  ];

  objectionPatterns.forEach(({ pattern, objection }) => {
    if (pattern.test(lowerTranscript)) {
      analysis.objections.push(objection);
    }
  });

  // Generate specific recommendations for LMS sales
  if (analysis.categoryScores.rapportBuilding < 8) {
    analysis.recommendations.push({ 
      priority: 'High', 
      text: 'Focus on building stronger rapport by asking about current pain points and showing empathy' 
    });
  }
  if (analysis.categoryScores.productKnowledge < 10) {
    analysis.recommendations.push({ 
      priority: 'High', 
      text: 'Improve product demonstration skills and feature-benefit mapping for LMES LMS' 
    });
  }
  if (analysis.categoryScores.closingTechniques < 10) {
    analysis.recommendations.push({ 
      priority: 'High', 
      text: 'Strengthen closing techniques and create more urgency around next steps' 
    });
  }
  if (analysis.objections.length > 2 && analysis.categoryScores.objectionHandling < 8) {
    analysis.recommendations.push({ 
      priority: 'Medium', 
      text: 'Develop better objection handling frameworks and prepare standard responses' 
    });
  }
  if (callsCount > 3) {
    analysis.recommendations.push({ 
      priority: 'Low', 
      text: 'Consider varying your approach across multiple calls to maintain engagement' 
    });
  }

  // Calculate effectiveness score
  const totalCategoryScore = Object.values(analysis.categoryScores).reduce((sum, score) => sum + Math.max(0, score), 0);
  const baseScore = 40 + Math.min(callsCount * 2, 10); // Bonus for having multiple calls
  analysis.effectivenessScore = Math.min(100, Math.max(0, baseScore + totalCategoryScore));

  return analysis;
};

const formatAgentDataAnalysis = (analysis) => {
  let formatted = `AGENT PERFORMANCE ANALYSIS - REAL SALES DATA\n`;
  formatted += `${'='.repeat(60)}\n\n`;
  
  formatted += `Agent: ${analysis.salesAgentName}\n`;
  formatted += `Calls Analyzed: ${analysis.callsAnalyzed}\n`;
  formatted += `Overall Effectiveness Score: ${analysis.effectivenessScore}/100\n\n`;
  
  formatted += `CATEGORY BREAKDOWN:\n`;
  formatted += `• Rapport Building: ${Math.max(0, analysis.categoryScores.rapportBuilding)}/25\n`;
  formatted += `• Product Knowledge: ${Math.max(0, analysis.categoryScores.productKnowledge)}/25\n`;
  formatted += `• Objection Handling: ${Math.max(0, analysis.categoryScores.objectionHandling)}/25\n`;
  formatted += `• Closing Techniques: ${Math.max(0, analysis.categoryScores.closingTechniques)}/25\n\n`;
  
  if (analysis.keyStatements.length > 0) {
    formatted += `KEY STATEMENTS FROM CALLS:\n`;
    analysis.keyStatements.forEach((statement, i) => {
      formatted += `${i + 1}. "${statement}..."\n`;
    });
    formatted += '\n';
  }
  
  formatted += `COMMUNICATION PROFILE:\n`;
  formatted += `• Primary Tone: ${analysis.toneAnalysis}\n`;
  formatted += `• Speech Rate: ~${analysis.speechRate} words/minute\n`;
  formatted += `• Lead Quality Focus: ${analysis.leadQuality}\n\n`;
  
  if (analysis.strengths.length > 0) {
    formatted += `IDENTIFIED STRENGTHS:\n`;
    analysis.strengths.forEach(s => {
      formatted += `✓ ${s}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.improvements.length > 0) {
    formatted += `DEVELOPMENT AREAS:\n`;
    analysis.improvements.forEach(i => {
      formatted += `• ${i}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.objections.length > 0) {
    formatted += `COMMON OBJECTIONS ENCOUNTERED:\n`;
    analysis.objections.forEach(obj => {
      formatted += `• ${obj}\n`;
    });
    formatted += '\n';
  }
  
  if (analysis.recommendations.length > 0) {
    formatted += `COACHING RECOMMENDATIONS:\n`;
    analysis.recommendations.forEach((r, i) => {
      formatted += `${i + 1}. [${r.priority} Priority] ${r.text}\n`;
    });
    formatted += '\n';
  }
  
  formatted += `SUMMARY:\n`;
  formatted += `Based on ${analysis.callsAnalyzed} sales calls, this analysis provides insights into `;
  formatted += `${analysis.salesAgentName}'s performance selling LMES LMS solutions. `;
  formatted += `Focus areas include strengthening ${analysis.categoryScores.rapportBuilding < 8 ? 'rapport building, ' : ''}`;
  formatted += `${analysis.categoryScores.productKnowledge < 10 ? 'product knowledge, ' : ''}`;
  formatted += `${analysis.categoryScores.closingTechniques < 10 ? 'closing techniques, ' : ''}`;
  formatted += `and overall sales effectiveness.`;
  
  return formatted;
};

const apiKey = process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
}) : null;

async function generateAgentDataAnalysisWithGemini(aggregatedTranscript, salesAgentName, callsCount) {
  const prompt = `Act as a **high-level Senior Sales Manager** evaluating an LMES LMS sales agent.  
You are reviewing this agent’s actual sales call performance across ${callsCount} calls.  

Agent: ${salesAgentName}  
Aggregated Transcripts from ${callsCount} calls:  
${aggregatedTranscript}  

Your role:  
- Analyze the agent like a senior manager would when preparing a performance review and coaching session.  
- Be objective, constructive, and strategic in your evaluation.  
- Focus on: product knowledge, objection handling, rapport with education clients, closing techniques, consistency across calls, and overall professionalism.  
- Provide **numeric scores** for each area and an overall score.  
- Give concrete examples from the transcript as evidence.  
- Provide not just observations, but also **senior-level coaching advice** on how the agent can grow into a top-performing senior sales agent.  

Output Format:  
1. **JSON block** (strictly follow the schema below).  
2. After JSON, write a **coaching report** in the voice of a Senior Sales Manager — professional, clear, encouraging, and practical.  

JSON Schema:  
{
  "salesAgentName": "${salesAgentName}",
  "callsAnalyzed": ${callsCount},
  "overallScore": number (0-100),
  "categoryScores": {
    "rapportBuilding": {"score": number (0-25), "justification": string, "examples": [string]},
    "productKnowledge": {"score": number (0-25), "justification": string, "examples": [string]},
    "objectionHandling": {"score": number (0-25), "justification": string, "examples": [string]},
    "closingTechniques": {"score": number (0-25), "justification": string, "examples": [string]}
  },
  "keyStatements": [string, string, string],
  "toneAnalysis": string,
  "speechRate": number,
  "leadQuality": string,
  "objections": [string],
  "strengths": [{"point": string, "evidence": string}],
  "improvements": [{"point": string, "evidence": string}],
  "recommendations": [{"priority": "High|Medium|Low", "text": string}],
  "consistencyAcrossCalls": string,
  "analysisConfidence": number (0-1)
}

Important rules:  
1. Scores must be **numeric values**.  
2. Each justification should be grounded in transcript evidence.  
3. The coaching report should sound like it comes from a **seasoned Senior Sales Manager**, combining praise, constructive feedback, and actionable next steps.  
4. Emphasize how the agent can progress toward becoming a **senior sales agent**.  
`;

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash-exp",
    messages: [
      { role: "system", content: "You are a sales performance coach specializing in LMS sales analysis." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { salesAgentName } = body;
    
    if (!salesAgentName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'salesAgentName is required'
      });
    }

    // Load the JSON data
    const jsonPath = path.join(process.cwd(), 'public', 'lms_sales_calls_with_long_transcripts.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Sales calls data file not found'
      });
    }

    const salesCallsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Filter calls for the specific agent
    const agentCalls = filterCallsByAgent(salesCallsData, salesAgentName);
    
    if (agentCalls.length === 0) {
      return {
        analysis: `No sales calls found for agent: ${salesAgentName}
        
Available agents in the data:
${[...new Set(salesCallsData.map(call => call.salesAgentName))].join('\n')}

Please check the agent name spelling and try again.`,
        salesAgentName,
        callsFound: 0,
        isLocal: true
      };
    }

    // Aggregate all transcripts for this agent
    const aggregatedTranscript = aggregateAgentTranscripts(agentCalls);
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, using local analysis');
      const localAnalysis = analyzeAgentFromDataLocally(aggregatedTranscript, salesAgentName, agentCalls.length);
      const formattedAnalysis = formatAgentDataAnalysis(localAnalysis);
      
      return {
        analysis: `${formattedAnalysis}

Note: This analysis was generated using local algorithms based on real sales call data.

For AI-powered analysis:
1. Get a Gemini API key from Google AI Studio
2. Add NUXT_GEMINI_API_KEY=your_key to your .env file
3. Restart the development server`,
        isLocal: true,
        salesAgentName,
        callsFound: agentCalls.length,
        aggregatedTranscript: aggregatedTranscript.substring(0, 1000) + '...',
        agentCalls: agentCalls.map(call => ({
          id: call.id,
          customerName: call.customerName,
          callOutcome: call.callOutcome,
          amountQuoted: call.amountQuoted
        }))
      };
    }

    console.log(`Using AI analysis for Agent ${salesAgentName} with ${agentCalls.length} calls`);
    const analysis = await generateAgentDataAnalysisWithGemini(aggregatedTranscript, salesAgentName, agentCalls.length);
    
    return {
      analysis,
      salesAgentName,
      callsFound: agentCalls.length,
      agentCalls: agentCalls.map(call => ({
        id: call.id,
        customerName: call.customerName,
        callOutcome: call.callOutcome,
        amountQuoted: call.amountQuoted
      }))
    };
  } catch (error) {
    console.error('Agent data analysis error:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: `Agent analysis failed: ${error.message}`
    });
  }
});