import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import language from '../languages/languages';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = ({ language: langKey }) => {
  const copy = language[langKey]?.login || language.en.login;
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form.email, form.password);
      const redirectPath = location.state?.from?.pathname || '/view/own-stations';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="login-wrapper">
      <Paper elevation={4} className="login-card">
        <Typography variant="h4" component="h1" gutterBottom>
          {copy.title}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {copy.subtitle}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            label={copy.email}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label={copy.password}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            {copy.submit}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {copy.registerPrompt}
          </Typography>
          <Button
            component={RouterLink}
            to="/view/register"
            color="secondary"
            sx={{ mt: 1 }}
          >
            {copy.registerLink}
          </Button>
        </Box>
        <Button
          component={RouterLink}
          to="/view"
          color="secondary"
          sx={{ mt: 2 }}
        >
          {copy.backToMap}
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
