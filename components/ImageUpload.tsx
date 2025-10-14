'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient, getErrorMessage } from '@/lib/api/client'
import Image from 'next/image'

interface ImageUploadProps {
  bucket: 'listing-images' | 'listing-docs' | 'avatars'
  maxFiles?: number
  onUploadComplete?: (paths: string[]) => void
  token: string // Auth token for upload
}

interface UploadedFile {
  file: File
  path: string
  preview: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const MAX_FILE_SIZES = {
  'listing-images': 10 * 1024 * 1024, // 10MB
  'listing-docs': 5 * 1024 * 1024, // 5MB
  'avatars': 2 * 1024 * 1024, // 2MB
}

const ALLOWED_TYPES = {
  'listing-images': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  'listing-docs': ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  'avatars': ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}

export default function ImageUpload({
  bucket,
  maxFiles = 5,
  onUploadComplete,
  token,
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSize = MAX_FILE_SIZES[bucket]
  const allowedTypes = ALLOWED_TYPES[bucket]

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return `Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`
    }

    return null
  }

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const preview = URL.createObjectURL(file)

    const uploadedFile: UploadedFile = {
      file,
      path: '',
      preview,
      status: 'uploading',
      progress: 0,
    }

    try {
      // Validate
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      // Upload using BFF endpoint
      uploadedFile.progress = 50
      const path = await apiClient.uploadFileComplete(file, bucket, token)

      uploadedFile.path = path
      uploadedFile.status = 'success'
      uploadedFile.progress = 100

      return uploadedFile
    } catch (error) {
      uploadedFile.status = 'error'
      uploadedFile.error = getErrorMessage(error)
      return uploadedFile
    }
  }

  const handleFiles = async (fileList: FileList) => {
    setGlobalError('')

    // Check max files limit
    if (files.length + fileList.length > maxFiles) {
      setGlobalError(`Vous ne pouvez télécharger que ${maxFiles} fichier(s) maximum`)
      return
    }

    const newFiles = Array.from(fileList)

    // Upload all files
    const uploadPromises = newFiles.map(uploadFile)
    const uploadedFiles = await Promise.all(uploadPromises)

    setFiles(prev => [...prev, ...uploadedFiles])

    // Notify parent of successful uploads
    const successfulPaths = uploadedFiles
      .filter(f => f.status === 'success')
      .map(f => f.path)

    if (successfulPaths.length > 0 && onUploadComplete) {
      const allSuccessfulPaths = [
        ...files.filter(f => f.status === 'success').map(f => f.path),
        ...successfulPaths,
      ]
      onUploadComplete(allSuccessfulPaths)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)

      // Update parent
      if (onUploadComplete) {
        const successfulPaths = updated
          .filter(f => f.status === 'success')
          .map(f => f.path)
        onUploadComplete(successfulPaths)
      }

      return updated
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const canUploadMore = files.length < maxFiles

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          whileHover={{ scale: 1.01 }}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Cliquez ou glissez vos fichiers ici
              </p>
              <p className="text-sm text-gray-600">
                {bucket === 'listing-images' && 'Images JPEG, PNG, WebP'}
                {bucket === 'listing-docs' && 'PDF ou images'}
                {bucket === 'avatars' && 'Photo de profil'}
                {' '}" Max {maxSize / (1024 * 1024)}MB par fichier
              </p>
            </div>

            <div className="text-xs text-gray-500">
              {files.length} / {maxFiles} fichier(s) téléchargé(s)
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Error */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Erreur</strong>
              <p>{globalError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Files */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {files.map((uploadedFile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group"
            >
              {/* Preview */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                {uploadedFile.file.type.startsWith('image/') ? (
                  <Image
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Status Overlay */}
                {uploadedFile.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}

                {uploadedFile.status === 'success' && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}

                {uploadedFile.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">{uploadedFile.error}</p>
                  </div>
                )}

                {/* Remove Button */}
                {uploadedFile.status !== 'uploading' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* File Name */}
              <p className="mt-2 text-xs text-gray-600 truncate" title={uploadedFile.file.name}>
                {uploadedFile.file.name}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Upload Statistics */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {files.filter(f => f.status === 'success').length} réussi(s)
            </span>
            {files.some(f => f.status === 'error') && (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                {files.filter(f => f.status === 'error').length} échoué(s)
              </span>
            )}
            {files.some(f => f.status === 'uploading') && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                {files.filter(f => f.status === 'uploading').length} en cours
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
