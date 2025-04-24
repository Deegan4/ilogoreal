import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || prompt.trim().length < 3) {
      return Response.json(
        {
          success: false,
          error: "Please provide a valid prompt",
        },
        { status: 400 },
      )
    }

    const systemPrompt = `You are an expert logo designer specializing in providing style suggestions to improve logo prompts. 
    
Your task is to analyze the user's logo prompt and suggest 3-5 specific style improvements that would make the logo more visually appealing, memorable, and effective.

For each suggestion:
1. Provide a clear, concise title (3-5 words)
2. Give a brief explanation of why this improvement would enhance the logo (1-2 sentences)

Focus on design aspects like:
- Color schemes and psychology
- Typography and font choices
- Visual elements and symbolism
- Composition and balance
- Style (minimalist, geometric, abstract, etc.)
- Industry appropriateness

Format your response as a JSON array of objects with 'title' and 'description' fields. Do not include any other text.
Example format:
[
  {
    "title": "Monochromatic Blue Palette",
    "description": "Using shades of blue would convey trust and professionalism, ideal for a tech company."
  }
]`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      system: systemPrompt,
      prompt: `User's logo prompt: "${prompt}"`,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the response as JSON
    let suggestions
    try {
      suggestions = JSON.parse(text)

      // Validate the structure
      if (!Array.isArray(suggestions)) {
        throw new Error("Response is not an array")
      }

      // Ensure each suggestion has the required fields
      suggestions = suggestions.filter((suggestion) => suggestion.title && suggestion.description)

      // Limit to 5 suggestions
      suggestions = suggestions.slice(0, 5)
    } catch (error) {
      console.error("Failed to parse Groq response:", error)
      return Response.json(
        {
          success: false,
          error: "Failed to generate style suggestions",
        },
        { status: 500 },
      )
    }

    return Response.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error("Error in suggest-styles API:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to generate style suggestions",
      },
      { status: 500 },
    )
  }
}
