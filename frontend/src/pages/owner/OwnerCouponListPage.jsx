import { useEffect, useState } from "react";
import couponApi from "../../api/couponApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import "./OwnerCouponListPage.scss";

const OwnerCouponListPage = () => {
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
      const response = await couponApi.getCouponsForOwner({
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

  if (loading) return <Loader />;

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  return (
    <div className="owner-coupon-list-page">
      <h1>쿠폰 관리</h1>
      <p className="page-description">관리자가 발급한 쿠폰 목록을 확인할 수 있습니다.</p>

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
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
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
                  <td>
                    {isExpired(coupon.validTo) ? (
                      <span className="status-badge status-rejected">만료됨</span>
                    ) : (
                      <span className="status-badge status-approved">사용 가능</span>
                    )}
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

export default OwnerCouponListPage;

