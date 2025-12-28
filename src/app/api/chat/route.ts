import { NextRequest, NextResponse } from "next/server"

type Message = {
  role: "user" | "assistant"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, dashboardContext } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
    }

    // Build context from dashboard data
    let contextPrompt = `You are a helpful financial assistant for FinBoard, a stock market dashboard app. 
You help users understand their investments, analyze market trends, and answer financial questions.
Be concise, friendly, and accurate. Use emojis occasionally to make it engaging.

`
    
    if (dashboardContext?.widgets?.length > 0) {
      contextPrompt += `\nUser's current dashboard:\n`
      dashboardContext.widgets.forEach((w: any) => {
        contextPrompt += `- ${w.title || w.name}: ${w.provider} data\n`
      })
    }

    // Prepare messages for Gemini
    const geminiMessages = [
      { role: "user", parts: [{ text: contextPrompt }] },
      ...messages.map((msg: Message) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ]

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages.slice(-6), // Keep last 6 messages for context
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("Gemini API error:", JSON.stringify(error, null, 2))
      
      // Better error messages for users
      let userMessage = "I'm sorry, I couldn't generate a response."
      if (error.error?.code === 429) {
        userMessage = "⚠️ The AI service is currently at capacity. Please try again in a moment."
      } else if (error.error?.code === 403) {
        userMessage = "⚠️ API key configuration issue. Please check your Gemini API settings."
      } else if (error.error?.message) {
        userMessage = `⚠️ ${error.error.message}`
      }
      
      return NextResponse.json({ reply: userMessage }, { status: 200 })
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
