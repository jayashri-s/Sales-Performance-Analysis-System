<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">
                    Call Details
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ formatDate(record.callTimestamp) }}
                  </p>
                </div>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-500"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm font-medium text-gray-600">Sales Agent</p>
                  <p class="text-lg font-semibold text-gray-900">{{ record.salesAgentName }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm font-medium text-gray-600">Customer</p>
                  <p class="text-lg font-semibold text-gray-900">{{ record.customerName }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm font-medium text-gray-600">Product</p>
                  <p class="text-lg font-semibold text-gray-900">{{ record.product }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm font-medium text-gray-600">Amount Quoted</p>
                  <p class="text-lg font-semibold text-gray-900">{{ formatCurrency(record.amountQuoted) }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mb-6">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {{ record.region }}
                </span>
                <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {{ record.language }}
                </span>
                <span :class="getSentimentClass(record.sentiment)" class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ record.sentiment }}
                </span>
                <span :class="getOutcomeClass(record.callOutcome)" class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ record.callOutcome }}
                </span>
                <span class="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {{ formatDuration(record.callDurationSec) }}
                </span>
              </div>

              <div v-if="record.tags && record.tags.length > 0" class="mb-6">
                <p class="text-sm font-medium text-gray-600 mb-2">Tags</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in record.tags"
                    :key="tag"
                    class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>

              <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                  <p class="text-sm font-medium text-gray-600">Voice Note Transcript</p>
                  <button
                    v-if="record.voiceNoteFile"
                    class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Play Recording
                  </button>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ record.voiceNoteTranscript }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="analyzeWithAI"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Analyze with AI
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <AnalysisModal
      v-if="showAnalysis"
      :record="record"
      @close="showAnalysis = false"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { formatCurrency, formatDuration } from '~/utils/salesAnalysis'

export default {
  name: 'TranscriptModal',
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const showAnalysis = ref(false)

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }

    const getSentimentClass = (sentiment) => {
      const classes = {
        'positive': 'bg-green-100 text-green-800',
        'neutral': 'bg-gray-100 text-gray-800',
        'negative': 'bg-red-100 text-red-800'
      }
      return classes[sentiment] || 'bg-gray-100 text-gray-800'
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

    const analyzeWithAI = () => {
      showAnalysis.value = true
    }

    return {
      showAnalysis,
      formatDate,
      getSentimentClass,
      getOutcomeClass,
      analyzeWithAI,
      formatCurrency,
      formatDuration
    }
  }
}
</script>