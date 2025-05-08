// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import SkillMap from './components/SkillMap';
import Dashboard from './components/Dashboard';
import SkillList from './components/SkillList';
import StudentList from './components/StudentList';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editSkill, setEditSkill] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  // ページ遷移を処理
  const handleNavigate = (page) => {
    setCurrentPage(page);
    setEditSkill(null);
    setEditStudent(null);
  };

  // スキル編集を処理
  const handleEditSkill = (skill) => {
    setEditSkill(skill);
    setCurrentPage('skillForm');
  };

  // 学生編集を処理
  const handleEditStudent = (student) => {
    setEditStudent(student);
    setCurrentPage('studentForm');
  };

  // 現在のページをレンダリング
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'skills':
        return <SkillList onEditSkill={handleEditSkill} onNavigate={handleNavigate} />;
      case 'students':
        return <StudentList onEditStudent={handleEditStudent} />;
      case 'skillmap':
        return <SkillMap />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App bg-gray-50 min-h-screen">
      <Header activePage={currentPage} onNavigate={handleNavigate} />
      {renderPage()}
    </div>
  );
}

export default App;