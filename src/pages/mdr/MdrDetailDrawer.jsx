import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Button } from 'antd';
import {
    PercentageOutlined,
    CalendarOutlined,
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { formatAmount } from '../../utils/number.utils';
import { SCOPE_CONFIG, RATE_TYPE_CONFIG } from '../../constants/mdr';

const labelStyle = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

const MdrDetailDrawer = ({ open, record, onClose, onEdit, onDeactivate }) => {
    const item = record ?? {};
    const scopeCfg = SCOPE_CONFIG[item.scope] ?? {};
    const rateCfg  = RATE_TYPE_CONFIG[item.rateType] ?? {};

    const renderRateDetails = () => {
        if (item.rateType === 'Percentage') {
            return (
                <>
                    <Descriptions.Item label="MDR Rate">{item.mdrRate != null ? `${item.mdrRate}%` : '—'}</Descriptions.Item>
                    {item.minFee != null && <Descriptions.Item label="Min Fee">${item.minFee}</Descriptions.Item>}
                    {item.maxFee != null && <Descriptions.Item label="Max Fee">${item.maxFee}</Descriptions.Item>}
                </>
            );
        }
        if (item.rateType === 'Flat') {
            return (
                <>
                    <Descriptions.Item label="Flat Fee">{item.flatFee != null ? `$${item.flatFee}` : '—'}</Descriptions.Item>
                    {item.minFee != null && <Descriptions.Item label="Min Fee">${item.minFee}</Descriptions.Item>}
                </>
            );
        }
        if (item.rateType === 'Tiered' && Array.isArray(item.tieredRates)) {
            return (
                <Descriptions.Item label="Tiered Rates" span={2}>
                    <div className="space-y-1">
                        {item.tieredRates.map((t, i) => (
                            <div key={i} className="text-xs">
                                <span style={{ color: 'var(--text-muted)' }}>
                                    ${formatAmount(t.minVolume, { decimals: 0, maxDecimals: 0 })} – {t.maxVolume != null ? `$${formatAmount(t.maxVolume, { decimals: 0, maxDecimals: 0 })}` : '∞'}
                                </span>
                                {' '}→{' '}
                                <span style={{ color: rateCfg.color, fontWeight: 600 }}>{t.rate}%</span>
                            </div>
                        ))}
                    </div>
                </Descriptions.Item>
            );
        }
        return null;
    };

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
                        <PercentageOutlined style={{ color: '#6366f1', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>MDR Config Details</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            <div className="space-y-6">
                    {/* Header badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Tag style={{ background: scopeCfg.bg, border: `1px solid ${scopeCfg.border}`, color: scopeCfg.color, fontWeight: 600 }}>
                            {item.scope ?? '—'}
                        </Tag>
                        <Tag style={{ background: `${rateCfg.color}10`, border: `1px solid ${rateCfg.color}30`, color: rateCfg.color, fontWeight: 600 }}>
                            {rateCfg.label ?? item.rateType ?? '—'}
                        </Tag>
                        {item.isActive ? (
                            <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>Active</Tag>
                        ) : (
                            <Tag style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 600 }}>Inactive</Tag>
                        )}
                    </div>

                    {/* Config specifics */}
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Configuration</p>
                        <Descriptions column={2} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                            <Descriptions.Item label="Wallet Type">{item.walletType ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Blockchain">{item.blockchain ?? '—'}</Descriptions.Item>
                            {item.merchantId && (
                                <Descriptions.Item label="Merchant ID" span={2}>
                                    <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.merchantId}</code>
                                </Descriptions.Item>
                            )}
                            {renderRateDetails()}
                        </Descriptions>
                    </div>

                    {/* Dates */}
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarOutlined style={{ color: '#6366f1' }} />
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Validity</p>
                        </div>
                        <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                            <Descriptions.Item label="Effective From">
                                {item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleString() : '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Effective To">
                                {item.effectiveTo ? new Date(item.effectiveTo).toLocaleString() : <span style={{ color: 'var(--text-muted)' }}>No end date</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Created by */}
                    {item.createdBy && (
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Created By</p>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                {item.createdBy.firstName} {item.createdBy.lastName}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.createdBy.emailId}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {(onEdit || onDeactivate) && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <div className="flex flex-wrap gap-2">
                                {onEdit && item.isActive && (
                                    <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(item)}>
                                        Update
                                    </Button>
                                )}
                                {onDeactivate && item.isActive && !item.isDelete && (
                                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDeactivate(item)}>
                                        Deactivate
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
            </div>
        </Drawer>
    );
};

export default MdrDetailDrawer;
