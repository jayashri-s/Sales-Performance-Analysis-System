<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Sales Performance Dashboard</h1>
            <p class="text-gray-600 mt-1">Analyze and monitor sales team performance</p>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              @click="openAudioAnalysis"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
              Analyze Audio
            </button>
            <button
              @click="toggleAnalyticsView"
              v-if="salesData.length > 0"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg v-if="showAnalytics" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 16.121m6.878-6.243L16.121 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
              </svg>
              {{ showAnalytics ? 'Hide Analytics' : 'View Analytics' }}
            </button>
            <button
              @click="loadSampleData"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Sample Data
            </button>
            <label class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              Upload JSON
              <input
                type="file"
                @change="handleFileUpload"
                accept=".json"
                class="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="salesData.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- KPI Cards - Always Visible -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Calls</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ analysis.summary.totalCalls }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Revenue</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ formatCurrency(analysis.summary.totalRevenue) }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Avg Call Duration</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ formatDuration(Math.round(analysis.summary.avgCallDuration)) }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Top Agent</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ analysis.summary.topAgent }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-lg">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Analytics Summary - When Hidden -->
      <div v-if="!showAnalytics" class="space-y-6">
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Analytics Available</h3>
                <p class="text-sm text-gray-600">{{ Object.keys(analysis.agentPerformance).length }} agents • {{ salesTrends.length }} days of data • {{ keywords.length }} keywords analyzed</p>
              </div>
            </div>
            <button
              @click="toggleAnalyticsView"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
              </svg>
              Show Charts
            </button>
          </div>
        </div>
        
        <QuickInsights :analysis="analysis" :salesData="salesData" />
      </div>

      <!-- Analytics Section - Toggleable -->
      <transition name="slide-down" mode="out-in">
        <div v-if="showAnalytics" class="space-y-8">
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <svg class="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
                </svg>
                <h2 class="text-2xl font-bold text-gray-900">Overall Analytics Dashboard</h2>
              </div>
              <div class="flex gap-2">
                <button
                  @click="exportAnalyticsSummary"
                  class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Export
                </button>
                <button
                  @click="printDashboard"
                  class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Print
                </button>
              </div>
            </div>
            <p class="text-gray-600">Comprehensive analysis of all sales data including agent performance, trends, and key insights.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="lg:col-span-2">
              <SalesAgentPerformance :agentData="analysis.agentPerformance" />
            </div>
            <div>
              <OutcomeDistribution :outcomeData="analysis.outcomeStats" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesTrendsChart :trendsData="salesTrends" />
            <KeywordAnalysis :keywords="keywords" />
          </div>

          <ChartPerformanceOverview
            :regionData="analysis.regionStats"
            :leadSourceData="analysis.leadSourceStats"
            :sentimentData="analysis.sentimentStats"
            :productData="analysis.productStats"
            class="mb-8"
          />
        </div>
      </transition>

      <!-- Sales Records Table - Always Visible -->
      <SalesRecordsTable
        :salesData="salesData"
      />
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="bg-white rounded-xl shadow-lg p-12 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No Data Loaded</h2>
        <p class="text-gray-600 mb-6">Upload a JSON file or load sample data to get started</p>
        <div class="flex gap-4 justify-center">
          <button
            @click="loadSampleData"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Sample Data
          </button>
          <label class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Upload JSON File
            <input
              type="file"
              @change="handleFileUpload"
              accept=".json"
              class="hidden"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Audio Analysis Modal -->
    <AudioAnalysisModal
      :isVisible="showAudioModal"
      @close="closeAudioModal"
      @analysis-complete="handleAudioAnalysis"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { analyzeSalesData, extractKeywords, getSalesTrends, formatCurrency, formatDuration } from '~/utils/salesAnalysis'
import AudioAnalysisModal from '~/components/AudioAnalysisModal.vue'

export default {
  name: 'Dashboard',
  components: {
    AudioAnalysisModal
  },
  setup() {
    const salesData = ref([])
    const showAnalytics = ref(false)
    const showAudioModal = ref(false)
    const analysis = ref({
      summary: {
        totalCalls: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        avgCallDuration: 0,
        topAgent: null
      },
      agentPerformance: {},
      productStats: {},
      outcomeStats: {},
      regionStats: {},
      sentimentStats: {},
      leadSourceStats: {}
    })

    const salesTrends = computed(() => {
      if (salesData.value.length === 0) return []
      return getSalesTrends(salesData.value)
    })

    const keywords = computed(() => {
      if (salesData.value.length === 0) return []
      const transcripts = salesData.value.map(record => record.voiceNoteTranscript || '')
      return extractKeywords(transcripts)
    })

    const loadSampleData = async () => {
      try {
        let response = await fetch('/lms_sales_calls_with_long_transcripts.json')
        if (!response.ok) {
          response = await fetch('/sample-data.json')
        }
        const data = await response.json()
        salesData.value = data
        analysis.value = analyzeSalesData(data)
      } catch (error) {
        console.error('Error loading sample data:', error)
        try {
          const response = await fetch('/sample-data.json')
          const data = await response.json()
          salesData.value = data
          analysis.value = analyzeSalesData(data)
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError)
        }
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            salesData.value = data
            analysis.value = analyzeSalesData(data)
          } catch (error) {
            console.error('Error parsing JSON:', error)
            alert('Invalid JSON file format')
          }
        }
        reader.readAsText(file)
      }
    }

    const toggleAnalyticsView = () => {
      showAnalytics.value = !showAnalytics.value
    }

    const exportAnalyticsSummary = () => {
      const summary = `
SALES PERFORMANCE ANALYTICS REPORT
Generated on: ${new Date().toLocaleString()}

${'='.repeat(60)}

EXECUTIVE SUMMARY
- Total Calls: ${analysis.value.summary.totalCalls}
- Total Revenue: ${formatCurrency(analysis.value.summary.totalRevenue)}
- Average Revenue per Call: ${formatCurrency(analysis.value.summary.avgRevenue)}
- Average Call Duration: ${formatDuration(Math.round(analysis.value.summary.avgCallDuration))}
- Top Performing Agent: ${analysis.value.summary.topAgent}

${'='.repeat(60)}

AGENT PERFORMANCE
${Object.entries(analysis.value.agentPerformance)
  .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
  .map(([name, data], index) => 
    `${index + 1}. ${name}
   - Calls: ${data.calls}
   - Revenue: ${formatCurrency(data.totalRevenue)}
   - Conversion Rate: ${data.conversionRate.toFixed(1)}%
   - Avg Call Duration: ${formatDuration(Math.round(data.avgCallDuration))}`
  ).join('\n\n')}

${'='.repeat(60)}

CALL OUTCOMES
${Object.entries(analysis.value.outcomeStats)
  .map(([outcome, count]) => `- ${outcome}: ${count} calls`)
  .join('\n')}

${'='.repeat(60)}

REGIONAL PERFORMANCE
${Object.entries(analysis.value.regionStats)
  .sort((a, b) => b[1].revenue - a[1].revenue)
  .map(([region, data]) => `- ${region}: ${data.calls} calls, ${formatCurrency(data.revenue)} revenue`)
  .join('\n')}

${'='.repeat(60)}

This report was generated by the Sales Performance Analysis System.
      `.trim()

      const blob = new Blob([summary], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Sales_Analytics_Report_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      URL.revokeObjectURL(url)
    }

    const printDashboard = () => {
      window.print()
    }

    const openAudioAnalysis = () => {
      showAudioModal.value = true
    }

    const closeAudioModal = () => {
      showAudioModal.value = false
    }

    const handleAudioAnalysis = (result) => {
      console.log('Audio analysis result:', result)
      // You can add additional handling here if needed
    }

    onMounted(() => {
      loadSampleData()
    })

    return {
      salesData,
      showAnalytics,
      showAudioModal,
      analysis,
      salesTrends,
      keywords,
      loadSampleData,
      handleFileUpload,
      toggleAnalyticsView,
      exportAnalyticsSummary,
      printDashboard,
      openAudioAnalysis,
      closeAudioModal,
      handleAudioAnalysis,
      formatCurrency,
      formatDuration
    }
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  transform-origin: top;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.95);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px) scaleY(0.95);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white !important;
  }
  
  .bg-gray-50 {
    background: white !important;
  }
  
  .shadow-md,
  .shadow-lg {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }
  
  .rounded-xl,
  .rounded-lg {
    border-radius: 8px !important;
  }
  
  canvas {
    max-height: 300px !important;
  }
}
</style>