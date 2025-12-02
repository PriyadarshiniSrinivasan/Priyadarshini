'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@lib/api'
import { 
  Box, 
  Card, 
  CardContent, 
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
  Paper 
} from '@mui/material'

type TableInfo = { table_name: string }

export default function ViewTablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selected, setSelected] = useState('')
  const [rows, setRows] = useState<any[]>([])
  
  useEffect(() => { 
    apiFetch('/tables').then((r: Response) => r.json()).then(setTables) 
  }, [])
  
  useEffect(() => { 
    if (selected) {
      apiFetch(`/tables/${selected}/rows`).then((r: Response) => r.json()).then(setRows) 
    }
  }, [selected])
  
  return (
    <Box sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            View Tables
          </Typography>
          
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Select a table</InputLabel>
            <Select
              value={selected}
              label="Select a table"
              onChange={e=>setSelected(e.target.value)}
            >
              <MenuItem value="">Select a table…</MenuItem>
              {tables.map(t => <MenuItem key={t.table_name} value={t.table_name}>{t.table_name}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>
      
      {selected && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selected} — {rows.length} rows
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    {Object.keys(rows[0] || {}).map(c => 
                      <TableCell key={c} sx={{ fontWeight: 'bold' }}>{c}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r,i)=>(
                    <TableRow key={i} hover>
                      {Object.keys(r).map(c => 
                        <TableCell key={c}>{String(r[c] ?? '')}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

