import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import language from '../languages/languages';
import requests from '../helpers/requests';
import { useAuth } from '../context/AuthContext';
import './PasswordReset.css';

const PasswordReset = ({ language: langKey }) => {
  const copy = language[langKey]?.passwordReset || language.en.passwordReset;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authenticateWithToken } = useAuth();

  const tokenFromQuery = searchParams.get('token') || '';
  const [mode, setMode] = useState(tokenFromQuery ? 'confirm' : 'request');
  const [requestEmail, setRequestEmail] = useState('');
  const [confirmForm, setConfirmForm] = useState({ token: tokenFromQuery, newPassword: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) {
      setMode('confirm');
      setConfirmForm((prev) => ({ ...prev, token: tokenFromQuery }));
    }
  }, [tokenFromQuery]);

  const resetStatus = () => setStatus({ type: null, message: '' });

  const handleModeChange = (_event, value) => {
    if (value) {
      setMode(value);
      resetStatus();
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      const normalizedEmail = requestEmail.trim().toLowerCase();
      await requests.requestPasswordReset({ email: normalizedEmail });
      setStatus({ type: 'success', message: copy.requestSuccess });
      setRequestEmail('');
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        setStatus({ type: 'warning', message: copy.verificationRequired });
        const normalizedEmail = requestEmail.trim().toLowerCase();
        if (normalizedEmail) {
          setTimeout(() => navigate(`/view/verify-email?email=${encodeURIComponent(normalizedEmail)}`), 1200);
        }
      } else {
        const message = error.response?.data?.message || copy.requestError;
        setStatus({ type: 'error', message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      const payload = {
        token: confirmForm.token.trim(),
        newPassword: confirmForm.newPassword,
      };
      const response = await requests.confirmPasswordReset(payload);
      if (response.data?.token) {
        await authenticateWithToken(response.data.token);
      }
      setStatus({ type: 'success', message: copy.confirmSuccess });
      setConfirmForm({ token: '', newPassword: '' });
      setTimeout(() => navigate('/view/own-stations', { replace: true }), 1500);
    } catch (error) {
      const message = error.response?.data?.message || copy.confirmError;
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="password-reset-wrapper">
      <Paper elevation={4} className="password-reset-card">
        <Typography variant="h4" component="h1" gutterBottom>
          {copy.title}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {mode === 'request' ? copy.requestSubtitle : copy.confirmSubtitle}
        </Typography>

        <Tabs
          value={mode}
          onChange={handleModeChange}
          className="password-reset-tabs"
          variant="fullWidth"
        >
          <Tab label={copy.requestTab} value="request" />
          <Tab label={copy.confirmTab} value="confirm" />
        </Tabs>

        {status.message && (
          <Alert severity={status.type} sx={{ width: '100%', mt: 2 }}>
            {status.message}
          </Alert>
        )}

        {mode === 'request' ? (
          <form className="password-reset-form" onSubmit={handleRequestSubmit}>
            <TextField
              label={copy.emailLabel}
              type="email"
              value={requestEmail}
              onChange={(event) => setRequestEmail(event.target.value)}
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
              {copy.requestSubmit}
            </Button>
          </form>
        ) : (
          <form className="password-reset-form" onSubmit={handleConfirmSubmit}>
            <TextField
              label={copy.tokenLabel}
              value={confirmForm.token}
              onChange={(event) => setConfirmForm((prev) => ({ ...prev, token: event.target.value }))}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label={copy.newPasswordLabel}
              type="password"
              value={confirmForm.newPassword}
              onChange={(event) => setConfirmForm((prev) => ({ ...prev, newPassword: event.target.value }))}
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
              {copy.confirmSubmit}
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

export default PasswordReset;
