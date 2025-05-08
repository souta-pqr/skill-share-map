import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import StudentCard from './StudentCard';
import StudentDetail from './StudentDetail';
import SkillVisualization from './SkillVisualization';

const SkillMap = () => {
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  // Handle view profile click
  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedUser(null);
  };
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">学生検索</h2>
            
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
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-full">
                      <input
                        type="range"
                        id="level"
                        name="level"
                        min="0"
                        max="5"
                        step="1"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                        disabled={!selectedSkill}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-700 w-8 text-center">
                      {selectedLevel > 0 ? selectedLevel : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-xs text-gray-500">指定なし</span>
                    <span className="text-xs text-gray-500">レベル5</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {filteredUsers.length}人の学生が見つかりました
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <StudentCard
                    key={user._id}
                    user={user}
                    selectedSkill={selectedSkill}
                    onViewProfile={handleViewProfile}
                  />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  条件に合う学生が見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-8">
          <SkillVisualization skills={skills} users={users} />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">カテゴリ別スキル</h2>
            
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map(skill => (
                      <button
                        key={skill.name}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedSkill === skill.name
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedSkill(skill.name)}
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {selectedUser && (
        <StudentDetail user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default SkillMap;