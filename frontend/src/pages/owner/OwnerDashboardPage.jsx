import { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";
import Loader from "../../components/common/Loader";
import OwnerChartArea from "../../components/owner/OwnerChartArea";
import "./OwnerDashboardPage.scss";

const OwnerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [trendType, setTrendType] = useState("day");

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadRevenueTrend(trendType);
  }, [trendType]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getOwnerDashboard();
      // axiosClient 인터셉터가 이미 response.data를 반환하므로, response는 { success, message, data } 구조
      // response.data가 있으면 그것을 사용, 없으면 response 자체를 사용
      const dashboardData = response?.data || response;
      console.log("사업자 대시보드 원본 응답:", response);
      console.log("사업자 대시보드 데이터:", dashboardData);
      console.log("매출 데이터:", dashboardData?.revenue);
      setData(dashboardData);
    } catch (err) {
      console.error("사업자 대시보드 로드 실패:", err);
      setError(err.response?.data?.message || err.message || "대시보드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueTrend = async (type) => {
    try {
      const response = await dashboardApi.getOwnerRevenueTrend(type);
      // axiosClient 인터셉터가 이미 response.data를 반환하므로, response는 { success, message, data } 구조
      const trendData = response?.data || response || [];
      console.log("사업자 매출 추세 데이터:", trendData);
      setRevenueTrend(Array.isArray(trendData) ? trendData : []);
    } catch (err) {
      console.error("사업자 매출 추세 로드 실패:", err);
      setRevenueTrend([]); // 오류 시 빈 배열로 설정
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div className="owner-dashboard-page">
      <h1>사업자 대시보드</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>내 호텔</h3>
          <p className="stat-value">{data.hotels?.total || 0}</p>
          <div className="stat-details">
            <span>승인 대기: {data.hotels?.pending || 0}</span>
            <span>승인됨: {data.hotels?.approved || 0}</span>
            <span>거절됨: {data.hotels?.rejected || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>객실</h3>
          <p className="stat-value">{data.rooms?.total || 0}</p>
          <div className="stat-details">
            <span>활성: {data.rooms?.active || 0}</span>
            <span>비활성: {data.rooms?.inactive || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>예약</h3>
          <p className="stat-value">{data.reservations?.total || 0}</p>
          <div className="stat-details">
            <span>대기: {data.reservations?.pending || 0}</span>
            <span>확정: {data.reservations?.confirmed || 0}</span>
            <span>완료: {data.reservations?.completed || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3>최근 30일 매출</h3>
          <p className="stat-value">
            {data.revenue?.last30DaysTotal?.toLocaleString() || 0}원
          </p>
          <div className="stat-details">
            <span>예약 건수: {data.revenue?.last30DaysCount || 0}건</span>
          </div>
        </div>
      </div>

      <OwnerChartArea
        summaryRevenue={data.revenue}
        reservations={data.reservations}
        trend={revenueTrend}
        trendType={trendType}
        onTrendTypeChange={setTrendType}
      />
    </div>
  );
};

export default OwnerDashboardPage;

