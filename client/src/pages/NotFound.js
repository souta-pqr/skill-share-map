import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          ページが見つかりません
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          お探しのページは存在しないか、移動した可能性があります。
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          size="large"
        >
          トップページに戻る
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;