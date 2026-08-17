import React from 'react';
import { Form, Input, Select, Switch, Button, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FEE_TYPE_OPTIONS, SLAB_BAND_TYPE_OPTIONS } from './transactionFeeHelpers';

/**
 * Renders the "Fee Detail" block inside one transactionFee entry's editor.
 * Lives inside the parent <Form.List name="transactionFee">; the outer list
 * provides `name` (the row index) and `restField`.
 *
 * Each transactionFee entry can carry MULTIPLE fee lines (e.g. Platform Fee,
 * Gov Fee, Network Fee). This component renders a nested Form.List over
 * `feeLines[]` and lets the admin add/remove individual fee rows.
 *
 * Per fee line: feeName, feeType (Fixed / Percentage / Slab), feeAmount (or
 * slab bands when type === 'Slab'), feeDescription, feeShouldDeduct toggle.
 *
 * Validation is shape-only; the backend pre-validate hook enforces slab band
 * ordering, non-overlap, and the type/amount cross-field rule.
 */
const FeeDetailFields = ({
    name,
    form,
    labelStyle = { color: 'var(--text-secondary)' },
    inputStyle = {
        background: 'var(--input-bg)',
        border:     '1px solid var(--border-color)',
        color:      'var(--text-primary)',
    },
}) => {
    const popupStyle = { popup: { root: { background: 'var(--bg-card)' } } };

    return (
        <>
            <Divider style={{ borderColor: 'var(--border-color)', margin: '6px 0 10px' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fees</span>
            </Divider>

            <Form.List name={[name, 'feeLines']}>
                {(lineFields, { add: addLine, remove: removeLine }) => (
                    <div className="space-y-2">
                        {lineFields.length === 0 && (
                            <div className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                                No fees defined for this payment method. Click below to add one.
                            </div>
                        )}

                        {lineFields.map(({ key: lineKey, name: lineName, ...lineRest }) => (
                            <FeeLineEditor
                                key={lineKey}
                                outerName={name}
                                lineName={lineName}
                                lineRest={lineRest}
                                form={form}
                                labelStyle={labelStyle}
                                inputStyle={inputStyle}
                                popupStyle={popupStyle}
                                onRemove={() => removeLine(lineName)}
                            />
                        ))}

                        <Button
                            type="dashed"
                            size="small"
                            onClick={() => addLine({ feeShouldDeduct: true })}
                            icon={<PlusOutlined />}
                            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                        >
                            Add Fee
                        </Button>
                    </div>
                )}
            </Form.List>
        </>
    );
};

/**
 * Editor for one fee line inside a transactionFee entry. Receives the outer
 * row index (`outerName`), the inner row index (`lineName`), and the AntD
 * `restField` from the inner Form.List.
 */
const FeeLineEditor = ({
    outerName,
    lineName,
    lineRest,
    form,
    labelStyle,
    inputStyle,
    popupStyle,
    onRemove,
}) => {
    const readLine = () =>
        form.getFieldValue('transactionFee')?.[outerName]?.feeLines?.[lineName];

    return (
        <div
            className="rounded-lg p-3 relative"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
            <div className="grid grid-cols-2 gap-3">
                <Form.Item
                    {...lineRest}
                    name={[lineName, 'feeName']}
                    label={<span style={labelStyle}>Fee Name</span>}
                    style={{ marginBottom: 8 }}
                    rules={[{
                        validator: (_, value) => {
                            const line = readLine();
                            if ((line?.feeType || line?.feeAmount || line?.feeSlabs?.length) && !value) {
                                return Promise.reject(new Error('Fee name is required'));
                            }
                            return Promise.resolve();
                        },
                    }]}
                >
                    <Input placeholder="e.g. Platform Fee" style={inputStyle} />
                </Form.Item>

                <Form.Item
                    {...lineRest}
                    name={[lineName, 'feeType']}
                    label={<span style={labelStyle}>Fee Type</span>}
                    style={{ marginBottom: 8 }}
                    rules={[{
                        validator: (_, value) => {
                            const line = readLine();
                            if (line?.feeName && !value) {
                                return Promise.reject(new Error('Fee type is required'));
                            }
                            return Promise.resolve();
                        },
                    }]}
                >
                    <Select
                        placeholder="Fixed / Percentage / Slab"
                        allowClear
                        options={FEE_TYPE_OPTIONS}
                        styles={popupStyle}
                    />
                </Form.Item>

                <Form.Item
                    {...lineRest}
                    name={[lineName, 'feeShouldDeduct']}
                    label={<span style={labelStyle}>Deducted by Our System</span>}
                    valuePropName="checked"
                    initialValue={true}
                    tooltip="When off, the upstream provider charges this fee; shown for transparency only and not debited from the user."
                    style={{ marginBottom: 8 }}
                >
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>

                <Form.Item
                    {...lineRest}
                    name={[lineName, 'feeDescription']}
                    label={<span style={labelStyle}>Description</span>}
                    style={{ marginBottom: 8 }}
                >
                    <Input placeholder="Optional" style={inputStyle} />
                </Form.Item>
            </div>

            {/* feeAmount for Fixed/Percentage; slab editor for Slab */}
            <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => {
                    const pType = prev?.transactionFee?.[outerName]?.feeLines?.[lineName]?.feeType;
                    const cType = curr?.transactionFee?.[outerName]?.feeLines?.[lineName]?.feeType;
                    return pType !== cType;
                }}
            >
                {() => {
                    const feeType = form.getFieldValue([
                        'transactionFee', outerName, 'feeLines', lineName, 'feeType',
                    ]);
                    const isSlab = feeType === 'Slab';

                    if (!isSlab) {
                        return (
                            <Form.Item
                                {...lineRest}
                                name={[lineName, 'feeAmount']}
                                label={<span style={labelStyle}>Amount</span>}
                                style={{ marginBottom: 0 }}
                                rules={[{
                                    validator: (_, value) => {
                                        const line = readLine();
                                        if (line?.feeName && line?.feeType && line?.feeType !== 'Slab'
                                            && (value === '' || value === null || value === undefined)) {
                                            return Promise.reject(new Error('Amount is required'));
                                        }
                                        if (value !== '' && value !== null && value !== undefined) {
                                            const n = Number(value);
                                            if (isNaN(n) || n < 0) {
                                                return Promise.reject(new Error('Must be a non-negative number'));
                                            }
                                        }
                                        return Promise.resolve();
                                    },
                                }]}
                            >
                                <Input placeholder="0.5 or 25.00" style={inputStyle} />
                            </Form.Item>
                        );
                    }

                    return (
                        <div
                            className="rounded-lg p-3"
                            style={{ background: 'rgba(99,102,241,0.04)', border: '1px dashed var(--border-color)' }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                    Slab Bands
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Half-open [min, max). Leave max empty on the top band.
                                </span>
                            </div>

                            <Form.List name={[lineName, 'feeSlabs']}>
                                {(slabFields, { add: addSlab, remove: removeSlab }) => (
                                    <div className="space-y-2">
                                        {slabFields.map(({ key: slabKey, name: slabName, ...slabRest }) => (
                                            <div
                                                key={slabKey}
                                                className="rounded-md p-2 relative"
                                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                            >
                                                <div className="grid grid-cols-4 gap-2">
                                                    <Form.Item
                                                        {...slabRest}
                                                        name={[slabName, 'minAmount']}
                                                        label={<span style={labelStyle}>Min</span>}
                                                        style={{ marginBottom: 4 }}
                                                        rules={[{
                                                            validator: (_, value) => {
                                                                if (value === '' || value === null || value === undefined) {
                                                                    return Promise.reject(new Error('Required'));
                                                                }
                                                                const n = Number(value);
                                                                if (isNaN(n) || n < 0) {
                                                                    return Promise.reject(new Error('≥ 0'));
                                                                }
                                                                return Promise.resolve();
                                                            },
                                                        }]}
                                                    >
                                                        <Input placeholder="0" style={inputStyle} />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...slabRest}
                                                        name={[slabName, 'maxAmount']}
                                                        label={<span style={labelStyle}>Max</span>}
                                                        style={{ marginBottom: 4 }}
                                                        rules={[{
                                                            validator: (_, value) => {
                                                                if (value === '' || value === null || value === undefined) {
                                                                    return Promise.resolve();
                                                                }
                                                                const n = Number(value);
                                                                if (isNaN(n) || n < 0) {
                                                                    return Promise.reject(new Error('≥ 0'));
                                                                }
                                                                return Promise.resolve();
                                                            },
                                                        }]}
                                                    >
                                                        <Input placeholder="(empty = ∞)" style={inputStyle} />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...slabRest}
                                                        name={[slabName, 'type']}
                                                        label={<span style={labelStyle}>Type</span>}
                                                        style={{ marginBottom: 4 }}
                                                        initialValue="Fixed"
                                                        rules={[{ required: true, message: 'Required' }]}
                                                    >
                                                        <Select
                                                            options={SLAB_BAND_TYPE_OPTIONS}
                                                            styles={popupStyle}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...slabRest}
                                                        name={[slabName, 'amount']}
                                                        label={<span style={labelStyle}>Amount</span>}
                                                        style={{ marginBottom: 4 }}
                                                        rules={[{
                                                            validator: (_, value) => {
                                                                if (value === '' || value === null || value === undefined) {
                                                                    return Promise.reject(new Error('Required'));
                                                                }
                                                                const n = Number(value);
                                                                if (isNaN(n) || n < 0) {
                                                                    return Promise.reject(new Error('≥ 0'));
                                                                }
                                                                return Promise.resolve();
                                                            },
                                                        }]}
                                                    >
                                                        <Input placeholder="1.5" style={inputStyle} />
                                                    </Form.Item>
                                                </div>
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeSlab(slabName)}
                                                    style={{ position: 'absolute', top: 4, right: 4 }}
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            type="dashed"
                                            size="small"
                                            onClick={() => addSlab({ minAmount: '', maxAmount: '', type: 'Fixed', amount: '' })}
                                            icon={<PlusOutlined />}
                                            style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                        >
                                            Add Slab Band
                                        </Button>
                                    </div>
                                )}
                            </Form.List>
                        </div>
                    );
                }}
            </Form.Item>

            <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={onRemove}
                style={{ position: 'absolute', top: 4, right: 4 }}
                title="Remove this fee"
            />
        </div>
    );
};

export default FeeDetailFields;
