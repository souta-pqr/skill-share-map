// src/utils/api.js
import { mockSkills, mockUsers } from '../mockData';

// モック API
const api = {
  get: async (url) => {
    // 遅延を模倣
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // エンドポイントに応じてデータを返す
    if (url === '/skills') {
      return { data: { data: mockSkills } };
    } else if (url === '/users') {
      return { data: { data: mockUsers } };
    }
    
    // デフォルトのレスポンス
    return { data: { data: [] } };
  }
};

export default api;