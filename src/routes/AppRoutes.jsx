import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PageErrorBoundary, AsyncErrorBoundary } from '../components/error';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import { RoutePageSkeleton } from '../components/common/skeletons';

const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const UsersList = lazy(() => import('../pages/users/UsersList'));
const OwnersList = lazy(() => import('../pages/owners/OwnersList'));
const ListingsList = lazy(() => import('../pages/listings/ListingsList'));
const HistoryList = lazy(() => import('../pages/history/HistoryList'));
const ReviewsList = lazy(() => import('../pages/reviews/ReviewsList'));
const EarningsPage = lazy(() => import('../pages/earnings/EarningsPage'));
const MasterDataPage = lazy(() => import('../pages/master/MasterDataPage'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const SendPushPage = lazy(() => import('../pages/notifications/SendPushPage'));

const PageLoader = () => <RoutePageSkeleton />;

const NotFound = () => <div className="p-12 text-center text-gray-500">404 - Page Not Found</div>;

const ProtectedPageRoute = ({ children }) => {
  const location = useLocation();
  return (
    <PageErrorBoundary key={location.pathname}>
      <AsyncErrorBoundary>
        {children}
      </AsyncErrorBoundary>
    </PageErrorBoundary>
  );
};

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
                    <Route path="/reset-password/:token" element={<Navigate to="/login" replace />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<ProtectedPageRoute><Dashboard /></ProtectedPageRoute>} />
                        <Route path="/users" element={<ProtectedPageRoute><UsersList /></ProtectedPageRoute>} />
                        <Route path="/owners" element={<ProtectedPageRoute><OwnersList /></ProtectedPageRoute>} />
                        <Route path="/listings" element={<ProtectedPageRoute><ListingsList /></ProtectedPageRoute>} />
                        <Route path="/history" element={<ProtectedPageRoute><HistoryList /></ProtectedPageRoute>} />
                        <Route path="/reviews" element={<ProtectedPageRoute><ReviewsList /></ProtectedPageRoute>} />
                        <Route path="/earnings" element={<ProtectedPageRoute><EarningsPage /></ProtectedPageRoute>} />
                        <Route path="/master-data" element={<ProtectedPageRoute><MasterDataPage /></ProtectedPageRoute>} />
                        <Route path="/push-notifications" element={<ProtectedPageRoute><SendPushPage /></ProtectedPageRoute>} />
                        <Route path="/notifications" element={<ProtectedPageRoute><SendPushPage /></ProtectedPageRoute>} />
                        <Route path="/settings" element={<ProtectedPageRoute><Settings /></ProtectedPageRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
