"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Twitter, Facebook, Linkedin, Mail, Link2, Check } from "lucide-react"
import type { Database } from "@/lib/database.types"

type Logo = Database["public"]["Tables"]["logos"]["Row"]

interface ShareLogoProps {
  logo: Logo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareLogo({ logo, open, onOpenChange }: ShareLogoProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Generate a share URL when the component mounts
  useEffect(() => {
    // In a real app, this would be a URL to a public page showing the logo
    // For now, we'll just use a placeholder
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    setShareUrl(`${baseUrl}/shared-logos/${logo.id}`)
  }, [logo.id])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)

    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    const text = `Check out this logo I created with iLogo: ${logo.prompt}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank")
  }

  const shareOnLinkedIn = () => {
    const title = `Logo: ${logo.prompt}`
    const summary = "Created with iLogo"
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
    window.open(url, "_blank")
  }

  const shareByEmail = () => {
    const subject = `Check out this logo I created with iLogo`
    const body = `I created this logo with iLogo: ${logo.prompt}\n\nView it here: ${shareUrl}`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Logo</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="link">Copy Link</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Share Link</Label>
              <div className="flex gap-2">
                <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Share this link with others to show them your logo</p>
            </div>

            <div className="pt-2">
              <Button className="w-full" onClick={copyToClipboard}>
                <Link2 className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy Share Link"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={shareOnTwitter} className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button variant="outline" onClick={shareOnFacebook} className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button variant="outline" onClick={shareOnLinkedIn} className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button variant="outline" onClick={shareByEmail} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Share your logo directly to social media platforms
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
