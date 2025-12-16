import { createContext, useState, useEffect } from "react";
import authApi from "../api/authApi";
import userApi from "../api/userApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authApi.getMe();
      // 백엔드 응답: { success: true, message: "...", data: { user: {...} } }
      if (response?.success && response?.data) {
        const currentUser = response.data.user || response.data;
        // 차단된 계정이면 즉시 로그아웃 처리
        if (currentUser.isBlocked) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(currentUser);
        }
      }
    } catch (error) {
      // 401 에러는 정상적인 경우(토큰 없음/만료)이므로 조용히 처리
      // 에러를 콘솔에 표시하지 않음
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    // 백엔드 응답: { success: true, message: "...", data: { user: {...}, token: "..." } }
    if (response?.success && response?.data) {
      const data = response.data;
      const loggedInUser = data.user || data;

      // 차단된 계정이면 토큰 저장/로그인 처리 없이 에러 발생
      if (loggedInUser.isBlocked) {
        localStorage.removeItem("token");
        setUser(null);
        throw new Error("차단된 계정입니다. 관리자에게 문의해주세요.");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setUser(loggedInUser);
      return data;
    }
    throw new Error(response?.message || "로그인에 실패했습니다.");
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getMe();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        refreshUser,
        isAdmin: user?.role === "admin",
        isOwner: user?.role === "owner",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

