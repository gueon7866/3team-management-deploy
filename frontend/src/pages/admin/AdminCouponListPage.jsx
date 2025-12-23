import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import couponApi from "../../api/couponApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./AdminCouponListPage.scss";

const AdminCouponListPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadCoupons();
  }, [pagination.page]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponApi.getCouponsForAdmin({
        page: pagination.page,
        limit: pagination.limit,
      });
      setCoupons(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "쿠폰 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (couponId) => {
    if (!window.confirm("이 쿠폰을 비활성화하시겠습니까?")) return;

    try {
      await couponApi.deactivateCoupon(couponId);
      alert("쿠폰이 비활성화되었습니다.");
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "처리에 실패했습니다.");
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("이 쿠폰을 삭제하시겠습니까?\n삭제된 쿠폰은 복구할 수 없습니다.")) return;

    try {
      await couponApi.deleteCoupon(couponId);
      alert("쿠폰이 삭제되었습니다.");
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-coupon-list-page">
      <div className="page-header">
        <h1>쿠폰 관리</h1>
        <button className="btn btn-primary" onClick={() => navigate("/admin/coupons/new")}>
          쿠폰 생성
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="coupon-table">
        <table>
          <thead>
            <tr>
              <th>쿠폰명</th>
              <th>코드</th>
              <th>할인액</th>
              <th>최소주문금액</th>
              <th>유효기간</th>
              <th>사업자</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  쿠폰이 없습니다.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id || coupon._id}>
                  <td>{coupon.name}</td>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountAmount?.toLocaleString()}원</td>
                  <td>{coupon.minOrderAmount?.toLocaleString()}원</td>
                  <td>
                    {new Date(coupon.validFrom).toLocaleDateString()} ~{" "}
                    {new Date(coupon.validTo).toLocaleDateString()}
                  </td>
                  <td>{coupon.owner?.name || "-"}</td>
                  <td>
                    {coupon.isActive ? (
                      <span className="status-badge status-approved">활성</span>
                    ) : (
                      <span className="status-badge status-rejected">비활성</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/admin/coupons/${coupon.id || coupon._id}/edit`)}
                        style={{ marginRight: "8px" }}
                      >
                        수정
                      </button>
                      {coupon.isActive && (
                        <button
                          className="btn btn-warning"
                          onClick={() => handleDeactivate(coupon.id || coupon._id)}
                          style={{ marginRight: "8px" }}
                        >
                          비활성화
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(coupon.id || coupon._id)}
                      >
                        삭제
                      </button>
                    </div>
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

export default AdminCouponListPage;
