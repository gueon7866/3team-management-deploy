import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const OwnerHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="header-left">
          <h2>사업자 대시보드</h2>
        </div>
        <div className="header-right">
          <span>{user?.name || "Owner"}</span>
          <button onClick={handleLogout} className="btn btn-outline">
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default OwnerHeader;

