// src/mockData.js
export const mockSkills = [
    { name: 'React', level: 4, category: 'programming' },
    { name: 'JavaScript', level: 3, category: 'programming' },
    { name: 'Python', level: 5, category: 'programming' },
    { name: 'Photoshop', level: 4, category: 'design' },
    { name: 'Illustrator', level: 3, category: 'design' },
    { name: '英語', level: 4, category: 'language' },
    { name: 'フランス語', level: 2, category: 'language' },
    { name: 'マーケティング', level: 3, category: 'business' },
    { name: '会計', level: 2, category: 'business' },
    { name: '物理学', level: 5, category: 'academic' },
    { name: '統計学', level: 4, category: 'academic' }
  ];
  
  export const mockUsers = [
    {
      _id: '1',
      name: '山田太郎',
      department: '情報工学部',
      year: 3,
      skills: [
        { name: 'React', level: 4 },
        { name: 'JavaScript', level: 3 },
        { name: '英語', level: 3 }
      ]
    },
    {
      _id: '2',
      name: '佐藤花子',
      department: 'デザイン学部',
      year: 2,
      skills: [
        { name: 'Photoshop', level: 4 },
        { name: 'Illustrator', level: 3 },
        { name: 'フランス語', level: 2 }
      ]
    },
    {
      _id: '3',
      name: '鈴木一郎',
      department: '経営学部',
      year: 4,
      skills: [
        { name: 'マーケティング', level: 3 },
        { name: '会計', level: 2 },
        { name: '英語', level: 4 }
      ]
    },
    {
      _id: '4',
      name: '高橋直子',
      department: '理学部',
      year: 3,
      skills: [
        { name: 'Python', level: 5 },
        { name: '物理学', level: 5 },
        { name: '統計学', level: 4 }
      ]
    }
  ];