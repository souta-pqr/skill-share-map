skill-share-map/
├── README.md                 # プロジェクト概要
├── .gitignore                # Gitで無視するファイル
├── package.json              # プロジェクト設定
├── client/                   # フロントエンド
│   ├── public/               # 静的ファイル
│   ├── src/                  # ソースコード
│   │   ├── App.js            # メインアプリコンポーネント
│   │   ├── index.js          # エントリーポイント
│   │   ├── components/       # 共通コンポーネント
│   │   │   ├── Navbar.js     # ナビゲーションバー
│   │   │   ├── Footer.js     # フッター
│   │   │   └── ...
│   │   ├── pages/            # ページコンポーネント
│   │   │   ├── Home.js       # ホームページ
│   │   │   ├── Profile.js    # プロフィールページ
│   │   │   ├── SkillMap.js   # スキルマップページ
│   │   │   └── ...
│   │   ├── services/         # APIサービス
│   │   └── styles/           # スタイルシート
└── server/                   # バックエンド
    ├── index.js              # サーバーエントリーポイント
    ├── db/                   # データベース関連
    │   ├── database.js       # DB接続
    │   └── migrations/       # DBマイグレーション
    ├── routes/               # APIルート
    │   ├── users.js          # ユーザー関連API
    │   ├── skills.js         # スキル関連API
    │   └── projects.js       # プロジェクト関連API
    └── models/               # データモデル