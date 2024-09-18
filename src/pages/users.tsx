import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Modal,
  Paper,
  Select,
  Stack,
  Switch,
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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';
import { collection, deleteDoc, doc, getDocs, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

interface User {
  id: string;
  name: string;
  email: string;
  position: string;
  gender: string;
  status: string;
  uid?: string; // Optional for the new user UID
}

export default function UsersList() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Omit<User, 'id' | 'uid'>>({
    name: '',
    position: '',
    email: '',
    gender: '',
    status: '',
  });
  const [emailError, setEmailError] = useState<string>('');

  const empCollectionRef = collection(db, 'Employee');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(empCollectionRef);
        const usersData: User[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as User,
        );
        setRows(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'Employee', id));
    Swal.fire('Deleted!', 'The user has been deleted.', 'success');
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const deleteSelectedUsers = async () => {
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
        await Promise.all(selected.map((id) => deleteUser(id)));
        setSelected([]);
      }
    });
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | { name?: string; value: unknown };

    if (name === 'email' && typeof value === 'string' && value !== '') {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        setEmailError('Please enter a valid email address.');
        return;
      }
      setEmailError('');
    }

    setUserForm({ ...userForm, [name!]: value });
  };

  const sendConfirmationEmail = (email: string) => {
    console.log(`Confirmation email sent to ${email}`);
  };

  const addUser = async () => {
    const newUID = `UNIPOD${Math.floor(100 + Math.random() * 9000)}`;
    const newUser = { ...userForm, uid: newUID, status: 'active' };

    await addDoc(empCollectionRef, newUser);
    setRows((prevRows) => [...prevRows, { ...newUser, id: newUID } as User]);
    setOpenModal(false);
    sendConfirmationEmail(userForm.email);
    Swal.fire('Added!', 'New employee has been added.', 'success');
  };

  const updateUser = async () => {
    const userDoc = doc(db, 'Employee', editUserId!);
    await updateDoc(userDoc, userForm);
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === editUserId ? { ...row, ...userForm } : row)),
    );
    setOpenModal(false);
    setEditUserId(null);
    Swal.fire('Updated!', 'Employee details have been updated.', 'success');
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const userDoc = doc(db, 'Employee', user.id);
    await updateDoc(userDoc, { status: newStatus });
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === user.id ? { ...row, status: newStatus } : row)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserId) {
      updateUser();
    } else {
      addUser();
    }
  };

  const openAddUserModal = () => {
    setEditUserId(null);
    setUserForm({ name: '', position: '', email: '', gender: '', status: '' });
    setOpenModal(true);
  };

  const openDeleteModal = (user: User) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete user ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(user.id);
      }
    });
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5">All Users</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search by name or email"
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
          <Button variant="contained" startIcon={<AddCircleIcon />} onClick={openAddUserModal}>
            Add User
          </Button>
          {selected.length > 0 && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={deleteSelectedUsers}
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
                <TableCell>UID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Status</TableCell>
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
                    <TableCell>{row.uid}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>
                      <Switch
                        checked={row.status === 'active'}
                        onChange={() => toggleStatus(row)}
                        color="primary"
                      />
                      {row.status}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditUserId(row.id);
                          setUserForm({
                            name: row.name,
                            position: row.position,
                            email: row.email,
                            gender: row.gender,
                            status: row.status,
                          });
                          setOpenModal(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => openDeleteModal(row)}>
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

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box component="form" sx={modalStyle} onSubmit={handleSubmit}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {editUserId ? 'Edit User' : 'Add User'}
          </Typography>
          <TextField
            label="Name"
            fullWidth
            name="name"
            value={userForm.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <Select
            label="Position"
            name="position"
            value={userForm.position}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<{ name?: string; value: unknown }>)
            }
            displayEmpty
            fullWidth
            margin="dense"
          >
            <MenuItem value="">
              <em>Select Position</em>
            </MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="support">Support</MenuItem>
            <MenuItem value="programmer">Programmer</MenuItem>
            <MenuItem value="intern">Intern</MenuItem>
            <MenuItem value="innovator">Innovator</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </Select>
          <TextField
            margin="normal"
            fullWidth
            name="email"
            label="Email"
            value={userForm.email}
            onChange={handleInputChange}
            required
            error={!!emailError}
            helperText={emailError}
          />
          <Select
            name="gender"
            fullWidth
            value={userForm.gender}
            onChange={(e) =>
              handleInputChange(e as React.ChangeEvent<{ name?: string; value: unknown }>)
            }
            displayEmpty
            required
          >
            <MenuItem value="">
              <em>Select Gender</em>
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
          <Stack direction="row" spacing={5} mt={3}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" style={{backgroundColor: '#E32636', color: 'white'}}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={Boolean(emailError)}
            >
              {editUserId ? 'Update' : 'Add'} User
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Paper>
  );
}
