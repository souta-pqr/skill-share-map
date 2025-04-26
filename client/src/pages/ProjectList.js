import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Grid, TextField, InputAdornment,
  Chip, Card, CardContent, CardActions, Button, FormControl,
  InputLabel, Select, MenuItem, Tab, Tabs, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AuthContext } from '../context/AuthContext';

const ProjectList = () => {
  const { isAuthenticated, user, getToken } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [matchingProjects, setMatchingProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [viewMode, setViewMode] = useState(0); // 0: すべて, 1: マッチング, 2: 自分のプロジェクト
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // すべてのプロジェクトを取得
        const projectsRes = await axios.get(`${process.env.REACT_APP_API_URL}/projects`);
        setProjects(projectsRes.data);
        setFilteredProjects(projectsRes.data);
        
        // すべてのスキルを取得
        const skillsRes = await axios.get(`${process.env.REACT_APP_API_URL}/skills`);
        setSkills(skillsRes.data);
        
        // 認証済みの場合は追加データを取得
        if (isAuthenticated) {
          // 自分のスキルにマッチするプロジェクト
          const matchingRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/projects/matches/me`,
            { headers: { 'x-auth-token': getToken() } }
          );
          setMatchingProjects(matchingRes.data);
          
          // 自分のプロジェクト
          const myProjectsRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/projects/user/mine`,
            { headers: { 'x-auth-token': getToken() } }
          );
          setMyProjects(myProjectsRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, getToken]);
  
  // 検索とフィルタリングの適用
  useEffect(() => {
    let result = [];
    
    // タブに応じたプロジェクトを選択
    switch (viewMode) {
      case 1: // マッチング
        result = [...matchingProjects];
        break;
      case 2: // 自分のプロジェクト
        result = [...myProjects];
        break;
      default: // すべて
        result = [...projects];
    }
    
    // 検索語でフィルタリング
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(lowerSearchTerm) || 
        project.description.toLowerCase().includes(lowerSearchTerm) ||
        project.creator_name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // スキルでフィルタリング
    if (selectedSkill) {
      result = result.filter(project => 
        project.required_skills.some(skill => skill.id === parseInt(selectedSkill))
      );
    }
    
    setFilteredProjects(result);
  }, [searchTerm, selectedSkill, viewMode, projects, matchingProjects, myProjects]);
  
  // 検索語の変更ハンドラ
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // スキル選択の変更ハンドラ
  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
  };
  
  // タブ変更ハンドラ
  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
  };
  
  // フィルターのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSkill('');
  };
  
  // プロジェクトカードのマッチングクラスを取得
  const getMatchClass = (matchScore) => {
    if (matchScore >= 75) return 'match-high';
    if (matchScore >= 40) return 'match-medium';
    return 'match-low';
  };
  
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            プロジェクト
          </Typography>
          {isAuthenticated && (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/projects/create"
            >
              新規プロジェクト作成
            </Button>
          )}
        </Box>
        
        {isAuthenticated ? (
          <Tabs
            value={viewMode}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 4 }}
          >
            <Tab label="すべてのプロジェクト" />
            <Tab label="あなたにマッチするプロジェクト" />
            <Tab label="自分のプロジェクト" />
          </Tabs>
        ) : (
          <Divider sx={{ mb: 4 }} />
        )}
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="タイトル・説明で検索"
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="skill-filter-label">必要なスキルで絞り込み</InputLabel>
              <Select
                labelId="skill-filter-label"
                id="skill-filter"
                value={selectedSkill}
                label="必要なスキルで絞り込み"
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
          {filteredProjects.length} 件のプロジェクトが見つかりました
        </Typography>
        
        {filteredProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {viewMode === 2 
                ? 'まだプロジェクトを作成していません。' 
                : '条件に一致するプロジェクトがありません。'}
            </Typography>
            {viewMode === 2 && (
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/projects/create"
                sx={{ mt: 2 }}
              >
                プロジェクトを作成する
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map(project => (
              <Grid item xs={12} key={project.id}>
                <Card 
                  className={`project-card ${viewMode === 1 ? getMatchClass(project.match_score) : ''}`}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          作成者: {project.creator_name} | 
                          作成日: {new Date(project.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {project.description.length > 200 
                            ? `${project.description.substring(0, 200)}...` 
                            : project.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          必要なスキル:
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          {project.required_skills && project.required_skills.map(skill => (
                            <Chip
                              key={skill.id}
                              label={`${skill.name} (Lv.${skill.level})`}
                              size="small"
                              className={`skill-level-${skill.level}`}
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                        
                        {viewMode === 1 && project.match_score !== undefined && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              マッチング率: <strong>{project.match_score}%</strong>
                            </Typography>
                            <Typography variant="body2">
                              あなたが持つスキル: {project.matched_skills_count}/{project.required_skills.length}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      to={`/projects/${project.id}`}
                    >
                      詳細を見る
                    </Button>
                    {viewMode === 2 && (
                      <Button
                        size="small"
                        color="secondary"
                        component={Link}
                        to={`/projects/${project.id}`}
                      >
                        編集
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectList;