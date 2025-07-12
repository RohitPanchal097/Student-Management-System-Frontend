import { FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaCog, FaTable, FaArrowUp, FaBook, FaMoneyCheckAlt } from 'react-icons/fa';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Box, Typography, Divider } from '@mui/material';
import { deepOrange } from '@mui/material/colors';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'admission', label: 'Student Admission', icon: <FaUserGraduate /> },
  { key: 'records', label: 'Student Records', icon: <FaTable /> },
  { key: 'exam', label: 'Exam Form', icon: <FaTable /> },
  { key: 'promotion', label: 'Promotion', icon: <FaArrowUp /> },
  { key: 'fees_history', label: 'Fees History', icon: <FaMoneyCheckAlt /> },
  { key: 'courses', label: 'Course & Batch Mgmt', icon: <FaBook /> },
  { key: 'teachers', label: 'Teachers', icon: <FaChalkboardTeacher /> },
  { key: 'settings', label: 'Settings', icon: <FaCog /> },
];

const drawerWidth = 240;

function Sidebar({ current, setCurrent }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #22335b 0%, #2d3a5a 100%)',
          color: '#fff',
          borderRight: 'none',
          boxShadow: '4px 0 24px 0 rgba(34,51,91,0.12)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, mb: 2 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: deepOrange[500], fontSize: 36, mb: 1 }}>A</Avatar>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', letterSpacing: 1 }}>
          Admin
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          admin@college.com
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 1 }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={current === item.key}
              onClick={() => setCurrent(item.key)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                color: current === item.key ? '#ff9800' : '#fff',
                background: current === item.key ? 'rgba(255,152,0,0.12)' : 'none',
                '&:hover': {
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ff9800',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36, fontSize: 22 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 16 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mt: 1 }} />
      <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, py: 2 }}>
        &copy; 2024 College SMS
      </Box>
    </Drawer>
  );
}

export default Sidebar; 