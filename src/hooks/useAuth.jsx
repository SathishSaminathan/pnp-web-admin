import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/modules/auth';
import { notifySuccess } from '../utils/notification';
import { setCookie, removeCookie, getCookie, AUTH_KEY, TOKEN_KEY, USER_ID_KEY } from '../utils/cookies';
import useIdleTimeout from './useIdleTimeout';
import logger, { setLoggerUserId } from '../services/logger';
import monitoring from '../services/monitoring';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    // Always-current ref — unlike state, this is readable inside stale async callbacks
    const userRef = useRef(null);

    const setUserSynced = (data) => {
        userRef.current = data;
        setUser(data);
    };

    const [isAuthenticated, setIsAuthenticated] = useState(
        getCookie(AUTH_KEY) === 'true'
    );

    // Re-hydrate user profile on page refresh when cookie says authenticated.
    // IMPORTANT: we use `userRef` (not state) in the async callbacks so a
    // stale getProfile() response that arrives AFTER a fresh MFA login never
    // clears the newly-established session.
    useEffect(() => {
        if (getCookie(AUTH_KEY) !== 'true') return;

        const userId = getCookie(USER_ID_KEY);
        if (!userId) return;

        authApi.getUserProfile(userId)
            .then((res) => {
                // If the user already logged in while this request was in-flight, skip
                if (userRef.current) return;
                const adminData = res?.data?.data ?? null;
                setUserSynced(adminData);
            })
            .catch(() => {
                // Only clear the session if the user hasn't freshly authenticated
                // in the time this request was in-flight (race condition guard)
                if (userRef.current) return;
                removeCookie(AUTH_KEY);
                removeCookie(TOKEN_KEY);
                removeCookie(USER_ID_KEY);
                setIsAuthenticated(false);
                navigate('/login');
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [idleEnabled, setIdleEnabledState] = useState(
        () => localStorage.getItem('idleTimeoutEnabled') === 'true'
    );
    const [idleMinutes, setIdleMinutesState] = useState(
        () => {
            const stored = localStorage.getItem('idleTimeoutMinutes');
            const parsed = Number(stored);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
        }
    );

    const setIdleEnabled = (val) => {
        localStorage.setItem('idleTimeoutEnabled', val ? 'true' : 'false');
        setIdleEnabledState(val);
    };
    const setIdleMinutes = (val) => {
        localStorage.setItem('idleTimeoutMinutes', String(val));
        setIdleMinutesState(val);
    };

    const login = async (credentials) => {
        // axios interceptor already unwraps response.data, so `response` = API body:
        // { success, message, data: { requiresMFA?, userId?, admin?, ... } }
        const response = await authApi.login(credentials);
        const payload = response?.data ?? response;

        // Backend returns requiresMFA (uppercase FA)
        if (payload?.requiresMFA || payload?.requiresMfa) {
            return { requiresMfa: true, tempUserId: payload.userId ?? payload.tempUserId };
        }

        await handleLoginSuccess(response);
        return { success: true };
    };

    const verifyMfa = async (userId, mfaCode) => {
        const response = await authApi.verifyMfa(userId, mfaCode);
        await handleLoginSuccess(response);
        return { success: true };
    };

    const handleLoginSuccess = async (apiResponse) => {
        const token = apiResponse?.data?.token;
        const basicUserData = apiResponse?.data?.userData ?? null;
        const userId = basicUserData?.userId || basicUserData?.id || basicUserData?._id;

        setCookie(AUTH_KEY, 'true');
        if (token) setCookie(TOKEN_KEY, token);
        if (userId) setCookie(USER_ID_KEY, userId);
        setIsAuthenticated(true);

        // Fetch full profile using the userId from login response
        let adminData = basicUserData;
        if (userId) {
            try {
                const profileRes = await authApi.getUserProfile(userId);
                adminData = profileRes?.data?.data ?? basicUserData;
            } catch {
                // Fall back to basic login data if profile fetch fails
            }
        }

        setUserSynced(adminData);  // updates both ref and state

        // Set user context for logging and monitoring
        setLoggerUserId(userId);
        monitoring.setUser(adminData);

        logger.info('Login successful', { userId });
        notifySuccess(apiResponse?.message || 'Login successful');
        navigate('/');
    };

    const logout = async () => {
        // TODO: re-enable once logout API is fixed (currently returns 400)
        // try {
        //     await authApi.logout();
        // } catch (e) {
        //     logger.warn('Logout API failed or session already invalid', { error: e?.message });
        // }
        removeCookie(AUTH_KEY);
        removeCookie(TOKEN_KEY);
        removeCookie(USER_ID_KEY);
        setIsAuthenticated(false);
        setUserSynced(null);  // clears both ref and state
        setLoggerUserId(null);
        monitoring.setUser(null);
        logger.info('User logged out');
        navigate('/login');
        notifySuccess('Logged out successfully');
    };

    useIdleTimeout({
        enabled: isAuthenticated && idleEnabled,
        timeoutMinutes: idleMinutes,
        onTimeout: logout,
    });

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            verifyMfa,
            logout,
            idleEnabled,
            idleMinutes,
            setIdleEnabled,
            setIdleMinutes,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };


