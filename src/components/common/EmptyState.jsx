import React from 'react';
import { Empty, Button } from 'antd';

const EmptyState = ({
    title = 'No Data Available',
    description = 'There is currently no data to display in this section.',
    actionLabel,
    onAction,
    icon
}) => {
    return (
        <div className="bg-white p-12 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
            <Empty
                image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <p className="text-gray-500 mt-1">{description}</p>
                    </div>
                }
            >
                {actionLabel && onAction && (
                    <Button type="primary" onClick={onAction} className="mt-4">
                        {actionLabel}
                    </Button>
                )}
            </Empty>
        </div>
    );
};

export default EmptyState;
