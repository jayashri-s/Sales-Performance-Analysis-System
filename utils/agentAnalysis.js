export const filterTranscriptByAgent = (transcript, agentId) => {
  if (!transcript || !agentId) {
    return '';
  }

  const lines = transcript.split('\n');
  const agentLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith(`${agentId}:`) || 
        trimmedLine.startsWith(`Agent ${agentId}:`) ||
        trimmedLine.startsWith(`[${agentId}]`) ||
        trimmedLine.includes(`Agent ID: ${agentId}`) ||
        trimmedLine.toLowerCase().includes(`agent ${agentId.toLowerCase()}`)) {
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1) {
        const content = trimmedLine.substring(colonIndex + 1).trim();
        if (content) {
          agentLines.push(content);
        }
      }
    }
  }

  return agentLines.join(' ');
};

export const filterCallsByAgent = (salesCalls, salesAgentName) => {
  if (!salesCalls || !salesAgentName) {
    return [];
  }

  return salesCalls.filter(call => 
    call.salesAgentName && 
    call.salesAgentName.toLowerCase() === salesAgentName.toLowerCase()
  );
};

export const aggregateAgentTranscripts = (agentCalls) => {
  if (!agentCalls || agentCalls.length === 0) {
    return '';
  }

  return agentCalls
    .map(call => call.voiceNoteTranscript || '')
    .filter(transcript => transcript.trim().length > 0)
    .join('\n\n--- Next Call ---\n\n');
};

export const extractAgentSpeech = (transcript, agentId, includeTimestamps = true) => {
  if (!transcript || !agentId) {
    return { filteredTranscript: '', metadata: { totalLines: 0, agentLines: 0 } };
  }

  const lines = transcript.split('\n');
  const agentLines = [];
  let totalLines = 0;
  let agentLinesCount = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    totalLines++;
    
    const isAgentLine = 
      trimmedLine.startsWith(`${agentId}:`) || 
      trimmedLine.startsWith(`Agent ${agentId}:`) ||
      trimmedLine.startsWith(`[${agentId}]`) ||
      trimmedLine.includes(`Agent ID: ${agentId}`) ||
      trimmedLine.toLowerCase().includes(`agent ${agentId.toLowerCase()}:`);
    
    if (isAgentLine) {
      agentLinesCount++;
      
      if (includeTimestamps) {
        const timestampMatch = trimmedLine.match(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        
        const colonIndex = trimmedLine.indexOf(':', trimmedLine.indexOf(agentId) + agentId.length);
        if (colonIndex !== -1) {
          const content = trimmedLine.substring(colonIndex + 1).trim();
          if (content) {
            agentLines.push(timestamp ? `[${timestamp}] ${content}` : content);
          }
        }
      } else {
        const colonIndex = trimmedLine.indexOf(':', trimmedLine.indexOf(agentId) + agentId.length);
        if (colonIndex !== -1) {
          const content = trimmedLine.substring(colonIndex + 1).trim();
          if (content) {
            agentLines.push(content);
          }
        }
      }
    }
  }

  return {
    filteredTranscript: agentLines.join('\n'),
    metadata: {
      totalLines,
      agentLines: agentLinesCount,
      agentParticipationRate: totalLines > 0 ? (agentLinesCount / totalLines * 100).toFixed(1) : 0
    }
  };
};

export const generateAgentAnalysisPrompt = (agentTranscript, agentId) => {
  return `You are analyzing a sales call transcript for a single agent only. 

Agent ID: ${agentId}
Agent's part of conversation (filtered transcript):
${agentTranscript}

Please provide a comprehensive analysis of this agent's performance using the same analysis pipeline as before:

1. **Overall Effectiveness Score (0–100)** broken down into:
   - Rapport Building (0–25)
   - Product Knowledge (0–25)  
   - Objection Handling (0–25)
   - Closing Techniques / Next Steps (0–25)

2. **Top 3 Key Statements** (at least 2 should be directly from the transcript)

3. **Tone Analysis** (professional, friendly, aggressive, passive, etc.)

4. **Speech Rate Analysis** (words per minute estimate if timestamps available)

5. **Lead Quality Assessment** based on agent's responses

6. **Objections Identified** and how the agent handled them

7. **Suggestions for Improvement** (specific to this agent)

8. **Agent-Specific Recommendations** prioritized as High/Medium/Low

Focus only on this agent's performance and communication style. Ignore other participants in the original conversation.`;
};