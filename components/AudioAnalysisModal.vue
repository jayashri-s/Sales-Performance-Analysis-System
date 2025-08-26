<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Audio Call Analysis</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- Upload Section -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <div class="mb-4">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="mb-4">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                class="hidden"
              />
              <button
                @click="$refs.fileInput.click()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                :disabled="isAnalyzing"
              >
                Upload Audio File
              </button>
            </div>
            <p class="text-sm text-gray-600">
              Supports MP3, WAV, M4A, OGG formats
            </p>
          </div>

          <div class="text-center text-gray-500">
            <span class="bg-gray-100 px-3 py-1 rounded-full text-sm">OR</span>
          </div>

          <!-- Recording Section -->
          <div class="border border-gray-300 rounded-lg p-6 text-center">
            <div class="mb-4">
              <div class="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div v-if="!isRecording && !recordedAudio" class="mb-4">
              <button
                @click="startRecording"
                class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                :disabled="isAnalyzing"
              >
                Start Recording
              </button>
              <p class="text-sm text-gray-600 mt-2">Click to start recording your call</p>
            </div>

            <div v-if="isRecording" class="mb-4">
              <div class="flex items-center justify-center space-x-4 mb-4">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-lg font-mono text-red-600">{{ formatTime(recordingTime) }}</span>
              </div>
              <button
                @click="stopRecording"
                class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Stop Recording
              </button>
            </div>

            <div v-if="recordedAudio && !isRecording" class="mb-4">
              <div class="bg-green-50 rounded-lg p-4 mb-4">
                <div class="flex items-center justify-center space-x-4 mb-3">
                  <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-green-700 font-medium">Recording completed!</span>
                </div>
                <audio controls class="w-full">
                  <source :src="recordedAudioUrl" type="audio/webm">
                  Your browser does not support the audio element.
                </audio>
              </div>
              <div class="flex space-x-3 justify-center">
                <button
                  @click="clearRecording"
                  class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  :disabled="isAnalyzing"
                >
                  Record Again
                </button>
                <button
                  @click="analyzeRecording"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  :disabled="isAnalyzing"
                >
                  AI Analysis
                </button>
                <button
                  @click="analyzeDemoRecording"
                  class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  :disabled="isAnalyzing"
                >
                  Demo Analysis
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Status -->
          <div v-if="uploadedFile" class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <div class="flex-1">
                <p class="text-blue-700 font-medium">{{ uploadedFile.name }}</p>
                <p class="text-blue-600 text-sm">{{ (uploadedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="analyzeUploadedFile"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  :disabled="isAnalyzing"
                >
                  AI Analysis
                </button>
                <button
                  @click="analyzeDemoFile"
                  class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  :disabled="isAnalyzing"
                >
                  Demo Analysis
                </button>
              </div>
            </div>
          </div>

          <!-- Demo Analysis Button -->
          <div v-if="!uploadedFile && !recordedAudio && !isAnalyzing && !analysisResult" class="text-center py-6 border-t border-gray-200">
            <div class="mb-4">
              <svg class="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Try Demo Analysis</h3>
            <p class="text-sm text-gray-600 mb-4">
              See how our sales call analysis works with sample data
            </p>
            <button
              @click="runStandaloneDemo"
              class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
            >
              Run Demo Analysis
            </button>
          </div>

          <!-- Analysis Loading -->
          <div v-if="isAnalyzing" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-600">Analyzing audio... This may take a moment.</p>
          </div>

          <!-- Analysis Results -->
          <div v-if="analysisResult" class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
            <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre class="whitespace-pre-wrap text-sm text-gray-800">{{ analysisResult }}</pre>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <h4 class="text-red-800 font-medium">Analysis Error</h4>
                <p class="text-red-700 text-sm mt-1">{{ error }}</p>
                <div v-if="error.includes('API key')" class="mt-2 p-3 bg-yellow-100 rounded-lg">
                  <p class="text-yellow-800 text-sm">
                    <strong>Solution:</strong> The Gemini API key needs to be updated. Please check the .env file and ensure you have a valid API key from 
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-blue-600 underline">Google AI Studio</a>.
                  </p>
                </div>
                <div v-else-if="error.includes('quota') || error.includes('exceeded') || error.includes('429')" class="mt-2 p-3 bg-orange-100 rounded-lg">
                  <p class="text-orange-800 text-sm">
                    <strong>Quota Limit Reached:</strong> The free tier API quota has been exceeded. You can:
                  </p>
                  <ul class="text-orange-700 text-sm mt-1 ml-4 list-disc">
                    <li>Use the <strong>"Demo"</strong> buttons to see sample analysis results</li>
                    <li>Wait a few minutes and try again with live AI</li>
                    <li>Visit <a href="https://console.cloud.google.com/billing" target="_blank" class="text-blue-600 underline">Google Cloud Console</a> to upgrade to a paid plan</li>
                  </ul>
                  <div class="mt-3 flex justify-center">
                    <button
                      @click="tryDemoInstead"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Try Demo Analysis Instead
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'AudioAnalysisModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'analysis-complete'],
  setup(props, { emit }) {
    const uploadedFile = ref(null)
    const isRecording = ref(false)
    const recordedAudio = ref(null)
    const recordedAudioUrl = ref(null)
    const mediaRecorder = ref(null)
    const recordingTime = ref(0)
    const recordingInterval = ref(null)
    const isAnalyzing = ref(false)
    const analysisResult = ref(null)
    const error = ref(null)

    const closeModal = () => {
      if (isRecording.value) {
        stopRecording()
      }
      clearRecording()
      uploadedFile.value = null
      analysisResult.value = null
      error.value = null
      emit('close')
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        uploadedFile.value = file
        error.value = null
        analysisResult.value = null
      }
    }

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder.value = new MediaRecorder(stream)
        const audioChunks = []

        mediaRecorder.value.ondataavailable = (event) => {
          audioChunks.push(event.data)
        }

        mediaRecorder.value.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          recordedAudio.value = audioBlob
          recordedAudioUrl.value = URL.createObjectURL(audioBlob)
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.value.start()
        isRecording.value = true
        recordingTime.value = 0
        
        recordingInterval.value = setInterval(() => {
          recordingTime.value += 1
        }, 1000)
      } catch (err) {
        error.value = 'Could not access microphone. Please check permissions.'
        console.error('Error accessing microphone:', err)
      }
    }

    const stopRecording = () => {
      if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop()
        isRecording.value = false
        clearInterval(recordingInterval.value)
      }
    }

    const clearRecording = () => {
      recordedAudio.value = null
      if (recordedAudioUrl.value) {
        URL.revokeObjectURL(recordedAudioUrl.value)
        recordedAudioUrl.value = null
      }
      recordingTime.value = 0
      if (recordingInterval.value) {
        clearInterval(recordingInterval.value)
      }
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const analyzeAudio = async (audioData, filename) => {
      isAnalyzing.value = true
      error.value = null
      analysisResult.value = null

      try {
        const formData = new FormData()
        formData.append('audio', audioData, filename)
        
        const response = await fetch('/api/analyze-audio', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const result = await response.text()
        analysisResult.value = result
        emit('analysis-complete', result)
      } catch (err) {
        error.value = `Failed to analyze audio: ${err.message}`
        console.error('Analysis error:', err)
      } finally {
        isAnalyzing.value = false
      }
    }

    const analyzeUploadedFile = () => {
      if (uploadedFile.value) {
        analyzeAudio(uploadedFile.value, uploadedFile.value.name)
      }
    }

    const analyzeRecording = () => {
      if (recordedAudio.value) {
        analyzeAudio(recordedAudio.value, 'recorded_audio.webm')
      }
    }

    const analyzeDemoFile = () => {
      if (uploadedFile.value) {
        analyzeDemoAudio(uploadedFile.value, uploadedFile.value.name)
      }
    }

    const analyzeDemoRecording = () => {
      if (recordedAudio.value) {
        analyzeDemoAudio(recordedAudio.value, 'recorded_audio.webm')
      }
    }

    const analyzeDemoAudio = async (audioData, filename) => {
      isAnalyzing.value = true
      error.value = null
      analysisResult.value = null

      try {
        const formData = new FormData()
        formData.append('audio', audioData, filename)
        
        const response = await fetch('/api/analyze-audio-demo', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const result = await response.text()
        analysisResult.value = result
        emit('analysis-complete', result)
      } catch (err) {
        error.value = `Demo analysis failed: ${err.message}`
        console.error('Demo analysis error:', err)
      } finally {
        isAnalyzing.value = false
      }
    }

    const runStandaloneDemo = async () => {
      // Create a dummy audio blob for demo purposes
      const dummyAudio = new Blob(['demo audio data'], { type: 'audio/wav' })
      await analyzeDemoAudio(dummyAudio, 'demo_audio.wav')
    }

    const tryDemoInstead = async () => {
      // Clear the error and run demo analysis
      error.value = null
      
      if (uploadedFile.value) {
        await analyzeDemoAudio(uploadedFile.value, uploadedFile.value.name)
      } else if (recordedAudio.value) {
        await analyzeDemoAudio(recordedAudio.value, 'recorded_audio.webm')
      } else {
        await runStandaloneDemo()
      }
    }

    onUnmounted(() => {
      if (recordingInterval.value) {
        clearInterval(recordingInterval.value)
      }
      if (recordedAudioUrl.value) {
        URL.revokeObjectURL(recordedAudioUrl.value)
      }
    })

    return {
      uploadedFile,
      isRecording,
      recordedAudio,
      recordedAudioUrl,
      recordingTime,
      isAnalyzing,
      analysisResult,
      error,
      closeModal,
      handleFileUpload,
      startRecording,
      stopRecording,
      clearRecording,
      formatTime,
      analyzeUploadedFile,
      analyzeRecording,
      analyzeDemoFile,
      analyzeDemoRecording,
      runStandaloneDemo,
      tryDemoInstead
    }
  }
}
</script>