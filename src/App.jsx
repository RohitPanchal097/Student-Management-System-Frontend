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

function App() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <div className="bg-dark min-vh-100" style={{ minHeight: '100vh' }}>
      <Sidebar current={current} setCurrent={setCurrent} />
      <div style={{ marginLeft: 240, minHeight: '100vh', background: '#23272b' }}>
        <Topbar />
        <main className="py-4" style={{ minHeight: 'calc(100vh - 64px)', background: '#23272b', paddingLeft: 32, paddingRight: 32 }}>
          {current === "dashboard" && <Dashboard />}
          {current === "admission" && <StudentAdmission />}
          {current === "records" && <StudentRecords />}
          {current === "exam" && <ExamForm />}
          {current === "promotion" && <PromotionManager />}
          {current === "courses" && <CourseBatchManager />}
          {current === "search" && <SearchUpdate />}
          {current === "backup" && <BackupManager />}
        </main>
      </div>
    </div>
  );
}

export default App;
