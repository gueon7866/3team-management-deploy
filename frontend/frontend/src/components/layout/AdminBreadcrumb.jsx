import { Link, useLocation } from "react-router-dom";

const AdminBreadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    admin: "관리자",
    dashboard: "대시보드",
    hotels: "호텔 관리",
    bookings: "예약 관리",
    users: "회원 관리",
    reviews: "리뷰 관리",
    coupons: "쿠폰 관리",
    settings: "설정",
    me: "내 정보",
    new: "새로 만들기",
    edit: "수정",
  };

  return (
    <nav className="breadcrumb">
      <Link to="/admin">홈</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name;

        return isLast ? (
          <span key={name}> / {displayName}</span>
        ) : (
          <span key={name}>
            {" / "}
            <Link to={routeTo}>{displayName}</Link>
          </span>
        );
      })}
    </nav>
  );
};

export default AdminBreadcrumb;
