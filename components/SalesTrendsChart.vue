<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Sales Trends</h2>
      <select
        v-model="selectedMetric"
        class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="revenue">Revenue</option>
        <option value="calls">Calls</option>
        <option value="conversions">Conversions</option>
        <option value="conversionRate">Conversion Rate</option>
      </select>
    </div>
    
    <div class="relative h-64">
      <div class="absolute inset-0 flex items-end justify-between gap-1 px-2">
        <div
          v-for="(day, index) in trendsData"
          :key="index"
          class="flex-1 flex flex-col items-center"
        >
          <div class="w-full flex flex-col items-center">
            <span class="text-xs font-medium text-gray-700 mb-1">
              {{ getMetricValue(day) }}
            </span>
            <div
              :class="getBarColor(index)"
              class="w-full rounded-t transition-all duration-500 hover:opacity-80"
              :style="`height: ${getBarHeight(day)}px`"
              :title="`${formatDate(day.date)}: ${getMetricValue(day)}`"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-between mt-4 px-2">
      <span class="text-xs text-gray-600">{{ formatDate(trendsData[0]?.date) }}</span>
      <span class="text-xs text-gray-600">{{ formatDate(trendsData[trendsData.length - 1]?.date) }}</span>
    </div>
    
    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
      <div class="text-center">
        <p class="text-lg font-bold text-gray-900">{{ formatCurrency(totalRevenue) }}</p>
        <p class="text-xs text-gray-600">Total Revenue</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold text-gray-900">{{ totalCalls }}</p>
        <p class="text-xs text-gray-600">Total Calls</p>
      </div>
      <div class="text-center">
        <p class="text-lg font-bold text-gray-900">{{ avgConversionRate }}%</p>
        <p class="text-xs text-gray-600">Avg Conversion</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { formatCurrency } from '~/utils/salesAnalysis'

export default {
  name: 'SalesTrendsChart',
  props: {
    trendsData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const selectedMetric = ref('revenue')

    const maxValue = computed(() => {
      if (!props.trendsData.length) return 0
      
      switch (selectedMetric.value) {
        case 'revenue':
          return Math.max(...props.trendsData.map(d => d.revenue))
        case 'calls':
          return Math.max(...props.trendsData.map(d => d.calls))
        case 'conversions':
          return Math.max(...props.trendsData.map(d => d.conversions))
        case 'conversionRate':
          return Math.max(...props.trendsData.map(d => d.conversionRate))
        default:
          return 0
      }
    })

    const totalRevenue = computed(() => {
      return props.trendsData.reduce((sum, d) => sum + d.revenue, 0)
    })

    const totalCalls = computed(() => {
      return props.trendsData.reduce((sum, d) => sum + d.calls, 0)
    })

    const avgConversionRate = computed(() => {
      if (!props.trendsData.length) return 0
      const avg = props.trendsData.reduce((sum, d) => sum + d.conversionRate, 0) / props.trendsData.length
      return avg.toFixed(1)
    })

    const getBarHeight = (day) => {
      if (!maxValue.value) return 0
      
      let value
      switch (selectedMetric.value) {
        case 'revenue':
          value = day.revenue
          break
        case 'calls':
          value = day.calls
          break
        case 'conversions':
          value = day.conversions
          break
        case 'conversionRate':
          value = day.conversionRate
          break
        default:
          value = 0
      }
      
      return (value / maxValue.value) * 200
    }

    const getMetricValue = (day) => {
      switch (selectedMetric.value) {
        case 'revenue':
          return formatCurrency(day.revenue)
        case 'calls':
          return day.calls
        case 'conversions':
          return day.conversions
        case 'conversionRate':
          return `${day.conversionRate.toFixed(1)}%`
        default:
          return 0
      }
    }

    const getBarColor = (index) => {
      const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-yellow-500',
        'bg-pink-500',
        'bg-indigo-500'
      ]
      return colors[index % colors.length]
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return {
      selectedMetric,
      maxValue,
      totalRevenue,
      totalCalls,
      avgConversionRate,
      getBarHeight,
      getMetricValue,
      getBarColor,
      formatDate,
      formatCurrency
    }
  }
}
</script>