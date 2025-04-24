"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button-custom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export function AuthStatusChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<{
    success: boolean
    message: string
    details?: Record<string, any>
  } | null>(null)

  const checkAuthStatus = async () => {
    setIsChecking(true)
    setStatus(null)

    try {
      const supabase = createClient()

      // Check if Supabase client is initialized
      if (!supabase) {
        setStatus({
          success: false,
          message: "Supabase client initialization failed",
        })
        return
      }

      // Check connection to Supabase
      try {
        const { data, error } = await supabase.from("logos").select("count").limit(1)

        if (error) {
          setStatus({
            success: false,
            message: "Database connection failed",
            details: { error: error.message, code: error.code },
          })
          return
        }
      } catch (error) {
        setStatus({
          success: false,
          message: "Database query failed",
          details: { error: error instanceof Error ? error.message : String(error) },
        })
        return
      }

      // Check session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        setStatus({
          success: false,
          message: "Session retrieval failed",
          details: { error: sessionError.message },
        })
        return
      }

      if (session) {
        setStatus({
          success: true,
          message: "You are signed in",
          details: {
            user: session.user.email,
            expires: new Date(session.expires_at! * 1000).toLocaleString(),
          },
        })
      } else {
        setStatus({
          success: false,
          message: "You are not signed in",
        })
      }
    } catch (error) {
      setStatus({
        success: false,
        message: "Authentication check failed",
        details: { error: error instanceof Error ? error.message : String(error) },
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={checkAuthStatus} disabled={isChecking} variant="outline" className="w-full">
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking authentication status...
          </>
        ) : (
          "Check Authentication Status"
        )}
      </Button>

      {status && (
        <Alert variant={status.success ? "default" : "destructive"}>
          {status.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{status.success ? "Authentication Successful" : "Authentication Issue"}</AlertTitle>
          <AlertDescription>
            <p>{status.message}</p>
            {status.details && (
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(status.details, null, 2)}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
