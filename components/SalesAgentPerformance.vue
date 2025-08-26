<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Agent Performance</h2>
    <div class="space-y-4">
      <div
        v-for="(agent, name) in sortedAgents"
        :key="name"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ name }}</h3>
            <p class="text-sm text-gray-600">{{ agent.calls }} calls | {{ formatDuration(Math.round(agent.avgCallDuration)) }} avg</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(agent.totalRevenue) }}</p>
            <p class="text-sm text-gray-600">{{ agent.conversionRate.toFixed(1) }}% conversion</p>
            <button
              @click="analyzeAgent(name)"
              class="text-xs text-purple-600 hover:text-purple-900 font-medium mt-1 block"
            >
              Analyze Agent →
            </button>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Performance</span>
            <span>{{ ((agent.totalRevenue / maxRevenue) * 100).toFixed(0) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              :style="`width: ${(agent.totalRevenue / maxRevenue) * 100}%`"
            ></div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(count, outcome) in agent.outcomes"
            :key="outcome"
            :class="getOutcomeClass(outcome)"
            class="px-2 py-1 text-xs font-medium rounded"
          >
            {{ outcome }}: {{ count }}
          </span>
        </div>
      </div>
    </div>
    
    <AgentAnalysisModal
      v-if="selectedAgentForAnalysis"
      :record="selectedAgentForAnalysis"
      @close="selectedAgentForAnalysis = null"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { formatCurrency, formatDuration } from '~/utils/salesAnalysis'

export default {
  name: 'SalesAgentPerformance',
  props: {
    agentData: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const selectedAgentForAnalysis = ref(null)

    const sortedAgents = computed(() => {
      return Object.entries(props.agentData)
        .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
        .reduce((acc, [name, data]) => {
          acc[name] = data
          return acc
        }, {})
    })

    const maxRevenue = computed(() => {
      return Math.max(...Object.values(props.agentData).map(a => a.totalRevenue))
    })

    const getOutcomeClass = (outcome) => {
      const classes = {
        'Closed': 'bg-green-100 text-green-700',
        'Interested': 'bg-blue-100 text-blue-700',
        'Follow-up': 'bg-yellow-100 text-yellow-700',
        'Not Interested': 'bg-red-100 text-red-700',
        'Voicemail': 'bg-gray-100 text-gray-700'
      }
      return classes[outcome] || 'bg-gray-100 text-gray-700'
    }

    const analyzeAgent = (agentName) => {
      // Create a mock record for the agent analysis
      selectedAgentForAnalysis.value = {
        salesAgentName: agentName,
        voiceNoteTranscript: `Sample transcript for analysis of agent ${agentName}. This would contain the actual conversation transcript in a real scenario.`
      }
    }

    return {
      selectedAgentForAnalysis,
      sortedAgents,
      maxRevenue,
      getOutcomeClass,
      analyzeAgent,
      formatCurrency,
      formatDuration
    }
  }
}
</script>