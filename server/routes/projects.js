const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
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

// すべてのプロジェクト一覧を取得
router.get('/', async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT p.*, u.name as creator_name
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    // 各プロジェクトに必要なスキルを追加
    for (const project of projects) {
      project.required_skills = await db.query(`
        SELECT s.id, s.name, s.category, ps.level
        FROM project_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.project_id = ?
      `, [project.id]);
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 特定のプロジェクトを取得
router.get('/:id', async (req, res) => {
  try {
    const project = await db.get(`
      SELECT p.*, u.name as creator_name, u.department as creator_department, u.email as creator_email
      FROM projects p
      JOIN users u ON p.creator_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    // 必要なスキル
    project.required_skills = await db.query(`
      SELECT s.id, s.name, s.category, ps.level
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = ?
    `, [req.params.id]);
    
    // スキルにマッチするユーザーを検索
    project.matching_users = [];
    
    for (const skill of project.required_skills) {
      const users = await db.query(`
        SELECT u.id, u.name, u.department, u.grade, us.level
        FROM user_skills us
        JOIN users u ON us.user_id = u.id
        WHERE us.skill_id = ? AND us.level >= ?
        ORDER BY us.level DESC
      `, [skill.id, skill.level]);
      
      project.matching_users.push({
        skill_id: skill.id,
        skill_name: skill.name,
        users: users
      });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 新しいプロジェクトを作成
router.post(
  '/',
  [
    auth,
    check('title', 'タイトルは必須です').not().isEmpty(),
    check('description', '説明は必須です').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, required_skills } = req.body;
    
    try {
      // トランザクション開始
      await db.run('BEGIN TRANSACTION');
      
      // プロジェクト作成
      const project = await db.run(
        'INSERT INTO projects (title, description, creator_id) VALUES (?, ?, ?)',
        [title, description, req.user.id]
      );
      
      // 必要なスキルの追加
      if (required_skills && required_skills.length > 0) {
        for (const skill of required_skills) {
          await db.run(
            'INSERT INTO project_skills (project_id, skill_id, level) VALUES (?, ?, ?)',
            [project.id, skill.skill_id, skill.level]
          );
        }
      }
      
      // トランザクション完了
      await db.run('COMMIT');
      
      res.status(201).json({
        id: project.id,
        title,
        description,
        creator_id: req.user.id
      });
    } catch (err) {
      // トランザクション失敗時のロールバック
      await db.run('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// プロジェクトを更新
router.put(
  '/:id',
  [
    auth,
    check('title', 'タイトルは必須です').not().isEmpty(),
    check('description', '説明は必須です').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, status, required_skills } = req.body;
    
    try {
      // プロジェクトの所有者確認
      const project = await db.get(
        'SELECT * FROM projects WHERE id = ?',
        [req.params.id]
      );
      
      if (!project) {
        return res.status(404).json({ message: 'プロジェクトが見つかりません' });
      }
      
      if (project.creator_id !== req.user.id) {
        return res.status(403).json({ message: 'このプロジェクトの編集権限がありません' });
      }
      
      // トランザクション開始
      await db.run('BEGIN TRANSACTION');
      
      // プロジェクト更新
      await db.run(
        'UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?',
        [title, description, status || project.status, req.params.id]
      );
      
      // 必要なスキルの更新（一旦すべて削除して再追加）
      if (required_skills) {
        await db.run('DELETE FROM project_skills WHERE project_id = ?', [req.params.id]);
        
        for (const skill of required_skills) {
          await db.run(
            'INSERT INTO project_skills (project_id, skill_id, level) VALUES (?, ?, ?)',
            [req.params.id, skill.skill_id, skill.level]
          );
        }
      }
      
      // トランザクション完了
      await db.run('COMMIT');
      
      res.json({ message: 'プロジェクトを更新しました' });
    } catch (err) {
      // トランザクション失敗時のロールバック
      await db.run('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// プロジェクトを削除
router.delete('/:id', auth, async (req, res) => {
  try {
    // プロジェクトの所有者確認
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ?',
      [req.params.id]
    );
    
    if (!project) {
      return res.status(404).json({ message: 'プロジェクトが見つかりません' });
    }
    
    if (project.creator_id !== req.user.id) {
      return res.status(403).json({ message: 'このプロジェクトの削除権限がありません' });
    }
    
    // トランザクション開始
    await db.run('BEGIN TRANSACTION');
    
    // 関連するproject_skillsを削除
    await db.run('DELETE FROM project_skills WHERE project_id = ?', [req.params.id]);
    
    // プロジェクト削除
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    
    // トランザクション完了
    await db.run('COMMIT');
    
    res.json({ message: 'プロジェクトを削除しました' });
  } catch (err) {
    // トランザクション失敗時のロールバック
    await db.run('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 自分が作成したプロジェクト一覧
router.get('/user/mine', auth, async (req, res) => {
  try {
    const projects = await db.query(
      'SELECT * FROM projects WHERE creator_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    // 各プロジェクトに必要なスキルを追加
    for (const project of projects) {
      project.required_skills = await db.query(`
        SELECT s.id, s.name, s.category, ps.level
        FROM project_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.project_id = ?
      `, [project.id]);
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 自分のスキルにマッチするプロジェクト検索
router.get('/matches/me', auth, async (req, res) => {
  try {
    // 自分のスキルを取得
    const mySkills = await db.query(`
      SELECT skill_id, level
      FROM user_skills
      WHERE user_id = ?
    `, [req.user.id]);
    
    if (mySkills.length === 0) {
      return res.json([]);
    }
    
    // スキルIDのリストを作成
    const skillIds = mySkills.map(skill => skill.skill_id);
    
    // マッチするプロジェクトを検索
    const matchingProjects = await db.query(`
      SELECT DISTINCT p.*, u.name as creator_name
      FROM projects p
      JOIN project_skills ps ON p.id = ps.project_id
      JOIN users u ON p.creator_id = u.id
      WHERE ps.skill_id IN (${skillIds.map(() => '?').join(',')}) AND p.creator_id != ?
      ORDER BY p.created_at DESC
    `, [...skillIds, req.user.id]);
    
    // 各プロジェクトに必要なスキルとマッチングスコアを追加
    for (const project of matchingProjects) {
      // プロジェクトが必要とするスキル
      project.required_skills = await db.query(`
        SELECT s.id, s.name, s.category, ps.level
        FROM project_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.project_id = ?
      `, [project.id]);
      
      // マッチングスコアの計算
      let matchScore = 0;
      let matchedSkills = 0;
      
      for (const required of project.required_skills) {
        const mySkill = mySkills.find(s => s.skill_id === required.id);
        
        if (mySkill) {
          matchedSkills++;
          if (mySkill.level >= required.level) {
            matchScore += 2;  // 必要レベル以上
          } else {
            matchScore += 1;  // 必要レベル未満だがスキルあり
          }
        }
      }
      
      // 総合マッチングスコア (0-100%)
      const totalPossibleScore = project.required_skills.length * 2;
      project.match_score = totalPossibleScore > 0 
        ? Math.round((matchScore / totalPossibleScore) * 100) 
        : 0;
      
      project.matched_skills_count = matchedSkills;
    }
    
    // マッチングスコアで降順ソート
    matchingProjects.sort((a, b) => b.match_score - a.match_score);
    
    res.json(matchingProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;