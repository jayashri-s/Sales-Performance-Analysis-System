<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">
                    AI Analysis Results
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    Powered by Gemini AI • Press 'D' to toggle details
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleDetailedView"
                    v-if="analysis"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                    :class="showDetailedView 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="showDetailedView" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    {{ showDetailedView ? 'Summary View' : 'Detailed View' }}
                  </button>
                  <button
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-500"
                  >
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="loading" class="py-12 text-center">
                <div class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-lg text-gray-700">Analyzing transcript...</span>
                </div>
              </div>

              <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Analysis Error</h3>
                    <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                  </div>
                </div>
              </div>

              <div v-else-if="analysis" class="space-y-6">
                
                <!-- Summary View (Always Visible) -->
                <div class="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-xl font-bold text-gray-900">Quick Overview</h4>
                    <div v-if="parsedAnalysis.overallScore" class="flex items-center space-x-2">
                      <div class="text-3xl font-bold" :class="getScoreColor(parsedAnalysis.overallScore, 100)">
                        {{ parsedAnalysis.overallScore }}
                      </div>
                      <div class="text-gray-500">/100</div>
                    </div>
                  </div>
                  
                  <!-- Compact Score Overview -->
                  <div v-if="parsedAnalysis.scoreBreakdown.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div
                      v-for="score in parsedAnalysis.scoreBreakdown"
                      :key="score.category"
                      class="bg-white rounded-lg p-3 text-center shadow-sm"
                    >
                      <div class="text-lg font-bold mb-1" :class="getScoreColor(score.score, 25)">
                        {{ score.score }}/25
                      </div>
                      <div class="text-xs text-gray-600 font-medium">{{ score.category }}</div>
                      <div class="w-full bg-gray-200 rounded-full h-1 mt-2">
                        <div
                          class="h-1 rounded-full transition-all duration-500"
                          :class="getScoreBarColor(score.score, 25)"
                          :style="`width: ${(score.score / 25) * 100}%`"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Key Insights Summary -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-600">{{ parsedAnalysis.strengths.length }}</div>
                      <div class="text-xs text-gray-600">Strengths</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-yellow-600">{{ parsedAnalysis.improvements.length }}</div>
                      <div class="text-xs text-gray-600">Improvements</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-blue-600">{{ parsedAnalysis.recommendations.length }}</div>
                      <div class="text-xs text-gray-600">Recommendations</div>
                    </div>
                  </div>
                  
                  <!-- Quick Actions -->
                  <div v-if="!showDetailedView" class="flex justify-center gap-3 mt-4">
                    <button
                      @click="showDetailedView = true"
                      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      View Details
                    </button>
                    <button
                      @click="copyToClipboard"
                      class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>

                <!-- Detailed View (Toggleable) -->
                <transition
                  enter-active-class="transition ease-out duration-300"
                  enter-from-class="opacity-0 transform translate-y-2"
                  enter-to-class="opacity-100 transform translate-y-0"
                  leave-active-class="transition ease-in duration-200"
                  leave-from-class="opacity-100 transform translate-y-0"
                  leave-to-class="opacity-0 transform translate-y-2"
                >
                  <div v-show="showDetailedView" class="detailed-analysis space-y-6">
                  <!-- Detailed Score Breakdown -->
                  <div v-if="parsedAnalysis.overallScore" class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-xl font-bold text-gray-900">Detailed Score Analysis</h4>
                      <div class="flex items-center space-x-2">
                        <div class="text-3xl font-bold text-green-600">{{ parsedAnalysis.overallScore }}</div>
                        <div class="text-gray-500">/100</div>
                      </div>
                    </div>
                    
                    <!-- Score Breakdown with Examples -->
                    <div v-if="parsedAnalysis.scoreBreakdown.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        v-for="score in parsedAnalysis.scoreBreakdown"
                        :key="score.category"
                        class="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div class="flex justify-between items-center mb-2">
                          <h5 class="font-semibold text-gray-800">{{ score.category }}</h5>
                          <span class="text-lg font-bold" :class="getScoreColor(score.score, 25)">
                            {{ score.score }}/25
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            class="h-2 rounded-full transition-all duration-500"
                            :class="getScoreBarColor(score.score, 25)"
                            :style="`width: ${(score.score / 25) * 100}%`"
                          ></div>
                        </div>
                        <p v-if="score.example" class="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                          "{{ score.example }}"
                        </p>
                      </div>
                    </div>
                  </div>

                <!-- Strengths Section -->
                <div v-if="parsedAnalysis.strengths.length > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="font-semibold text-green-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Strengths Observed
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="(strength, index) in parsedAnalysis.strengths"
                      :key="index"
                      class="bg-white rounded p-3 border-l-4 border-green-400"
                    >
                      <p class="text-sm text-gray-700">{{ strength }}</p>
                    </div>
                  </div>
                </div>

                <!-- Improvements Section -->
                <div v-if="parsedAnalysis.improvements.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 class="font-semibold text-yellow-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    Areas for Improvement
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="(improvement, index) in parsedAnalysis.improvements"
                      :key="index"
                      class="bg-white rounded p-3 border-l-4 border-yellow-400"
                    >
                      <p class="text-sm text-gray-700">{{ improvement }}</p>
                    </div>
                  </div>
                </div>

                <!-- Recommendations Section -->
                <div v-if="parsedAnalysis.recommendations.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-semibold text-blue-900 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    Actionable Recommendations
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="(recommendation, index) in parsedAnalysis.recommendations"
                      :key="index"
                      class="bg-white rounded p-3 border-l-4 border-blue-400 flex items-start"
                    >
                      <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mr-3 mt-0.5">
                        {{ index + 1 }}
                      </span>
                      <p class="text-sm text-gray-700">{{ recommendation }}</p>
                    </div>
                  </div>
                </div>

                  <!-- Raw Analysis Fallback -->
                  <div v-if="!parsedAnalysis.overallScore" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Full Analysis Text</h4>
                    <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ analysis }}</div>
                  </div>
                  </div> <!-- End of Detailed View -->
                </transition>

                <!-- Call Details -->
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm font-medium text-blue-900">Sales Agent</p>
                    <p class="text-lg font-semibold text-blue-700">{{ record.salesAgentName }}</p>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <p class="text-sm font-medium text-purple-900">Customer</p>
                    <p class="text-lg font-semibold text-purple-700">{{ record.customerName }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            @click="exportAnalysis"
            v-if="analysis"
            class="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export PDF
          </button>
          <button
            @click="copyToClipboard"
            v-if="analysis"
            class="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            Copy Text
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'AnalysisModal',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const loading = ref(true)
    const error = ref(null)
    const analysis = ref(null)
    const showDetailedView = ref(false)

    const parsedAnalysis = computed(() => {
      if (!analysis.value) return {
        overallScore: null,
        scoreBreakdown: [],
        strengths: [],
        improvements: [],
        recommendations: []
      }

      const text = analysis.value
      const parsed = {
        overallScore: null,
        scoreBreakdown: [],
        strengths: [],
        improvements: [],
        recommendations: []
      }

      // Extract overall score
      const overallScoreMatch = text.match(/(?:Overall|Effectiveness).*?Score.*?(\d+)/i)
      if (overallScoreMatch) {
        parsed.overallScore = parseInt(overallScoreMatch[1])
      }

      // Extract score breakdown
      const categoryScores = [
        { name: 'Rapport Building', regex: /Rapport Building.*?(\d+)\/25/i },
        { name: 'Product Knowledge', regex: /Product Knowledge.*?(\d+)\/25/i },
        { name: 'Objection Handling', regex: /Objection Handling.*?(\d+)\/25/i },
        { name: 'Closing Techniques', regex: /Closing Techniques.*?(\d+)\/25/i }
      ]

      categoryScores.forEach(category => {
        const match = text.match(category.regex)
        if (match) {
          const score = parseInt(match[1])
          
          // Try to find example for this category
          const exampleRegex = new RegExp(`${category.name}.*?example.*?"([^"]+)"`, 'is')
          const exampleMatch = text.match(exampleRegex)
          
          parsed.scoreBreakdown.push({
            category: category.name,
            score: score,
            example: exampleMatch ? exampleMatch[1] : null
          })
        }
      })

      // Extract strengths
      const strengthsSection = text.match(/(?:Strengths Observed|Strengths)[\s\S]*?(?=(?:Areas for Improvement|Actionable Recommendations|$))/i)
      if (strengthsSection) {
        const strengthLines = strengthsSection[0].split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[-*\d.]\s*/, '').trim())
          .filter(line => line.length > 10)
        
        parsed.strengths = strengthLines.slice(0, 5) // Limit to 5 items
      }

      // Extract improvements
      const improvementsSection = text.match(/(?:Areas for Improvement|Improvements)[\s\S]*?(?=(?:Actionable Recommendations|$))/i)
      if (improvementsSection) {
        const improvementLines = improvementsSection[0].split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[-*\d.]\s*/, '').trim())
          .filter(line => line.length > 10)
        
        parsed.improvements = improvementLines.slice(0, 5) // Limit to 5 items
      }

      // Extract recommendations
      const recommendationsSection = text.match(/(?:Actionable Recommendations|Recommendations)[\s\S]*$/i)
      if (recommendationsSection) {
        const recommendationLines = recommendationsSection[0].split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./))
          .map(line => line.replace(/^[-*\d.]\s*/, '').trim())
          .filter(line => line.length > 10)
        
        parsed.recommendations = recommendationLines.slice(0, 6) // Limit to 6 items
      }

      return parsed
    })

    const getScoreColor = (score, maxScore) => {
      const percentage = (score / maxScore) * 100
      if (percentage >= 80) return 'text-green-600'
      if (percentage >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }

    const getScoreBarColor = (score, maxScore) => {
      const percentage = (score / maxScore) * 100
      if (percentage >= 80) return 'bg-green-500'
      if (percentage >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    const toggleDetailedView = () => {
      showDetailedView.value = !showDetailedView.value
    }

    const analyzeTranscript = async () => {
      loading.value = true
      error.value = null
      
      try {
        const response = await $fetch('/api/analyze-transcript', {
          method: 'POST',
          body: {
            transcript: props.record.voiceNoteTranscript
          }
        })
        
        analysis.value = response.analysis
      } catch (err) {
        console.error('Error analyzing transcript:', err)
        error.value = err.data?.statusMessage || 'Failed to analyze transcript. Please check your API configuration.'
      } finally {
        loading.value = false
      }
    }

    const copyToClipboard = async () => {
      if (analysis.value) {
        try {
          await navigator.clipboard.writeText(analysis.value)
          // Show success notification
          const button = event.target.closest('button')
          const originalText = button.innerHTML
          button.innerHTML = '✓ Copied!'
          button.classList.add('bg-green-600')
          setTimeout(() => {
            button.innerHTML = originalText
            button.classList.remove('bg-green-600')
          }, 2000)
        } catch (err) {
          alert('Analysis copied to clipboard!')
        }
      }
    }

    const exportAnalysis = () => {
      if (analysis.value) {
        const content = `
SALES CALL ANALYSIS REPORT
Generated on: ${new Date().toLocaleString()}

Agent: ${props.record.salesAgentName}
Customer: ${props.record.customerName}
Date: ${new Date(props.record.callTimestamp).toLocaleDateString()}
Duration: ${Math.floor(props.record.callDurationSec / 60)}:${(props.record.callDurationSec % 60).toString().padStart(2, '0')}
Product: ${props.record.product}
Amount Quoted: ₹${props.record.amountQuoted?.toLocaleString() || 'N/A'}
Outcome: ${props.record.callOutcome}

${'='.repeat(60)}

${analysis.value}

${'='.repeat(60)}

This report was generated by the Sales Performance Analysis System.
        `.trim()

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Sales_Analysis_${props.record.salesAgentName}_${new Date().toISOString().split('T')[0]}.txt`
        link.click()
        URL.revokeObjectURL(url)
      }
    }

    const handleKeydown = (event) => {
      if (event.key === 'd' && !event.ctrlKey && !event.metaKey) {
        toggleDetailedView()
      } else if (event.key === 'Escape') {
        emit('close')
      }
    }

    onMounted(() => {
      analyzeTranscript()
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    return {
      loading,
      error,
      analysis,
      showDetailedView,
      parsedAnalysis,
      getScoreColor,
      getScoreBarColor,
      toggleDetailedView,
      analyzeTranscript,
      copyToClipboard,
      exportAnalysis
    }
  }
}
</script>