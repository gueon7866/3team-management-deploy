import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hotelApi from "../../api/hotelApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./OwnerHotelListPage.scss";

const OwnerHotelListPage = () => {
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    loadHotels();
  }, [pagination.page]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelApi.getMyHotels({
        page: pagination.page,
        limit: pagination.limit,
      });
      setHotels(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "호텔 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hotelApi.createHotel(formData);
      alert("호텔이 등록되었습니다. 승인 대기 중입니다.");
      setShowCreateForm(false);
      setFormData({ name: "", city: "", address: "" });
      loadHotels();
    } catch (err) {
      alert(err.response?.data?.message || "호텔 등록에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="owner-hotel-list-page">
      <div className="page-header">
        <h1>호텔 관리</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
          호텔 등록
        </button>
      </div>

      {showCreateForm && (
        <div className="create-modal">
          <div className="modal-content">
            <h2>호텔 등록</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>호텔명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>도시</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="hotel-table">
        <table>
          <thead>
            <tr>
              <th>호텔명</th>
              <th>도시</th>
              <th>주소</th>
              <th>상태</th>
              <th>등록일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  호텔이 없습니다.
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr key={hotel.id || hotel._id}>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.address || "-"}</td>
                  <td>
                    <StatusBadge status={hotel.status} />
                  </td>
                  <td>{new Date(hotel.createdAt).toLocaleDateString()}</td>
                  <td>
                    {hotel.status === "approved" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/owner/hotels/${hotel.id || hotel._id}`)}
                      >
                        관리
                      </button>
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

export default OwnerHotelListPage;

