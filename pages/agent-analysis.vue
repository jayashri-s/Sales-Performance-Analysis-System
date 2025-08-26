<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Agent Performance Analysis</h1>
            <p class="text-gray-600 mt-2">Individual sales agent analysis using real LMES LMS call data</p>
          </div>
          <div class="flex space-x-4">
            <NuxtLink 
              to="/"
              class="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </NuxtLink>
            <NuxtLink 
              to="/dashboard"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Introduction -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-8">
        <h2 class="text-2xl font-bold mb-2">Real Sales Call Analysis</h2>
        <p class="text-blue-100 mb-4">
          Analyze individual agent performance using actual sales call transcripts from LMES LMS sales conversations. 
          This analysis focuses on single-agent performance across multiple calls.
        </p>
        <div class="grid md:grid-cols-4 gap-4 text-center">
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <div class="text-2xl font-bold">{{ totalAgents }}</div>
            <div class="text-sm text-blue-100">Sales Agents</div>
          </div>
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <div class="text-2xl font-bold">{{ totalCalls }}</div>
            <div class="text-sm text-blue-100">Total Calls</div>
          </div>
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <div class="text-2xl font-bold">₹{{ totalRevenue.toLocaleString() }}</div>
            <div class="text-sm text-blue-100">Total Revenue</div>
          </div>
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <div class="text-2xl font-bold">{{ avgCallsPerAgent }}</div>
            <div class="text-sm text-blue-100">Avg Calls/Agent</div>
          </div>
        </div>
      </div>

      <!-- Real Data Agent Analysis Component -->
      <RealDataAgentAnalysis />

      <!-- Features Info -->
      <div class="mt-12 bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Analysis Features</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">Performance Scoring</h4>
              <p class="text-sm text-gray-600">Comprehensive scoring across 4 key categories: Rapport, Product Knowledge, Objection Handling, and Closing</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">Multi-Call Analysis</h4>
              <p class="text-sm text-gray-600">Aggregated analysis across all calls for comprehensive agent performance evaluation</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">LMS-Specific Insights</h4>
              <p class="text-sm text-gray-600">Tailored analysis for LMES LMS sales with education sector specific objection handling</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">Actionable Recommendations</h4>
              <p class="text-sm text-gray-600">Prioritized coaching recommendations based on actual call performance patterns</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">Real Data Driven</h4>
              <p class="text-sm text-gray-600">Analysis based on actual LMES LMS sales call transcripts with real outcomes and revenue data</p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-900">Export & Share</h4>
              <p class="text-sm text-gray-600">Export detailed analysis reports for coaching sessions and performance reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'AgentAnalysisPage',
  setup() {
    const salesData = ref([])

    const totalAgents = computed(() => {
      return new Set(salesData.value.map(call => call.salesAgentName)).size
    })

    const totalCalls = computed(() => salesData.value.length)

    const totalRevenue = computed(() => {
      return salesData.value.reduce((sum, call) => sum + (call.amountQuoted || 0), 0)
    })

    const avgCallsPerAgent = computed(() => {
      return totalAgents.value > 0 ? Math.round(totalCalls.value / totalAgents.value) : 0
    })

    const loadSalesData = async () => {
      try {
        const response = await fetch('/lms_sales_calls_with_long_transcripts.json')
        if (response.ok) {
          salesData.value = await response.json()
        }
      } catch (error) {
        console.warn('Could not load sales data for stats:', error)
      }
    }

    onMounted(() => {
      loadSalesData()
    })

    return {
      totalAgents,
      totalCalls,
      totalRevenue,
      avgCallsPerAgent
    }
  }
}
</script>