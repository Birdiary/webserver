import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import language from '../languages/languages';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = ({ language: langKey }) => {
  const copy = language[langKey]?.register || language.en.register;
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate('/view/own-stations', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="register-wrapper">
      <Paper elevation={4} className="register-card">
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
        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            label={copy.name}
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
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
          <TextField
            label={copy.confirmPassword}
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
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
        <Button component={RouterLink} to="/view/login" color="secondary" sx={{ mt: 2 }}>
          {copy.backToLogin}
        </Button>
        <Button component={RouterLink} to="/view" color="secondary" sx={{ mt: 1 }}>
          {copy.backToMap}
        </Button>
      </Paper>
    </Box>
  );
};

export default Register;
