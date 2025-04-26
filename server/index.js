const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// データベース接続
const db = require('./db/database');

// ルート
const usersRoutes = require('./routes/users');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// APIルート
app.use('/api/users', usersRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);

// 本番環境用の静的ファイル配信
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// ポート設定
const PORT = process.env.PORT || 5000;

// データベース初期化とサーバー起動
db.initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`サーバーが起動しました: ポート ${PORT}`));
  })
  .catch(err => {
    console.error('データベース初期化エラー:', err);
  });