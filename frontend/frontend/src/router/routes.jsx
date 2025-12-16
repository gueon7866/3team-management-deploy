import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import OwnerRegisterPage from "../pages/auth/OwnerRegisterPage";

// Admin Pages
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminHotelListPage from "../pages/admin/AdminHotelListPage";
import AdminUserListPage from "../pages/admin/AdminUserListPage";
import AdminReviewListPage from "../pages/admin/AdminReviewListPage";
import AdminCouponListPage from "../pages/admin/AdminCouponListPage";
import AdminCouponCreatePage from "../pages/admin/AdminCouponCreatePage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";
import AdminMyProfilePage from "../pages/admin/AdminMyProfilePage";

// Owner Pages
import OwnerLayout from "../components/layout/OwnerLayout";
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage";
import OwnerHotelListPage from "../pages/owner/OwnerHotelListPage";
import OwnerHotelDetailPage from "../pages/owner/OwnerHotelDetailPage";
import OwnerReservationListPage from "../pages/owner/OwnerReservationListPage";
import OwnerReviewListPage from "../pages/owner/OwnerReviewListPage";
import OwnerCouponListPage from "../pages/owner/OwnerCouponListPage";
import OwnerSettingsPage from "../pages/owner/OwnerSettingsPage";
import OwnerMyProfilePage from "../pages/owner/OwnerMyProfilePage";

export const routes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/owner/register",
    element: <OwnerRegisterPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "hotels",
        element: <AdminHotelListPage />,
      },
      {
        path: "users",
        element: <AdminUserListPage />,
      },
      {
        path: "reviews",
        element: <AdminReviewListPage />,
      },
      {
        path: "coupons",
        element: <AdminCouponListPage />,
      },
      {
        path: "coupons/new",
        element: <AdminCouponCreatePage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
      {
        path: "me",
        element: <AdminMyProfilePage />,
      },
    ],
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["owner"]}>
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/owner/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <OwnerDashboardPage />,
      },
      {
        path: "hotels",
        element: <OwnerHotelListPage />,
      },
      {
        path: "hotels/:hotelId",
        element: <OwnerHotelDetailPage />,
      },
      {
        path: "reservations",
        element: <OwnerReservationListPage />,
      },
      {
        path: "reviews",
        element: <OwnerReviewListPage />,
      },
      {
        path: "coupons",
        element: <OwnerCouponListPage />,
      },
      {
        path: "settings",
        element: <OwnerSettingsPage />,
      },
      {
        path: "me",
        element: <OwnerMyProfilePage />,
      },
    ],
  },
];

export default routes;

