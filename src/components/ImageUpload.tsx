import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Id } from '../../convex/_generated/dataModel'

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  existingImages?: string[]
  maxImages?: number
}

export function ImageUpload({ onImagesChange, existingImages = [], maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(existingImages)
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).slice(0, maxImages - imageUrls.length).map(async (file) => {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl()
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        
        const { storageId } = await result.json()
        
        // Return the storage ID (it will be converted to URL by queries)
        return storageId
      })

      const newStorageIds = await Promise.all(uploadPromises)
      const updatedUrls = [...imageUrls, ...newStorageIds]
      setImageUrls(updatedUrls)
      onImagesChange(updatedUrls)
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlAdd = (url: string) => {
    if (url.trim() && !imageUrls.includes(url.trim())) {
      const updatedUrls = [...imageUrls, url.trim()]
      setImageUrls(updatedUrls)
      onImagesChange(updatedUrls)
    }
  }

  const removeImage = (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updatedUrls)
    onImagesChange(updatedUrls)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        <span className="text-sm font-medium">صور المنتج</span>
        <span className="text-xs text-muted-foreground">({imageUrls.length}/{maxImages})</span>
      </div>
      
      {/* File Upload */}
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading || imageUrls.length >= maxImages}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || imageUrls.length >= maxImages}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'جاري الرفع...' : 'رفع'}
        </Button>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="أو أضف رابط صورة مباشر"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUrlAdd(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
          disabled={imageUrls.length >= maxImages}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement
            handleUrlAdd(input.value)
            input.value = ''
          }}
          disabled={imageUrls.length >= maxImages}
        >
          إضافة
        </Button>
      </div>

      {/* Image Preview */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {imageUrls.map((urlOrStorageId, index) => (
            <ImagePreview 
              key={index} 
              urlOrStorageId={urlOrStorageId} 
              index={index}
              onRemove={() => removeImage(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImagePreview({ urlOrStorageId, index, onRemove }: { urlOrStorageId: string, index: number, onRemove: () => void }) {
  // Check if it's a URL or storage ID
  const isUrl = urlOrStorageId.startsWith('http')
  
  // Get URL from storage ID if needed
  const storageUrl = useQuery(
    api.files.getImageUrl, 
    isUrl ? 'skip' : { storageId: urlOrStorageId as Id<'_storage'> }
  )
  
  const displayUrl = isUrl ? urlOrStorageId : (storageUrl || 'https://placehold.co/400x400/e2e8f0/475569?text=جاري+التحميل')
  
  return (
    <div className="relative group">
      <img
        src={displayUrl}
        alt={`Product image ${index + 1}`}
        className="w-full h-24 object-cover rounded-md border"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/475569?text=خطأ+في+الصورة'
        }}
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
