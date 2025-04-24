"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import type { Database } from "@/lib/database.types"

type GenerationHistoryItem = Database["public"]["Tables"]["logo_generation_history"]["Row"]

interface GenerationHistoryProps {
  initialHistory: GenerationHistoryItem[]
}

export function GenerationHistory({ initialHistory }: GenerationHistoryProps) {
  const [history, setHistory] = useState<GenerationHistoryItem[]>(initialHistory)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const loadMoreHistory = async () => {
    if (history.length === 0) return

    setIsLoading(true)
    try {
      // Get the oldest item's date
      const oldestDate = history[history.length - 1].created_at

      // Fetch more history items - RLS will ensure the user can only see their own history
      const { data, error } = await supabase
        .from("logo_generation_history")
        .select("*")
        .lt("created_at", oldestDate)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      if (data.length === 0) {
        toast({
          title: "No more history",
          description: "You've reached the end of your generation history",
        })
        return
      }

      setHistory((prev) => [...prev, ...data])
    } catch (error) {
      console.error("Error loading more history:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load more history. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Unknown date"
    }
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No generation history yet</h3>
        <p className="text-muted-foreground mb-4">Generate some logos to see your history</p>
        <Button asChild>
          <a href="/">Create Your First Logo</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {history.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {item.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <h3 className="font-medium">{item.prompt}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(item.created_at)}</p>
                </div>
                {item.status === "failed" && item.error_message && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm p-2 rounded-md max-w-md">
                    {item.error_message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length >= 10 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMoreHistory} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
