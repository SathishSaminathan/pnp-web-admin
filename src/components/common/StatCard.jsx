import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const StatCard = ({ title, value, prefix, suffix, trend, trendValue, icon, loading = false }) => {
    return (
        <Card className="shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full" loading={loading}>
            <div className="flex justify-between items-start">
                <div>
                    <Text className="font-medium uppercase tracking-wider text-xs text-gray-500">{title}</Text>
                    <div className="flex items-baseline gap-1 !mt-2 !mb-0">
                        {prefix && <span className="text-xl text-gray-400 font-medium">{prefix}</span>}
                        <Title level={3} className="!m-0">{value}</Title>
                        {suffix && <span className="text-gray-500">{suffix}</span>}
                    </div>
                </div>

                {icon && (
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-lg">
                        {icon}
                    </div>
                )}
            </div>

            {(trend || trendValue) && (
                <div className="mt-4 flex items-center gap-2">
                    {trendValue && (
                        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(trendValue)}%
                        </span>
                    )}
                    <span className="text-gray-400 text-sm font-medium">from last period</span>
                </div>
            )}
        </Card>
    );
};

export default StatCard;
