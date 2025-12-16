import { useState, useEffect } from "react";
import AdminBookingFilter from "../../components/admin/bookings/AdminBookingFilter";
import AdminBookingTable from "../../components/admin/bookings/AdminBookingTable";
import Pagination from "../../components/common/Pagination";
import { adminBookingApi } from "../../api/adminBookingApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminBookingListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminBookingApi.getBookings({
        ...filters,
        page,
      });
      setBookings(data.items || []);
      setTotalPages(data.totalPages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings(1);
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await adminBookingApi.updateBookingStatus(bookingId, status);
      fetchBookings(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "상태 변경에 실패했습니다.");
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm("이 예약을 취소하시겠습니까?");
    if (!confirmed) return;

    try {
      await adminBookingApi.cancelBooking(bookingId);
      fetchBookings(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "취소에 실패했습니다.");
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchBookings(currentPage)} />;

  return (
    <div className="admin-booking-list-page">
      <div className="page-header">
        <h1>예약 관리</h1>
      </div>

      <AdminBookingFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <AdminBookingTable
        bookings={bookings}
        onStatusChange={handleStatusChange}
        onCancel={handleCancel}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default AdminBookingListPage;
