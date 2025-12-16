import { useEffect, useState } from "react";
import reviewApi from "../../api/reviewApi";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import "./OwnerReviewListPage.scss";

const OwnerReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [showReportForm, setShowReportForm] = useState(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    loadReviews();
  }, [pagination.page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getOwnerReportedReviews({
        page: pagination.page,
        limit: pagination.limit,
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

  const handleReport = async (reviewId) => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }

    try {
      await reviewApi.escalateReview(reviewId, reportReason);
      alert("리뷰가 관리자에게 신고되었습니다.");
      setShowReportForm(null);
      setReportReason("");
      loadReviews();
    } catch (err) {
      alert(err.response?.data?.message || "신고에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="owner-review-list-page">
      <h1>리뷰 관리</h1>
      <p className="page-description">유저가 신고한 리뷰를 확인하고 관리자에게 이관할 수 있습니다.</p>

      {error && <div className="error-message">{error}</div>}

      <div className="review-table">
        <table>
          <thead>
            <tr>
              <th>호텔명</th>
              <th>작성자</th>
              <th>평점</th>
              <th>내용</th>
              <th>신고 상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  신고된 리뷰가 없습니다.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id || review._id}>
                  <td>{review.hotelId?.name || "-"}</td>
                  <td>{review.userId?.name || "-"}</td>
                  <td>{review.rating}점</td>
                  <td className="comment-cell">{review.comment}</td>
                  <td>
                    {review.isEscalatedByOwner ? (
                      <span className="status-badge status-approved">신고 완료</span>
                    ) : (
                      <span className="status-badge status-pending">대기 중</span>
                    )}
                  </td>
                  <td>
                    {!review.isEscalatedByOwner && (
                      <>
                        {showReportForm === review.id ? (
                          <div className="report-form">
                            <textarea
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              placeholder="신고 사유를 입력하세요"
                              rows="3"
                            />
                            <div className="form-actions">
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowReportForm(null);
                                  setReportReason("");
                                }}
                              >
                                취소
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={() => handleReport(review.id || review._id)}
                              >
                                신고
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-danger"
                            onClick={() => setShowReportForm(review.id || review._id)}
                          >
                            관리자에게 신고
                          </button>
                        )}
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

export default OwnerReviewListPage;

