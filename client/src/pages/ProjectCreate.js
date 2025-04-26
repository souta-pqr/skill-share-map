import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Paper, Grid, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
  Chip, Slider, FormHelperText, Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const ProjectCreate = () => {
  const { getToken } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(res.data);
        setLoading(false);
      } catch (err) {
        console.error('スキル取得エラー:', err);
        setLoading(false);
      }
    };
    
    fetchSkills();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // エラー状態のクリア
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const handleSkillSelectChange = (e) => {
    setSelectedSkill(e.target.value);
  };
  
  const handleSkillLevelChange = (e, newValue) => {
    setSkillLevel(newValue);
  };
  
  const handleAddSkill = () => {
    if (!selectedSkill) return;
    
    // 選択されたスキルの情報
    const skillInfo = skills.find(s => s.id === parseInt(selectedSkill));
    
    // 既に追加済みかチェック
    const exists = formData.required_skills.some(s => s.skill_id === parseInt(selectedSkill));
    
    if (exists) {
      // 既存のスキルを更新
      const updatedSkills = formData.required_skills.map(s =>
        s.skill_id === parseInt(selectedSkill)
          ? { ...s, level: skillLevel }
          : s
      );
      
      setFormData({
        ...formData,
        required_skills: updatedSkills
      });
    } else {
      // 新しいスキルを追加
      setFormData({
        ...formData,
        required_skills: [
          ...formData.required_skills,
          {
            skill_id: parseInt(selectedSkill),
            level: skillLevel,
            name: skillInfo.name,
            category: skillInfo.category
          }
        ]
      });
    }
    
    // 選択をリセット
    setSelectedSkill('');
    setSkillLevel(1);
  };
  
  const handleRemoveSkill = (skillId) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(s => s.skill_id !== skillId)
    });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'タイトルは必須です';
    }
    
    if (!formData.description.trim()) {
      errors.description = '説明は必須です';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/projects`,
        formData,
        { headers: { 'x-auth-token': getToken() } }
      );
      
      setAlertSeverity('success');
      setAlertMessage('プロジェクトが作成されました！');
      
      // 作成されたプロジェクトページに移動
      setTimeout(() => {
        navigate(`/projects/${res.data.id}`);
      }, 1500);
    } catch (err) {
      setAlertSeverity('error');
      setAlertMessage(err.response?.data?.message || 'プロジェクト作成中にエラーが発生しました');
    }
  };
  
  // 利用可能なスキルのリスト（既に追加済みのものを除外）
  const availableSkills = skills.filter(
    skill => !formData.required_skills.some(s => s.skill_id === skill.id)
  );
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          新規プロジェクト作成
        </Typography>
        
        {alertMessage && (
          <Alert severity={alertSeverity} sx={{ mb: 3 }}>
            {alertMessage}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="プロジェクトタイトル"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="プロジェクト説明"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={5}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                必要なスキル
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel id="add-skill-label">スキルを追加</InputLabel>
                    <Select
                      labelId="add-skill-label"
                      id="add-skill-select"
                      value={selectedSkill}
                      label="スキルを追加"
                      onChange={handleSkillSelectChange}
                    >
                      <MenuItem value="">選択してください</MenuItem>
                      {availableSkills.map(skill => (
                        <MenuItem key={skill.id} value={skill.id}>
                          {skill.name} ({skill.category})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={5}>
                  <Box sx={{ px: 2 }}>
                    <Typography id="skill-level-slider" gutterBottom>
                      必要なレベル: {skillLevel}
                    </Typography>
                    <Slider
                      value={skillLevel}
                      onChange={handleSkillLevelChange}
                      aria-labelledby="skill-level-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={1}
                      max={5}
                      disabled={!selectedSkill}
                    />
                    <FormHelperText>
                      1: 初心者, 5: エキスパート
                    </FormHelperText>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddSkill}
                    fullWidth
                    disabled={!selectedSkill}
                  >
                    追加
                  </Button>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                {formData.required_skills.length === 0 ? (
                  <Typography color="text.secondary">
                    スキルが追加されていません
                  </Typography>
                ) : (
                  <Grid container spacing={1}>
                    {formData.required_skills.map(skill => (
                      <Grid item key={skill.skill_id}>
                        <Chip
                          label={`${skill.name} (Lv.${skill.level})`}
                          onDelete={() => handleRemoveSkill(skill.skill_id)}
                          className={`skill-level-${skill.level}`}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  プロジェクトを作成
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectCreate;