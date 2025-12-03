'use client'

import { useState, useRef } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { apiFetch } from '../../../lib/api'

interface FileUploadProps {
  onUploadSuccess: () => void
  selectedFolderId: number | null
}

export default function FileUpload({ onUploadSuccess, selectedFolderId }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'documents', label: 'Documents' },
    { value: 'images', label: 'Images' },
    { value: 'reports', label: 'Reports' },
    { value: 'materials', label: 'Materials' },
    { value: 'invoices', label: 'Invoices' },
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      // Validate file type
      const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv)$/i
      if (!allowedTypes.test(file.name)) {
        setError('Invalid file type. Allowed: jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, txt, csv')
        return
      }

      setSelectedFile(file)
      setError(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('description', description)
      formData.append('category', category)
      if (selectedFolderId !== null) {
        formData.append('folderId', selectedFolderId.toString())
        console.log('Uploading to folder:', selectedFolderId)
      } else {
        console.log('Uploading to root (no folder)')
      }

      console.log('Uploading file:', selectedFile.name)

      const response = await apiFetch('/files/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let the browser set Content-Type for FormData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      console.log('File uploaded successfully:', result)

      // Reset form
      setSelectedFile(null)
      setDescription('')
      setCategory('general')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadSuccess()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload New File
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* File Selection */}
      <Paper sx={{ p: 3, mb: 3, border: '2px dashed #ccc' }}>
        <Box sx={{ textAlign: 'center' }}>
          {!selectedFile ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop a file here, or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supported formats: JPG, PNG, PDF, DOC, XLS, TXT, CSV (Max: 10MB)
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
              >
                Choose File
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
              </Button>
            </>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected File
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleRemoveFile} disabled={uploading}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>

      {/* File Metadata */}
      {selectedFile && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            startIcon={<CloudUploadIcon />}
            size="large"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </Box>
      )}
    </Box>
  )
}