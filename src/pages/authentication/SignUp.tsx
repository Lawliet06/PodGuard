import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paths, { rootPaths } from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PasswordTextField from 'components/common/PasswordTextField';
import LogoHeader from 'layouts/main-layout/sidebar/LogoHeader';
import { doCreateUserWithEmailAndPassword, doSendEmailVerification, } from '../../firebase/auth'; // Add this import

interface FirebaseAuthError extends Error {
  code: string;
}

const checkBoxLabel = { inputProps: { 'aria-label': 'Checkbox' } };

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message on submit

    if (!isLoading) {
      setIsLoading(true);
      try {
        // Use Firebase method to create a new user
        await doCreateUserWithEmailAndPassword(email, password, name);
        navigate(rootPaths.root); // Redirect to homepage or dashboard after successful sign-up
        await doSendEmailVerification();
      } catch (error) {
        const authError = error as FirebaseAuthError;
        handleAuthError(authError.code);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Simplified error handling for common Firebase auth errors
  const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        setErrorMessage("This email is already in use.");
        break;
      case "auth/invalid-email":
        setErrorMessage("The email you entered is invalid.");
        break;
      case "auth/weak-password":
        setErrorMessage("The password is too weak.");
        break;
      case "auth/network-request-failed":
        setErrorMessage("A network error occurred. Please check your connection.");
        break;
      default:
        setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <LogoHeader sx={{ justifyContent: 'center', mb: 5 }} />

      <Paper sx={{ p: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="h3">Sign up</Typography>
          <Typography variant="subtitle2" color="neutral.main">
            Have an account?{' '}
            <Link href={paths.signin} underline="hover">
              Sign in
            </Link>
          </Typography>
        </Stack>

        <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoComplete="name"
              fullWidth
              required
              error={Boolean(errorMessage)}
              helperText={errorMessage.includes('name') && errorMessage}
            />

            <TextField
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              fullWidth
              required
              error={Boolean(errorMessage)}
              helperText={errorMessage.includes('email') && errorMessage}
            />

            <PasswordTextField
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              fullWidth
              required
              error={Boolean(errorMessage)}
              helperText={errorMessage.includes('password') && errorMessage}
            />
          </Stack>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          <FormControlLabel
            control={<Checkbox {...checkBoxLabel} color="primary" />}
            label={
              <Typography variant="subtitle2" whiteSpace="nowrap">
                Accept{' '}
                <Link href="#!" underline="hover" sx={{ fontWeight: 'fontWeightBold' }}>
                  terms
                </Link>{' '}
                &{' '}
                <Link href="#!" underline="hover" sx={{ fontWeight: 'fontWeightBold' }}>
                  privacy policy
                </Link>
              </Typography>
            }
            sx={{ mt: 2 }}
          />

          <Button type="submit" size="large" variant="contained" sx={{ mt: 2 }} fullWidth>
            Sign up
          </Button>

          <Divider sx={{ color: 'neutral.main', my: 2 }}>
            <Typography variant="subtitle2">or sign up with</Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<IconifyIcon icon="devicon:google" />}
                sx={{ color: 'error.main', borderColor: 'error.main' }}
                fullWidth
              >
                <Typography>Google</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<IconifyIcon icon="logos:facebook" />}
                sx={{ color: 'primary.light', borderColor: 'primary.light' }}
                fullWidth
              >
                <Typography>Facebook</Typography>
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;
