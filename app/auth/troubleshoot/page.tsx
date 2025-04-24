import Link from "next/link"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthStatusChecker } from "@/components/auth/auth-status-checker"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Authentication Troubleshooting | iLogo",
  description: "Diagnose and fix sign-in issues with your iLogo account",
}

export default function TroubleshootPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/auth/signin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Troubleshooting</CardTitle>
          <CardDescription>Diagnose and fix issues with signing in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthStatusChecker />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Common Issues</h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Forgot Password</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  If you've forgotten your password, you can reset it.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/forgot-password">Reset Password</Link>
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium">Email Verification</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  If you haven't verified your email, check your inbox for a verification link.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/resend-verification">Resend Verification Email</Link>
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium">Browser Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Try clearing your browser cache and cookies, or use a different browser.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Contact Support</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Still having issues? Contact our support team for assistance.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
