<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-6">Keyword Analysis</h2>
    <div class="space-y-3">
      <div
        v-for="(keyword, index) in displayedKeywords"
        :key="keyword.word"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold text-gray-500 w-6">{{ index + 1 }}</span>
          <span class="text-sm font-medium text-gray-900">{{ keyword.word }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-32 bg-gray-200 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
              :style="`width: ${(keyword.count / maxCount) * 100}%`"
            ></div>
          </div>
          <span class="text-sm font-bold text-gray-700 w-10 text-right">{{ keyword.count }}</span>
        </div>
      </div>
    </div>
    
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-600">
          Top {{ displayedKeywords.length }} of {{ keywords.length }} keywords
        </p>
        <button
          @click="showAll = !showAll"
          v-if="keywords.length > 10"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {{ showAll ? 'Show Less' : 'Show All' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'KeywordAnalysis',
  props: {
    keywords: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const showAll = ref(false)

    const displayedKeywords = computed(() => {
      return showAll.value ? props.keywords : props.keywords.slice(0, 10)
    })

    const maxCount = computed(() => {
      if (props.keywords.length === 0) return 0
      return Math.max(...props.keywords.map(k => k.count))
    })

    return {
      showAll,
      displayedKeywords,
      maxCount
    }
  }
}
</script>