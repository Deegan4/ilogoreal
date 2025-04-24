import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  // Check if GROQ_API_KEY is available
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not defined in environment variables")
    return Response.json(
      {
        success: false,
        error: "API key configuration error. Please check server environment variables.",
      },
      { status: 500 },
    )
  }

  // Add this logging to see if the API key is being recognized (only logs the first few characters for security)
  console.log("Using API key starting with:", process.env.GROQ_API_KEY.substring(0, 5) + "...")
  try {
    // Extract parameters from request
    const { prompt, style, colorScheme, complexity, industry } = await req.json()

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return Response.json(
        {
          success: false,
          error: "Please provide a valid prompt",
        },
        { status: 400 },
      )
    }

    console.log("Original prompt:", prompt)
    console.log("Style:", style)
    console.log("Color scheme:", colorScheme)
    console.log("Complexity:", complexity)
    console.log("Industry:", industry)

    // Enhance the prompt based on additional parameters
    let enhancedPrompt = prompt

    // Add style information if provided
    if (style) {
      enhancedPrompt += `, ${style} style`
    }

    // Add color scheme if provided
    if (colorScheme) {
      enhancedPrompt += `, ${colorScheme} colors`
    }

    // Add complexity guidance if provided
    if (complexity) {
      enhancedPrompt += `, ${complexity === "simple" ? "minimalist" : "detailed"}`
    }

    // Add industry information if provided
    if (industry) {
      enhancedPrompt += `, for ${industry} industry`
    }

    console.log(`Generating logo with prompt: ${enhancedPrompt}`)

    // Use Groq to generate SVG description with an improved prompt
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `You are an expert SVG logo designer. Create a professional, visually appealing SVG logo based on this description: "${enhancedPrompt}".

LOGO DESIGN REQUIREMENTS:
- Create a modern, professional logo suitable for business use
- The logo should be visually balanced and aesthetically pleasing
- Design should be simple enough to be recognizable at small sizes
- Use appropriate colors that match the description and convey the right emotion
- Ensure the design is unique and memorable

SVG TECHNICAL REQUIREMENTS:
- Output ONLY valid, well-formed SVG code
- Use viewBox="0 0 100 100" for consistent scaling
- Set width="100%" and height="100%" for responsive sizing
- Use clean, optimized paths with minimal points
- Group related elements with <g> tags
- Use appropriate stroke-width values (usually between 1-3)
- Avoid unnecessary complexity that would make the SVG file large
- Ensure all elements are properly closed
- Use descriptive class names for major elements

COLOR GUIDELINES:
${colorScheme ? `- Use a ${colorScheme} color scheme as specified` : "- Choose colors that match the theme and emotion of the description"}
- Limit the palette to 2-4 colors for a clean design
- Use color psychology principles to evoke the right emotions
- Consider contrast for visibility

STYLE GUIDELINES:
${style ? `- Create the logo in a ${style} style as specified` : "- Choose an appropriate style that matches the description"}
- Ensure the style is consistent throughout the design
${
  complexity === "simple"
    ? "- Keep the design minimal and clean with fewer elements"
    : complexity === "detailed"
      ? "- Include appropriate details while maintaining clarity"
      : "- Balance simplicity and detail appropriately"
}

INDUSTRY GUIDELINES:
${industry ? `- Design a logo appropriate for the ${industry} industry` : "- Design a versatile logo suitable for general use"}
${industry === "technology" ? "- Incorporate elements that suggest innovation, connectivity, or digital concepts" : ""}
${industry === "finance" ? "- Use elements that convey trust, security, and professionalism" : ""}
${industry === "health" ? "- Include elements that suggest care, wellness, or medical expertise" : ""}
${industry === "food" ? "- Design should evoke appetite appeal and culinary themes" : ""}
${industry === "creative" ? "- Incorporate artistic elements and expressive design" : ""}

OUTPUT FORMAT:
- Return ONLY the complete SVG code with no explanation or markdown
- The SVG must start with <svg and end with </svg>
- Do not include any text or commentary outside the SVG tags

Example of good SVG structure:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <g class="logo-main">
    <!-- Logo elements here -->
  </g>
</svg>`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Extract SVG from the response with better logging
    console.log("Full API response length:", text.length)

    // Log a sample of the response to see its structure
    console.log("Response sample:", text.substring(0, 200) + "...")

    // Check if the response contains an SVG tag
    if (!text.includes("<svg")) {
      console.error("No SVG tag found in response")
      console.log("Full response:", text)
      throw new Error("API response did not contain valid SVG")
    }

    const svgMatch = text.match(/<svg[\s\S]*<\/svg>/m)

    if (!svgMatch) {
      console.error("Failed to extract SVG using regex")
      throw new Error("Failed to generate valid SVG")
    }

    const svgString = svgMatch[0]
    console.log("Extracted SVG length:", svgString.length)

    // Clean and optimize the SVG
    const cleanedSvg = svgString
      .replace(/width="[^"]*"/, 'width="100%"')
      .replace(/height="[^"]*"/, 'height="100%"')
      // Ensure viewBox is set if not present
      .replace(/<svg/, (match) => {
        if (!svgString.includes("viewBox")) {
          return '<svg viewBox="0 0 100 100"'
        }
        return match
      })
      // Remove any potential script tags for security
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")

    return Response.json({
      success: true,
      svg: cleanedSvg,
    })
  } catch (error) {
    console.error("Logo generation error:", error)

    // Check for rate limiting errors
    if (error.message?.includes("rate limit") || error.status === 429) {
      return Response.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        },
        { status: 429 },
      )
    }

    // Check for API key errors
    if (error.message?.includes("API key") || error.status === 401) {
      return Response.json(
        {
          success: false,
          error: "Authentication error. Please check your API configuration.",
        },
        { status: 401 },
      )
    }

    return Response.json(
      {
        success: false,
        error: "Failed to generate logo. Please try again with a different prompt.",
      },
      { status: 500 },
    )
  }
}
