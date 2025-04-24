import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Share2 } from "lucide-react"
import { LogoImage } from "@/components/logo-image"
import { generateSizes } from "@/lib/image-service"

export default async function SharedLogoPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get the logo
  const { data: logo, error } = await supabase
    .from("logos")
    .select("*, profiles(username, full_name)")
    .eq("id", params.id)
    .single()

  if (error || !logo) {
    notFound()
  }

  // Get the creator's name
  const creatorName = logo.profiles?.full_name || logo.profiles?.username || "Anonymous"

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">{logo.prompt}</CardTitle>
          <p className="text-sm text-muted-foreground">Created by {creatorName}</p>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-8 aspect-square flex items-center justify-center">
            <LogoImage
              svgContent={logo.svg_content}
              className="w-full h-full"
              priority
              sizes={generateSizes({
                sm: "100vw",
                md: "80vw",
                lg: "60vw",
                xl: "50vw",
              })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="/">Create Your Own Logo</a>
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
