import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Button, Popconfirm } from 'antd';
import {
    CloseOutlined,
    GlobalOutlined,
    EditOutlined,
    StopOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { formatInteger } from '../../utils/number.utils';
import CountryFlag from '../../components/common/CountryFlag';

const labelStyle   = { color: 'var(--text-muted)',    fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)',  fontWeight: 500 };

const TYPE_CONFIG = {
    Fiat:   { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
    Crypto: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
};

const CurrencyDetailDrawer = ({
    open,
    record,
    onClose,
    onEdit,
    onToggle,
    onDelete,
    actionLoading,
}) => {
    const item = record ?? {};
    const typeCfg = TYPE_CONFIG[item.type] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' };

    return (
        <Drawer
            placement="right"
            width={520}
            open={open}
            onClose={onClose}
            closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                        <GlobalOutlined style={{ color: '#6366f1', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Currency Details</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            {record && (
                <div className="space-y-6">
                    {/* Logo + Badges */}
                    {item.logo && (
                        <div className="flex items-center gap-3 mb-2">
                            <img src={item.logo} alt={item.name} className="w-10 h-10 rounded-full object-contain"
                                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-elevated, #fff)' }}
                                onError={(e) => { e.target.style.display = 'none'; }} />
                            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        <Tag style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.border}`, color: typeCfg.color, fontWeight: 600, fontSize: 13 }}>
                            {item.type ?? '—'}
                        </Tag>
                        {item.accountType && (
                            <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                                {item.accountType}
                            </Tag>
                        )}
                        <Tag style={{
                            background: item.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                            border:     `1px solid ${item.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                            color:      item.isActive ? '#10b981' : '#6b7280',
                            fontWeight: 600,
                        }}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>

                    {/* Core Info */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="ID">{item._id ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Currency Code / Name">{item.name ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Type">{item.type ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Account Type">{item.accountType ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Phone Code">{item.countryCode ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Country">
                            <div className="flex items-center gap-2">
                                <CountryFlag
                                    countryCode={item?.country?.isoCode}
                                    size={18}
                                    showFallbackText={false}
                                />
                                <span>
                                    {item?.country?.name ?? (typeof item?.country === 'string' ? item?.country : '—')}
                                </span>
                            </div>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Limits */}
                    <Descriptions
                        title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Transaction Limits</span>}
                        column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                    >
                        <Descriptions.Item label="Per Day Limit">
                            {item.perDayTransactionLimit != null
                                ? formatInteger(item.perDayTransactionLimit)
                                : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Per Month Limit">
                            {item.perMonthTransactionLimit != null
                                ? formatInteger(item.perMonthTransactionLimit)
                                : '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Transaction Fees */}
                    {Array.isArray(item.transactionFee) && item.transactionFee.length > 0 && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <div>
                                <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Transaction Fees</p>
                                <div className="space-y-2">
                                    {item.transactionFee.map((fee, i) => (
                                        <div key={i} className="rounded-lg p-3"
                                            style={{ background: 'var(--bg-elevated, rgba(99,102,241,0.04))', border: '1px solid var(--border-color)' }}>
                                            {/* Header: payment method + settlement days */}
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {fee.paymentMethod ?? `Method ${i + 1}`}
                                                </span>
                                                {fee.settlementDays != null && (
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        {fee.settlementDays}d settlement
                                                    </span>
                                                )}
                                            </div>
                                            {/* Individual fees */}
                                            {Array.isArray(fee.fees) && fee.fees.map((f, j) => (
                                                <div key={j} className="mt-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                                            {f.name}
                                                            {f.shouldDeduct === false && (
                                                                <Tag style={{
                                                                    background: 'rgba(245,158,11,0.1)',
                                                                    border:     '1px solid rgba(245,158,11,0.3)',
                                                                    color:      '#f59e0b',
                                                                    fontSize:   10,
                                                                    fontWeight: 600,
                                                                    padding:    '0 6px',
                                                                    lineHeight: '16px',
                                                                    margin:     0,
                                                                }}>
                                                                    Display only
                                                                </Tag>
                                                            )}
                                                        </span>
                                                        <span className="text-xs font-bold" style={{ color: '#6366f1' }}>
                                                            {f.type === 'Slab'
                                                                ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Slab — see bands below)</span>
                                                                : <>{f.amount} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({f.type})</span></>}
                                                        </span>
                                                    </div>
                                                    {f.type === 'Slab' && Array.isArray(f.slabs) && f.slabs.length > 0 && (
                                                        <div className="ml-3 mt-1 space-y-1">
                                                            {f.slabs.map((band, k) => (
                                                                <div key={k} className="flex justify-between items-center text-xs"
                                                                    style={{ color: 'var(--text-muted)' }}>
                                                                    <span>
                                                                        [{band.minAmount}–{band.maxAmount === '' || band.maxAmount == null ? '∞' : band.maxAmount})
                                                                    </span>
                                                                    <span style={{ color: '#6366f1', fontWeight: 600 }}>
                                                                        {band.amount} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({band.type})</span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {f.description && (
                                                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.description}</div>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Min / Max amounts */}
                                            {(fee.minimumAmount || fee.maximumAmount) && (
                                                <div className="flex gap-4 mt-2">
                                                    {fee.minimumAmount && (
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Min: {fee.minimumAmount}</span>
                                                    )}
                                                    {fee.maximumAmount && (
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Max: {fee.maximumAmount}</span>
                                                    )}
                                                </div>
                                            )}
                                            {/* Service provider */}
                                            {fee.serviceProvider?.providerName && (
                                                <div className="mt-1">
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        Provider: {fee.serviceProvider.providerName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Timestamps */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Created">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Updated">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Actions */}
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                    <div className="flex flex-wrap gap-2">
                        <Button icon={<EditOutlined />} onClick={() => onEdit(item)}>
                            Edit
                        </Button>
                        <Button
                            icon={item.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                            loading={actionLoading === 'toggle'}
                            style={{
                                borderColor: item.isActive ? '#f59e0b' : '#10b981',
                                color:       item.isActive ? '#f59e0b' : '#10b981',
                            }}
                            onClick={() => onToggle(item)}
                        >
                            {item.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Popconfirm
                            title="Delete currency?"
                            description="This will soft-delete the currency. This cannot be undone easily."
                            onConfirm={() => onDelete(item)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />} loading={actionLoading === 'delete'}>
                                Delete
                            </Button>
                        </Popconfirm>
                    </div>
                </div>
            )}
        </Drawer>
    );
};

export default CurrencyDetailDrawer;
