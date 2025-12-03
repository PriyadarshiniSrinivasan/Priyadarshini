'use client'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ViewListIcon from '@mui/icons-material/ViewList'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import InventoryIcon from '@mui/icons-material/Inventory'
import FolderIcon from '@mui/icons-material/Folder'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system')
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null)
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    const t = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!t) router.replace('/login')
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark' | 'system'
    if (savedTheme) {
      setThemeMode(savedTheme)
    }
  }, [router])
  
  useEffect(() => {
    // Determine actual theme based on mode
    const determineTheme = () => {
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setActualMode(isDark ? 'dark' : 'light')
      } else {
        setActualMode(themeMode)
      }
    }
    
    determineTheme()
    localStorage.setItem('themeMode', themeMode)
    
    // Listen for system theme changes
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        setActualMode(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [themeMode])
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: actualMode,
          primary: {
            main: actualMode === 'dark' ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: actualMode === 'dark' ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: actualMode === 'dark' ? '#121212' : '#f5f5f5',
            paper: actualMode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [actualMode]
  )
  
  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode)
    setThemeMenuAnchor(null)
  }
  
  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
  }
  
  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 0
    if (pathname === '/dashboard/view') return 1
    if (pathname === '/dashboard/update') return 2
    if (pathname === '/dashboard/add-table') return 3
    if (pathname === '/dashboard/materials') return 4
    if (pathname === '/dashboard/files') return 5
    return 0
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top AppBar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Biodata Manager
            </Typography>
            <Tooltip title="Theme Settings">
              <IconButton 
                color="inherit" 
                onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
                sx={{ 
                  mr: 1,
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.1)' 
                  } 
                }}
              >
                {themeMode === 'dark' ? (
                  <DarkModeIcon />
                ) : themeMode === 'light' ? (
                  <LightModeIcon />
                ) : (
                  <SettingsBrightnessIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.1)' 
                  } 
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
          
          {/* Navigation Tabs */}
          <Tabs 
            value={getActiveTab()} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              bgcolor: 'rgba(0, 0, 0, 0.1)'
            }}
          >
            <Tab 
              label="Dashboard" 
              icon={<DashboardIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard"
            />
            <Tab 
              label="View Tables" 
              icon={<ViewListIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard/view"
            />
            <Tab 
              label="Update Tables" 
              icon={<EditIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard/update"
            />
            <Tab 
              label="Add Tables" 
              icon={<AddCircleIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard/add-table"
            />
            <Tab 
              label="Materials" 
              icon={<InventoryIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard/materials"
            />
            <Tab 
              label="Files" 
              icon={<FolderIcon />} 
              iconPosition="start"
              component={Link} 
              href="/dashboard/files"
            />
          </Tabs>
        </AppBar>
        
        {/* Theme Menu */}
        <Menu
          anchorEl={themeMenuAnchor}
          open={Boolean(themeMenuAnchor)}
          onClose={() => setThemeMenuAnchor(null)}
        >
          <MenuItem 
            onClick={() => handleThemeChange('light')}
            selected={themeMode === 'light'}
          >
            <LightModeIcon fontSize="small" sx={{ mr: 1 }} />
            Light
          </MenuItem>
          <MenuItem 
            onClick={() => handleThemeChange('dark')}
            selected={themeMode === 'dark'}
          >
            <DarkModeIcon fontSize="small" sx={{ mr: 1 }} />
            Dark
          </MenuItem>
          <MenuItem 
            onClick={() => handleThemeChange('system')}
            selected={themeMode === 'system'}
          >
            <SettingsBrightnessIcon fontSize="small" sx={{ mr: 1 }} />
            System
          </MenuItem>
        </Menu>
        
        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {children}
        </Container>
        
        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: 2, 
            mt: 'auto',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Biodata Manager. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

