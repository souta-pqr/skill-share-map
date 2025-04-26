import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, TextField,
  Paper, Avatar, Alert, Grid 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    grade: '',
    bio: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  
  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
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
    
    if (!formData.name) {
      errors.name = '名前を入力してください';
    }
    
    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 確認用パスワードを除外
      const { confirmPassword, ...registerData } = formData;
      
      const success = await register(registerData);
      
      if (success) {
        navigate('/profile');
      }
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            アカウント登録
          </Typography>
          
          {alertMessage && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {alertMessage}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="名前"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="メールアドレス"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="パスワード"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="パスワード（確認）"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="department"
                  label="学部・学科"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="grade"
                  label="学年"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  label="自己紹介"
                  name="bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              登録
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  既にアカウントをお持ちの方はこちら
                </Typography>
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;