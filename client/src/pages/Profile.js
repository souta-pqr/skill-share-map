import React, { useState, useContext, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, Grid 
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          マイプロフィール
        </Typography>
        
        {user ? (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>名前:</strong> {user.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>メールアドレス:</strong> {user.email}
                </Typography>
              </Grid>
              {user.department && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>学部・学科:</strong> {user.department}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Typography>ログインしてください</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
