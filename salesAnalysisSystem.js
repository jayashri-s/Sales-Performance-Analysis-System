import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY, // set your Gemini API key here or via environment
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function generateCallAnalysisWithGemini(callTranscript) {
  const prompt = `You are a sales call analysis assistant. Analyze this transcript and provide a detailed sales effectiveness report including strengths, improvements, and recommendations:\n\n${callTranscript}`;

  const response = await openai.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [
      { role: "system", content: "You are a helpful sales assistant." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content;
}
