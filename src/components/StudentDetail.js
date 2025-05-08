import React from 'react';

const StudentDetail = ({ user, onClose }) => {
  if (!user) return null;

  // Calculate the average skill level
  const averageSkillLevel = user.skills.reduce((acc, skill) => acc + skill.level, 0) / user.skills.length;
  
  // Group skills by category (using a dummy category if none is provided)
  const groupedSkills = user.skills.reduce((acc, skill) => {
    const category = skill.category || 'その他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">学生プロフィール</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {user.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.department} {user.year}年</p>
              
              <div className="mt-2 flex items-center">
                <div className="text-sm font-medium text-gray-500">平均スキルレベル:</div>
                <div className="ml-2 flex items-center">
                  <span className="text-sm font-medium text-gray-900">{averageSkillLevel.toFixed(1)}</span>
                  <div className="ml-2 bg-gray-200 rounded-full h-2 w-24">
                    <div
                      className="bg-indigo-600 rounded-full h-2"
                      style={{ width: `${(averageSkillLevel / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">スキル詳細</h4>
            
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">{category}</h5>
                  <div className="space-y-3">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1/3 text-sm font-medium text-gray-900">{skill.name}</div>
                        <div className="w-2/3">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">Lv.{skill.level}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                閉じる
              </button>
              
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                メッセージを送る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;