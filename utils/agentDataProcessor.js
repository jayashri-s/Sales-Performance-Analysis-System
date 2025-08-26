import fs from 'fs';
import path from 'path';

/**
 * Filter sales call data for a specific agent and format for API
 * @param {string} salesAgentName - Name of the agent to filter for
 * @returns {Object} Filtered and formatted data for API endpoint
 */
export function filterAgentData(salesAgentName) {
  try {
    // Load the JSON data
    const jsonPath = path.join(process.cwd(), 'lms_sales_calls_with_long_transcripts.json');
    const salesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Filter for the specific agent
    const agentCalls = salesData.filter(call => 
      call.salesAgentName && 
      call.salesAgentName.trim().toLowerCase() === salesAgentName.trim().toLowerCase()
    );
    
    if (agentCalls.length === 0) {
      return {
        error: `No calls found for agent: ${salesAgentName}`,
        availableAgents: [...new Set(salesData.map(call => call.salesAgentName))].sort()
      };
    }
    
    // Aggregate all transcripts for this agent
    const aggregatedTranscript = agentCalls
      .map(call => {
        const transcript = call.voiceNoteTranscript || '';
        const callInfo = `[Call ID: ${call.id} | Customer: ${call.customerName} | Outcome: ${call.callOutcome} | Amount: ₹${call.amountQuoted}]`;
        return `${callInfo}\n${transcript}`;
      })
      .filter(transcript => transcript.trim().length > 0)
      .join('\n\n--- Next Call ---\n\n');
    
    // Format the payload for API endpoint
    const payload = [{
      salesAgentName: salesAgentName,
      callsCount: agentCalls.length,
      aggregatedTranscript: aggregatedTranscript,
      callsSummary: agentCalls.map(call => ({
        id: call.id,
        customerName: call.customerName,
        callTimestamp: call.callTimestamp,
        callDurationSec: call.callDurationSec,
        region: call.region,
        language: call.language,
        leadSource: call.leadSource,
        amountQuoted: call.amountQuoted,
        callOutcome: call.callOutcome,
        sentiment: call.sentiment,
        tags: call.tags
      })),
      totalRevenue: agentCalls.reduce((sum, call) => sum + (call.amountQuoted || 0), 0),
      avgDealSize: agentCalls.reduce((sum, call) => sum + (call.amountQuoted || 0), 0) / agentCalls.length,
      outcomeDistribution: agentCalls.reduce((outcomes, call) => {
        outcomes[call.callOutcome] = (outcomes[call.callOutcome] || 0) + 1;
        return outcomes;
      }, {}),
      regions: [...new Set(agentCalls.map(call => call.region))],
      languages: [...new Set(agentCalls.map(call => call.language))]
    }];
    
    return {
      success: true,
      agent: salesAgentName,
      callsFound: agentCalls.length,
      payload: payload,
      apiEndpoint: '/api/analyze-agent-from-data',
      method: 'POST'
    };
    
  } catch (error) {
    return {
      error: `Failed to process agent data: ${error.message}`,
      details: error.stack
    };
  }
}

/**
 * Get all available agents with their call counts
 * @returns {Array} List of agents with metadata
 */
export function getAvailableAgents() {
  try {
    const jsonPath = path.join(process.cwd(), 'lms_sales_calls_with_long_transcripts.json');
    const salesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    const agentMap = new Map();
    
    salesData.forEach(call => {
      const agentName = call.salesAgentName;
      if (!agentMap.has(agentName)) {
        agentMap.set(agentName, {
          name: agentName,
          callCount: 0,
          totalRevenue: 0,
          outcomes: new Set(),
          regions: new Set(),
          languages: new Set()
        });
      }
      
      const agent = agentMap.get(agentName);
      agent.callCount++;
      agent.totalRevenue += call.amountQuoted || 0;
      agent.outcomes.add(call.callOutcome);
      agent.regions.add(call.region);
      agent.languages.add(call.language);
    });
    
    // Convert Sets to Arrays and sort by call count
    return Array.from(agentMap.values())
      .map(agent => ({
        ...agent,
        outcomes: Array.from(agent.outcomes),
        regions: Array.from(agent.regions),
        languages: Array.from(agent.languages),
        avgDealSize: Math.round(agent.totalRevenue / agent.callCount)
      }))
      .sort((a, b) => b.callCount - a.callCount);
      
  } catch (error) {
    return {
      error: `Failed to get available agents: ${error.message}`
    };
  }
}

/**
 * CLI function to filter data for a specific agent
 * Usage: node agentDataProcessor.js "Agent Name"
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const agentName = process.argv[2];
  
  if (!agentName) {
    console.log('Usage: node agentDataProcessor.js "Agent Name"');
    console.log('\nAvailable agents:');
    const agents = getAvailableAgents();
    agents.forEach(agent => {
      console.log(`- ${agent.name} (${agent.callCount} calls, ₹${agent.totalRevenue.toLocaleString()} revenue)`);
    });
    process.exit(1);
  }
  
  console.log(`\nFiltering data for agent: ${agentName}`);
  const result = filterAgentData(agentName);
  
  if (result.error) {
    console.error('Error:', result.error);
    if (result.availableAgents) {
      console.log('\nAvailable agents:');
      result.availableAgents.forEach(agent => console.log(`- ${agent}`));
    }
    process.exit(1);
  }
  
  console.log(`\n✓ Successfully filtered ${result.callsFound} calls for ${result.agent}`);
  console.log(`\nAPI Payload Preview:`);
  console.log(`Endpoint: POST ${result.apiEndpoint}`);
  console.log(`Agent: ${result.payload[0].salesAgentName}`);
  console.log(`Calls Count: ${result.payload[0].callsCount}`);
  console.log(`Total Revenue: ₹${result.payload[0].totalRevenue.toLocaleString()}`);
  console.log(`Average Deal Size: ₹${result.payload[0].avgDealSize.toLocaleString()}`);
  console.log(`Outcomes: ${Object.keys(result.payload[0].outcomeDistribution).join(', ')}`);
  console.log(`Regions: ${result.payload[0].regions.join(', ')}`);
  console.log(`Languages: ${result.payload[0].languages.join(', ')}`);
  console.log(`\nTranscript Length: ${result.payload[0].aggregatedTranscript.length} characters`);
  console.log(`\nFirst 200 characters of aggregated transcript:`);
  console.log(`"${result.payload[0].aggregatedTranscript.substring(0, 200)}..."`);
  
  // Save payload to file for API testing
  const outputPath = `./agent_${agentName.replace(/\s+/g, '_').toLowerCase()}_payload.json`;
  fs.writeFileSync(outputPath, JSON.stringify(result.payload, null, 2));
  console.log(`\n📁 Full payload saved to: ${outputPath}`);
}