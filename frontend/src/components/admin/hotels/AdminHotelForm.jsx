import { useState, useEffect } from "react";
import "./AdminHotelForm.scss";

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

const AdminHotelForm = ({ hotel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    rating: 0,
    freebies: [],
    amenities: [],
  });
  const [images, setImages] = useState([]); // 새로 업로드할 파일들
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 URL들
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        city: hotel.city || "",
        address: hotel.address || "",
        rating: hotel.rating || 0,
        freebies: hotel.freebies || [],
        amenities: hotel.amenities || [],
      });
      const hotelImages = hotel.images || [];
      setExistingImages(hotelImages);
      setImagePreviews(hotelImages);
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({ ...prev, rating: value }));
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - imagePreviews.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (newFiles.length === 0) return;
    
    setImages((prev) => [...prev, ...newFiles]);

    // 미리보기 생성
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImagePreview = (index) => {
    const existingCount = existingImages.length;
    
    if (index < existingCount) {
      // 기존 이미지 제거
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새 이미지 제거
      const newIndex = index - existingCount;
      // URL 해제
      const fileToRemove = images[newIndex];
      if (fileToRemove && fileToRemove instanceof File) {
        URL.revokeObjectURL(imagePreviews[index]);
      }
      setImages((prev) => prev.filter((_, i) => i !== newIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("city", formData.city);
      submitData.append("address", formData.address);
      submitData.append("rating", formData.rating.toString());

      // 배열 필드 추가
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

      // 기존 이미지 URL 추가 (제거된 이미지를 반영하기 위해 현재 preview에 있는 기존 이미지만 포함)
      existingImages.forEach((imageUrl) => {
        submitData.append("images", imageUrl);
      });

      // 새로 업로드할 이미지 파일 추가
      images.forEach((image) => {
        submitData.append("images", image);
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-hotel-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">호텔명 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">도시 *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">주소</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">평점 (1-5)</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleRatingChange}
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
          {imagePreviews.length >= 5 && (
            <p className="image-limit-message">이미지는 최대 5개까지 업로드 가능합니다.</p>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "저장 중..." : hotel ? "수정" : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHotelForm;
