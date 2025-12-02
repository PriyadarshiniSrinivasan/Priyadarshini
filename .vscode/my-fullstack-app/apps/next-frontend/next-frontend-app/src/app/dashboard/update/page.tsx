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
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Stack,
  Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

type TableInfo = { table_name: string }
type ColumnInfo = { column_name: string; data_type: string; is_nullable: 'YES'|'NO' }

export default function UpdateTablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [table, setTable] = useState('')
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [mode, setMode] = useState<'add'|'edit'|''>('')
  const [form, setForm] = useState<Record<string, any>>({})
  const [selectedRow, setSelectedRow] = useState<any|null>(null)

  useEffect(() => { 
    apiFetch('/tables').then((r: Response) => r.json()).then(setTables) 
  }, [])
  
  useEffect(() => {
    if (!table) return
    apiFetch(`/tables/${table}/columns`).then((r: Response) => r.json()).then(setColumns)
    apiFetch(`/tables/${table}/rows`).then((r: Response) => r.json()).then(setRows)
    setMode(''); setSelectedRow(null)
  }, [table])
  
  useEffect(() => {
    const init: Record<string, any> = {}
    columns.forEach(c => init[c.column_name] = '')
    setForm(init)
  }, [columns])

  const saveAdd = async () => {
    // Filter out id and any empty string values to let database handle auto-increment
    const filteredForm = Object.fromEntries(
      Object.entries(form).filter(([key, value]) => {
        // Exclude 'id' field and empty strings
        if (key.toLowerCase() === 'id') return false
        if (value === '') return false
        return true
      })
    )
    
    const res = await apiFetch(`/tables/${table}/rows`, { method:'POST', body: JSON.stringify({ values: filteredForm }) })
    if (res.ok) { 
      alert('Row added'); 
      apiFetch(`/tables/${table}/rows`).then((r: Response) => r.json()).then(setRows); 
      setMode('') 
    } else {
      const errorText = await res.text()
      alert('Failed to add row: ' + errorText)
    }
  }

  const startEdit = (row: any) => { 
    setSelectedRow(row); 
    setForm(row); 
    setMode('edit') 
  }

  const saveEdit = async () => {
    const res = await apiFetch(`/tables/${table}/rows`, { method:'PUT', body: JSON.stringify({ original: selectedRow, values: form }) })
    if (res.ok) { 
      alert('Row updated'); 
      apiFetch(`/tables/${table}/rows`).then((r: Response) => r.json()).then(setRows); 
      setMode(''); 
      setSelectedRow(null) 
    } else {
      alert('Failed to update row')
    }
  }

  return (
    <Box sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Update Tables
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FormControl fullWidth sx={{ maxWidth: 300 }}>
              <InputLabel>Select a table</InputLabel>
              <Select
                value={table}
                label="Select a table"
                onChange={e=>setTable(e.target.value)}
              >
                <MenuItem value="">Select a table…</MenuItem>
                {tables.map(t => <MenuItem key={t.table_name} value={t.table_name}>{t.table_name}</MenuItem>)}
              </Select>
            </FormControl>
            
            {table && (
              <Stack direction="row" spacing={1}>
                <Button 
                  variant={mode==='add' ? 'contained' : 'outlined'}
                  startIcon={<AddIcon />}
                  onClick={()=>setMode('add')}
                >
                  Add Entry
                </Button>
                <Button 
                  variant="outlined"
                  onClick={()=>setMode('')}
                >
                  Done Editing
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {table && mode==='add' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add entry to {table}
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              {columns.map(c => {
                const isIdField = c.column_name.toLowerCase() === 'id'
                return (
                  <TextField
                    key={c.column_name}
                    label={`${c.column_name} (${c.data_type})`}
                    variant="outlined"
                    fullWidth
                    disabled={isIdField}
                    value={form[c.column_name] ?? ''}
                    onChange={e=>setForm(p=>({ ...p, [c.column_name]: e.target.value }))}
                    helperText={isIdField ? 'Auto-generated by database' : ''}
                    placeholder={isIdField ? 'Auto-generated' : ''}
                  />
                )
              })}
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={saveAdd}
              >
                Save
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={()=>setMode('')}
              >
                Cancel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {table && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Rows in {table}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {Object.keys(rows[0] || {}).map(c => 
                      <TableCell key={c} sx={{ fontWeight: 'bold' }}>{c}</TableCell>
                    )}
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r,i)=>(
                    <TableRow key={i} hover>
                      {Object.keys(r).map(c => 
                        <TableCell key={c}>{String(r[c] ?? '')}</TableCell>
                      )}
                      <TableCell>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={()=>startEdit(r)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {mode==='edit' && selectedRow && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Edit entry
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
              mb: 3
            }}>
              {Object.keys(form).map(col => {
                const isIdField = col.toLowerCase() === 'id'
                return (
                  <TextField
                    key={col}
                    label={col}
                    variant="outlined"
                    fullWidth
                    disabled={isIdField}
                    value={form[col] ?? ''}
                    onChange={e=>setForm(p=>({ ...p, [col]: e.target.value }))}
                    helperText={isIdField ? 'Cannot modify ID' : ''}
                  />
                )
              })}
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={saveEdit}
              >
                Save
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CancelIcon />}
                onClick={()=>setMode('')}
              >
                Cancel
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
