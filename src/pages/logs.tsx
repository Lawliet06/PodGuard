import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';
import * as XLSX from 'xlsx'; // For exporting to Excel
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

interface AccessLog {
  id: string;
  name: string;
  position: string;
  date: string;
  checkinTime: string;
  checkoutTime: string;
}

export default function Log() {
  const [rows, setRows] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const logCollectionRef = collection(db, 'Access');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(logCollectionRef);
        const logsData = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name || '',
            position: data.position || '',
            date: (data.date as Timestamp)?.toDate(),
            checkinTime: (data.checkin as Timestamp)?.toDate(),
            checkoutTime: (data.checkout as Timestamp)?.toDate(),
          };
        });

        // Sort by check-in time in descending order (latest first)
        logsData.sort((a, b) => (b.checkinTime?.getTime() || 0) - (a.checkinTime?.getTime() || 0));

        // Convert timestamps to readable strings for display
        const formattedLogs = logsData.map((log) => ({
          ...log,
          date: log.date?.toLocaleDateString() || '',
          checkinTime: log.checkinTime?.toLocaleTimeString() || '',
          checkoutTime: log.checkoutTime?.toLocaleTimeString() || '',
        }));

        setRows(formattedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectRow = (id: string) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id],
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(event.target.checked ? rows.map((row) => row.id) : []);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRows = rows.filter(
    (row) =>
      (row.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (row.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const deleteLog = async (id: string) => {
    await deleteDoc(doc(db, 'Access', id));
    Swal.fire('Deleted!', 'The log has been deleted.', 'success');
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const deleteSelectedLogs = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete selected!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Promise.all(selected.map((id) => deleteLog(id)));
        setSelected([]);
      }
    });
  };

  const exportToXLS = () => {
    const ws = XLSX.utils.json_to_sheet(
      rows.map(row => ({
        Name: row.name,
        Position: row.position,
        Date: row.date,
        'Check-In Time': row.checkinTime,
        'Check-Out Time': row.checkoutTime
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AccessLog");
    XLSX.writeFile(wb, "AccessLog.xlsx");
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5">Access Logs</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search by name or position"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={exportToXLS}>
            Export to XLS
          </Button>
          {selected.length > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={deleteSelectedLogs}
            >
              Delete Selected
            </Button>
          )}
        </Stack>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === rows.length}
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check-In Time</TableCell>
                <TableCell>Check-Out Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                    <TableRow
                    hover
                    key={row.id}
                    role="checkbox"
                    tabIndex={-1}
                    selected={selected.includes(row.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'lightgrey !important', // Enforcing light grey
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.checkinTime}</TableCell>
                    <TableCell>{row.checkoutTime}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => deleteLog(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
