import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, Grid, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Timestamp } from 'firebase/firestore';

// Define AccessLog interface
interface AccessLog {
  id: string;
  name: string;
  position: string;
  date: string;
  checkinTime: string;
  checkoutTime: string;
}

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, ArcElement);

const Analytics = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  const logsCollectionRef = collection(db, 'Access');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snapshot = await getDocs(logsCollectionRef);
        const logsData: AccessLog[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            position: data.position || '',
            date: (data.date as Timestamp)?.toDate().toLocaleDateString() || '',
            checkinTime: (data.checkin as Timestamp)?.toDate().toLocaleTimeString() || '',
            checkoutTime: (data.checkout as Timestamp)?.toDate().toLocaleTimeString() || '',
          } as AccessLog;
        });
        setLogs(logsData);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Convert time to minutes since start of the day
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Data for charts
  const checkinTimes = logs.map(log => convertTimeToMinutes(log.checkinTime));
  const checkoutTimes = logs.map(log => convertTimeToMinutes(log.checkoutTime));
  const dates = logs.map(log => log.date);

  const pieData = {
    labels: ['Check-in Time', 'Check-out Time'],
    datasets: [
      {
        data: [checkinTimes.reduce((a, b) => a + b, 0) / checkinTimes.length || 0, checkoutTimes.reduce((a, b) => a + b, 0) / checkoutTimes.length || 0],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverOffset: 4,
      },
    ],
  };

  const lineData = {
    labels: dates,
    datasets: [
      {
        label: 'Check-in Time',
        data: checkinTimes,
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Check-out Time',
        data: checkoutTimes,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  const barData = {
    labels: dates,
    datasets: [
      {
        label: 'Check-in Time',
        data: checkinTimes,
        backgroundColor: '#FF6384',
      },
      {
        label: 'Check-out Time',
        data: checkoutTimes,
        backgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>Analytics Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Check-in/Check-out Time Distribution</Typography>
                  <Pie data={pieData} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Check-in and Check-out Time Trends</Typography>
                  <Line data={lineData} />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Check-in and Check-out Times by Date</Typography>
                  <Bar data={barData} />
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Detailed Logs</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Check-out Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>{log.position}</TableCell>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.checkinTime}</TableCell>
                      <TableCell>{log.checkoutTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Analytics;
