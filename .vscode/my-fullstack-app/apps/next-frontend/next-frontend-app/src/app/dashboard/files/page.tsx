'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  Snackbar,
  Paper,
  Divider,
  IconButton,
} from '@mui/material'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FolderIcon from '@mui/icons-material/Folder'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import FolderTree from './components/FolderTree'

export default function FilesPage() {
  const router = useRouter()
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleFolderChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const stopResizing = () => {
    setIsResizing(false)
  }

  const resize = (e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left
      
      // Set min and max width constraints
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', stopResizing)
    } else {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      console.error('No authentication token found - redirecting to login')
      router.push('/login')
      return
    }
    console.log('Token found:', token.substring(0, 20) + '...')
  }, [router])

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          File Management with Folders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize your files in a hierarchical folder structure. Drag and drop to reorganize.
        </Typography>
      </Box>

      <Box 
        ref={containerRef}
        sx={{ 
          display: 'flex', 
          gap: 0, 
          position: 'relative',
          userSelect: isResizing ? 'none' : 'auto'
        }}
      >
        {/* Left Sidebar - Folder Tree */}
        <Box 
          sx={{ 
            width: `${sidebarWidth}px`,
            minWidth: '200px',
            maxWidth: '600px',
            flexShrink: 0,
            transition: isResizing ? 'none' : 'width 0.2s'
          }}
        >
          <Paper sx={{ p: 2, height: 'calc(100vh - 250px)', overflow: 'auto' }}>
            <FolderTree
              key={refreshKey}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onFolderChange={handleFolderChange}
            />
          </Paper>
        </Box>

        {/* Resizable Divider */}
        <Box
          onMouseDown={startResizing}
          sx={{
            width: '8px',
            cursor: 'col-resize',
            bgcolor: isResizing ? 'primary.main' : 'divider',
            transition: 'background-color 0.2s',
            '&:hover': {
              bgcolor: 'primary.light',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <DragIndicatorIcon 
            sx={{ 
              fontSize: 16, 
              color: isResizing ? 'white' : 'text.secondary',
              transform: 'rotate(90deg)'
            }} 
          />
        </Box>

        {/* Right Content - Upload and File List */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Upload Section */}
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <CloudUploadIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Upload Files
                {selectedFolderId && (
                  <Typography component="span" variant="body2" sx={{ ml: 2, opacity: 0.9 }}>
                    (to selected folder)
                  </Typography>
                )}
              </Typography>
            </Box>
            <CardContent>
              <FileUpload
                selectedFolderId={selectedFolderId}
                onUploadSuccess={() => {
                  showSnackbar('File uploaded successfully!')
                  handleFolderChange()
                }}
              />
            </CardContent>
          </Card>

          {/* File List Section */}
          <Card>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: 'secondary.main', color: 'white' }}>
              <FolderIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Files
                {selectedFolderId ? ' in Selected Folder' : ' (All Files)'}
              </Typography>
            </Box>
            <CardContent>
              <FileList
                selectedFolderId={selectedFolderId}
                onDeleteSuccess={() => {
                  showSnackbar('File deleted successfully!')
                  handleFolderChange()
                }}
                onUpdateSuccess={() => {
                  showSnackbar('File updated successfully!')
                  handleFolderChange()
                }}
                onError={(message: string) => showSnackbar(message, 'error')}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}