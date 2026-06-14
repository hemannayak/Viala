import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function askGemini(context: string, question: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    })

    const prompt = `
You are Viala AI Assistant. You must answer ONLY using the provided system context. If the question is outside Viala, say so clearly.

SYSTEM CONTEXT:
${context}

USER QUESTION: ${question}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Gemini error:", error)
    return "Viala AI is temporarily unavailable."
  }
}