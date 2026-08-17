import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Modal, Form, Input, Switch, Select, Spin } from 'antd';
import { countriesApi } from '../../../api/modules/countries';
import { statesApi } from '../../../api/modules/states';

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
   City Form Modal — handles both Create and Edit
   ═══════════════════════════════════════════════════════════════════════════ */
const CityFormModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const isEdit = !!record;

    /* ── Country options ── */
    const [countryOptions, setCountryOptions] = useState([]);
    const [countryLoading, setCountryLoading] = useState(false);
    const countryDebounce = useRef(null);

    /* ── State options (depend on selected country) ── */
    const [stateOptions, setStateOptions] = useState([]);
    const [stateLoading, setStateLoading] = useState(false);
    const stateDebounce = useRef(null);

    /* selected country id — used to filter states */
    const [selectedCountryId, setSelectedCountryId] = useState(null);

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

    const loadStates = useCallback((q = '', countryId) => {
        if (!countryId) return;
        setStateLoading(true);
        const params = { limit: 100, sort: 'name:1', countryId };
        if (q) params.search = q;
        statesApi.getAll(params)
            .then((res) => {
                if (res.success) {
                    setStateOptions(res.data.map((s) => ({ value: s._id, label: s.name })));
                }
            })
            .catch(() => {})
            .finally(() => setStateLoading(false));
    }, []);

    useEffect(() => {
        if (open) {
            loadCountries('');
            if (isEdit) {
                /* API returns countryId / stateId as populated objects */
                const cField    = record.countryId;
                const sField    = record.stateId;
                const countryId = cField?._id ?? (typeof cField === 'string' ? cField : null);
                const stateId   = sField?._id ?? (typeof sField === 'string' ? sField : null);

                setSelectedCountryId(countryId);

                /* If we have a country, seed the state options */
                if (countryId) loadStates('', countryId);

                form.setFieldsValue({
                    countryId,
                    stateId,
                    name:      record.name,
                    latitude:  record.latitude,
                    longitude: record.longitude,
                    isActive:  record.isActive ?? true,
                });
            } else {
                setSelectedCountryId(null);
                setStateOptions([]);
                form.setFieldsValue({ isActive: true });
            }
        } else {
            form.resetFields();
            setSelectedCountryId(null);
            setStateOptions([]);
        }
    }, [open, record, form, isEdit, loadCountries, loadStates]); // eslint-disable-line

    const handleCountryChange = (val) => {
        setSelectedCountryId(val ?? null);
        form.setFieldValue('stateId', undefined);
        setStateOptions([]);
        if (val) loadStates('', val);
    };

    const handleOk = () => {
        /* Send all form values including countryId — the API requires both countryId and stateId */
        form.validateFields().then(onSubmit);
    };

    return (
        <Modal
            open={open}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {isEdit ? 'Edit City' : 'Create City'}
                </span>
            }
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEdit ? 'Save Changes' : 'Create City'}
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
                {/* Country selector (UI-only, used to filter states) */}
                <Form.Item
                    name="countryId"
                    label={<span style={labelStyle}>Country</span>}
                    rules={[{ required: true, message: 'Select a country first' }]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Select country"
                        loading={countryLoading}
                        filterOption={false}
                        notFoundContent={countryLoading ? <Spin size="small" /> : 'No countries found'}
                        onSearch={(v) => {
                            clearTimeout(countryDebounce.current);
                            countryDebounce.current = setTimeout(() => loadCountries(v), 300);
                        }}
                        onChange={handleCountryChange}
                        options={countryOptions}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        style={{ background: 'var(--input-bg)' }}
                    />
                </Form.Item>

                {/* State selector */}
                <Form.Item
                    name="stateId"
                    label={<span style={labelStyle}>State / Region</span>}
                    rules={[{ required: true, message: 'State is required' }]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder={selectedCountryId ? 'Select state' : 'Select a country first'}
                        disabled={!selectedCountryId}
                        loading={stateLoading}
                        filterOption={false}
                        notFoundContent={stateLoading ? <Spin size="small" /> : 'No states found'}
                        onSearch={(v) => {
                            const cid = form.getFieldValue('countryId');
                            clearTimeout(stateDebounce.current);
                            stateDebounce.current = setTimeout(() => loadStates(v, cid), 300);
                        }}
                        options={stateOptions}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        style={{ background: 'var(--input-bg)' }}
                    />
                </Form.Item>

                {/* City Name */}
                <Form.Item
                    name="name"
                    label={<span style={labelStyle}>City Name</span>}
                    rules={[
                        { required: true, message: 'City name is required' },
                        { whitespace: true, message: 'Cannot be blank' },
                    ]}
                >
                    <Input placeholder="e.g. San Francisco" style={inputStyle} />
                </Form.Item>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                        name="latitude"
                        label={<span style={labelStyle}>Latitude</span>}
                    >
                        <Input placeholder="37.77493000" style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="longitude"
                        label={<span style={labelStyle}>Longitude</span>}
                    >
                        <Input placeholder="-122.41942000" style={inputStyle} />
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

export default CityFormModal;
