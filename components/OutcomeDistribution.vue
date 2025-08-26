<template>
  <div class="bg-white rounded-xl shadow-lg p-6 h-full">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Call Outcomes</h2>
    <div class="space-y-4">
      <div v-for="(count, outcome) in sortedOutcomes" :key="outcome">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">{{ outcome }}</span>
          <span class="text-sm font-bold text-gray-900">{{ count }} ({{ getPercentage(count) }}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            :class="getOutcomeBarClass(outcome)"
            class="h-3 rounded-full transition-all duration-500"
            :style="`width: ${getPercentage(count)}%`"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ successRate }}%</p>
          <p class="text-xs text-gray-600">Success Rate</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">{{ total }}</p>
          <p class="text-xs text-gray-600">Total Calls</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'OutcomeDistribution',
  props: {
    outcomeData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const total = computed(() => {
      return Object.values(props.outcomeData).reduce((sum, count) => sum + count, 0)
    })

    const sortedOutcomes = computed(() => {
      return Object.entries(props.outcomeData)
        .sort((a, b) => b[1] - a[1])
        .reduce((acc, [outcome, count]) => {
          acc[outcome] = count
          return acc
        }, {})
    })

    const successRate = computed(() => {
      const successOutcomes = ['Closed', 'Interested']
      const successCount = Object.entries(props.outcomeData)
        .filter(([outcome]) => successOutcomes.includes(outcome))
        .reduce((sum, [, count]) => sum + count, 0)
      return ((successCount / total.value) * 100).toFixed(1)
    })

    const getPercentage = (count) => {
      return ((count / total.value) * 100).toFixed(1)
    }

    const getOutcomeBarClass = (outcome) => {
      const classes = {
        'Closed': 'bg-green-500',
        'Interested': 'bg-blue-500',
        'Follow-up': 'bg-yellow-500',
        'Not Interested': 'bg-red-500',
        'Voicemail': 'bg-gray-500'
      }
      return classes[outcome] || 'bg-gray-500'
    }

    return {
      total,
      sortedOutcomes,
      successRate,
      getPercentage,
      getOutcomeBarClass
    }
  }
}
</script>