import { NavLink } from "react-router-dom";

const OwnerSidebar = () => {
  const menuItems = [
    { path: "/owner/dashboard", label: "대시보드", icon: "📊" },
    { path: "/owner/hotels", label: "호텔 관리", icon: "🏨" },
    { path: "/owner/reservations", label: "예약 관리", icon: "📅" },
    { path: "/owner/reviews", label: "리뷰 관리", icon: "⭐" },
    { path: "/owner/coupons", label: "쿠폰 관리", icon: "🎫" },
    { path: "/owner/me", label: "내 정보", icon: "👤" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-inner">
        <div className="sidebar-logo">
          <h2>사업자 관리</h2>
        </div>
        <nav>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default OwnerSidebar;

