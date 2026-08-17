import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { PageErrorBoundary, AsyncErrorBoundary } from '../components/error';

// Layouts (loaded eagerly - always needed)
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';

// Auth pages (loaded eagerly - first paint)
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Lazy-loaded pages (code splitting)
const SecuritySettings = lazy(() => import('../pages/auth/SecuritySettings'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const UsersList = lazy(() => import('../pages/users/UsersList'));
const UserDetailPage = lazy(() => import('../pages/users/UserDetailPage'));
const ProvidersList = lazy(() => import('../pages/providers/ProvidersList'));
const AccountProvidersList = lazy(() => import('../pages/account-providers/AccountProvidersList'));
const RequestsList = lazy(() => import('../pages/requests/RequestsList'));
const TransactionsList = lazy(() => import('../pages/transactions/TransactionsList'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const KycList = lazy(() => import('../pages/kyc/KycList'));
const KycReviewPage = lazy(() => import('../pages/kyc/KycReviewPage'));
const Notifications = lazy(() => import('../pages/notifications/Notifications'));
const BankAccountRequestsList = lazy(() => import('../pages/bank-account-requests/BankAccountRequestsList'));
const IdentityProvidersList = lazy(() => import('../pages/identity-providers/IdentityProvidersList'));
const MposRequestsList = lazy(() => import('../pages/mpos/MposRequestsList'));
const MdrConfigList = lazy(() => import('../pages/mdr/MdrConfigList'));
const VirtualAccountsList = lazy(() => import('../pages/virtual-accounts/VirtualAccountsList'));
const WalletsList = lazy(() => import('../pages/wallets/WalletsList'));
const BeneficiariesList = lazy(() => import('../pages/beneficiaries/BeneficiariesList'));
const LinkedBankAccountsList = lazy(() => import('../pages/linked-bank-accounts/LinkedBankAccountsList'));
const LinkedWalletsList = lazy(() => import('../pages/linked-wallets/LinkedWalletsList'));
const CurrencyList = lazy(() => import('../pages/currency/CurrencyList'));
const ExchangeRateList = lazy(() => import('../pages/exchange-rates/ExchangeRateList'));
const CreditTransactionsList = lazy(() => import('../pages/credit-transactions/CreditTransactionsList'));
const AdminWalletsList = lazy(() => import('../pages/admin-wallets/AdminWalletsList'));
const NoahCustodyWalletsList = lazy(() => import('../pages/noah-custody-wallets/NoahCustodyWalletsList'));
const UserSessionsList = lazy(() => import('../pages/user-sessions/UserSessionsList'));
const UserDevicesList = lazy(() => import('../pages/user-devices/UserDevicesList'));
const UserOtpsList = lazy(() => import('../pages/user-otps/UserOtpsList'));
const GeographyPage = lazy(() => import('../pages/geography/GeographyPage'));
const BookingsList = lazy(() => import('../pages/bookings/BookingsList'));

// Suspense fallback
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
    </div>
);

// Placeholder Analytics
const Analytics = () => <div className="p-6 bg-white rounded-lg shadow-sm">Analytics coming soon...</div>;
const NotFound = () => <div className="p-12 text-center text-gray-500">404 - Page Not Found</div>;

/**
 * Route wrapper that provides page-level error isolation.
 * Resets error state automatically on route change via key prop.
 */
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
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<ProtectedPageRoute><Dashboard /></ProtectedPageRoute>} />
                        <Route path="/analytics" element={<ProtectedPageRoute><Analytics /></ProtectedPageRoute>} />

                        {/* Dynamic Module Routes */}
                        <Route path="/users" element={<ProtectedPageRoute><UsersList /></ProtectedPageRoute>} />
                        <Route path="/bookings" element={<ProtectedPageRoute><BookingsList /></ProtectedPageRoute>} />
                        <Route path="/users/:id" element={<ProtectedPageRoute><UserDetailPage /></ProtectedPageRoute>} />
                        <Route path="/providers" element={<ProtectedPageRoute><ProvidersList /></ProtectedPageRoute>} />
                        <Route path="/requests" element={<ProtectedPageRoute><RequestsList /></ProtectedPageRoute>} />
                        <Route path="/transactions" element={<ProtectedPageRoute><TransactionsList /></ProtectedPageRoute>} />
                        <Route path="/settings" element={<ProtectedPageRoute><Settings /></ProtectedPageRoute>} />
                        <Route path="/security-settings" element={<ProtectedPageRoute><SecuritySettings /></ProtectedPageRoute>} />
                        <Route path="/kyc" element={<ProtectedPageRoute><KycList /></ProtectedPageRoute>} />
                        <Route path="/kyc/:id" element={<ProtectedPageRoute><KycReviewPage /></ProtectedPageRoute>} />
                        <Route path="/notifications" element={<ProtectedPageRoute><Notifications /></ProtectedPageRoute>} />
                        <Route path="/bank-account-requests" element={<ProtectedPageRoute><BankAccountRequestsList /></ProtectedPageRoute>} />
                        <Route path="/account-providers" element={<ProtectedPageRoute><AccountProvidersList /></ProtectedPageRoute>} />
                        <Route path="/identity-providers" element={<ProtectedPageRoute><IdentityProvidersList /></ProtectedPageRoute>} />
                        <Route path="/mpos-requests" element={<ProtectedPageRoute><MposRequestsList /></ProtectedPageRoute>} />
                        <Route path="/mdr-config" element={<ProtectedPageRoute><MdrConfigList /></ProtectedPageRoute>} />
                        <Route path="/virtual-accounts" element={<ProtectedPageRoute><VirtualAccountsList /></ProtectedPageRoute>} />
                        <Route path="/wallets" element={<ProtectedPageRoute><WalletsList /></ProtectedPageRoute>} />
                        <Route path="/beneficiaries" element={<ProtectedPageRoute><BeneficiariesList /></ProtectedPageRoute>} />
                        <Route path="/linked-bank-accounts" element={<ProtectedPageRoute><LinkedBankAccountsList /></ProtectedPageRoute>} />
                        <Route path="/linked-wallets" element={<ProtectedPageRoute><LinkedWalletsList /></ProtectedPageRoute>} />
                        <Route path="/currencies" element={<ProtectedPageRoute><CurrencyList /></ProtectedPageRoute>} />
                        <Route path="/exchange-rates" element={<ProtectedPageRoute><ExchangeRateList /></ProtectedPageRoute>} />
                        <Route path="/credit-transactions" element={<ProtectedPageRoute><CreditTransactionsList /></ProtectedPageRoute>} />
                        <Route path="/admin-wallets" element={<ProtectedPageRoute><AdminWalletsList /></ProtectedPageRoute>} />
                        <Route path="/noah-custody-wallets" element={<ProtectedPageRoute><NoahCustodyWalletsList /></ProtectedPageRoute>} />
                        <Route path="/user-sessions" element={<ProtectedPageRoute><UserSessionsList /></ProtectedPageRoute>} />
                        <Route path="/user-devices" element={<ProtectedPageRoute><UserDevicesList /></ProtectedPageRoute>} />
                        <Route path="/user-otps" element={<ProtectedPageRoute><UserOtpsList /></ProtectedPageRoute>} />
                        <Route path="/geography" element={<ProtectedPageRoute><GeographyPage /></ProtectedPageRoute>} />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
