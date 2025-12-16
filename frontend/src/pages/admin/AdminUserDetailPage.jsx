import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminUserDetail from "../../components/admin/users/AdminUserDetail";
import { adminUserApi } from "../../api/adminUserApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await adminUserApi.getUserById(userId);
      setUser(data);
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUser} />;

  return (
    <div className="admin-user-detail-page">
      <div className="page-header">
        <h1>회원 상세</h1>
        <button
          onClick={() => navigate("/admin/users")}
          className="btn btn-outline"
        >
          목록으로
        </button>
      </div>

      <AdminUserDetail user={user} />
    </div>
  );
};

export default AdminUserDetailPage;
