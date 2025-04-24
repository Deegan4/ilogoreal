"use client"

import { Button } from "@/components/ui/button-custom"
import { Lightbulb } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PromptExamplesProps {
  onSelectPrompt: (prompt: string) => void
}

export function PromptExamples({ onSelectPrompt }: PromptExamplesProps) {
  const examples = [
    {
      category: "Technology",
      prompts: [
        "A modern tech startup logo with a circuit board pattern",
        "A sleek AI assistant logo with a minimalist design",
        "A cloud computing logo with connected nodes",
      ],
    },
    {
      category: "Nature",
      prompts: [
        "A mountain peak logo with sunrise colors",
        "An organic leaf logo for an eco-friendly brand",
        "A water droplet logo with ripple effect",
      ],
    },
    {
      category: "Business",
      prompts: [
        "A professional consulting firm logo with a shield symbol",
        "A financial services logo with a graph motif",
        "A law firm logo with balanced scales",
      ],
    },
    {
      category: "Creative",
      prompts: [
        "A photography studio logo with aperture design",
        "A colorful art gallery logo with paint splashes",
        "A music production logo with sound wave pattern",
      ],
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span>Example Prompts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <h3 className="font-medium">Example Prompts</h3>
          <p className="text-sm text-muted-foreground mt-1">Click on any example to use it as your prompt</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {examples.map((category) => (
            <div key={category.category} className="p-4 border-b last:border-0">
              <h4 className="text-sm font-medium mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.prompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 font-normal"
                    onClick={() => onSelectPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
