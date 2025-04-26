const express = require('express');
const { check, validationResult } = require('express-validator');
const db = require('../db/database');

const router = express.Router();

// ユーザー認証ミドルウェア (users.jsと同じものを使用)
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

// すべてのスキルを取得
router.get('/', async (req, res) => {
  try {
    const skills = await db.query('SELECT * FROM skills ORDER BY category, name');
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// カテゴリー別スキル一覧
router.get('/categories', async (req, res) => {
  try {
    // ユニークなカテゴリーを取得
    const categories = await db.query('SELECT DISTINCT category FROM skills ORDER BY category');
    
    // カテゴリーごとにスキルをグループ化
    const result = [];
    
    for (const cat of categories) {
      const skills = await db.query('SELECT * FROM skills WHERE category = ? ORDER BY name', [cat.category]);
      result.push({
        category: cat.category,
        skills: skills
      });
    }
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 特定のスキルを取得
router.get('/:id', async (req, res) => {
  try {
    const skill = await db.get('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    
    if (!skill) {
      return res.status(404).json({ message: 'スキルが見つかりません' });
    }
    
    // このスキルを持つユーザー一覧
    skill.users = await db.query(`
      SELECT u.id, u.name, u.department, u.grade, us.level
      FROM user_skills us
      JOIN users u ON us.user_id = u.id
      WHERE us.skill_id = ?
      ORDER BY us.level DESC
    `, [req.params.id]);
    
    res.json(skill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 新しいスキルを追加（管理者のみ可能な機能を想定）
router.post(
  '/',
  [
    auth,
    check('name', 'スキル名は必須です').not().isEmpty(),
    check('category', 'カテゴリーは必須です').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, category, description } = req.body;
    
    try {
      // 重複チェック
      const existingSkill = await db.get('SELECT * FROM skills WHERE name = ?', [name]);
      
      if (existingSkill) {
        return res.status(400).json({ message: 'このスキルは既に存在します' });
      }
      
      // スキル追加
      const result = await db.run(
        'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
        [name, category, description]
      );
      
      res.status(201).json({
        id: result.id,
        name,
        category,
        description
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// スキル検索
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = `%${req.params.term}%`;
    
    const skills = await db.query(
      'SELECT * FROM skills WHERE name LIKE ? OR category LIKE ? OR description LIKE ? ORDER BY name',
      [searchTerm, searchTerm, searchTerm]
    );
    
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;