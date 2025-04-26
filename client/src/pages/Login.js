import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, TextField,
  Paper, Avatar, Alert 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // 既にログインしている場合はリダイレクト
    if (isAuthenticated) {
      navigate('/profile');
    }
    
    // エラーメッセージの設定
    if (error) {
      setAlertMessage(error);
      clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // 入力時にエラーをクリア
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const success = await login(formData);
      
      if (success) {
        navigate('/profile');
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            ログイン
          </Typography>
          
          {alertMessage && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {alertMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              ログイン
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  アカウントをお持ちでない方はこちら
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;