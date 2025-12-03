'use client'

import { useState, useEffect } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { apiFetch } from '../../../lib/api'

interface File {
  id: number
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  filePath: string
  description?: string
  category?: string
  folderId?: number | null
  folder?: {
    id: number
    name: string
  }
  uploadedBy: number
  createdAt: string
  updatedAt: string
}

interface FileListProps {
  onDeleteSuccess: () => void
  onUpdateSuccess: () => void
  onError: (message: string) => void
  selectedFolderId: number | null
}

export default function FileList({ onDeleteSuccess, onUpdateSuccess, onError, selectedFolderId }: FileListProps) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editDialog, setEditDialog] = useState<{ open: boolean; file: File | null }>({
    open: false,
    file: null
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file: File | null }>({
    open: false,
    file: null
  })
  const [editForm, setEditForm] = useState({ description: '', category: '' })

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'documents', label: 'Documents' },
    { value: 'images', label: 'Images' },
    { value: 'reports', label: 'Reports' },
    { value: 'materials', label: 'Materials' },
    { value: 'invoices', label: 'Invoices' },
  ]

  const fetchFiles = async () => {
    try {
      setLoading(true)
      let url = `/files?category=${categoryFilter}&search=${searchTerm}`
      // Only add folderId filter if a specific folder is selected
      // null = root level files, undefined = all files
      if (selectedFolderId !== null && selectedFolderId !== undefined) {
        url += `&folderId=${selectedFolderId}`
      }
      console.log('Fetching files from:', url)
      const response = await apiFetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }

      const data = await response.json()
      setFiles(data)
    } catch (err: any) {
      onError(err.message || 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [categoryFilter, searchTerm, selectedFolderId])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = (event: any) => {
    setCategoryFilter(event.target.value)
  }

  const handleDownload = async (file: File) => {
    try {
      const response = await apiFetch(`/files/${file.id}/download`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      onError(err.message || 'Download failed')
    }
  }

  const openEditDialog = (file: File) => {
    setEditForm({
      description: file.description || '',
      category: file.category || 'general'
    })
    setEditDialog({ open: true, file })
  }

  const closeEditDialog = () => {
    setEditDialog({ open: false, file: null })
  }

  const handleUpdate = async () => {
    if (!editDialog.file) return

    try {
      const response = await apiFetch(`/files/${editDialog.file.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Update failed')
      }

      closeEditDialog()
      fetchFiles()
      onUpdateSuccess()
    } catch (err: any) {
      onError(err.message || 'Update failed')
    }
  }

  const openDeleteDialog = (file: File) => {
    setDeleteDialog({ open: true, file })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, file: null })
  }

  const handleDelete = async () => {
    if (!deleteDialog.file) return

    try {
      const response = await apiFetch(`/files/${deleteDialog.file.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Delete failed')
      }

      closeDeleteDialog()
      fetchFiles()
      onDeleteSuccess()
    } catch (err: any) {
      onError(err.message || 'Delete failed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Files
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search files"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by name or description..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Files Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : files.length === 0 ? (
        <Alert severity="info">
          No files found. {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Upload some files to get started.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {file.originalName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {file.mimeType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={file.category || 'general'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {file.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleDownload(file)}
                      title="Download"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(file)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(file)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit File Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={editForm.category}
              label="Category"
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            >
              {categories.slice(1).map((cat) => ( // Skip 'all' option
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.file?.originalName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}