'use client'
import { useState } from 'react'
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
  Checkbox, 
  FormControlLabel,
  Stack
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

type Col = { name: string; type: string; nullable: boolean }
const TYPES = ['text','integer','numeric','boolean','timestamp']

export default function AddTablePage() {
  const [tableName, setTableName] = useState('')
  const [cols, setCols] = useState<Col[]>([{ name:'id', type:'integer', nullable:false }])
  
  const addCol = () => setCols(p => [...p, { name:'', type:'text', nullable:true }])
  const deleteCol = (i: number) => setCols(p => p.filter((_, idx) => idx !== i))
  const setCol = (i: number, patch: Partial<Col>) => setCols(p => p.map((c,idx)=> idx===i ? { ...c, ...patch } : c))
  
  const submit = async () => {
    if (!tableName) return alert('Table name required')
    const res = await apiFetch('/tables', {method:'POST', body: JSON.stringify({ tableName, columns: cols }) })
    if (res.ok) alert('Table created'); else alert('Failed to create table')
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create a new table
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Table name"
              variant="outlined"
              fullWidth
              value={tableName}
              onChange={e=>setTableName(e.target.value)}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Columns
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 3 }}>
            {cols.map((c,i)=>(
              <Box 
                key={i} 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' },
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <TextField
                  placeholder="column_name"
                  variant="outlined"
                  value={c.name}
                  onChange={e=>setCol(i,{name:e.target.value})}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={c.type}
                    label="Type"
                    onChange={e=>setCol(i,{type:e.target.value})}
                  >
                    {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={c.nullable} 
                      onChange={e=>setCol(i,{nullable:e.target.checked})} 
                    />
                  }
                  label="Nullable"
                />
                
                <IconButton 
                  color="error"
                  onClick={() => deleteCol(i)}
                  disabled={cols.length === 1}
                  title={cols.length === 1 ? "Cannot delete last column" : "Delete column"}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={addCol}
            >
              Add Column
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={submit}
            >
              Create Table
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
