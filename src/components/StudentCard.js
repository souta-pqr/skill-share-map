import React from 'react';

const StudentCard = ({ user, selectedSkill, onViewProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {user.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.department} {user.year}年</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">保有スキル</h4>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <div 
                key={index} 
                className={`flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  selectedSkill === skill.name
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <span>{skill.name}</span>
                <span className={`ml-1 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                  skill.level >= 4 ? 'bg-green-500 text-white' :
                  skill.level === 3 ? 'bg-blue-500 text-white' :
                  skill.level === 2 ? 'bg-yellow-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => onViewProfile(user)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            プロフィールを見る
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;