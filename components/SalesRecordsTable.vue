<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 class="text-xl font-bold text-gray-900">Sales Records</h2>
        <div class="flex flex-wrap gap-4">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name or transcript..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            v-model="filters.agent"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Agents</option>
            <option v-for="agent in uniqueAgents" :key="agent" :value="agent">
              {{ agent }}
            </option>
          </select>
          <select
            v-model="filters.outcome"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Outcomes</option>
            <option v-for="outcome in uniqueOutcomes" :key="outcome" :value="outcome">
              {{ outcome }}
            </option>
          </select>
          <select
            v-model="filters.region"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Outcome
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="record in paginatedRecords"
            :key="record.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ record.salesAgentName }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ record.customerName }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(record.callTimestamp) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ record.product }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ record.region }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDuration(record.callDurationSec) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ formatCurrency(record.amountQuoted) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getOutcomeClass(record.callOutcome)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ record.callOutcome }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="showTranscript(record)"
                class="text-blue-600 hover:text-blue-900 text-sm font-medium mr-3"
              >
                View
              </button>
              <button
                @click="analyzeRecord(record)"
                class="text-green-600 hover:text-green-900 text-sm font-medium"
              >
                Analyze
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredRecords.length }} results
      </div>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-1 text-sm border rounded-md',
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <TranscriptModal
      v-if="selectedRecord"
      :record="selectedRecord"
      @close="selectedRecord = null"
    />

    <AnalysisModal
      v-if="recordToAnalyze"
      :record="recordToAnalyze"
      @close="recordToAnalyze = null"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { formatCurrency, formatDuration } from '~/utils/salesAnalysis'

export default {
  name: 'SalesRecordsTable',
  props: {
    salesData: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const filters = ref({
      search: '',
      agent: '',
      outcome: '',
      region: ''
    })

    const currentPage = ref(1)
    const itemsPerPage = 10
    const selectedRecord = ref(null)
    const recordToAnalyze = ref(null)

    const uniqueAgents = computed(() => {
      return [...new Set(props.salesData.map(r => r.salesAgentName))].sort()
    })

    const uniqueOutcomes = computed(() => {
      return [...new Set(props.salesData.map(r => r.callOutcome))].sort()
    })

    const uniqueRegions = computed(() => {
      return [...new Set(props.salesData.map(r => r.region))].sort()
    })

    const filteredRecords = computed(() => {
      return props.salesData.filter(record => {
        const searchTerm = filters.value.search.toLowerCase()
        const matchesSearch = !searchTerm || 
          record.salesAgentName.toLowerCase().includes(searchTerm) ||
          record.customerName.toLowerCase().includes(searchTerm) ||
          (record.voiceNoteTranscript && record.voiceNoteTranscript.toLowerCase().includes(searchTerm))
        
        const matchesAgent = !filters.value.agent || record.salesAgentName === filters.value.agent
        const matchesOutcome = !filters.value.outcome || record.callOutcome === filters.value.outcome
        const matchesRegion = !filters.value.region || record.region === filters.value.region
        
        return matchesSearch && matchesAgent && matchesOutcome && matchesRegion
      })
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredRecords.value.length / itemsPerPage)
    })

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage, filteredRecords.value.length)
    })

    const paginatedRecords = computed(() => {
      return filteredRecords.value.slice(startIndex.value, endIndex.value)
    })

    const displayedPages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    const getOutcomeClass = (outcome) => {
      const classes = {
        'Closed': 'bg-green-100 text-green-800',
        'Interested': 'bg-blue-100 text-blue-800',
        'Follow-up': 'bg-yellow-100 text-yellow-800',
        'Not Interested': 'bg-red-100 text-red-800',
        'Voicemail': 'bg-gray-100 text-gray-800'
      }
      return classes[outcome] || 'bg-gray-100 text-gray-800'
    }

    const showTranscript = (record) => {
      selectedRecord.value = record
    }

    const analyzeRecord = (record) => {
      recordToAnalyze.value = record
    }

    return {
      filters,
      currentPage,
      itemsPerPage,
      selectedRecord,
      recordToAnalyze,
      uniqueAgents,
      uniqueOutcomes,
      uniqueRegions,
      filteredRecords,
      totalPages,
      startIndex,
      endIndex,
      paginatedRecords,
      displayedPages,
      formatDate,
      getOutcomeClass,
      showTranscript,
      analyzeRecord,
      formatCurrency,
      formatDuration
    }
  }
}
</script>