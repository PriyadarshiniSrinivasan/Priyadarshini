'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Collapse,
  Alert,
  Tooltip,
} from '@mui/material'
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreateNewFolder as CreateNewFolderIcon,
} from '@mui/icons-material'
import { apiFetch } from '../../../lib/api'

interface FolderNode {
  id: number
  name: string
  parentId: number | null
  children: FolderNode[]
  files?: FileNode[]
  order: number
  _count: {
    files: number
    children: number
  }
}

interface FileNode {
  id: number
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  createdAt: string
}

interface FolderTreeProps {
  onFolderSelect: (folderId: number | null) => void
  selectedFolderId: number | null
  onFolderChange: () => void
}

export default function FolderTree({ onFolderSelect, selectedFolderId, onFolderChange }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ folderId: number | null; mouseX: number; mouseY: number } | null>(null)
  const [dialog, setDialog] = useState<{ type: 'create' | 'rename' | 'delete' | null; folderId: number | null; parentId: number | null }>({
    type: null,
    folderId: null,
    parentId: null
  })
  const [folderName, setFolderName] = useState('')
  const [draggedItem, setDraggedItem] = useState<{ id: number; type: 'folder' | 'file' } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      setError(null)
      const response = await apiFetch('/folders/tree?includeFiles=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched folder tree with files:', data)
        setFolders(data)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        setError(`Failed to load folders: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
      setError(`Failed to fetch folders: ${error}`)
    }
  }

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return

    try {
      console.log('Creating folder:', { name: folderName, parentId: dialog.parentId })
      
      // Check if user is logged in
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) {
        alert('You are not logged in. Please login again.')
        window.location.href = '/login'
        return
      }
      
      const response = await apiFetch('/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: folderName,
          parentId: dialog.parentId
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Folder created successfully:', result)
        
        await fetchFolders()
        onFolderChange()
        setDialog({ type: null, folderId: null, parentId: null })
        setFolderName('')
        
        // Expand parent folder if creating subfolder
        if (dialog.parentId) {
          setExpandedFolders(prev => new Set([...prev, dialog.parentId!]))
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to create folder:', errorData)
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
          alert('Your session has expired. Please login again.')
          window.location.href = '/login'
        } else {
          alert(`Failed to create folder: ${errorData.message || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
      alert(`Failed to create folder: ${error}`)
    }
  }

  const handleRenameFolder = async () => {
    if (!folderName.trim() || !dialog.folderId) return

    try {
      const response = await apiFetch(`/folders/${dialog.folderId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: folderName })
      })

      if (response.ok) {
        await fetchFolders()
        onFolderChange()
        setDialog({ type: null, folderId: null, parentId: null })
        setFolderName('')
      }
    } catch (error) {
      console.error('Failed to rename folder:', error)
    }
  }

  const handleDeleteFolder = async () => {
    if (!dialog.folderId) return

    try {
      const response = await apiFetch(`/folders/${dialog.folderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFolders()
        onFolderChange()
        setDialog({ type: null, folderId: null, parentId: null })
        
        // Deselect if deleted folder was selected
        if (selectedFolderId === dialog.folderId) {
          onFolderSelect(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
    }
  }

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleContextMenu = (event: React.MouseEvent, folderId: number | null) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({
      folderId,
      mouseX: event.clientX,
      mouseY: event.clientY,
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleDragStart = (folderId: number) => {
    setDraggedItem({ id: folderId, type: 'folder' })
  }

  const handleFileDragStart = (fileId: number) => {
    setDraggedItem({ id: fileId, type: 'file' })
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (targetFolderId: number | null, order: number = 0) => {
    if (!draggedItem) return

    try {
      if (draggedItem.type === 'folder') {
        const response = await apiFetch(`/folders/${draggedItem.id}/move`, {
          method: 'PUT',
          body: JSON.stringify({
            parentId: targetFolderId,
            order: order
          })
        })

        if (response.ok) {
          await fetchFolders()
          onFolderChange()
        }
      } else if (draggedItem.type === 'file') {
        const response = await apiFetch(`/files/${draggedItem.id}/move`, {
          method: 'PUT',
          body: JSON.stringify({
            folderId: targetFolderId,
            order: order
          })
        })

        if (response.ok) {
          await fetchFolders()
          onFolderChange()
        }
      }
    } catch (error) {
      console.error(`Failed to move ${draggedItem.type}:`, error)
    }

    setDraggedItem(null)
  }

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = folder.children && folder.children.length > 0
    const hasFiles = folder.files && folder.files.length > 0
    const hasContent = hasChildren || hasFiles
    const isDragging = draggedItem?.type === 'folder' && draggedItem.id === folder.id

    return (
      <Box key={folder.id}>
        <Box
          draggable
          onDragStart={() => handleDragStart(folder.id)}
          onDragOver={(e) => {
            handleDragOver(e)
            e.currentTarget.style.backgroundColor = draggedItem ? 'rgba(25, 118, 210, 0.12)' : ''
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.backgroundColor = ''
          }}
          onDrop={(e) => { 
            e.stopPropagation()
            e.currentTarget.style.backgroundColor = ''
            handleDrop(folder.id, 0)
          }}
          onContextMenu={(e) => handleContextMenu(e, folder.id)}
          onClick={() => onFolderSelect(folder.id)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: level * 2,
            py: 0.3,
            cursor: isDragging ? 'grabbing' : 'pointer',
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: isSelected ? 'action.selected' : 'action.hover',
            },
            transition: 'background-color 0.2s, opacity 0.2s',
            position: 'relative',
            opacity: isDragging ? 0.5 : 1,
            '&::before': level > 0 ? {
              content: '""',
              position: 'absolute',
              left: `${level * 2 - 1.5}px`,
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
            } : {},
            '&::after': level > 0 ? {
              content: '""',
              position: 'absolute',
              left: `${level * 2 - 1.5}px`,
              top: '50%',
              width: '14px',
              height: '2px',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
            } : {},
          }}
        >
          {hasContent ? (
            <Box
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              sx={{
                width: 16,
                height: 16,
                border: '1px solid',
                borderColor: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                mr: 0.5,
                bgcolor: 'background.paper',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }
              }}
            >
              {isExpanded ? '−' : '+'}
            </Box>
          ) : (
            <Box sx={{ width: 16, mr: 0.5 }} />
          )}
          
          {isExpanded ? (
            <FolderOpenIcon sx={{ mr: 1, color: 'warning.main', position: 'relative' }} fontSize="small" />
          ) : (
            <FolderIcon sx={{ mr: 1, color: 'warning.main', position: 'relative' }} fontSize="small" />
          )}
          
          {/* Vertical line extending from folder to children when expanded */}
          {isExpanded && hasContent && (
            <Box
              sx={{
                position: 'absolute',
                left: `${level * 2 + 15.5}px`,
                top: '100%',
                bottom: 0,
                width: '2px',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          
          <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: isSelected ? 600 : 400 }}>
            {folder.name}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontSize: '0.7rem' }}>
            {folder._count.files}
          </Typography>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleContextMenu(e, folder.id)
            }}
            sx={{ p: 0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        {hasContent && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {/* Render child folders first */}
            {hasChildren && folder.children.map(child => renderFolder(child, level + 1))}
            
            {/* Render files in this folder */}
            {hasFiles && folder.files!.map((file, fileIndex) => (
              <Box
                key={`file-${file.id}`}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  handleFileDragStart(file.id)
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  pl: (level + 1) * 2 + 1.5,
                  py: 0.2,
                  cursor: 'move',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  opacity: draggedItem?.type === 'file' && draggedItem.id === file.id ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: `${(level + 1) * 2 - 1.5}px`,
                    top: fileIndex === 0 ? '0%' : '-100px',
                    bottom: fileIndex === folder.files!.length - 1 ? '50%' : 0,
                    width: '2px',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: `${(level + 1) * 2 - 1.5}px`,
                    top: '50%',
                    width: '14px',
                    height: '2px',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                  },
                }}
                onClick={() => {
                  console.log('File clicked:', file)
                }}
              >
                <Typography variant="caption" sx={{ flexGrow: 1, fontSize: '0.75rem', ml: 1 }} noWrap>
                  {file.originalName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: 1 }}>
                  {formatFileSize(file.fileSize)}
                </Typography>
              </Box>
            ))}
          </Collapse>
        )}
      </Box>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Box>
      {/* Header with create button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        pb: 1,
        borderBottom: '2px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Folders
        </Typography>
        <Tooltip title="Create root folder">
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setDialog({ type: 'create', folderId: null, parentId: null })
              setFolderName('')
            }}
          >
            <CreateNewFolderIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Root level */}
      <Box
        onDragOver={handleDragOver}
        onDrop={(e) => { e.stopPropagation(); handleDrop(null, 0) }}
        onContextMenu={(e) => handleContextMenu(e, null)}
        sx={{ minHeight: 200, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
      >
        {/* All Files Item */}
        <Box
          onClick={() => onFolderSelect(null)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            px: 1,
            cursor: 'pointer',
            bgcolor: selectedFolderId === null ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: selectedFolderId === null ? 'action.selected' : 'action.hover',
            },
            mb: 1,
            borderRadius: 1,
          }}
        >
          <Box sx={{ width: 16, mr: 0.5 }} />
          <FolderIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
          <Typography variant="body2" sx={{ fontWeight: selectedFolderId === null ? 600 : 400 }}>
            All Files
          </Typography>
        </Box>

        {folders.map(folder => renderFolder(folder))}
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {[
          <MenuItem
            key="create"
            onClick={() => {
              setDialog({ type: 'create', folderId: null, parentId: contextMenu?.folderId || null })
              setFolderName('')
              handleCloseContextMenu()
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            New Subfolder
          </MenuItem>,
          
          contextMenu?.folderId && [
            <MenuItem
              key="rename"
              onClick={() => {
                const folder = findFolder(folders, contextMenu.folderId!)
                setDialog({ type: 'rename', folderId: contextMenu.folderId!, parentId: null })
                setFolderName(folder?.name || '')
                handleCloseContextMenu()
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Rename
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                setDialog({ type: 'delete', folderId: contextMenu.folderId!, parentId: null })
                handleCloseContextMenu()
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          ]
        ]}
      </Menu>

      {/* Create/Rename Dialog */}
      <Dialog open={dialog.type === 'create' || dialog.type === 'rename'} onClose={() => setDialog({ type: null, folderId: null, parentId: null })}>
        <DialogTitle>
          {dialog.type === 'create' ? 'Create New Folder' : 'Rename Folder'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                dialog.type === 'create' ? handleCreateFolder() : handleRenameFolder()
              }
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ type: null, folderId: null, parentId: null })}>Cancel</Button>
          <Button onClick={dialog.type === 'create' ? handleCreateFolder : handleRenameFolder} variant="contained">
            {dialog.type === 'create' ? 'Create' : 'Rename'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialog.type === 'delete'} onClose={() => setDialog({ type: null, folderId: null, parentId: null })}>
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this folder? All subfolders will also be deleted, but files will be moved to the root.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ type: null, folderId: null, parentId: null })}>Cancel</Button>
          <Button onClick={handleDeleteFolder} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Helper function to find folder by ID in tree
function findFolder(folders: FolderNode[], id: number): FolderNode | null {
  for (const folder of folders) {
    if (folder.id === id) return folder
    if (folder.children) {
      const found = findFolder(folder.children, id)
      if (found) return found
    }
  }
  return null
}
