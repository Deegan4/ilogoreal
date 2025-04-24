"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Lightbulb, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react"

interface StyleSuggestion {
  title: string
  description: string
}

interface StyleSuggestionsProps {
  prompt: string
  onApplySuggestion: (suggestion: string) => void
  disabled?: boolean
}

export function StyleSuggestions({ prompt, onApplySuggestion, disabled = false }: StyleSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const fetchSuggestions = async () => {
    if (!prompt || prompt.trim().length < 3 || disabled) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/suggest-styles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to get style suggestions")
      }

      setSuggestions(data.suggestions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestion = (suggestion: StyleSuggestion) => {
    // Create an enhanced prompt by combining the original prompt with the suggestion
    const enhancedPrompt = `${prompt}, with ${suggestion.title.toLowerCase()}`
    onApplySuggestion(enhancedPrompt)
  }

  // If there are no suggestions and we're not loading, don't render anything
  if (suggestions.length === 0 && !loading && !error) {
    return (
      <div className="w-full">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={fetchSuggestions}
          disabled={disabled || !prompt || prompt.trim().length < 3}
        >
          <Lightbulb className="h-4 w-4" />
          <span>Get Style Suggestions</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3 bg-muted/30 rounded-lg p-3 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-medium">Style Suggestions</h3>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-destructive text-sm py-2">{error}</div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-background rounded-md p-2 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 mt-0.5 text-muted-foreground hover:text-foreground"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Apply suggestion</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={fetchSuggestions}
                disabled={disabled}
              >
                Refresh Suggestions
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
