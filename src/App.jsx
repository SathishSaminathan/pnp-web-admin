import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme as antTheme } from 'antd';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PageErrorBoundary } from './components/error';
import NetworkIssue from './components/common/NetworkIssue';

const ThemedApp = () => {
    const { isDark } = useTheme();

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#2563eb',
                    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
                    borderRadius: 8,
                    colorBgContainer: isDark ? '#1e2a3a' : '#ffffff',
                    colorBgElevated: isDark ? '#243044' : '#ffffff',
                    colorBorderSecondary: isDark ? '#2d3f55' : '#f0f0f0',
                    colorText: isDark ? '#e2e8f0' : '#111827',
                    colorTextSecondary: isDark ? '#94a3b8' : '#6b7280',
                },
                components: {
                    Table: {
                        colorBgContainer: 'transparent',
                        headerBg: 'transparent',
                        rowHoverBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: isDark ? '#2d3f55' : '#f1f5f9',
                    },
                    Card: {
                        colorBgContainer: isDark ? '#1e2a3a' : '#ffffff',
                    },
                    Modal: {
                        colorBgElevated: isDark ? '#1e2a3a' : '#ffffff',
                    },
                    Dropdown: {
                        colorBgElevated: isDark ? '#243044' : '#ffffff',
                    },
                    Menu: {
                        itemBg: 'transparent',
                        subMenuItemBg: 'transparent',
                    },
                },
            }}
        >
            <BrowserRouter>
                <PageErrorBoundary pageName="app-shell">
                    <AuthProvider>
                        <AppRoutes />
                        <NetworkIssue />
                    </AuthProvider>
                </PageErrorBoundary>
            </BrowserRouter>
        </ConfigProvider>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    );
};

export default App;
