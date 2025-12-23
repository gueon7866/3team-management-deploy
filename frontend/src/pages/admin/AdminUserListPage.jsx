import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./AdminUserListPage.scss";

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    loadUsers();
  }, [pagination.page, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter || undefined,
      });
      setUsers(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "회원 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId, currentStatus) => {
    try {
      console.log("회원 차단/해제 요청:", {
        userId,
        currentStatus,
        newStatus: !currentStatus,
      });

      const response = await userApi.updateUserByAdmin(userId, {
        isBlocked: !currentStatus,
      });

      console.log("회원 차단/해제 성공:", response);
      alert("회원 상태가 변경되었습니다.");
      loadUsers();
    } catch (err) {
      console.error("회원 차단/해제 실패:", err);
      const errorMessage = err.response?.data?.message || err.message || "변경에 실패했습니다.";
      alert(errorMessage);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-user-list-page">
      <div className="page-header">
        <h1>회원 관리</h1>
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <option value="">전체</option>
            <option value="user">일반 회원</option>
            <option value="admin">관리자</option>
            <option value="owner">사업자</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>사업자번호</th>
              <th>연락처</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  회원이 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id || user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <StatusBadge status={user.role} />
                  </td>
                  <td>{user.businessNumber || "-"}</td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    {user.isBlocked ? (
                      <span className="status-badge status-rejected">차단됨</span>
                    ) : (
                      <span className="status-badge status-approved">정상</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`btn ${user.isBlocked ? "btn-success" : "btn-danger"}`}
                      onClick={() => handleBlockToggle(user.id || user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? "해제" : "차단"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}
    </div>
  );
};

export default AdminUserListPage;
