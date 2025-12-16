import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AdminBookingDetail from "../../components/admin/bookings/AdminBookingDetail";
import { adminBookingApi } from "../../api/adminBookingApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminBookingDetailPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateBooking = location.state?.booking;

  const [booking, setBooking] = useState(stateBooking || null);
  const [loading, setLoading] = useState(!stateBooking);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stateBooking) return;
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      // 백엔드에 단일 조회 엔드포인트가 없으므로 넉넉한 페이지 사이즈로 조회 후 찾는다
      const data = await adminBookingApi.getBookings({ page: 1, limit: 200 });
      const found =
        data.items?.find(
          (item) =>
            item.id === bookingId ||
            item.reservationId === bookingId ||
            item._id === bookingId
        ) || null;

      if (!found) {
        setError("예약을 찾을 수 없습니다. 목록에서 다시 접근해주세요.");
      }
      setBooking(found);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBooking} />;

  return (
    <div className="admin-booking-detail-page">
      <div className="page-header">
        <h1>예약 상세</h1>
        <button onClick={() => navigate("/admin/bookings")} className="btn btn-outline">
          목록으로
        </button>
      </div>

      <AdminBookingDetail booking={booking} />
    </div>
  );
};

export default AdminBookingDetailPage;
