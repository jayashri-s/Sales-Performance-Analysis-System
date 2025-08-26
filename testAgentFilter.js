import fs from 'fs';
import path from 'path';

// Example: Filter data for "Ishita Naidu"
const salesAgentName = "Ishita Naidu";

function filterAgentForAnalysis(targetAgentName) {
  try {
    // Load the JSON data
    const jsonPath = './lms_sales_calls_with_long_transcripts.json';
    const salesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📊 Total records in dataset: ${salesData.length}`);
    
    // Filter for the specific agent
    const agentCalls = salesData.filter(call => 
      call.salesAgentName && 
      call.salesAgentName.trim() === targetAgentName.trim()
    );
    
    console.log(`🔍 Filtering for agent: "${targetAgentName}"`);
    console.log(`✅ Found ${agentCalls.length} calls for this agent`);
    
    if (agentCalls.length === 0) {
      console.log('\n❌ No calls found for this agent.');
      console.log('\nAvailable agents:');
      const availableAgents = [...new Set(salesData.map(call => call.salesAgentName))].sort();
      availableAgents.forEach((agent, index) => {
        const callCount = salesData.filter(call => call.salesAgentName === agent).length;
        console.log(`${index + 1}. ${agent} (${callCount} calls)`);
      });
      return null;
    }
    
    // Show call details for this agent
    console.log('\n📞 Call Details:');
    agentCalls.forEach((call, index) => {
      console.log(`${index + 1}. Customer: ${call.customerName} | Outcome: ${call.callOutcome} | Amount: ₹${call.amountQuoted?.toLocaleString() || 0}`);
    });
    
    // Aggregate all transcripts for this agent
    const aggregatedTranscript = agentCalls
      .map(call => {
        const transcript = call.voiceNoteTranscript || '';
        const callHeader = `[Call ${call.id} - ${call.customerName} - ${call.callOutcome}]`;
        return `${callHeader}\n${transcript}`;
      })
      .filter(transcript => transcript.trim().length > 0)
      .join('\n\n--- Next Call ---\n\n');
    
    // Calculate metrics
    const totalRevenue = agentCalls.reduce((sum, call) => sum + (call.amountQuoted || 0), 0);
    const outcomeDistribution = agentCalls.reduce((outcomes, call) => {
      outcomes[call.callOutcome] = (outcomes[call.callOutcome] || 0) + 1;
      return outcomes;
    }, {});
    
    console.log('\n📈 Agent Summary:');
    console.log(`Total Calls: ${agentCalls.length}`);
    console.log(`Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`Average Deal Size: ₹${Math.round(totalRevenue / agentCalls.length).toLocaleString()}`);
    console.log(`Outcomes:`, outcomeDistribution);
    console.log(`Aggregated Transcript Length: ${aggregatedTranscript.length} characters`);
    
    // Format the payload exactly as requested
    const payload = [
      {
        "salesAgentName": targetAgentName,
        "callsCount": agentCalls.length,
        "aggregatedTranscript": aggregatedTranscript
      }
    ];
    
    console.log('\n🚀 API Payload Format:');
    console.log('POST http://localhost:3000/api/analyze-agent');
    console.log('Content-Type: application/json');
    console.log('\nPayload:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Save payload to file
    const outputFile = `${targetAgentName.replace(/\s+/g, '_').toLowerCase()}_payload.json`;
    fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
    console.log(`\n💾 Payload saved to: ${outputFile}`);
    
    // Show transcript preview
    console.log('\n📝 Transcript Preview (first 300 characters):');
    console.log(`"${aggregatedTranscript.substring(0, 300)}..."`);
    
    return payload;
    
  } catch (error) {
    console.error('❌ Error processing agent data:', error.message);
    return null;
  }
}

// Run the filter
console.log('🎯 LMES LMS Sales Agent Analysis - Data Filter');
console.log('=' .repeat(60));

const result = filterAgentForAnalysis(salesAgentName);

if (result) {
  console.log('\n✅ Success! Payload is ready for API analysis.');
  console.log('\nNext steps:');
  console.log('1. Start your server: npm run dev');
  console.log('2. Send POST request to: http://localhost:3000/api/analyze-agent');
  console.log('3. Use the payload from the generated JSON file');
} else {
  console.log('\n❌ Failed to generate payload. Please check the agent name.');
}