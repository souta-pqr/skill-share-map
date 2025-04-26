const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const db = require('../db/database');

const router = express.Router();

// ユーザー認証ミドルウェア
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: '認証トークンがありません' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    req.user = { id: decoded.user };
    next();
  } catch (err) {
    res.status(401).json({ message: 'トークンが無効です' });
  }
};

// ユーザー登録
router.post(
  '/register',
  [
    check('name', '名前は必須です').not().isEmpty(),
    check('email', '有効なメールアドレスを入力してください').isEmail(),
    check('password', 'パスワードは6文字以上で入力してください').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, email, password, department, grade, bio } = req.body;
    
    try {
      // メールアドレスの重複チェック
      const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (existingUser) {
        return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
      }
      
      // パスワードのハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // ユーザー登録
      const result = await db.run(
        'INSERT INTO users (name, email, password, department, grade, bio) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, department, grade, bio]
      );
      
      // JWTトークン生成
      const payload = {
        user: result.id
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '24h' });
      
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// ユーザーログイン
router.post(
  '/login',
  [
    check('email', 'メールアドレスを入力してください').isEmail(),
    check('password', 'パスワードを入力してください').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    try {
      // ユーザー検索
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      }
      
      // パスワード検証
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      }
      
      // JWTトークン生成
      const payload = {
        user: user.id
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '24h' });
      
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// 現在のユーザー情報取得
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, department, grade, bio, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザーのスキル一覧取得
router.get('/me/skills', auth, async (req, res) => {
  try {
    const skills = await db.query(`
      SELECT s.id, s.name, s.category, s.description, us.level, us.description as user_description
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = ?
    `, [req.user.id]);
    
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザープロフィール更新
router.put('/me', auth, async (req, res) => {
  const { name, department, grade, bio } = req.body;
  
  try {
    await db.run(
      'UPDATE users SET name = ?, department = ?, grade = ?, bio = ? WHERE id = ?',
      [name, department, grade, bio, req.user.id]
    );
    
    res.json({ message: 'プロフィールを更新しました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザーにスキルを追加
router.post('/me/skills', auth, async (req, res) => {
  const { skill_id, level, description } = req.body;
  
  try {
    // スキルの存在確認
    const skill = await db.get('SELECT * FROM skills WHERE id = ?', [skill_id]);
    
    if (!skill) {
      return res.status(404).json({ message: 'スキルが見つかりません' });
    }
    
    // 既存のスキルチェック
    const existingSkill = await db.get(
      'SELECT * FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [req.user.id, skill_id]
    );
    
    if (existingSkill) {
      // 既存のスキルを更新
      await db.run(
        'UPDATE user_skills SET level = ?, description = ? WHERE user_id = ? AND skill_id = ?',
        [level, description, req.user.id, skill_id]
      );
    } else {
      // 新しいスキルを追加
      await db.run(
        'INSERT INTO user_skills (user_id, skill_id, level, description) VALUES (?, ?, ?, ?)',
        [req.user.id, skill_id, level, description]
      );
    }
    
    res.json({ message: 'スキルを追加しました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ユーザーのスキルを削除
router.delete('/me/skills/:skill_id', auth, async (req, res) => {
  try {
    await db.run(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [req.user.id, req.params.skill_id]
    );
    
    res.json({ message: 'スキルを削除しました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// すべてのユーザー取得（スキルマップ用）
router.get('/map', async (req, res) => {
  try {
    const users = await db.query(`
      SELECT u.id, u.name, u.department, u.grade, u.bio
      FROM users u
    `);
    
    // 各ユーザーのスキルを取得
    for (const user of users) {
      user.skills = await db.query(`
        SELECT s.id, s.name, s.category, us.level
        FROM user_skills us
        JOIN skills s ON us.skill_id = s.id
        WHERE us.user_id = ?
      `, [user.id]);
    }
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;