import fs from 'fs';

// Change this to filter for any agent
const salesAgentName = "Meera Khan";

function filterAgentForPayload(targetAgent) {
  try {
    // Read the JSON data
    const data = JSON.parse(fs.readFileSync('lms_sales_calls_with_long_transcripts.json', 'utf8'));
    
    // Get all unique agents first
    const allAgents = [...new Set(data.map(call => call.salesAgentName))].sort();
    console.log(`Available agents (${allAgents.length}):`);
    allAgents.forEach((agent, i) => {
      const count = data.filter(call => call.salesAgentName === agent).length;
      console.log(`${i+1}. ${agent} (${count} calls)`);
    });
    
    console.log(`\n--- Filtering for: "${targetAgent}" ---`);
    
    // Filter calls for the specified agent
    const agentCalls = data.filter(call => 
      call.salesAgentName === targetAgent
    );
    
    if (agentCalls.length === 0) {
      console.log(`❌ No calls found for agent: ${targetAgent}`);
      return null;
    }
    
    // Aggregate transcripts
    const aggregatedTranscript = agentCalls
      .map(call => call.voiceNoteTranscript || '')
      .filter(transcript => transcript.trim() !== '')
      .join(' ');
    
    // Create the exact payload format for analyze-agent endpoint
    const payload = [
      {
        "salesAgentName": targetAgent,
        "callsCount": agentCalls.length,
        "aggregatedTranscript": aggregatedTranscript
      }
    ];
    
    // Display results
    console.log(`✅ Found ${agentCalls.length} calls for ${targetAgent}`);
    console.log(`📊 Aggregated transcript length: ${aggregatedTranscript.length} characters`);
    
    // Show call details
    console.log('\n📞 Calls details:');
    agentCalls.forEach((call, i) => {
      console.log(`${i+1}. Customer: ${call.customerName} | Outcome: ${call.callOutcome} | Amount: ₹${call.amountQuoted?.toLocaleString()}`);
    });
    
    // Save payload to file
    const filename = `${targetAgent.replace(/\s+/g, '_').toLowerCase()}_payload.json`;
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2));
    
    console.log(`\n🚀 API Payload for analyze-agent endpoint:`);
    console.log(`POST http://localhost:3000/api/analyze-agent`);
    console.log(`Content-Type: application/json`);
    console.log(`\nPayload saved to: ${filename}`);
    console.log('\nPayload structure:');
    console.log(JSON.stringify(payload, null, 2));
    
    return payload;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run the filter
console.log('🎯 Sales Agent Data Filter for analyze-agent API');
console.log('='.repeat(60));
filterAgentForPayload(salesAgentName);