import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminReviewDetail from "../../components/admin/reviews/AdminReviewDetail";
import { adminReviewApi } from "../../api/adminReviewApi";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminReviewDetailPage = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const data = await adminReviewApi.getReviewById(reviewId);
      setReview(data);
    } catch (err) {
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchReview} />;

  return (
    <div className="admin-review-detail-page">
      <div className="page-header">
        <h1>리뷰 상세</h1>
        <button
          onClick={() => navigate("/admin/reviews")}
          className="btn btn-outline"
        >
          목록으로
        </button>
      </div>

      <AdminReviewDetail review={review} />
    </div>
  );
};

export default AdminReviewDetailPage;
