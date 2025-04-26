import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, TextField, Paper,
  Grid, Chip, Card, CardContent, CardActions, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Slider
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, loadUser, getToken } = useContext(AuthContext);
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    grade: '',
    bio: ''
  });
  
  // スキル追加ダイアログの状態
  const [openSkillDialog, setOpenSkillDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [skillDescription, setSkillDescription] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ユーザースキルの取得
        const skillsRes = await axios.get(`${process.env.REACT_APP_API_URL}/users/me/skills`, {
          headers: { 'x-auth-token': getToken() }
        });
        setUserSkills(skillsRes.data);
        
        // すべてのスキルの取得
        const allSkillsRes = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setAllSkills(allSkillsRes.data);
        
        // ユーザー情報があれば、フォームデータを初期化
        if (user) {
          setFormData({
            name: user.name || '',
            department: user.department || '',
            grade: user.grade || '',
            bio: user.bio || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, getToken]);
  
  // プロフィール編集モードの切り替え
  const toggleEditMode = () => {
    if (editMode) {
      // 編集モードから通常モードに戻す場合、ユーザー情報で初期化
      setFormData({
        name: user.name || '',
        department: user.department || '',
        grade: user.grade || '',
        bio: user.bio || ''
      });
    }
    setEditMode(!editMode);
  };
  
  // フォーム入力の変更ハンドラ
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // プロフィール更新のハンドラ
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/users/me`, formData, {
        headers: { 'x-auth-token': getToken() }
      });
      
      // ユーザー情報を再取得
      await loadUser();
      setEditMode(false);
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
    }
  };
  
  // スキル選択の変更ハンドラ
  const handleSkillSelectChange = (e) => {
    setSelectedSkill(e.target.value);
  };
  
  // スキルレベルの変更ハンドラ
  const handleSkillLevelChange = (e, newValue) => {
    setSkillLevel(newValue);
  };
  
  // スキル説明の変更ハンドラ
  const handleSkillDescriptionChange = (e) => {
    setSkillDescription(e.target.value);
  };
  
  // スキル追加ダイアログを開く
  const handleOpenSkillDialog = () => {
    setOpenSkillDialog(true);
  };
  
  // スキル追加ダイアログを閉じる
  const handleCloseSkillDialog = () => {
    setOpenSkillDialog(false);
    // ダイアログの状態をリセット
    setSelectedSkill('');
    setSkillLevel(1);
    setSkillDescription('');
  };
  
  // スキル追加の実行
  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/users/me/skills`,
        {
          skill_id: selectedSkill,
          level: skillLevel,
          description: skillDescription
        },
        {
          headers: { 'x-auth-token': getToken() }
        }
      );
      
      // スキル一覧を再取得
      const skillsRes = await axios.get(`${process.env.REACT_APP_API_URL}/users/me/skills`, {
        headers: { 'x-auth-token': getToken() }
      });
      setUserSkills(skillsRes.data);
      
      // ダイアログを閉じて状態をリセット
      handleCloseSkillDialog();
    } catch (err) {
      console.error('スキル追加エラー:', err);
    }
  };
  
  // スキル削除のハンドラ
  const handleDeleteSkill = async (skillId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/me/skills/${skillId}`, {
        headers: { 'x-auth-token': getToken() }
      });
      
      // スキル一覧を更新（削除したスキルを除外）
      setUserSkills(userSkills.filter(skill => skill.id !== skillId));
    } catch (err) {
      console.error('スキル削除エラー:', err);
    }
  };
  
  // 表示用のスキルリストから既に追加済みのスキルを除外
  const availableSkills = allSkills.filter(
    skill => !userSkills.some(userSkill => userSkill.id === skill.id)
  );
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            マイプロフィール
          </Typography>
          <Button
            variant={editMode ? 'outlined' : 'contained'}
            color={editMode ? 'secondary' : 'primary'}
            onClick={toggleEditMode}
          >
            {editMode ? 'キャンセル' : 'プロフィール編集'}
          </Button>
        </Box>
        
        {editMode ? (
          // 編集フォーム
          <Box component="form" onSubmit={handleUpdateProfile}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="名前"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="学部・学科"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="学年"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="自己紹介"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                保存
              </Button>
            </Box>
          </Box>
        ) : (
          // プロフィール表示
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>名前:</strong> {user?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>メールアドレス:</strong> {user?.email}
                </Typography>
              </Grid>
              {user?.department && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>学部・学科:</strong> {user.department}
                  </Typography>
                </Grid>
              )}
              {user?.grade && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>学年:</strong> {user.grade}
                  </Typography>
                </Grid>
              )}
              {user?.bio && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>自己紹介:</strong>
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {user.bio}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* スキルセクション */}
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h2">
            マイスキル
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenSkillDialog}
          >
            スキル追加
          </Button>
        </Box>
        
        {userSkills.length === 0 ? (
          <Typography>登録されているスキルはありません。スキルを追加しましょう。</Typography>
        ) : (
          <Grid container spacing={2}>
            {userSkills.map((skill) => (
              <Grid item xs={12} sm={6} md={4} key={skill.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {skill.name}
                    </Typography>
                    <Chip
                      label={`レベル ${skill.level}`}
                      color="primary"
                      size="small"
                      className={`skill-level-${skill.level}`}
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      label={skill.category}
                      color="secondary"
                      size="small"
                      className={`skill-category-${skill.category}`}
                      sx={{ ml: 1, mb: 1 }}
                    />
                    {skill.user_description && (
                      <Typography variant="body2">
                        {skill.user_description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteSkill(skill.id)}
                    >
                      削除
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* スキル追加ダイアログ */}
      <Dialog open={openSkillDialog} onClose={handleCloseSkillDialog}>
        <DialogTitle>スキルを追加</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="skill-select-label">スキル</InputLabel>
            <Select
              labelId="skill-select-label"
              id="skill-select"
              value={selectedSkill}
              label="スキル"
              onChange={handleSkillSelectChange}
            >
              {availableSkills.map((skill) => (
                <MenuItem key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>スキルレベル: {skillLevel}</Typography>
            <Slider
              value={skillLevel}
              onChange={handleSkillLevelChange}
              step={1}
              marks
              min={1}
              max={5}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              1: 初心者, 2: 基礎理解, 3: 実践経験あり, 4: 熟練, 5: エキスパート
            </Typography>
          </Box>
          
          <TextField
            margin="dense"
            id="skill-description"
            label="スキル説明（任意）"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={skillDescription}
            onChange={handleSkillDescriptionChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSkillDialog}>キャンセル</Button>
          <Button 
            onClick={handleAddSkill} 
            variant="contained" 
            color="primary"
            disabled={!selectedSkill}
          >
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;