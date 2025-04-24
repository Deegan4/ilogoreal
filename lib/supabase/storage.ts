"use client"

import { createClient } from "./client"
import { v4 as uuidv4 } from "uuid"

// Define bucket names
export const LOGO_BUCKET = "logos"
export const USER_FILES_BUCKET = "user-files"
export const PUBLIC_BUCKET = "public"

/**
 * Initialize storage buckets if they don't exist
 * This should be called once during app initialization
 */
export async function initializeStorage() {
  try {
    const supabase = createClient()

    // Check if buckets exist, create them if they don't
    const buckets = [LOGO_BUCKET, USER_FILES_BUCKET, PUBLIC_BUCKET]

    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.getBucket(bucket)

      if (error && error.message.includes("not found")) {
        // Bucket doesn't exist, create it
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: bucket === PUBLIC_BUCKET, // Only make the public bucket public
          fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        })

        if (createError) {
          console.error(`Error creating bucket ${bucket}:`, createError)
        } else {
          console.log(`Created bucket: ${bucket}`)
        }
      } else if (error) {
        console.error(`Error checking bucket ${bucket}:`, error)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing storage:", error)
    return { success: false, error }
  }
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  file: File,
  path?: string,
  options?: {
    upsert?: boolean
    cacheControl?: string
    contentType?: string
  },
) {
  try {
    const supabase = createClient()

    // Generate a unique file path if not provided
    const filePath = path || `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: options?.upsert || false,
      cacheControl: options?.cacheControl || "3600",
      contentType: options?.contentType || file.type,
    })

    if (error) {
      throw error
    }

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return {
      success: true,
      data: {
        ...data,
        publicUrl,
        path: filePath,
        bucket,
      },
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error }
  }
}

/**
 * Upload a logo SVG to storage
 */
export async function uploadLogoSvg(svgContent: string, prompt: string, userId?: string) {
  try {
    // Convert SVG string to a file
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const file = new File([blob], `logo-${Date.now()}.svg`, { type: "image/svg+xml" })

    // Create a path that includes user ID if available
    const path = userId ? `users/${userId}/${uuidv4()}.svg` : `anonymous/${uuidv4()}.svg`

    return await uploadFile(LOGO_BUCKET, file, path, { upsert: true })
  } catch (error) {
    console.error("Error uploading logo SVG:", error)
    return { success: false, error }
  }
}

/**
 * Download a file from Supabase storage
 */
export async function downloadFile(bucket: string, path: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error downloading file:", error)
    return { success: false, error }
  }
}

/**
 * List files in a bucket or folder
 */
export async function listFiles(bucket: string, path?: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage.from(bucket).list(path || "")

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error listing files:", error)
    return { success: false, error }
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { success: false, error }
  }
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(bucket: string, path: string) {
  try {
    const supabase = createClient()

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return { success: true, publicUrl }
  } catch (error) {
    console.error("Error getting public URL:", error)
    return { success: false, error }
  }
}

/**
 * Create a signed URL for temporary access to a file
 */
export async function createSignedUrl(bucket: string, path: string, expiresIn = 60) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating signed URL:", error)
    return { success: false, error }
  }
}
