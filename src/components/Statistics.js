import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Statistics = () => {
  const [data, setData] = useState({
    skills: [],
    users: [],
    loading: true,
    error: null
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // スキルとユーザーのデータを取得
        const skillsRes = await api.get('/skills');
        const usersRes = await api.get('/users');
        
        setData({
          skills: skillsRes.data.data,
          users: usersRes.data.data,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'データの取得に失敗しました'
        }));
      }
    };

    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{data.error}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // カテゴリの一覧を取得
  const categories = ['all', ...new Set(data.skills.map(skill => skill.category || 'その他'))];

  // スキルごとの使用状況を計算
  const skillStats = data.skills.map(skill => {
    const usersWithSkill = data.users.filter(user => 
      user.skills.some(userSkill => userSkill.name === skill.name)
    );
    
    const levelCounts = [0, 0, 0, 0, 0, 0]; // インデックス0は未使用、1-5はレベル
    usersWithSkill.forEach(user => {
      const userSkill = user.skills.find(s => s.name === skill.name);
      if (userSkill) {
        levelCounts[userSkill.level]++;
      }
    });
    
    return {
      ...skill,
      usersCount: usersWithSkill.length,
      percentage: Math.round((usersWithSkill.length / data.users.length) * 100),
      levelDistribution: levelCounts,
      averageLevel: usersWithSkill.length > 0 
        ? usersWithSkill.reduce((sum, user) => {
            const userSkill = user.skills.find(s => s.name === skill.name);
            return sum + (userSkill ? userSkill.level : 0);
          }, 0) / usersWithSkill.length
        : 0
    };
  });

  // フィルタリング
  const filteredSkills = selectedCategory === 'all'
    ? skillStats
    : skillStats.filter(skill => (skill.category || 'その他') === selectedCategory);

  // 使用率でソート
  filteredSkills.sort((a, b) => b.percentage - a.percentage);

  // 学部別の学生数
  const departmentCounts = data.users.reduce((acc, user) => {
    const dept = user.department;
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // 学年別の学生数
  const yearCounts = data.users.reduce((acc, user) => {
    const year = user.year;
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">統計情報</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* スキル分布 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">スキル保有率</h2>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'すべてのカテゴリ' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-6">
            {filteredSkills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      平均Lv.{skill.averageLevel.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{skill.usersCount}/{data.users.length}人 ({skill.percentage}%)</span>
                </div>
                
                <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`h-full ${
                          level === 1 ? 'bg-gray-400' :
                          level === 2 ? 'bg-yellow-500' :
                          level === 3 ? 'bg-blue-500' :
                          level === 4 ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{
                          width: `${(skill.levelDistribution[level] / data.users.length) * 100}%`
                        }}
                        title={`レベル${level}: ${skill.levelDistribution[level]}人`}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-gray-400 rounded-full mr-1"></span>
                    <span>Lv.1</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
                    <span>Lv.2</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-blue-500 rounded-full mr-1"></span>
                    <span>Lv.3</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    <span>Lv.4</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-purple-500 rounded-full mr-1"></span>
                    <span>Lv.5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 学生分布 */}
        <div className="space-y-8">
          {/* 学部別分布 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">学部別分布</h2>
            <div className="space-y-4">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <div key={department}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{department}</span>
                    <span className="text-sm text-gray-500">{count}人 ({Math.round((count / data.users.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(count / data.users.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 学年別分布 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">学年別分布</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(year => (
                <div key={year}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{year}年生</span>
                    <span className="text-sm text-gray-500">
                      {yearCounts[year] || 0}人 ({Math.round(((yearCounts[year] || 0) / data.users.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        year === 1 ? 'bg-green-500' :
                        year === 2 ? 'bg-yellow-500' :
                        year === 3 ? 'bg-indigo-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${((yearCounts[year] || 0) / data.users.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 平均スキルレベル */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">平均スキルレベル</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e6e8eb"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray="68, 100" // 平均スキルレベル（3.4）を5で割って100をかけた値
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-gray-800">3.4</span>
                    <span className="block text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全体統計 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">主要指標</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{data.users.length}</div>
            <div className="text-sm text-gray-500">総学生数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{data.skills.length}</div>
            <div className="text-sm text-gray-500">総スキル数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{categories.length - 1}</div>
            <div className="text-sm text-gray-500">スキルカテゴリ数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {(data.users.reduce((sum, user) => sum + user.skills.length, 0) / data.users.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">学生あたりスキル数</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;