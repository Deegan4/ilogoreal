"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }).max(1000),
})

export type ContactFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Extract form data
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  // Validate form data
  const validationResult = contactSchema.safeParse({ name, email, message })

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      success: false,
    }
  }

  try {
    const supabase = createClient()

    // Get session - we'll use this to check if the user is logged in
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Insert into contacts table
    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      message,
      status: "new",
      // If user is logged in, associate the contact with their user ID
      ...(session?.user && { user_id: session.user.id }),
    })

    if (error) {
      console.error("Error submitting contact form:", error)
      return {
        errors: {
          _form: ["Failed to submit your message. Please try again."],
        },
        success: false,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error in contact form submission:", error)
    return {
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
      success: false,
    }
  }
}
