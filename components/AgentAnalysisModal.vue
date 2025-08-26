<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Agent Analysis</h2>
          <p class="text-gray-600 mt-1">Agent: {{ record.salesAgentName }} | Agent ID: {{ agentId }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <!-- Agent ID Input -->
        <div class="mb-6 bg-blue-50 p-4 rounded-lg">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Agent ID for Analysis
          </label>
          <div class="flex gap-3">
            <input
              v-model="agentId"
              type="text"
              placeholder="Enter Agent ID (e.g., A001, Agent1, John)"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click="analyzeAgent"
              :disabled="isAnalyzing || !agentId.trim()"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isAnalyzing ? 'Analyzing...' : 'Analyze Agent' }}
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Enter the Agent ID as it appears in the transcript (case-sensitive)
          </p>
        </div>

        <!-- Analysis Results -->
        <div v-if="analysisResult" class="space-y-6">
          <!-- Metadata -->
          <div v-if="analysisResult.metadata" class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Analysis Metadata</h3>
            <div class="text-sm text-gray-700 space-y-1">
              <p><strong>Total Lines in Transcript:</strong> {{ analysisResult.metadata.totalLines }}</p>
              <p><strong>Agent's Lines:</strong> {{ analysisResult.metadata.agentLines }}</p>
              <p><strong>Participation Rate:</strong> {{ analysisResult.metadata.agentParticipationRate }}%</p>
            </div>
          </div>

          <!-- Filtered Transcript Preview -->
          <div v-if="analysisResult.filteredTranscript" class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 mb-2">Agent's Speech (Filtered)</h3>
            <div class="bg-white p-3 rounded border max-h-40 overflow-y-auto text-sm">
              <pre class="whitespace-pre-wrap font-mono text-gray-700">{{ analysisResult.filteredTranscript.substring(0, 500) }}{{ analysisResult.filteredTranscript.length > 500 ? '...' : '' }}</pre>
            </div>
          </div>

          <!-- Analysis Display -->
          <div class="bg-white border border-gray-200 rounded-lg">
            <div class="p-4 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Agent Analysis Results
                <span v-if="analysisResult.isLocal" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                  Local Analysis
                </span>
              </h3>
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
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Analyzing agent performance...</p>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p class="text-lg">Enter an Agent ID to analyze their performance</p>
          <p class="text-sm mt-2">The analysis will focus only on this agent's part of the conversation</p>
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
    const agentId = ref('')
    const isAnalyzing = ref(false)
    const analysisResult = ref(null)

    const analyzeAgent = async () => {
      if (!agentId.value.trim()) return
      
      isAnalyzing.value = true
      analysisResult.value = null

      try {
        const response = await $fetch('/api/analyze-agent', {
          method: 'POST',
          body: {
            transcript: props.record.voiceNoteTranscript || 'Sample transcript for analysis',
            agentId: agentId.value.trim()
          }
        })

        analysisResult.value = response
      } catch (error) {
        console.error('Agent analysis error:', error)
        analysisResult.value = {
          analysis: `Analysis failed: ${error.message}
          
Please check:
1. Agent ID format is correct
2. Agent participated in this conversation
3. Network connection is stable`,
          error: error.message,
          isLocal: true
        }
      } finally {
        isAnalyzing.value = false
      }
    }

    // Set default agent ID from record if available
    if (props.record.salesAgentName) {
      agentId.value = props.record.salesAgentName
    }

    return {
      agentId,
      isAnalyzing,
      analysisResult,
      analyzeAgent
    }
  }
}
</script>