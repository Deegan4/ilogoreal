import Link from "next/link"
import { ContactForm } from "@/components/contact/contact-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export const metadata = {
  title: "Contact Us | iLogo",
  description: "Get in touch with the iLogo team for questions, feedback, or support.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <Breadcrumb items={[{ label: "Contact Us" }]} className="mb-6" />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-8">
          Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as
          soon as possible.
        </p>

        <ContactForm />

        <div className="mt-8 pt-6 border-t flex justify-center">
          <Button variant="ghost" asChild className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Return to Homepage</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
