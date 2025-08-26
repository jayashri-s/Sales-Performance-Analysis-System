<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Single Agent Analysis</h2>
          <p class="text-gray-600 mt-1">Analyze all sales calls for: {{ record.salesAgentName }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <!-- Agent Analysis Action -->
        <div class="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Performance Analysis</h3>
          <p class="text-sm text-gray-600 mb-4">
            This will analyze ALL sales calls by {{ record.salesAgentName }} using the complete sales database,
            providing comprehensive insights into their performance patterns, strengths, and areas for improvement.
          </p>
          <button
            @click="analyzeAgent"
            :disabled="isAnalyzing"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isAnalyzing ? 'Analyzing All Calls...' : 'Analyze Agent Performance' }}
          </button>
        </div>

        <!-- Analysis Results -->
        <div v-if="analysisResult" class="space-y-6">
          <!-- Analysis Metadata -->
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-900 mb-2">Analysis Complete ✓</h3>
            <div class="text-sm text-green-700 space-y-1">
              <p><strong>Agent:</strong> {{ analysisResult.salesAgentName }}</p>
              <p><strong>Calls Analyzed:</strong> {{ analysisResult.callsFound }}</p>
              <div v-if="analysisResult.agentCalls && analysisResult.agentCalls.length > 0">
                <p><strong>Calls Included:</strong></p>
                <div class="ml-4 mt-2 space-y-1 max-h-32 overflow-y-auto">
                  <div v-for="call in analysisResult.agentCalls" :key="call.id" class="text-xs bg-white p-2 rounded">
                    <span class="font-medium">{{ call.customerName }}</span> - 
                    <span class="text-green-600">{{ call.callOutcome }}</span> - 
                    <span>₹{{ call.amountQuoted?.toLocaleString() || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Analysis Display -->
          <div class="bg-white border border-gray-200 rounded-lg">
            <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                {{ record.salesAgentName }} - Performance Analysis
                <span v-if="analysisResult.isLocal" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                  Local Analysis
                </span>
              </h3>
              <p class="text-sm text-gray-600 mt-1">Based on {{ analysisResult.callsFound }} real sales calls</p>
            </div>
            
            <div class="p-4">
              <div class="prose prose-sm max-w-none">
                <pre class="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{{ analysisResult.analysis }}</pre>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="analysisResult.error" class="bg-red-50 p-4 rounded-lg">
            <h3 class="font-semibold text-red-900 mb-2">Analysis Warning</h3>
            <p class="text-red-700">{{ analysisResult.error }}</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="isAnalyzing" class="text-center py-12">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4 text-lg">Analyzing {{ record.salesAgentName }}'s performance...</p>
          <p class="text-sm text-gray-500 mt-2">Processing all sales call transcripts and generating insights</p>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
          </svg>
          <p class="text-lg">Ready to analyze {{ record.salesAgentName }}'s performance</p>
          <p class="text-sm mt-2">Click the button above to analyze all sales calls by this agent</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AgentAnalysisModal',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const isAnalyzing = ref(false)
    const analysisResult = ref(null)

    const analyzeAgent = async () => {
      if (!props.record.salesAgentName) return
      
      isAnalyzing.value = true
      analysisResult.value = null

      try {
        const response = await $fetch('/api/analyze-agent-from-data', {
          method: 'POST',
          body: {
            salesAgentName: props.record.salesAgentName
          }
        })

        analysisResult.value = response
      } catch (error) {
        console.error('Agent analysis error:', error)
        analysisResult.value = {
          analysis: `Analysis failed: ${error.message}
          
This analysis reviews all sales calls for ${props.record.salesAgentName} to provide comprehensive performance insights.

Please check:
1. Sales data is properly loaded
2. Network connection is stable
3. API endpoint is running`,
          error: error.message,
          isLocal: true,
          salesAgentName: props.record.salesAgentName,
          callsFound: 0
        }
      } finally {
        isAnalyzing.value = false
      }
    }

    return {
      isAnalyzing,
      analysisResult,
      analyzeAgent
    }
  }
}
</script>