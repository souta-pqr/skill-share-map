const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// データベースディレクトリの確認と作成
const dbDir = path.join(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// データベース接続
const dbPath = path.join(dbDir, 'skillshare.sqlite');
const db = new sqlite3.Database(dbPath);

// データベース初期化関数
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // ユーザーテーブル
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      grade TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) return reject(err);
      
      // スキルテーブル
      db.run(`CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT,
        description TEXT
      )`, (err) => {
        if (err) return reject(err);
        
        // ユーザースキルテーブル（中間テーブル）
        db.run(`CREATE TABLE IF NOT EXISTS user_skills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          skill_id INTEGER NOT NULL,
          level INTEGER DEFAULT 1,
          description TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
          UNIQUE (user_id, skill_id)
        )`, (err) => {
          if (err) return reject(err);
          
          // プロジェクトテーブル
          db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            creator_id INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
          )`, (err) => {
            if (err) return reject(err);
            
            // プロジェクトスキルテーブル（必要なスキル）
            db.run(`CREATE TABLE IF NOT EXISTS project_skills (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              project_id INTEGER NOT NULL,
              skill_id INTEGER NOT NULL,
              level INTEGER DEFAULT 1,
              FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
              FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
              UNIQUE (project_id, skill_id)
            )`, (err) => {
              if (err) return reject(err);
              
              // サンプルデータの挿入
              insertSampleData()
                .then(() => resolve())
                .catch(err => reject(err));
            });
          });
        });
      });
    });
  });
}

// サンプルデータ挿入
async function insertSampleData() {
  return new Promise((resolve, reject) => {
    // 既存データの確認
    db.get("SELECT COUNT(*) as count FROM skills", (err, result) => {
      if (err) return reject(err);
      
      // データが既に存在する場合はスキップ
      if (result.count > 0) {
        return resolve();
      }
      
      // サンプルスキルの挿入
      const sampleSkills = [
        { name: 'JavaScript', category: 'プログラミング', description: 'Webフロントエンド開発言語' },
        { name: 'Python', category: 'プログラミング', description: 'データ分析や機械学習に人気の言語' },
        { name: 'デザイン思考', category: '思考法', description: '問題解決のための思考プロセス' },
        { name: 'グラフィックデザイン', category: 'デザイン', description: 'ビジュアルコミュニケーションの技術' },
        { name: 'プレゼンテーション', category: 'コミュニケーション', description: '効果的に情報や考えを伝える技術' }
      ];
      
      // トランザクション開始
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare('INSERT INTO skills (name, category, description) VALUES (?, ?, ?)');
        
        sampleSkills.forEach(skill => {
          stmt.run(skill.name, skill.category, skill.description);
        });
        
        stmt.finalize();
        
        db.run('COMMIT', (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  });
}

// データベースクエリの簡易関数
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  query,
  get,
  run
};