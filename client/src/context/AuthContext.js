import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // トークン取得
  const getToken = () => localStorage.getItem('token');

  // ユーザー情報のロード
  const loadUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(err.response?.data?.message || 'サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 登録
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/register`, formData);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'サーバーエラーが発生しました');
      setLoading(false);
      return false;
    }
  };

  // ログイン
  const login = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, formData);
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'サーバーエラーが発生しました');
      setLoading(false);
      return false;
    }
  };

  // ログアウト
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // エラーのクリア
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        loadUser,
        clearError,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};