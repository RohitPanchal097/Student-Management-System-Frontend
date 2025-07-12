import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputLabel, Box, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import SelectDropdown from 'react-select';

const yearOptions = [
  { value: '', label: 'All' },
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year' },
];
const semesterOptions = [
  { value: '', label: 'All' },
  { value: '1st Semester', label: '1st Semester' },
  { value: '2nd Semester', label: '2nd Semester' },
  { value: '3rd Semester', label: '3rd Semester' },
  { value: '4th Semester', label: '4th Semester' },
  { value: '5th Semester', label: '5th Semester' },
  { value: '6th Semester', label: '6th Semester' },
  { value: '7th Semester', label: '7th Semester' },
  { value: '8th Semester', label: '8th Semester' },
];

function FeesHistorySidebar({ courses, batches }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterBatches = courseId ? batches.filter(b => b.course_id === parseInt(courseId)) : batches;

  const fetchPayments = async () => {
    setLoading(true);
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (courseId) params.push(`course_id=${courseId}`);
    if (batchId) params.push(`batch_id=${batchId}`);
    if (year) params.push(`year=${encodeURIComponent(year)}`);
    if (semester) params.push(`semester=${encodeURIComponent(semester)}`);
    const url = `http://localhost:5000/api/fees_payments${params.length ? '?' + params.join('&') : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []); // initial load

  // Promotion-style dark card
  const cardStyle = {
    background: '#232323',
    color: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
    margin: '0 auto',
    maxWidth: 1100,
    width: '100%',
  };
  const inputStyle = {
    background: '#181818',
    color: '#fff',
    borderRadius: 8,
    border: 'none',
    padding: 8,
    width: '100%',
  };
  const selectStyles = {
    control: (base) => ({ ...base, background: '#181818', color: '#fff', borderRadius: 8, minHeight: 40, border: 'none' }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    menu: (base) => ({ ...base, zIndex: 9999, background: '#232323', color: '#fff' }),
    option: (base, state) => ({ ...base, background: state.isFocused ? '#333' : '#232323', color: '#fff' }),
    input: (base) => ({ ...base, color: '#fff' }),
  };

  return (
    <Box sx={{ py: 4, px: { xs: 1, sm: 2, md: 4 }, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, type: 'spring' }} style={{ width: '100%' }}>
        <Card style={cardStyle} elevation={8}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom align="left" sx={{ mb: 3 }}>
              Fees History / Collection
            </Typography>
            <Box component="form" onSubmit={e => { e.preventDefault(); fetchPayments(); }} sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink htmlFor="from-date" sx={{ color: '#fff' }}>From</InputLabel>
                  <input id="from-date" type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink htmlFor="to-date" sx={{ color: '#fff' }}>To</InputLabel>
                  <input id="to-date" type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink sx={{ color: '#fff' }}>Course</InputLabel>
                  <SelectDropdown
                    options={[{ value: '', label: 'All' }, ...courses.map(c => ({ value: c.id, label: c.name }))]}
                    value={courses.find(c => String(c.id) === String(courseId)) ? { value: courseId, label: courses.find(c => String(c.id) === String(courseId)).name } : { value: '', label: 'All' }}
                    onChange={opt => setCourseId(opt.value)}
                    isClearable={false}
                    styles={selectStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink sx={{ color: '#fff' }}>Batch</InputLabel>
                  <SelectDropdown
                    options={[{ value: '', label: 'All' }, ...filterBatches.map(b => ({ value: b.id, label: b.name }))]}
                    value={filterBatches.find(b => String(b.id) === String(batchId)) ? { value: batchId, label: filterBatches.find(b => String(b.id) === String(batchId)).name } : { value: '', label: 'All' }}
                    onChange={opt => setBatchId(opt.value)}
                    isClearable={false}
                    styles={selectStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink sx={{ color: '#fff' }}>Year</InputLabel>
                  <SelectDropdown
                    options={yearOptions}
                    value={yearOptions.find(y => y.value === year) || yearOptions[0]}
                    onChange={opt => setYear(opt.value)}
                    isClearable={false}
                    styles={selectStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <InputLabel shrink sx={{ color: '#fff' }}>Semester</InputLabel>
                  <SelectDropdown
                    options={semesterOptions}
                    value={semesterOptions.find(s => s.value === semester) || semesterOptions[0]}
                    onChange={opt => setSemester(opt.value)}
                    isClearable={false}
                    styles={selectStyles}
                  />
                </Grid>
                <Grid item xs={12} md={2} alignSelf="end">
                  <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ borderRadius: 8, fontWeight: 700, py: 1.2, boxShadow: 3 }}>
                    Apply Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 4, background: '#181818', color: '#fff', boxShadow: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: '#232323' }}>
                    <TableCell sx={{ color: '#fff' }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Student</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Course</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Batch</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Year</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Amount</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Mode</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: '#fff' }}>Loading...</TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: '#fff' }}>No records</TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p, i) => (
                      <motion.tr key={p.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ background: i % 2 === 0 ? '#232323' : '#181818', color: '#fff' }}>
                        <TableCell sx={{ color: '#fff' }}>{p.date}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.student_name}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.course}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.batch}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.year}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.amount}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.mode}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{p.note}</TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}

export default FeesHistorySidebar; 