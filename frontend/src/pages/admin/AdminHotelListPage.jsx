import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hotelApi from "../../api/hotelApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./AdminHotelListPage.scss";

const AdminHotelListPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadHotels();
  }, [pagination.page, statusFilter]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getAllHotels({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      // 백엔드 응답 구조: { success: true, data: { items: [...], pagination: {...} } }
      const hotelData = response.data || {};
      setHotels(hotelData.items || []);
      const paginationData = hotelData.pagination || {};
      setPagination({
        ...pagination,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "호텔 목록을 불러오는데 실패했습니다.";
      setError(errorMessage);
      console.error("호텔 목록 로드 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hotelId) => {
    if (!window.confirm("이 호텔을 승인하시겠습니까?")) return;

    try {
      await hotelApi.approveHotel(hotelId);
      alert("호텔이 승인되었습니다.");
      loadHotels();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "승인에 실패했습니다.";
      alert(errorMessage);
    }
  };

  const handleReject = async (hotelId) => {
    if (!window.confirm("이 호텔을 거절하시겠습니까?")) return;

    try {
      await hotelApi.rejectHotel(hotelId);
      alert("호텔이 거절되었습니다.");
      loadHotels();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "거절에 실패했습니다.";
      alert(errorMessage);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-hotel-list-page">
      <div className="page-header">
        <h1>호텔 관리</h1>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <option value="all">전체</option>
            <option value="pending">승인 대기</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="hotel-table">
        <table>
          <thead>
            <tr>
              <th>이미지</th>
              <th>호텔명</th>
              <th>도시</th>
              <th>주소</th>
              <th>사업자명</th>
              <th>사업자번호</th>
              <th>상태</th>
              <th>등록일</th>
              <th>평점</th>
              <th>무료혜택</th>
              <th>편의시설</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", padding: "40px" }}>
                  호텔이 없습니다.
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr key={hotel.id || hotel._id}>
                  <td>
                    {hotel.images && hotel.images.length > 0 ? (
                      <img 
                        src={hotel.images[0]} 
                        alt={hotel.name}
                        className="hotel-thumbnail"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="hotel-thumbnail-placeholder">이미지 없음</div>
                    )}
                  </td>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.address || "-"}</td>
                  <td>{hotel.owner?.name || "-"}</td>
                  <td>{hotel.owner?.businessNumber || "-"}</td>
                  <td>
                    <StatusBadge status={hotel.status} />
                  </td>
                  <td>{new Date(hotel.createdAt).toLocaleDateString()}</td>
                  <td>
                    {hotel.rating > 0 ? `${hotel.rating}점` : "-"}
                  </td>
                  <td>
                    {hotel.freebies && hotel.freebies.length > 0 
                      ? hotel.freebies.join(", ") 
                      : "-"}
                  </td>
                  <td>
                    {hotel.amenities && hotel.amenities.length > 0 
                      ? hotel.amenities.join(", ") 
                      : "-"}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-info"
                        onClick={() => navigate(`/admin/hotels/${hotel.id || hotel._id}`)}
                        style={{ marginRight: "8px" }}
                      >
                        상세
                      </button>
                      {hotel.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={() => handleApprove(hotel.id || hotel._id)}
                          >
                            승인
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleReject(hotel.id || hotel._id)}
                          >
                            거절
                          </button>
                        </>
                      )}
                      {(hotel.status === "approved" || hotel.status === "rejected") && (
                        <>
                          {hotel.status === "approved" && (
                            <button
                              className="btn btn-danger"
                              onClick={() => handleReject(hotel.id || hotel._id)}
                            >
                              거절
                            </button>
                          )}
                          {hotel.status === "rejected" && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprove(hotel.id || hotel._id)}
                            >
                              승인
                            </button>
                          )}
                        </>
                      )}
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

export default AdminHotelListPage;
