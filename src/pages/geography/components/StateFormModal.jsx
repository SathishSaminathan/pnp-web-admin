import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Modal, Form, Input, Switch, Select, Spin } from 'antd';
import { countriesApi } from '../../../api/modules/countries';

const MODAL_STYLES = {
    content: { background: 'var(--bg-card)' },
    header:  { background: 'var(--bg-card)' },
    footer:  { background: 'var(--bg-card)' },
};

const inputStyle = {
    background: 'var(--input-bg)',
    border:     '1px solid var(--border-color)',
    color:      'var(--text-primary)',
};
const labelStyle = { color: 'var(--text-secondary)' };

/* ════════════════════════════════════════════════════════════════════════════
   State Form Modal — handles both Create and Edit
   ═══════════════════════════════════════════════════════════════════════════ */
const StateFormModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const isEdit = !!record;

    const [countryOptions, setCountryOptions] = useState([]);
    const [countryLoading, setCountryLoading] = useState(false);
    const debounceRef = useRef(null);

    const loadCountries = useCallback((q = '') => {
        setCountryLoading(true);
        countriesApi.getAll({ ...(q ? { search: q } : {}), limit: 50, sort: 'name:1' })
            .then((res) => {
                if (res.success) {
                    setCountryOptions(
                        res.data.map((c) => ({ value: c._id, label: `${c.flag ?? ''} ${c.name}`.trim() }))
                    );
                }
            })
            .catch(() => {})
            .finally(() => setCountryLoading(false));
    }, []);

    useEffect(() => {
        if (open) {
            loadCountries('');
            if (isEdit) {
                /* API returns countryId as a populated object */
                const cField    = record.countryId ?? record.country;
                const countryId = cField?._id ?? (typeof cField === 'string' ? cField : null);
                form.setFieldsValue({
                    countryId,
                    name:      record.name,
                    isoCode:   record.isoCode,
                    latitude:  record.latitude,
                    longitude: record.longitude,
                    isActive:  record.isActive ?? true,
                });
            } else {
                form.setFieldsValue({ isActive: true });
            }
        } else {
            form.resetFields();
        }
    }, [open, record, form, isEdit, loadCountries]);

    const handleOk = () => {
        form.validateFields().then(onSubmit);
    };

    return (
        <Modal
            open={open}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {isEdit ? 'Edit State / Region' : 'Create State / Region'}
                </span>
            }
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEdit ? 'Save Changes' : 'Create State'}
            cancelText="Cancel"
            confirmLoading={loading}
            width={520}
            styles={MODAL_STYLES}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
                requiredMark={(label, { required }) => (
                    <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
                )}
            >
                {/* Country */}
                <Form.Item
                    name="countryId"
                    label={<span style={labelStyle}>Country</span>}
                    rules={[{ required: true, message: 'Country is required' }]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select country"
                        loading={countryLoading}
                        filterOption={false}
                        notFoundContent={countryLoading ? <Spin size="small" /> : 'No countries found'}
                        onSearch={(v) => {
                            clearTimeout(debounceRef.current);
                            debounceRef.current = setTimeout(() => loadCountries(v), 300);
                        }}
                        options={countryOptions}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        style={{ background: 'var(--input-bg)' }}
                    />
                </Form.Item>

                {/* State Name */}
                <Form.Item
                    name="name"
                    label={<span style={labelStyle}>State / Region Name</span>}
                    rules={[
                        { required: true, message: 'Name is required' },
                        { whitespace: true, message: 'Cannot be blank' },
                    ]}
                >
                    <Input placeholder="e.g. California" style={inputStyle} />
                </Form.Item>

                {/* 2-col grid */}
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                        name="isoCode"
                        label={<span style={labelStyle}>ISO Code</span>}
                    >
                        <Input placeholder="CA" maxLength={10} style={inputStyle} />
                    </Form.Item>

                    <div /> {/* spacer */}

                    <Form.Item
                        name="latitude"
                        label={<span style={labelStyle}>Latitude</span>}
                    >
                        <Input placeholder="36.77826100" style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="longitude"
                        label={<span style={labelStyle}>Longitude</span>}
                    >
                        <Input placeholder="-119.41793240" style={inputStyle} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="isActive"
                    label={<span style={labelStyle}>Status</span>}
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StateFormModal;
