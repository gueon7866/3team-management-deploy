import { useEffect, useState } from "react";
import reservationApi from "../../api/reservationApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./OwnerReservationListPage.scss";

const OwnerReservationListPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadReservations();
  }, [pagination.page, statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationApi.getReservationsForOwner({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      setReservations(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await reservationApi.updateReservationStatus(reservationId, newStatus);
      alert("예약 상태가 변경되었습니다.");
      loadReservations();
    } catch (err) {
      alert(err.response?.data?.message || "변경에 실패했습니다.");
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm("이 예약을 완전히 삭제하시겠습니까?")) return;

    try {
      await reservationApi.deleteReservation(reservationId);
      alert("예약이 삭제되었습니다.");
      loadReservations();
    } catch (err) {
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="owner-reservation-list-page">
      <div className="page-header">
        <h1>예약 관리</h1>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <option value="">전체</option>
            <option value="pending">대기 중</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소됨</option>
            <option value="completed">완료</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="reservation-table">
        <table>
          <thead>
            <tr>
              <th>호텔명</th>
              <th>고객명</th>
              <th>체크인</th>
              <th>체크아웃</th>
              <th>인원</th>
              <th>금액</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  예약이 없습니다.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr key={reservation.id || reservation._id}>
                  <td>{reservation.hotelId?.name || "-"}</td>
                  <td>{reservation.userId?.name || "-"}</td>
                  <td>{new Date(reservation.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(reservation.checkOut).toLocaleDateString()}</td>
                  <td>{reservation.guests}명</td>
                  <td>{reservation.totalPrice?.toLocaleString()}원</td>
                  <td>
                    <StatusBadge status={reservation.status} />
                  </td>
                  <td>
                    <div className="action-buttons">
                      {reservation.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              handleStatusChange(reservation.id || reservation._id, "confirmed")
                            }
                          >
                            확정
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() =>
                              handleStatusChange(reservation.id || reservation._id, "cancelled")
                            }
                          >
                            취소
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(reservation.id || reservation._id)}
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

export default OwnerReservationListPage;

