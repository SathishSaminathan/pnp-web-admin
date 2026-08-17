import React from 'react';
import { Breadcrumb, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PageHeader = ({ title, description, breadcrumbs = [], primaryAction, secondaryAction }) => {
    const navigate = useNavigate();

    return (
        <div className="mb-6">
            {breadcrumbs.length > 0 && (
                <Breadcrumb
                    className="mb-2 text-sm text-gray-500"
                    items={[
                        { title: <a onClick={() => navigate('/')}>Home</a> },
                        ...breadcrumbs.map(bc => ({
                            title: bc.path ? <a onClick={() => navigate(bc.path)}>{bc.title}</a> : bc.title
                        }))
                    ]}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Title level={2} className="!mb-1 !text-2xl">{title}</Title>
                    {description && <Text className="text-gray-500">{description}</Text>}
                </div>

                {(primaryAction || secondaryAction) && (
                    <div className="flex items-center gap-3">
                        {secondaryAction && (
                            <Button onClick={secondaryAction.onClick} {...secondaryAction.props}>
                                {secondaryAction.label}
                            </Button>
                        )}
                        {primaryAction && (
                            <Button type="primary" onClick={primaryAction.onClick} {...primaryAction.props}>
                                {primaryAction.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
