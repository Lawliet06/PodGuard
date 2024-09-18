import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/FirebaseConfig';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Timestamp } from 'firebase/firestore';

// Define AccessLog interface here or import from a shared file
interface AccessLog {
  id: string;
  name: string;
  position: string;
  date: string;
  checkinTime: string;
  checkoutTime: string;
}

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const Dashboard = () => {
  const [latestUser, setLatestUser] = useState<AccessLog | null>(null);
  const [userLogs, setUserLogs] = useState<AccessLog[]>([]);
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
        logsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
        setLatestUser(logsData[0] || null);
        setUserLogs(logsData);
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

  // Calculate latest and average check-in times
  const latestCheckinTime = latestUser ? convertTimeToMinutes(latestUser.checkinTime) : 0;
  const averageCheckinTime = userLogs.length > 0 
    ? userLogs.reduce((acc, log) => acc + convertTimeToMinutes(log.checkinTime), 0) / userLogs.length
    : 0;

  // Pie chart data
  const checkinData = {
    labels: ['Latest Check-in Time', 'Average Check-in Time'],
    datasets: [
      {
        data: [latestCheckinTime, averageCheckinTime],
        backgroundColor: ['#36A2EB', '#FF6384'],
        hoverOffset: 4,
      },
    ],
  };

  // Prepare data for the bar chart
  const chartData = {
    labels: userLogs.map(log => log.date),
    datasets: [
      {
        label: 'Check-in Time',
        data: userLogs.map(log => convertTimeToMinutes(log.checkinTime)),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Check-out Time',
        data: userLogs.map(log => convertTimeToMinutes(log.checkoutTime)),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
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
            <Typography variant="h5" gutterBottom>Latest User Added</Typography>
            {latestUser ? (
              <Card>
                <CardContent>
                  <Typography variant="h6">{latestUser.name}</Typography>
                  <Typography variant="body2">Position: {latestUser.position}</Typography>
                  <Typography variant="body2">Date: {latestUser.date}</Typography>
                  <Typography variant="body2">Check-in Time: {latestUser.checkinTime}</Typography>
                  <Typography variant="body2">Check-out Time: {latestUser.checkoutTime}</Typography>
                </CardContent>
              </Card>
            ) : (
              <Typography>No user found.</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>Check-in Times</Typography>
            <Box display="flex" justifyContent="space-around">
              <Box sx={{ width: '45%' }}>
                <Typography variant="h6" gutterBottom>Latest Check-in Time</Typography>
                <Pie data={checkinData} />
              </Box>
              <Box sx={{ width: '45%' }}>
                <Typography variant="h6" gutterBottom>Average Check-in Time from Previous Logs</Typography>
                <Pie data={checkinData} />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>User Cards</Typography>
            <Grid container spacing={2}>
              {userLogs.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{user.name}</Typography>
                      <Typography variant="body2">Position: {user.position}</Typography>
                      <Typography variant="body2">Date: {user.date}</Typography>
                      <Typography variant="body2">Check-in Time: {user.checkinTime}</Typography>
                      <Typography variant="body2">Check-out Time: {user.checkoutTime}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
