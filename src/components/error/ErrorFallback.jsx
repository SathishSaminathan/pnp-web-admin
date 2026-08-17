import React from 'react';
import { Button, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Enterprise-grade error fallback UI.
 *
 * Features:
 * - Clean, professional fintech design (no scary red screens)
 * - Friendly title and description
 * - Retry button with configurable action
 * - Optional error reference ID for support tickets
 * - Never exposes stack trace in production
 * - Responsive layout
 * - Variant support (full-page vs inline)
 */
const ErrorFallback = ({
  title = 'Something went wrong',
  description = "We're working on fixing this issue. Please try again.",
  onRetry,
  onGoHome,
  errorId,
  variant = 'page', // 'page' | 'inline'
  showHomeButton = false,
}) => {
  const isFullPage = variant === 'page';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${
        isFullPage ? 'min-h-[60vh]' : 'min-h-[300px]'
      }`}
    >
      {/* Icon */}
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <Title level={4} className="!mb-2 !text-gray-800">
        {title}
      </Title>

      {/* Description */}
      <Text className="text-gray-500 max-w-md block mb-6">
        {description}
      </Text>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {onRetry && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRetry}
            size="middle"
          >
            Try Again
          </Button>
        )}
        {showHomeButton && (
          <Button
            icon={<HomeOutlined />}
            onClick={onGoHome || (() => { window.location.href = '/'; })}
            size="middle"
          >
            Go to Dashboard
          </Button>
        )}
      </div>

      {/* Error Reference ID (for support) */}
      {errorId && (
        <Text className="text-gray-400 text-xs mt-6 block">
          Reference: {errorId}
        </Text>
      )}
    </div>
  );
};

export default ErrorFallback;
