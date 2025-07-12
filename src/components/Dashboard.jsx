import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../slices/coursesSlice';
import { fetchStudents } from '../slices/studentsSlice';
import { Card, CardContent, Typography, Box, Chip, Divider, Button } from '@mui/material';

const events = [
  { date: 'Tue, 6 Feb', title: 'School President Elections', time: '11:00 AM - 12:30 PM', tag: 'Today' },
  { date: 'Fri, 9 Feb', title: 'Special Guest Lecture', time: '11:00 AM - 12:30 PM', tag: 'In 3 days' },
  { date: 'Fri, 9 Feb', title: 'Webinar on Career Trends for Class 11', time: '01:00 PM - 02:30 PM', tag: 'In 3 days' },
];

const tabData = {
  Admissions: [95, 88, 70, 82, 98],
  Fees: [80, 90, 85, 75, 95],
  Results: [92, 85, 78, 88, 96],
};

const tabLabels = Object.keys(tabData);
const classLabels = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'];

function Dashboard() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: students, status: studentsStatus } = useSelector(state => state.students);
  const { items: batches } = useSelector(state => state.batches);
  const [tab, setTab] = useState('Results');

  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (studentsStatus === 'idle') {
      dispatch(fetchStudents());
    }
  }, [dispatch, coursesStatus, studentsStatus]);

  const stats = [
    { label: 'Students', value: students.length, icon: <FaUserGraduate size={28} />, color: '#22335b', bg: '#e3eafc' },
    { label: 'Courses', value: courses.length, icon: <FaChalkboardTeacher size={28} />, color: '#1abc9c', bg: '#e0f7f4' },
    { label: 'Batches', value: batches.length, icon: <FaUsers size={28} />, color: '#3498db', bg: '#e3f1fc' },
    { label: 'Active', value: students.filter(s => s.status !== 'inactive').length, icon: <FaUserTie size={28} />, color: '#ff9800', bg: '#fff3e0' },
  ];

  const loading = coursesStatus === 'loading' || studentsStatus === 'loading';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mx: 0, px: 0 }}>
      {/* Top stats cards (side by side, responsive) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
        {stats.map((s) => (
          <Box key={s.label} sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }
          }}>
            <Card sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 3, boxShadow: 3, background: s.bg }}>
              <Box sx={{ color: s.color }}>{s.icon}</Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>{s.label.toUpperCase()}</Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
      {/* Courses Overview & Recent Students (full width) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Courses Overview</Typography>
              {courses.length > 0 ? (
                <Box>
                  {courses.map((course) => {
                    const courseBatches = batches.filter(b => b.course_id === course.id);
                    const courseStudents = students.filter(s => s.course_id === course.id);
                    return (
                      <Box key={course.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Box>
                          <Typography fontWeight={700}>{course.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{courseBatches.length} batches</Typography>
                        </Box>
                        <Chip label={`${courseStudents.length} students`} color="primary" variant="outlined" />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography color="text.secondary">No courses added yet</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Recent Students</Typography>
              {students.length > 0 ? (
                <Box>
                  {students.slice(0, 5).map((student) => (
                    <Box key={student.id} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box>
                        <Typography fontWeight={700}>{student.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{student.course} - {student.batch}</Typography>
                      </Box>
                      <Chip label={student.year} color="success" variant="filled" />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No students added yet</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Tabs and chart (full width) */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent>
              <Box mb={2} display="flex" gap={2}>
                {tabLabels.map((t) => (
                  <Button key={t} variant={tab === t ? 'contained' : 'outlined'} color="primary" onClick={() => setTab(t)} sx={{ borderRadius: 2, fontWeight: 700 }}>{t}</Button>
                ))}
              </Box>
              <Typography variant="h6" fontWeight={700} mb={2}>Students Performance</Typography>
              {/* Simple bar chart using Box (replace with recharts later) */}
              <Box display="flex" alignItems="end" gap={3} minHeight={180}>
                {tabData[tab].map((val, i) => (
                  <Box key={i} textAlign="center" flex={1}>
                    <Box sx={{ height: val * 1.2, background: '#22335b', borderRadius: 2, mb: 1, transition: 'height 0.3s' }} />
                    <Typography fontWeight={700}>{val}%</Typography>
                    <Typography variant="body2" color="text.secondary">{classLabels[i]}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Upcoming Events (full width) */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ width: '100%' }}>
          <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}><FaCalendarAlt style={{ marginRight: 8 }} /> Upcoming Events</Typography>
              {events.map((e, i) => (
                <Box key={i} display="flex" alignItems="center" mb={2}>
                  <Box minWidth={90} textAlign="center">
                    <Typography fontWeight={700} color="text.secondary">{e.date}</Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography fontWeight={700}>{e.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{e.time}</Typography>
                  </Box>
                  <Chip label={e.tag} color="info" variant="filled" sx={{ ml: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard; 