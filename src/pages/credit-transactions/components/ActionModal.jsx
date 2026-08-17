import React from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    CreditCardOutlined,
    BankOutlined,
    WalletOutlined,
    ExclamationCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { formatAmount } from '../../../utils/number.utils';

const ActionModal = ({
    actionModal,
    actionTarget,
    actionLoading,
    modalError,
    isDark,
    form,
    handleActionSubmit,
    closeAction,
}) => (
    <Modal
        title={
            <div className="flex items-center gap-2.5">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm shrink-0"
                    style={{ background: actionModal === 'approve' ? '#10b981' : '#ef4444' }}
                >
                    {actionModal === 'approve' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {actionModal === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {actionModal === 'approve'
                            ? 'Funds will be credited to the destination account'
                            : 'Transaction will be rejected and balance reversed if needed'}
                    </div>
                </div>
            </div>
        }
        open={!!actionModal}
        onOk={handleActionSubmit}
        onCancel={closeAction}
        confirmLoading={actionLoading}
        okText={actionModal === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        cancelText="Cancel"
        okButtonProps={{
            style: actionModal === 'approve'
                ? { background: '#10b981', borderColor: '#10b981' }
                : { background: '#ef4444', borderColor: '#ef4444' },
        }}
        width={480}
        styles={{
            content: { background: isDark ? 'var(--bg-card)' : '#fff', padding: 0 },
            header: {
                background: isDark ? 'var(--bg-card)' : '#fff',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'}`,
                padding: '16px 20px',
            },
            body: { padding: '16px 20px' },
            footer: {
                background: isDark ? 'var(--bg-card)' : '#fff',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0'}`,
                padding: '12px 20px',
            },
        }}
        destroyOnClose
    >
        {actionTarget && (() => {
            const t = actionTarget;
            const user = t.user ?? {};
            const userName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.emailId || '—';
            const dest = t.destination ?? {};
            const hasDestAccount = !!(dest.accountType);
            const willReverseBalance = actionModal === 'reject' && ['Approved', 'InProgress'].includes(t.status);
            return (
                <div className="space-y-3">
                    {/* Transaction summary card */}
                    <div
                        className="rounded-xl p-3 space-y-2"
                        style={{
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <UserOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Merchant</span>
                            <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>
                                {userName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCardOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                            <span className="text-xs font-mono font-semibold ml-auto" style={{ color: 'var(--text-primary)' }}>
                                {t.transactionId}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                            <span className="text-xs font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
                                {t.paymentMethod || '—'}
                            </span>
                        </div>
                        <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}` }} />
                        <div className="flex justify-between items-center">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Gross Amount</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                {formatAmount(t.amount)} {t.feeCurrency ?? 'USD'}
                            </span>
                        </div>
                        {t.totalFee > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Fee</span>
                                <span className="text-xs" style={{ color: '#f59e0b' }}>
                                    − {formatAmount(t.totalFee)} {t.feeCurrency ?? 'USD'}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Net Amount</span>
                            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                                {formatAmount(t.totalAmount)} {t.feeCurrency ?? 'USD'}
                            </span>
                        </div>
                    </div>

                    {/* Destination account info (approve only) */}
                    {actionModal === 'approve' && (
                        <div
                            className="rounded-xl p-3 space-y-2"
                            style={{
                                background: isDark ? 'rgba(79,70,229,0.08)' : 'rgba(79,70,229,0.05)',
                                border: `1px solid ${isDark ? 'rgba(79,70,229,0.25)' : 'rgba(79,70,229,0.15)'}`,
                            }}
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                {dest.accountType?.toLowerCase().includes('wallet')
                                    ? <WalletOutlined style={{ color: '#4f46e5', fontSize: 12 }} />
                                    : <BankOutlined style={{ color: '#4f46e5', fontSize: 12 }} />}
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4f46e5' }}>
                                    Destination Account
                                </span>
                            </div>
                            {hasDestAccount ? (
                                <>
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-muted)' }}>Account Type</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dest.accountType}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-muted)' }}>Currency</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{dest.currency ?? '—'}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#f59e0b' }}>
                                    <ExclamationCircleOutlined />
                                    Destination account details unavailable
                                </div>
                            )}
                        </div>
                    )}

                    {/* Balance reversal warning (reject when already approved/in-progress) */}
                    {willReverseBalance && (
                        <Alert
                            type="warning"
                            showIcon
                            icon={<WarningOutlined />}
                            message={
                                <span className="text-xs">
                                    This transaction is <strong>{t.status}</strong>. Rejecting will
                                    reverse <strong>{formatAmount(t.totalAmount)} {t.feeCurrency ?? 'USD'}</strong> from
                                    the merchant&apos;s {dest.accountType ?? 'destination'} account.
                                </span>
                            }
                            style={{
                                background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                                border: '1px solid rgba(245,158,11,0.3)',
                                borderRadius: 10,
                            }}
                        />
                    )}

                    {/* Inline API error */}
                    {modalError && (
                        <Alert
                            type="error"
                            showIcon
                            message={<span className="text-xs">{modalError}</span>}
                            style={{
                                background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 10,
                            }}
                        />
                    )}

                    {/* Notes / Reason input */}
                    <Form form={form} layout="vertical" style={{ marginBottom: 0 }}>
                        {actionModal === 'approve' && (
                            <Form.Item
                                name="notes"
                                label={
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        Approval Notes{' '}
                                        <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                                    </span>
                                }
                                style={{ marginBottom: 0 }}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Funds verified and source of funds confirmed."
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                                        color: 'var(--text-primary)',
                                        borderRadius: 8,
                                    }}
                                />
                            </Form.Item>
                        )}
                        {actionModal === 'reject' && (
                            <Form.Item
                                name="reason"
                                label={
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        Rejection Reason{' '}
                                        <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                                    </span>
                                }
                                style={{ marginBottom: 0 }}
                            >
                                <Input.TextArea
                                    rows={2}
                                    placeholder="Source of funds documentation insufficient."
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                                        color: 'var(--text-primary)',
                                        borderRadius: 8,
                                    }}
                                />
                            </Form.Item>
                        )}
                    </Form>
                </div>
            );
        })()}
    </Modal>
);

export default ActionModal;
