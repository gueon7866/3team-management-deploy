import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminCouponForm from "../../components/admin/coupons/AdminCouponForm";
import couponApi from "../../api/couponApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminCouponEditPage = () => {
  const { couponId } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCoupon();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await couponApi.getCouponById(couponId);
      // axiosClient 인터셉터가 이미 response.data를 반환하므로, response는 { success, message, data } 구조
      const couponData = response?.data || response;
      setCoupon(couponData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await couponApi.updateCoupon(couponId, formData);
      alert("쿠폰이 수정되었습니다.");
      navigate("/admin/coupons");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "수정에 실패했습니다.";
      alert(errorMessage);
      throw err; // AdminCouponForm에서 에러 처리하도록
    }
  };

  const handleCancel = () => {
    navigate("/admin/coupons");
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCoupon} />;

  return (
    <div className="admin-coupon-edit-page">
      <div className="page-header">
        <h1>쿠폰 수정</h1>
      </div>

      <AdminCouponForm
        coupon={coupon}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AdminCouponEditPage;
