import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const StudentList = ({ onEditStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    department: '',
    year: 1,
    skills: []
  });
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [allSkills, setAllSkills] = useState([]);

  // 学生と利用可能なスキルを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsRes = await api.get('/users');
        const skillsRes = await api.get('/skills');
        
        setStudents(studentsRes.data.data);
        setAllSkills(skillsRes.data.data);
        setLoading(false);
      } catch (error) {
        console.error('データの取得に失敗しました', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 学部の一覧を取得
  const departments = ['all', ...new Set(students.map(student => student.department))];
  
  // 学年の一覧を取得
  const years = ['all', ...new Set(students.map(student => student.year.toString()))];

  // 学生をフィルタリング
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || student.department === filterDepartment;
    const matchesYear = filterYear === 'all' || student.year.toString() === filterYear;
    return matchesSearch && matchesDepartment && matchesYear;
  });

  // 学生を名前でソート
  filteredStudents.sort((a, b) => a.name.localeCompare(b.name));

  // スキルを追加
  const handleAddSkillToStudent = () => {
    if (!selectedSkill) return;
    
    // 既に同じスキルが存在する場合は更新、なければ追加
    const skillExists = newStudent.skills.some(skill => skill.name === selectedSkill);
    
    if (skillExists) {
      const updatedSkills = newStudent.skills.map(skill => 
        skill.name === selectedSkill ? { ...skill, level: selectedLevel } : skill
      );
      setNewStudent({ ...newStudent, skills: updatedSkills });
    } else {
      setNewStudent({
        ...newStudent,
        skills: [...newStudent.skills, { name: selectedSkill, level: selectedLevel }]
      });
    }
    
    // 選択をリセット
    setSelectedSkill('');
    setSelectedLevel(1);
  };

  // スキルを削除
  const handleRemoveSkill = (skillName) => {
    const updatedSkills = newStudent.skills.filter(skill => skill.name !== skillName);
    setNewStudent({ ...newStudent, skills: updatedSkills });
  };

  // 新しい学生を追加（モック）
  const handleAddStudent = () => {
    const newId = `student-${Date.now()}`;
    const updatedStudents = [...students, { ...newStudent, _id: newId }];
    setStudents(updatedStudents);
    setNewStudent({
      name: '',
      department: '',
      year: 1,
      skills: []
    });
    setIsAddStudentModalOpen(false);
  };

  // 学生を削除（モック）
  const handleDeleteStudent = (studentToDelete) => {
    if (window.confirm(`「${studentToDelete.name}」を削除してもよろしいですか？`)) {
      const updatedStudents = students.filter(student => student._id !== studentToDelete._id);
      setStudents(updatedStudents);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">学生一覧</h1>
        <button
          onClick={() => setIsAddStudentModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新規学生登録
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search-student" className="block text-sm font-medium text-gray-700 mb-1">
              学生を検索
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search-student"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="名前を入力..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="filter-department" className="block text-sm font-medium text-gray-700 mb-1">
              学部
            </label>
            <select
              id="filter-department"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'すべての学部' : dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-year" className="block text-sm font-medium text-gray-700 mb-1">
              学年
            </label>
            <select
              id="filter-year"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'すべての学年' : `${year}年`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div key={student._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {student.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.department} {student.year}年</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">保有スキル</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
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
                  
                  <div className="mt-5 flex justify-end space-x-2">
                    <button
                      onClick={() => onEditStudent && onEditStudent(student)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-6 text-center text-gray-500">
              条件に合う学生が見つかりませんでした
            </div>
          )}
        </div>
      )}

      {/* 学生追加モーダル */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">新規学生登録</h2>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 mb-1">
                    氏名
                  </label>
                  <input
                    type="text"
                    id="student-name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student-department" className="block text-sm font-medium text-gray-700 mb-1">
                      学部
                    </label>
                    <input
                      type="text"
                      id="student-department"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newStudent.department}
                      onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="student-year" className="block text-sm font-medium text-gray-700 mb-1">
                      学年
                    </label>
                    <select
                      id="student-year"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({ ...newStudent, year: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>
                          {year}年
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">スキル登録</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label htmlFor="skill-select" className="block text-sm font-medium text-gray-700 mb-1">
                        スキル
                      </label>
                      <select
                        id="skill-select"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                      >
                        <option value="">スキルを選択</option>
                        {allSkills.map(skill => (
                          <option key={skill.name} value={skill.name}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="skill-level-select" className="block text-sm font-medium text-gray-700 mb-1">
                        レベル
                      </label>
                      <select
                        id="skill-level-select"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>
                            レベル {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddSkillToStudent}
                    disabled={!selectedSkill}
                    className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    スキルを追加
                  </button>
                  
                  {newStudent.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">登録済みスキル</h4>
                      <div className="flex flex-wrap gap-2">
                        {newStudent.skills.map((skill, index) => (
                          <div 
                            key={index} 
                            className="flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                          >
                            <span>{skill.name}</span>
                            <span className={`mx-1 h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                              skill.level >= 4 ? 'bg-green-500 text-white' :
                              skill.level === 3 ? 'bg-blue-500 text-white' :
                              skill.level === 2 ? 'bg-yellow-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {skill.level}
                            </span>
                            <button
                              onClick={() => handleRemoveSkill(skill.name)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={!newStudent.name || !newStudent.department}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;