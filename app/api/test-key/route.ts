import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function GET() {
  try {
    console.log("Testing Groq API connection...")

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not defined in environment variables")
    }

    console.log("API key present, first 5 chars:", process.env.GROQ_API_KEY.substring(0, 5) + "...")

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: "Say hello",
      temperature: 0.2,
      maxTokens: 10,
    })

    console.log("API test successful! Response:", text)

    return Response.json({
      success: true,
      message: "API connection successful",
      response: text,
    })
  } catch (error) {
    console.error("API test failed:", error.message)

    return Response.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: {
          name: error.name,
          status: error.status,
        },
      },
      { status: 500 },
    )
  }
}
