import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SkillMap = () => {
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // スキル一覧の取得（カテゴリ別にグループ化）
        const skillsRes = await api.get('/skills');
        // ユーザー一覧の取得
        const usersRes = await api.get('/users');
        
        setSkills(skillsRes.data.data);
        setUsers(usersRes.data.data);
        setLoading(false);
      } catch (err) {
        setError('データの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // スキルでフィルタリングする
  const filterUsersBySkill = (skill, level) => {
    if (!skill) return users;
    
    return users.filter(user => 
      user.skills.some(
        userSkill => userSkill.name === skill && userSkill.level >= level
      )
    );
  };

  // カテゴリでグループ化されたスキルリストを生成
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'その他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  // フィルタリングされたユーザーリスト
  const filteredUsers = filterUsersBySkill(selectedSkill, selectedLevel);

  if (loading) return <div className="text-center py-8">読み込み中...</div>;

  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">スキルマップ</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">スキル検索</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
              スキル
            </label>
            <select
              id="skill"
              name="skill"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">すべてのスキル</option>
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <optgroup key={category} label={category}>
                  {categorySkills.map(skill => (
                    <option key={skill.name} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              最小レベル
            </label>
            <select
              id="level"
              name="level"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
              disabled={!selectedSkill}
            >
              <option value="0">指定なし</option>
              <option value="1">レベル1以上</option>
              <option value="2">レベル2以上</option>
              <option value="3">レベル3以上</option>
              <option value="4">レベル4以上</option>
              <option value="5">レベル5</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            学生一覧
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredUsers.length}人の学生が見つかりました
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <li key={user._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.department} {user.year}年</p>
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {/* プロフィール表示 */}}
                      >
                        プロフィールを見る
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedSkill === skill.name
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {skill.name} (Lv.{skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-gray-500">
                条件に合う学生が見つかりませんでした
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillMap;