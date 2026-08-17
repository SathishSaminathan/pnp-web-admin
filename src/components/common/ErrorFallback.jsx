import React from 'react';
import { Result, Button } from 'antd';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const handleGoHome = () => {
        if (resetErrorBoundary) resetErrorBoundary();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Result
                status="500"
                title="Something went wrong"
                subTitle={error?.message || "An unexpected error occurred in the application."}
                extra={[
                    <Button
                        key="home"
                        type="primary"
                        onClick={handleGoHome}
                    >
                        Back Home
                    </Button>,
                    <Button
                        key="retry"
                        onClick={() => {
                            if (resetErrorBoundary) resetErrorBoundary();
                            else window.location.reload();
                        }}
                    >
                        Try Again
                    </Button>,
                ]}
            />
        </div>
    );
};

export default ErrorFallback;
