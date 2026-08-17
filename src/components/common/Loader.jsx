import React from 'react';
import { Spin } from 'antd';

const Loader = ({ tip = 'Loading...', fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-8">
            <Spin size="large" />
            {tip && <p className="mt-4 text-gray-500 font-medium">{tip}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
            {content}
        </div>
    );
};

export default Loader;
