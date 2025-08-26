export const analyzeTranscriptLocally = (transcript) => {
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

export const formatLocalAnalysis = (analysis) => {
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