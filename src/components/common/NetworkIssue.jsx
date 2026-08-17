import React, { useEffect, useRef, useState } from 'react';
import { DisconnectOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const NetworkIssue = () => {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);
    const timerRef = useRef(null);
    const { isDark } = useTheme();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowRestored(true);
            timerRef.current = setTimeout(() => setShowRestored(false), 3200);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowRestored(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (isOnline && !showRestored) return null;

    const successColor = isDark ? '#4ade80' : '#16a34a';

    return (
        <div
            key={showRestored ? 'restored' : 'offline'}
            className="network-issue-container"
        >
            {showRestored ? (
                <div className="network-issue-card network-issue-card--restored">
                    <div className="network-issue-icon-wrap network-issue-icon-wrap--success">
                        <CheckCircleOutlined style={{ fontSize: 18, color: successColor }} />
                    </div>
                    <div className="network-issue-text">
                        <p className="network-issue-title network-issue-title--success">Back online!</p>
                        <p className="network-issue-subtitle">Your connection has been restored.</p>
                    </div>
                </div>
            ) : (
                <div className="network-issue-card network-issue-card--offline">
                    <div className="network-issue-icon-wrap network-issue-icon-wrap--error">
                        <span className="network-issue-pulse-ring" />
                        <DisconnectOutlined style={{ fontSize: 18, color: '#dc2626' }} />
                    </div>
                    <div className="network-issue-text">
                        <p className="network-issue-title">No Internet Connection</p>
                        <p className="network-issue-subtitle">
                            Trying to reconnect
                            <span className="network-issue-dots">
                                <span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkIssue;
