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
    rating: 0,
    freebies: [],
    amenities: [],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const FREEBIES = [
    "무료 와이파이",
    "무료 조식",
    "무료 주차",
    "공항 셔틀",
    "무료 취소",
  ];

  const AMENITIES = [
    "수영장",
    "스파",
    "피트니스",
    "바비큐 시설",
    "비즈니스 센터",
  ];

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImagePreview = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckboxChange = (type, value) => {
    setFormData((prev) => {
      const currentArray = prev[type] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [type]: newArray };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("city", formData.city);
      submitData.append("address", formData.address);
      submitData.append("rating", formData.rating.toString());

      if (formData.freebies.length > 0) {
        formData.freebies.forEach((freebie) => {
          submitData.append("freebies", freebie);
        });
      }
      if (formData.amenities.length > 0) {
        formData.amenities.forEach((amenity) => {
          submitData.append("amenities", amenity);
        });
      }

      images.forEach((image) => {
        submitData.append("images", image);
      });

      await hotelApi.createHotel(submitData);
      alert("호텔이 등록되었습니다. 승인 대기 중입니다.");
      setShowCreateForm(false);
      setFormData({ name: "", city: "", address: "", rating: 0, freebies: [], amenities: [] });
      setImages([]);
      setImagePreviews([]);
      loadHotels();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "호텔 등록에 실패했습니다.");
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
                <label>호텔명 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>도시 *</label>
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
              <div className="form-group">
                <label>평점 (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>무료 혜택</label>
                <div className="checkbox-group">
                  {FREEBIES.map((freebie) => (
                    <label key={freebie} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.freebies.includes(freebie)}
                        onChange={() => handleCheckboxChange("freebies", freebie)}
                      />
                      <span>{freebie}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>편의시설</label>
                <div className="checkbox-group">
                  {AMENITIES.map((amenity) => (
                    <label key={amenity} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleCheckboxChange("amenities", amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>이미지 (최대 5개)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={imagePreviews.length >= 5}
                />
                {imagePreviews.length > 0 && (
                  <div className="image-preview-container">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImagePreview(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: "", city: "", address: "", rating: 0, freebies: [], amenities: [] });
                    setImages([]);
                    setImagePreviews([]);
                  }}
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
              <th>이미지</th>
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
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
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
                  <td>
                    <StatusBadge status={hotel.status} />
                  </td>
                  <td>{new Date(hotel.createdAt).toLocaleDateString()}</td>
                  <td>
                    {hotel.status === "approved" && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/owner/hotels/${hotel.id || hotel._id}`)}
                          style={{ marginRight: "8px" }}
                        >
                          관리
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/owner/hotels/${hotel.id || hotel._id}/edit`)}
                        >
                          수정
                        </button>
                      </>
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

