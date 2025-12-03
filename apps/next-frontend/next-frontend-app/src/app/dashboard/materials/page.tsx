'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@lib/api'
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function MaterialsPage() {
  const [filters, setFilters] = useState({ department:'', category:'', name:'' })
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const load = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k,v]) => v && params.append(k, v))
      const res = await apiFetch('/materials?'+params.toString())
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      
      const data = await res.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRows(data)
      } else {
        console.error('API did not return an array:', data)
        setRows([])
        setError('Invalid data format received from server')
      }
    } catch (err: any) {
      console.error('Error loading materials:', err)
      setRows([])
      setError(err.message || 'Failed to load materials')
    }
  }
  
  useEffect(()=>{ load() }, [])
  
  return (
    <Box sx={{ py: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Search Materials
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            mb: 2
          }}>
            <TextField
              label="Department"
              variant="outlined"
              fullWidth
              value={filters.department}
              onChange={e=>setFilters(p=>({ ...p, department: e.target.value }))}
            />
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              value={filters.category}
              onChange={e=>setFilters(p=>({ ...p, category: e.target.value }))}
            />
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={filters.name}
              onChange={e=>setFilters(p=>({ ...p, name: e.target.value }))}
            />
          </Box>
          <Button 
            variant="contained" 
            startIcon={<SearchIcon />}
            onClick={load}
          >
            Search
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Materials ({rows.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  {['id','code','name','category','department','quantity','unit','price','updatedAt'].map(h=>
                    <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r:any)=>(
                  <TableRow key={r.id} hover>
                    {['id','code','name','category','department','quantity','unit','price','updatedAt'].map(c=>
                      <TableCell key={c}>{String(r[c] ?? '')}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
