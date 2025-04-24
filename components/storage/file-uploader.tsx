"use client"

import type React from "react"

import { useState, useRef } from "react"
import { uploadFile, PUBLIC_BUCKET } from "@/lib/supabase/storage"
import { Button } from "@/components/ui/button-custom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface FileUploaderProps {
  bucket?: string
  onUploadComplete?: (fileData: any) => void
  maxSizeMB?: number
  allowedFileTypes?: string[]
}

export function FileUploader({
  bucket = PUBLIC_BUCKET,
  onUploadComplete,
  maxSizeMB = 10,
  allowedFileTypes,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    url?: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setUploadResult({
        success: false,
        message: `File size exceeds the maximum limit of ${maxSizeMB}MB`,
      })
      return
    }

    // Check file type if restrictions are provided
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const fileType = selectedFile.type
      if (!allowedFileTypes.includes(fileType)) {
        setUploadResult({
          success: false,
          message: `File type not allowed. Allowed types: ${allowedFileTypes.join(", ")}`,
        })
        return
      }
    }

    setFile(selectedFile)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10)
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 300)

      // Create a folder path based on user if available
      const folderPath = user ? `users/${user.id}/` : "anonymous/"
      const filePath = `${folderPath}${Date.now()}-${file.name.replace(/\s+/g, "-")}`

      const result = await uploadFile(bucket, file, filePath, { upsert: true })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setUploadResult({
          success: true,
          message: "File uploaded successfully",
          url: result.data.publicUrl,
        })

        if (onUploadComplete) {
          onUploadComplete(result.data)
        }
      } else {
        setUploadResult({
          success: false,
          message: `Upload failed: ${result.error.message || "Unknown error"}`,
        })
      }
    } catch (error) {
      console.error("Error in upload handler:", error)
      setUploadResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {uploadResult && (
        <Alert variant={uploadResult.success ? "default" : "destructive"}>
          {uploadResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{uploadResult.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>
            {uploadResult.message}
            {uploadResult.url && (
              <div className="mt-2">
                <a
                  href={uploadResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View uploaded file
                </a>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="file-upload">Select File</Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="cursor-pointer"
        />
        {allowedFileTypes && (
          <p className="text-xs text-muted-foreground">Allowed file types: {allowedFileTypes.join(", ")}</p>
        )}
        <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeMB}MB</p>
      </div>

      {file && (
        <div className="space-y-2">
          <p className="text-sm">
            Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)}MB)
          </p>

          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">{uploadProgress}% uploaded</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading || !file} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
