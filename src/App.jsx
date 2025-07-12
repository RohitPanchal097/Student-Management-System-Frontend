import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import StudentAdmission from "./components/StudentAdmission";
import StudentRecords from "./components/StudentRecords";
import ExamForm from "./components/ExamForm";
import PromotionManager from "./components/PromotionManager";
import CourseBatchManager from "./components/CourseBatchManager";
import SearchUpdate from "./components/SearchUpdate";
import BackupManager from "./components/BackupManager";
import FeesHistorySidebar from "./components/FeesHistorySidebar";
import { useSelector } from 'react-redux';
// MUI theme setup
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#22335b', // deep blue
    },
    secondary: {
      main: '#ff9800', // orange accent
    },
    background: {
      default: '#f4f7fb', // light background
      paper: '#fff',
    },
    text: {
      primary: '#1a2235',
      secondary: '#22335b',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Poppins, Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  },
});

function App() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="bg-dark min-vh-100" style={{ minHeight: '100vh' }}>
        <Sidebar current={current} setCurrent={setCurrent} />
        <div style={{ marginLeft: 240, minHeight: '100vh', background: '#f4f7fb', width: 'calc(100vw - 240px)' }}>
          <Topbar />
          <main className="py-4" style={{ minHeight: 'calc(100vh - 64px)', background: 'transparent', paddingLeft: 32, paddingRight: 32 }}>
            {current === "dashboard" && <Dashboard />}
            {current === "admission" && <StudentAdmission />}
            {current === "records" && <StudentRecords />}
            {current === "exam" && <ExamForm />}
            {current === "promotion" && <PromotionManager />}
            {current === "fees_history" && <FeesHistorySidebarWrapper />}
            {current === "courses" && <CourseBatchManager />}
            {current === "search" && <SearchUpdate />}
            {current === "backup" && <BackupManager />}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

// Add a wrapper to provide courses and batches from redux
function FeesHistorySidebarWrapper() {
  const courses = useSelector(state => state.courses.items);
  const batches = useSelector(state => state.batches.items);
  return <FeesHistorySidebar courses={courses} batches={batches} />;
}

export default App;
