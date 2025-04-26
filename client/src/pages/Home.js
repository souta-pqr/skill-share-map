import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Grid, Card, 
  CardContent, CardActions, CardMedia 
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Container maxWidth="lg">
      {/* ヒーローセクション */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
        >
          スキルシェアマップ
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          大学内の多様なスキルや知識を持つ仲間を見つけ、
          プロジェクトを共に実現する人材発掘プラットフォーム
        </Typography>
        <Box sx={{ mt: 4 }}>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/projects"
              size="large"
              sx={{ mr: 2 }}
            >
              プロジェクトを探す
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/register"
              size="large"
              sx={{ mr: 2 }}
            >
              今すぐ登録する
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/skill-map"
            size="large"
          >
            スキルマップを見る
          </Button>
        </Box>
      </Box>

      {/* 特徴セクション */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
        主な特徴
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{
                pt: '56.25%',
                backgroundColor: 'primary.light',
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h3">
                スキルを可視化
              </Typography>
              <Typography>
                自分のスキル・興味をプロフィールとして登録し、
                タグやレベル別に可視化するマップで他の学生のスキルを発見できます。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/skill-map">詳しく見る</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{
                pt: '56.25%',
                backgroundColor: 'secondary.light',
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h3">
                プロジェクト募集
              </Typography>
              <Typography>
                プロジェクトや勉強会の募集を行い、
                必要なスキルを持つ参加者とマッチングすることができます。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/projects">詳しく見る</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{
                pt: '56.25%',
                backgroundColor: 'info.light',
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h3">
                スキル交換
              </Typography>
              <Typography>
                お互いのスキルを教え合うことで、
                学び合いのコミュニティを形成します。
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} to="/skill-map">詳しく見る</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* 使い方セクション */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
        使い方
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              1. プロフィールを作成
            </Typography>
            <Typography variant="body1">
              アカウントを登録し、自分のスキル・専門分野・興味を登録しましょう。
              スキルごとに熟練度を設定できます。
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              2. スキルマップを探索
            </Typography>
            <Typography variant="body1">
              他の学生のスキルをマップで可視化・検索し、
              共通の興味を持つ仲間や必要なスキルを持つ協力者を見つけましょう。
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              3. プロジェクトを立ち上げる
            </Typography>
            <Typography variant="body1">
              自分のアイデアをプロジェクトとして登録し、
              必要なスキルを持つメンバーを募集しましょう。
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              4. プロジェクトに参加する
            </Typography>
            <Typography variant="body1">
              自分のスキルを活かせるプロジェクトを検索し、
              興味のあるプロジェクトに参加申請しましょう。
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* CTAセクション */}
      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          あなたのスキルを共有し、仲間と共に成長しましょう！
        </Typography>
        {!isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/register"
            size="large"
            sx={{ mt: 2 }}
          >
            今すぐ始める
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Home;