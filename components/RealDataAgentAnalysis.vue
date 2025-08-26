<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Real Sales Data - Agent Analysis</h2>
      <p class="text-gray-600">Analyze individual agent performance using actual sales call transcripts from LMES LMS.</p>
    </div>

    <!-- Agent Selection -->
    <div class="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Agent for Analysis</h3>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Choose Agent
          </label>
          <select
            v-model="selectedAgent"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an agent...</option>
            <option 
              v-for="agent in availableAgents" 
              :key="agent.name" 
              :value="agent.name"
            >
              {{ agent.name }} ({{ agent.callCount }} calls)
            </option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button
            @click="analyzeSelectedAgent"
            :disabled="!selectedAgent || isAnalyzing"
            class="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isAnalyzing ? 'Analyzing...' : 'Analyze Agent Performance' }}
          </button>
        </div>
      </div>

      <div v-if="selectedAgent" class="bg-white p-4 rounded-lg border">
        <h4 class="font-semibold text-gray-900 mb-2">{{ selectedAgent }} - Call Summary</h4>
        <div v-if="getAgentSummary(selectedAgent)" class="text-sm text-gray-700 space-y-1">
          <p><strong>Total Calls:</strong> {{ getAgentSummary(selectedAgent).calls }}</p>
          <p><strong>Total Revenue:</strong> ₹{{ getAgentSummary(selectedAgent).revenue.toLocaleString() }}</p>
          <p><strong>Avg Deal Size:</strong> ₹{{ Math.round(getAgentSummary(selectedAgent).revenue / getAgentSummary(selectedAgent).calls).toLocaleString() }}</p>
          <p><strong>Outcomes:</strong> {{ getAgentSummary(selectedAgent).outcomes.join(', ') }}</p>
        </div>
      </div>
    </div>

    <!-- Agent List Display -->
    <div v-if="!analysisResult && !isAnalyzing" class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Available Agents</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="agent in availableAgents"
          :key="agent.name"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          :class="{ 'ring-2 ring-blue-500 bg-blue-50': selectedAgent === agent.name }"
          @click="selectedAgent = agent.name"
        >
          <h4 class="font-semibold text-gray-900">{{ agent.name }}</h4>
          <p class="text-sm text-gray-600">{{ agent.callCount }} sales calls</p>
          <p class="text-xs text-gray-500 mt-1">
            Revenue: ₹{{ agent.totalRevenue.toLocaleString() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isAnalyzing" class="text-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-600 mt-4 text-lg">Analyzing {{ selectedAgent }}'s performance...</p>
      <p class="text-sm text-gray-500 mt-2">Processing real sales call transcripts</p>
    </div>

    <!-- Analysis Results -->
    <div v-if="analysisResult && !isAnalyzing" class="space-y-6">
      <!-- Metadata -->
      <div class="bg-green-50 p-4 rounded-lg">
        <h3 class="font-semibold text-green-900 mb-2">Analysis Complete ✓</h3>
        <div class="text-sm text-green-700 space-y-1">
          <p><strong>Agent:</strong> {{ analysisResult.salesAgentName }}</p>
          <p><strong>Calls Analyzed:</strong> {{ analysisResult.callsFound }}</p>
          <div v-if="analysisResult.agentCalls && analysisResult.agentCalls.length > 0">
            <p><strong>Calls Included:</strong></p>
            <div class="ml-4 mt-2 space-y-1">
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
            {{ selectedAgent }} - Performance Analysis
            <span v-if="analysisResult.isLocal" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
              Local Analysis
            </span>
          </h3>
          <p class="text-sm text-gray-600 mt-1">Based on {{ analysisResult.callsFound }} real sales calls</p>
        </div>
        
        <div class="p-6">
          <div class="prose prose-sm max-w-none">
            <pre class="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{{ analysisResult.analysis }}</pre>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <button
          @click="resetAnalysis"
          class="px-6 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
        >
          Analyze Another Agent
        </button>
        <button
          @click="exportAnalysis"
          class="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
        >
          Export Analysis
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 p-4 rounded-lg">
      <h3 class="font-semibold text-red-900 mb-2">Analysis Error</h3>
      <p class="text-red-700">{{ error }}</p>
      <button
        @click="resetAnalysis"
        class="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'RealDataAgentAnalysis',
  setup() {
    const salesData = ref([])
    const selectedAgent = ref('')
    const isAnalyzing = ref(false)
    const analysisResult = ref(null)
    const error = ref(null)

    const availableAgents = computed(() => {
      const agentMap = new Map()
      
      salesData.value.forEach(call => {
        const agentName = call.salesAgentName
        if (!agentMap.has(agentName)) {
          agentMap.set(agentName, {
            name: agentName,
            callCount: 0,
            totalRevenue: 0
          })
        }
        
        const agent = agentMap.get(agentName)
        agent.callCount++
        agent.totalRevenue += call.amountQuoted || 0
      })
      
      return Array.from(agentMap.values()).sort((a, b) => b.callCount - a.callCount)
    })

    const loadSalesData = async () => {
      try {
        const response = await fetch('/lms_sales_calls_with_long_transcripts.json')
        if (!response.ok) throw new Error('Failed to load sales data')
        salesData.value = await response.json()
      } catch (err) {
        error.value = `Failed to load sales data: ${err.message}`
      }
    }

    const getAgentSummary = (agentName) => {
      if (!agentName || !salesData.value.length) return null
      
      const agentCalls = salesData.value.filter(call => call.salesAgentName === agentName)
      
      return {
        calls: agentCalls.length,
        revenue: agentCalls.reduce((sum, call) => sum + (call.amountQuoted || 0), 0),
        outcomes: [...new Set(agentCalls.map(call => call.callOutcome))]
      }
    }

    const analyzeSelectedAgent = async () => {
      if (!selectedAgent.value) return
      
      isAnalyzing.value = true
      error.value = null
      analysisResult.value = null

      try {
        const response = await $fetch('/api/analyze-agent-from-data', {
          method: 'POST',
          body: {
            salesAgentName: selectedAgent.value
          }
        })

        analysisResult.value = response
      } catch (err) {
        error.value = `Analysis failed: ${err.message}`
        console.error('Agent analysis error:', err)
      } finally {
        isAnalyzing.value = false
      }
    }

    const resetAnalysis = () => {
      analysisResult.value = null
      error.value = null
      selectedAgent.value = ''
    }

    const exportAnalysis = () => {
      if (!analysisResult.value) return
      
      const exportData = {
        agent: analysisResult.value.salesAgentName,
        analyzedAt: new Date().toISOString(),
        callsAnalyzed: analysisResult.value.callsFound,
        analysis: analysisResult.value.analysis
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${analysisResult.value.salesAgentName}_analysis_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    onMounted(() => {
      loadSalesData()
    })

    return {
      salesData,
      selectedAgent,
      isAnalyzing,
      analysisResult,
      error,
      availableAgents,
      getAgentSummary,
      analyzeSelectedAgent,
      resetAnalysis,
      exportAnalysis
    }
  }
}
</script>