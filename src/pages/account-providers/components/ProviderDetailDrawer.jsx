import React, { useEffect, useState } from 'react';
import { Drawer, Tag, Button, Divider, Spin, Space, Switch, Tooltip } from 'antd';
import {
    CloseOutlined,
    EditOutlined,
    DollarOutlined,
    TeamOutlined,
    HeartOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { accountProvidersApi } from '../../../api/modules/accountProviders';
import { formatInteger } from '../../../utils/number.utils';
import { HealthStatusTag, EnabledStatusTag } from './ProviderTags';

const ProviderDetailDrawer = ({ open, providerId, onClose, onEdit }) => {
    const [provider, setProvider] = useState(null);
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        if (!open || !providerId) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await accountProvidersApi.getById(providerId);
                if (!cancelled) setProvider(res?.data ?? res);
            } catch {
                // error toast handled by axios interceptor
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [open, providerId]);

    const handleClose = () => {
        onClose();
        setProvider(null);
    };

    return (
        <Drawer
            title={
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                        Provider Details
                    </span>
                    {provider && (
                        <Space>
                            <Tooltip title="Edit Provider">
                                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(provider)}>
                                    Edit
                                </Button>
                            </Tooltip>
                        </Space>
                    )}
                </div>
            }
            placement="right"
            width={520}
            onClose={handleClose}
            open={open}
            closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin />
                </div>
            ) : provider ? (
                <div className="space-y-6">
                    {/* Identity */}
                    <div
                        className="rounded-xl p-5"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {(provider.providerName || 'P')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-lg m-0" style={{ color: 'var(--text-primary)' }}>
                                    {provider.providerName}
                                </p>
                                <code className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                    {provider.providerCode}
                                </code>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <EnabledStatusTag isEnabled={provider.isEnabled} />
                            <HealthStatusTag status={provider.metadata?.healthStatus} />
                            {provider.priority != null && (
                                <Tag color="default" style={{ borderRadius: 20 }}>
                                    Priority: {provider.priority}
                                </Tag>
                            )}
                        </div>

                        {provider.description && (
                            <p className="text-sm mt-3 mb-0" style={{ color: 'var(--text-secondary)' }}>
                                {provider.description}
                            </p>
                        )}
                    </div>

                    {/* Currencies */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                           style={{ color: 'var(--text-muted)' }}>
                            <DollarOutlined /> Supported Currencies
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(provider.supportedCurrencies ?? []).length === 0 ? (
                                <span style={{ color: 'var(--text-muted)' }} className="text-sm">No currencies added</span>
                            ) : (
                                provider.supportedCurrencies.map((c) => (
                                    <Tag
                                        key={c.currencyCode}
                                        color={c.isEnabled ? 'blue' : 'default'}
                                        style={{ borderRadius: 20, fontWeight: 600 }}
                                    >
                                        {c.currencyCode}
                                        {!c.isEnabled && <span className="ml-1 opacity-60">(disabled)</span>}
                                    </Tag>
                                ))
                            )}
                        </div>
                    </div>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                    {/* Eligibility */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                           style={{ color: 'var(--text-muted)' }}>
                            <TeamOutlined /> User Eligibility
                        </p>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Switch size="small" checked={provider.eligibility?.usUsers} disabled />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>US Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch size="small" checked={provider.eligibility?.nonUsUsers} disabled />
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Non-US Users</span>
                            </div>
                        </div>
                    </div>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                    {/* Configuration */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                           style={{ color: 'var(--text-muted)' }}>
                            <InfoCircleOutlined /> Configuration
                        </p>
                        <div className="flex flex-col gap-2">
                            {provider.priority != null && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Priority</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{provider.priority}</span>
                                </div>
                            )}
                            {provider.credentials?.environment && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Environment</span>
                                    <Tag color={provider.credentials.environment === 'production' ? 'green' : 'orange'} style={{ borderRadius: 12, margin: 0 }}>
                                        {provider.credentials.environment}
                                    </Tag>
                                </div>
                            )}
                            {provider.webhookUrl && (
                                <div className="flex justify-between items-center text-sm gap-2">
                                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                                        <LinkOutlined className="mr-1" />Webhook URL
                                    </span>
                                    <span
                                        className="text-xs truncate"
                                        style={{ color: 'var(--text-secondary)', maxWidth: 220, direction: 'ltr' }}
                                        title={provider.webhookUrl}
                                    >
                                        {provider.webhookUrl}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {(provider.rateLimits?.requestsPerMinute != null || provider.rateLimits?.requestsPerDay != null) && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                                   style={{ color: 'var(--text-muted)' }}>
                                    <ThunderboltOutlined /> Rate Limits
                                </p>
                                <div className="flex gap-6">
                                    {provider.rateLimits?.requestsPerMinute != null && (
                                        <div className="flex flex-col">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Per Minute</span>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {provider.rateLimits.requestsPerMinute}
                                            </span>
                                        </div>
                                    )}
                                    {provider.rateLimits?.requestsPerDay != null && (
                                        <div className="flex flex-col">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Per Day</span>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {formatInteger(provider.rateLimits.requestsPerDay)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                    {/* Metadata */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                           style={{ color: 'var(--text-muted)' }}>
                            <HeartOutlined /> Activity
                        </p>
                        <div className="flex flex-col gap-2">
                            {provider.metadata?.totalAccountsCreated != null && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Total Accounts</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {formatInteger(provider.metadata.totalAccountsCreated)}
                                    </span>
                                </div>
                            )}
                            {provider.metadata?.lastUsed && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Last Used</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {new Date(provider.metadata.lastUsed).toLocaleString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                            {provider.metadata?.lastHealthCheck && (
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: 'var(--text-muted)' }}>Last Health Check</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {new Date(provider.metadata.lastHealthCheck).toLocaleString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                    {/* Timestamps */}
                    <div className="flex flex-col gap-2">
                        {provider.createdAt && (
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Created</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(provider.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        {provider.updatedAt && (
                            <div className="flex justify-between text-sm">
                                <span style={{ color: 'var(--text-muted)' }}>Last Updated</span>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(provider.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-64 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Provider not found.
                </div>
            )}
        </Drawer>
    );
};

export default ProviderDetailDrawer;
