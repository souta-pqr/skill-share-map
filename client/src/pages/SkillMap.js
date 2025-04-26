import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, TextField, InputAdornment,
  Chip, Card, CardContent, CardActions, Button, FormControl,
  InputLabel, Select, MenuItem, Tab, Tabs
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const SkillMap = () => {
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0: ユーザー一覧, 1: スキル一覧
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // すべてのユーザーとそのスキルを取得
        const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/users/map`);
        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        
        // すべてのスキルを取得
        const skillsRes = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(skillsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // ユーザーフィルタリング
  useEffect(() => {
    // 検索条件に基づいてユーザーをフィルタリング
    let result = [...users];
    
    // 名前または学部で検索
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerSearchTerm) || 
        (user.department && user.department.toLowerCase().includes(lowerSearchTerm)) ||
        (user.bio && user.bio.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // 特定のスキルでフィルタリング
    if (selectedSkill) {
      result = result.filter(user => 
        user.skills.some(skill => skill.id === parseInt(selectedSkill))
      );
    }
    
    // 学部でフィルタリング
    if (selectedDepartment) {
      result = result.filter(user => 
        user.department === selectedDepartment
      );
    }
    
    setFilteredUsers(result);
  }, [searchTerm, selectedSkill, selectedDepartment, users]);
  
  // 検索語の変更ハンドラ
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // スキル選択の変更ハンドラ
  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
  };
  
  // 学部選択の変更ハンドラ
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // タブ変更ハンドラ
  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
  };
  
  // フィルターのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
    setSelectedDepartment('');
  };
  
  // ユニークな学部リストの取得
  const departments = Array.from(
    new Set(users.map(user => user.department).filter(Boolean))
  );
  
  // 特定のスキルを持つユーザーを検索
  const getUsersBySkill = (skillId) => {
    return users.filter(user => 
      user.skills.some(skill => skill.id === skillId)
    );
  };
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          スキルマップ
        </Typography>
        
        <Tabs
          value={viewMode}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 4 }}
        >
          <Tab label="ユーザー検索" />
          <Tab label="スキル検索" />
        </Tabs>
        
        {viewMode === 0 ? (
          // ユーザー検索ビュー
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="名前・学部・自己紹介で検索"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="skill-filter-label">スキルで絞り込み</InputLabel>
                  <Select
                    labelId="skill-filter-label"
                    id="skill-filter"
                    value={selectedSkill}
                    label="スキルで絞り込み"
                    onChange={handleSkillChange}
                  >
                    <MenuItem value="">すべて</MenuItem>
                    {skills.map(skill => (
                      <MenuItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="department-filter-label">学部で絞り込み</InputLabel>
                  <Select
                    labelId="department-filter-label"
                    id="department-filter"
                    value={selectedDepartment}
                    label="学部で絞り込み"
                    onChange={handleDepartmentChange}
                  >
                    <MenuItem value="">すべて</MenuItem>
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={resetFilters}
                  sx={{ height: '100%' }}
                >
                  リセット
                </Button>
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom>
              {filteredUsers.length} 人のユーザーが見つかりました
            </Typography>
            
            <Grid container spacing={3}>
              {filteredUsers.map(user => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card className="user-card">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">{user.name}</Typography>
                      </Box>
                      
                      {user.department && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SchoolIcon sx={{ mr: 1, fontSize: 'small' }} />
                          <Typography variant="body2">
                            {user.department} {user.grade ? `/ ${user.grade}` : ''}
                          </Typography>
                        </Box>
                      )}
                      
                      {user.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                        </Typography>
                      )}
                      
                      <Typography variant="subtitle2" gutterBottom>
                        スキル:
                      </Typography>
                      <Box>
                        {user.skills.map(skill => (
                          <Chip
                            key={skill.id}
                            label={skill.name}
                            size="small"
                            className={`skill-level-${skill.level}`}
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        詳細を見る
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          // スキル検索ビュー
          <>
            <TextField
              fullWidth
              label="スキル名で検索"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
            
            <Grid container spacing={3}>
              {skills
                .filter(skill => 
                  !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  skill.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(skill => {
                  const usersWithSkill = getUsersBySkill(skill.id);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={skill.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {skill.name}
                          </Typography>
                          <Chip
                            label={skill.category}
                            color="secondary"
                            size="small"
                            className={`skill-category-${skill.category}`}
                            sx={{ mb: 2 }}
                          />
                          
                          {skill.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {skill.description}
                            </Typography>
                          )}
                          
                          <Typography variant="body2">
                            <strong>{usersWithSkill.length}人</strong>が保有
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            component={Link}
                            to="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setViewMode(0);
                              setSelectedSkill(skill.id.toString());
                            }}
                          >
                            保有者を見る
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SkillMap;