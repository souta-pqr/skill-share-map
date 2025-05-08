import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSkills: 0,
    topSkills: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // スキルとユーザーのデータを取得
        const skillsRes = await api.get('/skills');
        const usersRes = await api.get('/users');
        
        const skills = skillsRes.data.data;
        const users = usersRes.data.data;
        
        // スキルごとの使用数をカウント
        const skillUsage = skills.map(skill => {
          const usersWithSkill = users.filter(user => 
            user.skills.some(userSkill => userSkill.name === skill.name)
          ).length;
          
          return {
            ...skill,
            usersCount: usersWithSkill,
            percentage: Math.round((usersWithSkill / users.length) * 100)
          };
        });
        
        // 使用数でソート
        skillUsage.sort((a, b) => b.usersCount - a.usersCount);
        
        // ダミーの最近のアクティビティ
        const recentActivity = [
          { type: 'new_user', user: '佐々木修平', timestamp: '2025-05-06 14:22' },
          { type: 'skill_update', user: '山田太郎', skill: 'React', level: 5, timestamp: '2025-05-05 11:15' },
          { type: 'new_skill', skill: 'Flutter', category: 'programming', timestamp: '2025-05-04 09:30' },
          { type: 'skill_update', user: '佐藤花子', skill: 'Photoshop', level: 5, timestamp: '2025-05-03 16:45' }
        ];
        
        setStats({
          totalStudents: users.length,
          totalSkills: skills.length,
          topSkills: skillUsage.slice(0, 5),
          recentActivity
        });
        
        setLoading(false);
      } catch (err) {
        console.error('データの取得に失敗しました', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ローディングスピナー
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">学生数</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">スキル数</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.totalSkills}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">平均スキルレベル</p>
              <p className="text-2xl font-semibold text-gray-800">3.4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">カテゴリ数</p>
              <p className="text-2xl font-semibold text-gray-800">5</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 人気のスキル */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">人気のスキル</h2>
          <div className="space-y-4">
            {stats.topSkills.map((skill, index) => (
              <div key={skill.name} className="flex items-center">
                <div className="w-8 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-yellow-700 text-white' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${skill.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              すべてのスキルを見る →
            </button>
          </div>
        </div>
        
        {/* 最近のアクティビティ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近のアクティビティ</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex">
                <div className={`mt-0.5 h-4 w-4 rounded-full ${
                  activity.type === 'new_user' ? 'bg-green-500' :
                  activity.type === 'skill_update' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-700">
                    {activity.type === 'new_user' && `${activity.user}さんがシステムに登録されました`}
                    {activity.type === 'skill_update' && `${activity.user}さんが${activity.skill}のレベルを${activity.level}に更新しました`}
                    {activity.type === 'new_skill' && `新しいスキル「${activity.skill}」が${activity.category}カテゴリに追加されました`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              すべてのアクティビティを見る →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;