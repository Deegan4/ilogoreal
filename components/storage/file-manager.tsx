"use client"

import { useState, useEffect } from "react"
import { listFiles, deleteFile, getPublicUrl, PUBLIC_BUCKET } from "@/lib/supabase/storage"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUploader } from "./file-uploader"
import { Loader2, Trash2, Download, Eye, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FileManagerProps {
  bucket?: string
  path?: string
  allowUpload?: boolean
  allowDelete?: boolean
  onFileSelect?: (file: any) => void
}

export function FileManager({
  bucket = PUBLIC_BUCKET,
  path = "",
  allowUpload = true,
  allowDelete = true,
  onFileSelect,
}: FileManagerProps) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()

  const fetchFiles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // If user is logged in, use their folder
      const userPath = user ? `users/${user.id}/${path}`.replace(/\/+$/, "") : path

      const result = await listFiles(bucket, userPath)

      if (result.success) {
        // Add public URLs to files
        const filesWithUrls = result.data.map((file: any) => {
          const filePath = path ? `${path}/${file.name}` : file.name
          const { publicUrl } = getPublicUrl(bucket, filePath)
          return { ...file, publicUrl }
        })

        setFiles(filesWithUrls)
      } else {
        setError(`Failed to load files: ${result.error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      setError(`Failed to load files: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [bucket, path, user])

  const handleDeleteFile = async (filePath: string) => {
    setIsDeleting(true)

    try {
      const result = await deleteFile(bucket, filePath)

      if (result.success) {
        // Remove the file from the list
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== filePath.split("/").pop()))
        setFileToDelete(null)
      } else {
        setError(`Failed to delete file: ${result.error.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      setError(`Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFileUploadComplete = (fileData: any) => {
    // Add the new file to the list
    fetchFiles()
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return "📄"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "🖼️"
      case "svg":
        return "🔷"
      case "mp4":
      case "webm":
      case "mov":
        return "🎬"
      case "mp3":
      case "wav":
      case "ogg":
        return "🎵"
      case "zip":
      case "rar":
      case "7z":
        return "📦"
      case "doc":
      case "docx":
        return "📝"
      case "xls":
      case "xlsx":
        return "📊"
      case "ppt":
      case "pptx":
        return "📑"
      default:
        return "📄"
    }
  }

  const isImageFile = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Files</h3>
        <Button variant="outline" size="sm" onClick={fetchFiles} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {allowUpload && (
        <Card>
          <CardContent className="p-4">
            <FileUploader bucket={bucket} onUploadComplete={handleFileUploadComplete} />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">No files found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.name} className="overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFileIcon(file.name)}</div>
                  <div>
                    <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.metadata?.size / 1024).toFixed(2)} KB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isImageFile(file.name) && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={file.publicUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="icon" asChild>
                    <a href={file.publicUrl} download={file.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  {allowDelete && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete File</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{file.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setFileToDelete(null)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteFile(file.name)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
