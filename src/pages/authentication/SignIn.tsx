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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paths, { rootPaths } from 'routes/paths';
import LogoHeader from 'layouts/main-layout/sidebar/LogoHeader';
import IconifyIcon from 'components/base/IconifyIcon';
import PasswordTextField from 'components/common/PasswordTextField';
import { doSignInWithEmailAndPassword, doPasswordReset, doSignOut } from "../../firebase/auth";

interface FirebaseAuthError extends Error {
  code: string;
}

const checkBoxLabel = { inputProps: { 'aria-label': 'Checkbox' } };

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Automatically sign out the user when they visit this page
    const signOutUser = async () => {
      try {
        await doSignOut();
      } catch (error) {
        console.error("Error signing out: ", error);
      }
    };

    signOutUser();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message on submit

    if (!isLoading) {
      setIsLoading(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
        navigate(rootPaths.root); // Redirect to homepage or dashboard after successful sign-in
      } catch (error) {
        const authError = error as FirebaseAuthError;
        handleAuthError(authError.code);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        setErrorMessage("Wrong email or password.");
        break;
      case "auth/invalid-email":
        setErrorMessage("The email you entered is invalid.");
        break;
      case "auth/user-not-found":
        setErrorMessage("This email is not registered.");
        break;
      case "auth/wrong-password":
        setErrorMessage("Wrong email or password.");
        break;
      case "auth/missing-password":
        setErrorMessage("Please enter the password.");
        break;
      case "auth/too-many-requests":
        setErrorMessage("Too many login attempts. Please try again later.");
        break;
      case "auth/network-request-failed":
        setErrorMessage("A network error occurred. Please check your connection.");
        break;
      default:
        setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        setErrorMessage('Please enter your email to reset your password.');
        return;
      }
      await doPasswordReset(email);
      setResetSuccess(true);
      setErrorMessage('');
      window.alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      setErrorMessage('Failed to send password reset email. Please try again.');
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
          <Typography variant="h3">Sign in</Typography>
          <Typography variant="subtitle2" color="neutral.main">
            or{' '}
            <Link href={paths.signup} underline="hover">
              Create an account
            </Link>
          </Typography>
        </Stack>

        <Box component="form" sx={{ mt: 3 }} onSubmit={onSubmit}>
          <Stack spacing={2}>
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

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            mt={1}
            spacing={0.5}
          >
            <FormControlLabel
              control={<Checkbox {...checkBoxLabel} color="primary" />}
              label={<Typography variant="subtitle1">Remember me</Typography>}
            />

            <Typography variant="subtitle2" color="primary">
              <Link href="#!" underline="hover" onClick={handleForgotPassword}>
                Forgot password?
              </Link>
            </Typography>
          </Stack>

          <Button type="submit" size="large" variant="contained" sx={{ mt: 2 }} fullWidth>
            Sign in
          </Button>

          {resetSuccess && (
            <Typography color="success.main" mt={2}>
              Password reset email sent successfully.
            </Typography>
          )}

          <Divider sx={{ color: 'neutral.main', my: 2 }}>
            <Typography variant="subtitle2"> or sign in with</Typography>
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

export default SignIn;
