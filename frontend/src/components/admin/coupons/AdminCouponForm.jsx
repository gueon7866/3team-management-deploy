import { useState, useEffect } from "react";
import "./AdminCouponForm.scss";

const AdminCouponForm = ({ coupon, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountAmount: "",
    minOrderAmount: "",
    validFrom: "",
    validTo: "",
    businessNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      // 날짜를 datetime-local 형식으로 변환
      const formatDateForInput = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: coupon.name || "",
        code: coupon.code || "",
        discountAmount: coupon.discountAmount?.toString() || "",
        minOrderAmount: coupon.minOrderAmount?.toString() || "",
        validFrom: formatDateForInput(coupon.validFrom),
        validTo: formatDateForInput(coupon.validTo),
        businessNumber: coupon.owner?.businessNumber || coupon.ownerBusinessNumber || "",
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        // businessNumber가 비어 있으면 전역 쿠폰으로 처리
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "처리에 실패했습니다.";
      setError(errorMessage);
      console.error("쿠폰 처리 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-coupon-form">
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="coupon-form">
        <div className="form-group">
          <label>쿠폰명 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>쿠폰 코드 *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            disabled={!!coupon} // 수정 시 코드는 변경 불가
          />
          {coupon && (
            <small className="helper-text">
              쿠폰 코드는 수정할 수 없습니다.
            </small>
          )}
        </div>

        <div className="form-group">
          <label>사업자 번호 (선택)</label>
          <input
            type="text"
            name="businessNumber"
            value={formData.businessNumber}
            onChange={handleChange}
            placeholder="특정 사업자에게만 쿠폰을 연결하려면 입력하세요"
          />
          <small className="helper-text">
            비워두면 모든 사업자가 사용할 수 있는 전역 쿠폰으로 처리됩니다.
          </small>
        </div>

        <div className="form-group">
          <label>할인액 (원) *</label>
          <input
            type="number"
            name="discountAmount"
            value={formData.discountAmount}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label>최소 주문 금액 (원)</label>
          <input
            type="number"
            name="minOrderAmount"
            value={formData.minOrderAmount}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>유효 시작일 *</label>
          <input
            type="datetime-local"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>유효 종료일 *</label>
          <input
            type="datetime-local"
            name="validTo"
            value={formData.validTo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            취소
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "저장 중..." : coupon ? "수정" : "생성"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCouponForm;
