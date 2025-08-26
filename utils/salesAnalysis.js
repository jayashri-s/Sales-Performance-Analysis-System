export const analyzeSalesData = (salesData) => {
  const agentPerformance = {};
  const productStats = {};
  const outcomeStats = {};
  const regionStats = {};
  const sentimentStats = { positive: 0, neutral: 0, negative: 0 };
  const leadSourceStats = {};
  let totalRevenue = 0;
  let totalCalls = salesData.length;

  salesData.forEach(record => {
    if (!agentPerformance[record.salesAgentName]) {
      agentPerformance[record.salesAgentName] = {
        calls: 0,
        totalRevenue: 0,
        avgCallDuration: 0,
        outcomes: {},
        conversions: 0
      };
    }

    const agent = agentPerformance[record.salesAgentName];
    agent.calls++;
    agent.totalRevenue += record.amountQuoted || 0;
    agent.avgCallDuration = ((agent.avgCallDuration * (agent.calls - 1)) + record.callDurationSec) / agent.calls;
    
    if (!agent.outcomes[record.callOutcome]) {
      agent.outcomes[record.callOutcome] = 0;
    }
    agent.outcomes[record.callOutcome]++;

    if (record.callOutcome === 'Closed' || record.callOutcome === 'Interested') {
      agent.conversions++;
    }

    if (!productStats[record.product]) {
      productStats[record.product] = {
        count: 0,
        revenue: 0,
        avgQuote: 0
      };
    }
    productStats[record.product].count++;
    productStats[record.product].revenue += record.amountQuoted || 0;
    productStats[record.product].avgQuote = productStats[record.product].revenue / productStats[record.product].count;

    if (!outcomeStats[record.callOutcome]) {
      outcomeStats[record.callOutcome] = 0;
    }
    outcomeStats[record.callOutcome]++;

    if (!regionStats[record.region]) {
      regionStats[record.region] = {
        calls: 0,
        revenue: 0
      };
    }
    regionStats[record.region].calls++;
    regionStats[record.region].revenue += record.amountQuoted || 0;

    if (record.sentiment) {
      sentimentStats[record.sentiment]++;
    }

    if (!leadSourceStats[record.leadSource]) {
      leadSourceStats[record.leadSource] = {
        calls: 0,
        conversions: 0
      };
    }
    leadSourceStats[record.leadSource].calls++;
    if (record.callOutcome === 'Closed' || record.callOutcome === 'Interested') {
      leadSourceStats[record.leadSource].conversions++;
    }

    totalRevenue += record.amountQuoted || 0;
  });

  Object.keys(agentPerformance).forEach(agent => {
    agentPerformance[agent].conversionRate = 
      (agentPerformance[agent].conversions / agentPerformance[agent].calls) * 100;
  });

  const topAgent = Object.entries(agentPerformance)
    .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)[0];

  const avgCallDuration = salesData.reduce((sum, r) => sum + r.callDurationSec, 0) / totalCalls;

  return {
    summary: {
      totalCalls,
      totalRevenue,
      avgRevenue: totalRevenue / totalCalls,
      avgCallDuration,
      topAgent: topAgent ? topAgent[0] : null
    },
    agentPerformance,
    productStats,
    outcomeStats,
    regionStats,
    sentimentStats,
    leadSourceStats
  };
};

export const extractKeywords = (transcripts) => {
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'when', 'where', 'who', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'from', 'with', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once']);
  
  const wordFreq = {};
  
  transcripts.forEach(text => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
  });
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
};

export const getSalesTrends = (salesData) => {
  const dailyStats = {};
  
  salesData.forEach(record => {
    const date = new Date(record.callTimestamp).toLocaleDateString();
    
    if (!dailyStats[date]) {
      dailyStats[date] = {
        calls: 0,
        revenue: 0,
        conversions: 0
      };
    }
    
    dailyStats[date].calls++;
    dailyStats[date].revenue += record.amountQuoted || 0;
    if (record.callOutcome === 'Closed' || record.callOutcome === 'Interested') {
      dailyStats[date].conversions++;
    }
  });
  
  return Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      ...stats,
      conversionRate: (stats.conversions / stats.calls) * 100
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};