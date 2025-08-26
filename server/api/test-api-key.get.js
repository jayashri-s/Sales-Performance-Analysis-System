import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY
    
    if (!apiKey) {
      setResponseStatus(event, 400)
      return { 
        error: 'API key not configured',
        message: 'Please set GEMINI_API_KEY or NUXT_GEMINI_API_KEY environment variable'
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const result = await model.generateContent(['Say "API key is working!" in a single sentence.'])
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      message: 'API key is valid',
      response: text,
      keyPrefix: apiKey.substring(0, 10) + '...'
    }

  } catch (error) {
    console.error('API key test error:', error)
    setResponseStatus(event, 400)
    return {
      error: 'API key test failed',
      message: error.message,
      details: error.toString()
    }
  }
})