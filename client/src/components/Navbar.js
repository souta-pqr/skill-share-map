import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          スキルシェアマップ
        </Typography>
        
        {/* デスクトップメニュー */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Button color="inherit" component={Link} to="/skill-map">
            スキルマップ
          </Button>
          <Button color="inherit" component={Link} to="/projects">
            プロジェクト
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/profile">
                マイプロフィール
              </Button>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>プロフィール</MenuItem>
                <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                ログイン
              </Button>
              <Button color="inherit" component={Link} to="/register">
                登録
              </Button>
            </>
          )}
        </Box>
        
        {/* モバイルメニュー */}
        <Menu
          id="menu-mobile"
          anchorEl={mobileAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(mobileAnchorEl)}
          onClose={handleMobileClose}
        >
          <MenuItem onClick={() => { handleMobileClose(); navigate('/skill-map'); }}>スキルマップ</MenuItem>
          <MenuItem onClick={() => { handleMobileClose(); navigate('/projects'); }}>プロジェクト</MenuItem>
          
          {isAuthenticated ? (
            <>
              <MenuItem onClick={() => { handleMobileClose(); navigate('/profile'); }}>マイプロフィール</MenuItem>
              <MenuItem onClick={() => { handleMobileClose(); handleLogout(); }}>ログアウト</MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => { handleMobileClose(); navigate('/login'); }}>ログイン</MenuItem>
              <MenuItem onClick={() => { handleMobileClose(); navigate('/register'); }}>登録</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;