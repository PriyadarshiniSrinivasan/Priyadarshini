import Link from 'next/link'
import { Box, Card, CardContent, Typography, Paper, Chip, Avatar, Stack, Container } from '@mui/material'
import ViewListIcon from '@mui/icons-material/ViewList'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import InventoryIcon from '@mui/icons-material/Inventory'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

function FeatureCard({
  href,
  title,
  desc,
  icon,
  color = 'primary',
}: {
  href: string
  title: string
  desc: string
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'secondary' | 'warning'
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card 
        sx={{ 
          height: '100%',
          transition: 'all 0.3s',
          '&:hover': { 
            transform: 'translateY(-4px)',
            boxShadow: 6 
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.main` }}>
              {icon}
            </Avatar>
            <Chip label="Open" size="small" color={color} />
          </Box>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {desc}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: `${color}.main` }}>
            <Typography variant="body2" fontWeight="medium">
              Open
            </Typography>
            <ArrowForwardIcon fontSize="small" />
          </Box>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  return (
    <Box sx={{ py: 3 }}>
      {/* Hero / Welcome */}
      <Paper 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          p: 4,
          mb: 4
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome back 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              Manage your data efficiently—view, update, and create tables. Search <em>Materials</em> by flexible criteria.
            </Typography>
          </Box>

          {/* Stats */}
          <Stack direction="row" spacing={2}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', minWidth: 80 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', display: 'block' }}>
                Tables
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Public
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', minWidth: 80 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', display: 'block' }}>
                Materials
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Manage
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', minWidth: 80 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', display: 'block' }}>
                Status
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#4ade80' }}>
                Healthy
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      {/* Feature Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Actions
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 3 
        }}>
          <FeatureCard
            href="/dashboard/view"
            title="View Tables"
            desc="Inspect rows across any public table in your database."
            color="primary"
            icon={<ViewListIcon />}
          />

          <FeatureCard
            href="/dashboard/update"
            title="Update Tables"
            desc="Add new entries or edit existing rows safely."
            color="success"
            icon={<EditIcon />}
          />

          <FeatureCard
            href="/dashboard/add-table"
            title="Add Tables"
            desc="Create a new table by defining columns & types."
            color="secondary"
            icon={<AddCircleIcon />}
          />

          <FeatureCard
            href="/dashboard/materials"
            title="Materials"
            desc="Filter by department, category, and name."
            color="warning"
            icon={<InventoryIcon />}
          />

          <FeatureCard
            href="/dashboard/files"
            title="File Management"
            desc="Upload, view, update and manage files in the database."
            color="primary"
            icon={<CloudUploadIcon />}
          />
        </Box>
      </Box>

      {/* Helpful tips */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tips
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}>
            <li>
              <Typography variant="body2" color="text.secondary">
                Use <strong>View Tables</strong> to quickly inspect any public table.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Update Tables</strong> offers both Add and Edit flows.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Add Tables</strong> supports column types: text, integer, numeric, boolean, timestamp.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>Materials</strong> lets you filter by department, category, and name contains.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                <strong>File Management</strong> allows uploading files up to 10MB and organizing them by categories.
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
