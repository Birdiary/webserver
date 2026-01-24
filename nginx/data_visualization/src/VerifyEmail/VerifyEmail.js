import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import language from '../languages/languages';
import { useAuth } from '../context/AuthContext';
import './VerifyEmail.css';

const VerifyEmail = ({ language: langKey }) => {
  const copy = language[langKey]?.verifyEmail || language.en.verifyEmail;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail: verifyEmailRequest, resendVerification } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [mode, setMode] = useState(tokenParam ? 'verify' : 'resend');
  const [verifyForm, setVerifyForm] = useState({ token: tokenParam });
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const latestToken = searchParams.get('token') || '';
    const latestEmail = searchParams.get('email') || '';
    setVerifyForm((prev) => ({ ...prev, token: latestToken }));
    setResendEmail(latestEmail);
    if (latestToken) {
      setMode('verify');
    }
  }, [searchParams]);

  const resetStatus = () => setStatus({ type: null, message: '' });

  const handleModeChange = (_event, value) => {
    if (value) {
      setMode(value);
      resetStatus();
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      await verifyEmailRequest(verifyForm.token.trim());
      setStatus({ type: 'success', message: copy.verifySuccess });
      setVerifyForm({ token: '' });
      setTimeout(() => navigate('/view/own-stations', { replace: true }), 1500);
    } catch (error) {
      const message = error.response?.data?.message || copy.verifyError;
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      await resendVerification(resendEmail.trim().toLowerCase());
      setStatus({ type: 'success', message: copy.resendSuccess });
    } catch (error) {
      const message = error.response?.data?.message || copy.resendError;
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="verify-email-wrapper">
      <Paper elevation={4} className="verify-email-card">
        <Typography variant="h4" component="h1" gutterBottom>
          {copy.title}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {mode === 'verify' ? copy.verifySubtitle : copy.resendSubtitle}
        </Typography>

        <Tabs
          value={mode}
          onChange={handleModeChange}
          className="verify-email-tabs"
          variant="fullWidth"
        >
          <Tab label={copy.verifyTab} value="verify" />
          <Tab label={copy.resendTab} value="resend" />
        </Tabs>

        {status.message && (
          <Alert severity={status.type || 'info'} sx={{ width: '100%', mt: 2 }}>
            {status.message}
          </Alert>
        )}

        {mode === 'verify' ? (
          <form className="verify-email-form" onSubmit={handleVerifySubmit}>
            <TextField
              label={copy.tokenLabel}
              value={verifyForm.token}
              onChange={(event) => setVerifyForm({ token: event.target.value })}
              required
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {copy.verifySubmit}
            </Button>
          </form>
        ) : (
          <form className="verify-email-form" onSubmit={handleResendSubmit}>
            <TextField
              label={copy.emailLabel}
              type="email"
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {copy.resendSubmit}
            </Button>
          </form>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button component={RouterLink} to="/view/login" sx={{ mr: 1 }}>
            {copy.backToLogin}
          </Button>
          <Button component={RouterLink} to="/view">
            {copy.backToMap}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
