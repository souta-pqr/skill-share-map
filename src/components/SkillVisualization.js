import React, { useState } from 'react';

const SkillVisualization = ({ skills, users }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get all unique categories
  const categories = ['all', ...new Set(skills.map(skill => skill.category || 'その他'))];
  
  // Filter skills by selected category
  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => (skill.category || 'その他') === selectedCategory);
  
  // Count users for each skill
  const skillUserCounts = filteredSkills.map(skill => {
    const count = users.filter(user => 
      user.skills.some(userSkill => userSkill.name === skill.name)
    ).length;
    
    return {
      ...skill,
      userCount: count,
      percentage: Math.round((count / users.length) * 100)
    };
  });
  
  // Sort by user count (descending)
  skillUserCounts.sort((a, b) => b.userCount - a.userCount);
  
  // Take top 8 skills
  const topSkills = skillUserCounts.slice(0, 8);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">スキル分布</h2>
        
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
      
      <div className="space-y-4">
        {topSkills.map((skill) => (
          <div key={skill.name} className="relative">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{skill.name}</span>
              <span className="ml-auto text-sm text-gray-500">{skill.userCount}/{users.length}人 ({skill.percentage}%)</span>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-4 bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
            
            {/* Skill level distribution dots */}
            <div className="flex mt-1 ml-1 space-x-1">
              {[1, 2, 3, 4, 5].map(level => {
                const countAtLevel = users.filter(user => 
                  user.skills.some(userSkill => 
                    userSkill.name === skill.name && userSkill.level === level
                  )
                ).length;
                
                return countAtLevel > 0 ? (
                  <div 
                    key={level}
                    className="h-2 w-2 rounded-full bg-indigo-600"
                    style={{ 
                      opacity: 0.3 + (level * 0.14), 
                      transform: `scale(${0.8 + (countAtLevel / users.length)})`
                    }}
                    title={`レベル${level}: ${countAtLevel}人`}
                  ></div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillVisualization;