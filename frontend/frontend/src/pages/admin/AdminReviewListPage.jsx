import { useEffect, useState } from "react";
import reviewApi from "../../api/reviewApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import "./AdminReviewListPage.scss";

const AdminReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    loadReviews();
  }, [pagination.page, statusFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getAdminReportedReviews({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
      });
      setReviews(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "리뷰 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;

    try {
      await reviewApi.approveReviewReport(reviewId);
      alert("리뷰가 삭제되었습니다.");
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.message || "처리에 실패했습니다.");
    }
  };

  const handleReject = async (reviewId) => {
    if (!window.confirm("이 신고를 기각하시겠습니까?")) return;

    try {
      await reviewApi.rejectReviewReport(reviewId);
      alert("신고가 기각되었습니다.");
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.message || "처리에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-review-list-page">
      <div className="page-header">
        <h1>리뷰 관리</h1>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <option value="pending">대기 중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="review-table">
        <table>
          <thead>
            <tr>
              <th>호텔명</th>
              <th>작성자</th>
              <th>평점</th>
              <th>내용</th>
              <th>신고 사유</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id || review._id}>
                  <td>{review.hotelId?.name || "-"}</td>
                  <td>{review.userId?.name || "-"}</td>
                  <td>{review.rating}점</td>
                  <td className="comment-cell">{review.comment}</td>
                  <td>{review.ownerReportReason || "-"}</td>
                  <td>
                    <StatusBadge status={review.adminReportStatus} />
                  </td>
                  <td>
                    {review.adminReportStatus === "pending" && (
                      <div className="action-buttons">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleApprove(review.id || review._id)}
                        >
                          삭제
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleReject(review.id || review._id)}
                        >
                          기각
                        </button>
                      </div>
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

export default AdminReviewListPage;
