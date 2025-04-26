import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Typography variant="body2" align="center">
        © {new Date().getFullYear()} スキルシェアマップ - 大学内人材発掘プラットフォーム
      </Typography>
      <Typography variant="body2" align="center">
        <Link to="/" style={{ color: 'white', marginRight: 10 }}>ホーム</Link>
        <Link to="/skill-map" style={{ color: 'white', marginRight: 10 }}>スキルマップ</Link>
        <Link to="/projects" style={{ color: 'white' }}>プロジェクト</Link>
      </Typography>
    </Box>
  );
};

export default Footer;