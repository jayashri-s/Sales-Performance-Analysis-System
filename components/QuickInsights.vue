<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Quick Insights</h3>
      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-green-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-600">{{ conversionRate }}%</div>
        <div class="text-xs text-green-700">Conversion Rate</div>
      </div>
      
      <div class="bg-blue-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(avgRevenue) }}</div>
        <div class="text-xs text-blue-700">Avg Revenue</div>
      </div>
      
      <div class="bg-purple-50 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-600">{{ topRegion }}</div>
        <div class="text-xs text-purple-700">Top Region</div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Recent Activity</span>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-green-600">{{ recentCallsToday }} calls today</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { formatCurrency } from '~/utils/salesAnalysis'

export default {
  name: 'QuickInsights',
  props: {
    analysis: {
      type: Object,
      required: true
    },
    salesData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const conversionRate = computed(() => {
      const totalCalls = props.analysis.summary.totalCalls
      const successfulCalls = Object.entries(props.analysis.outcomeStats)
        .filter(([outcome]) => ['Closed', 'Interested'].includes(outcome))
        .reduce((sum, [, count]) => sum + count, 0)
      
      return totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '0'
    })

    const avgRevenue = computed(() => {
      return props.analysis.summary.avgRevenue || 0
    })

    const topRegion = computed(() => {
      const regions = props.analysis.regionStats
      if (!regions || Object.keys(regions).length === 0) return 'N/A'
      
      const topRegion = Object.entries(regions)
        .sort((a, b) => b[1].revenue - a[1].revenue)[0]
      
      return topRegion ? topRegion[0] : 'N/A'
    })

    const recentCallsToday = computed(() => {
      const today = new Date().toDateString()
      return props.salesData.filter(call => {
        const callDate = new Date(call.callTimestamp).toDateString()
        return callDate === today
      }).length
    })

    return {
      conversionRate,
      avgRevenue,
      topRegion,
      recentCallsToday,
      formatCurrency
    }
  }
}
</script>