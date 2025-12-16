import React from "react";

// 사업자용 매출 차트: 관리자 차트와 동일한 구조이되 타이틀만 사업자 관점으로 표시
const OwnerChartArea = ({
  summaryRevenue,
  reservations,
  trend,
  trendType,
  onTrendTypeChange,
}) => {
  const totalRevenue = summaryRevenue?.last30DaysTotal || 0;
  const totalCount = summaryRevenue?.last30DaysCount || 0;
  const completedCount = reservations?.completed || 0;

  const avgPerReservation = totalCount ? totalRevenue / totalCount : 0;

  const maxValue = Math.max(totalRevenue, avgPerReservation, completedCount || 1);

  const toHeight = (value) =>
    maxValue === 0 ? 0 : Math.round((value / maxValue) * 100);

  const summaryBars = [
    {
      label: "30일 총 매출",
      value: totalRevenue,
      height: toHeight(totalRevenue),
      color: "#4f46e5",
      suffix: "원",
    },
    {
      label: "예약당 평균 매출",
      value: Math.round(avgPerReservation),
      height: toHeight(avgPerReservation),
      color: "#22c55e",
      suffix: "원",
    },
    {
      label: "완료 예약 수",
      value: completedCount,
      height: toHeight(completedCount),
      color: "#f97316",
      suffix: "건",
    },
  ];

  const maxTrendValue =
    trend && trend.length
      ? Math.max(...trend.map((d) => d.total || 0))
      : 0;

  const toTrendHeight = (value) =>
    maxTrendValue === 0 ? 0 : Math.round((value / maxTrendValue) * 100);

  const typeLabel =
    trendType === "year" ? "연도별" : trendType === "month" ? "월별" : "일별";

  return (
    <div className="owner-chart-area admin-chart-area">
      <div className="chart-header">
        <h2>내 호텔 매출 통계</h2>
        <span className="chart-subtitle">
          내 호텔에서 발생한 완료된 예약 기준 매출입니다.
        </span>
      </div>

      <div className="chart-body summary">
        {summaryBars.map((bar) => (
          <div key={bar.label} className="chart-bar-wrapper">
            <div className="chart-bar">
              <div
                className="chart-bar-fill"
                style={{ height: `${bar.height}%`, backgroundColor: bar.color }}
                title={`${bar.value.toLocaleString()}${bar.suffix}`}
              />
            </div>
            <div className="chart-bar-label">{bar.label}</div>
            <div className="chart-bar-value">
              {bar.value.toLocaleString()}
              {bar.suffix}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-trend-header">
        <div className="chart-trend-title">
          <h3>{typeLabel} 매출 추세</h3>
          <span className="chart-subtitle">
            버튼을 눌러 일/월/연 단위로 매출 흐름을 비교해보세요.
          </span>
        </div>
        <div className="chart-trend-tabs">
          <button
            type="button"
            className={trendType === "day" ? "active" : ""}
            onClick={() => onTrendTypeChange("day")}
          >
            일별
          </button>
          <button
            type="button"
            className={trendType === "month" ? "active" : ""}
            onClick={() => onTrendTypeChange("month")}
          >
            월별
          </button>
          <button
            type="button"
            className={trendType === "year" ? "active" : ""}
            onClick={() => onTrendTypeChange("year")}
          >
            연도별
          </button>
        </div>
      </div>

      <div className="chart-body trend">
        {!trend || trend.length === 0 ? (
          <div className="chart-empty">표시할 매출 데이터가 없습니다.</div>
        ) : (
          trend.map((item) => (
            <div key={item.label} className="chart-bar-wrapper">
              <div className="chart-bar">
                <div
                  className="chart-bar-fill"
                  style={{
                    height: `${toTrendHeight(item.total)}%`,
                    backgroundColor: "#0ea5e9",
                  }}
                  title={`${item.total.toLocaleString()}원 (${item.count}건)`}
                />
              </div>
              <div className="chart-bar-label">{item.label}</div>
              <div className="chart-bar-value">
                {item.total.toLocaleString()}원
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerChartArea;


