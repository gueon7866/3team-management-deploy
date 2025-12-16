import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminCouponForm from "../../components/admin/coupons/AdminCouponForm";
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
      // TODO: API 연결
      setCoupon({});
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // TODO: API 연결
      alert("쿠폰이 수정되었습니다.");
      navigate("/admin/coupons");
    } catch (err) {
      alert(err.message || "수정에 실패했습니다.");
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
