import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Paper, Grid, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Card, CardContent, Divider, Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, getToken } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects/${id}`);
        setProject(res.data);
        setLoading(false);
      } catch (err) {
        console.error('プロジェクト取得エラー:', err);
        setError(err.response?.data?.message || 'プロジェクトの取得中にエラーが発生しました');
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/projects/${id}`, {
        headers: { 'x-auth-token': getToken() }
      });
      
      setAlertSeverity('success');
      setAlertMessage('プロジェクトが削除されました');
      setDeleteDialogOpen(false);
      
      // 一覧ページにリダイレクト
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      setAlertSeverity('error');
      setAlertMessage(err.response?.data?.message || 'プロジェクトの削除中にエラーが発生しました');
      setDeleteDialogOpen(false);
    }
  };
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            component={Link}
            to="/projects"
          >
            プロジェクト一覧に戻る
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // 自分のプロジェクトかどうか
  const isOwnProject = isAuthenticated && user && project.creator_id === user.id;
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mb: 3 }}>
            {alertMessage}
          </Alert>
        )}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {project.title}
          </Typography>
          
          {isOwnProject && (
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                // 編集機能は最小限実装では省略
              >
                編集
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                削除
              </Button>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                プロジェクト説明
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {project.description}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                作成日: {new Date(project.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ステータス: {project.status === 'active' ? '進行中' : '完了'}
              </Typography>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                必要なスキル
              </Typography>
              {project.required_skills.length === 0 ? (
                <Typography color="text.secondary">
                  必要なスキルは指定されていません
                </Typography>
              ) : (
                <Grid container spacing={1}>
                  {project.required_skills.map(skill => (
                    <Grid item key={skill.id}>
                      <Chip
                        label={`${skill.name} (Lv.${skill.level})`}
                        className={`skill-level-${skill.level}`}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                プロジェクト作成者
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {project.creator_name}
                </Typography>
              </Box>
              {project.creator_department && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    {project.creator_department}
                  </Typography>
                </Box>
              )}
              {project.creator_email && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  連絡先: {project.creator_email}
                </Typography>
              )}
            </Paper>
            
            {project.matching_users && project.matching_users.length > 0 && (
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  スキルにマッチするユーザー
                </Typography>
                
                {project.matching_users.map(item => (
                  <Box key={item.skill_id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {item.skill_name}:
                    </Typography>
                    
                    {item.users.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        このスキルを持つユーザーはいません
                      </Typography>
                    ) : (
                      item.users.slice(0, 3).map(user => (
                        <Card key={user.id} sx={{ mb: 1, p: 1 }}>
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="body2">
                              {user.name} - レベル {user.level}
                            </Typography>
                            {user.department && (
                              <Typography variant="caption" color="text.secondary">
                                {user.department} {user.grade ? `/ ${user.grade}` : ''}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                    
                    {item.users.length > 3 && (
                      <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: 'pointer' }}>
                        他 {item.users.length - 3} 人のユーザーを表示
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            component={Link}
            to="/projects"
          >
            プロジェクト一覧に戻る
          </Button>
        </Box>
      </Paper>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
      >
        <DialogTitle>プロジェクトの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当にこのプロジェクトを削除しますか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail;