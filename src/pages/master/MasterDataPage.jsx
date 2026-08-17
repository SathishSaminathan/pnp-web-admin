import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Switch, Tabs, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const TYPES = [
  { key: 'categories', label: 'Categories' },
  { key: 'availability', label: 'Availability' },
  { key: 'facilities', label: 'Facilities' },
];

const emptyForm = { value: '', label: '', color: '#16A34A', bg: '#F0FDF4', active: true, sortOrder: 1 };

const MasterDataPage = () => {
  const [master, setMaster] = useState({ categories: [], availability: [], facilities: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('categories');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      setMaster(await adminApi.master());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ ...emptyForm, sortOrder: (master[tab] || []).length + 1 });
    setModalOpen(true);
  };

  const openEdit = record => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async values => {
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateMasterItem(tab, editing.id, values);
        message.success('Updated');
      } else {
        await adminApi.createMasterItem(tab, values);
        message.success('Added');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async record => {
    await adminApi.deleteMasterItem(tab, record.id);
    message.success('Removed');
    load();
  };

  const columns = [
    { title: 'Label', dataIndex: 'label', render: value => <span className="pnp-cell-strong">{value}</span> },
    { title: 'Value', dataIndex: 'value' },
    { title: 'Order', dataIndex: 'sortOrder', width: 90 },
    {
      title: 'Status',
      dataIndex: 'active',
      width: 110,
      render: active => <Tag color={active === false ? 'default' : 'green'}>{active === false ? 'Hidden' : 'Active'}</Tag>,
    },
    tab === 'availability'
      ? {
          title: 'Color',
          dataIndex: 'color',
          render: (color, row) => (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border" style={{ background: color }} />
              {row.label}
            </span>
          ),
        }
      : null,
    {
      title: '',
      width: 160,
      render: record => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Remove this option?" onConfirm={() => handleDelete(record)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title="Master data"
        description="Categories, availability, and facilities used by the mobile listing form and discovery filters."
        primaryAction={{ label: 'Add option', onClick: openCreate, props: { icon: <PlusOutlined /> } }}
      />
      <Tabs activeKey={tab} onChange={setTab} items={TYPES.map(item => ({ key: item.key, label: item.label }))} />
      <DataTable rowKey="id" loading={loading} dataSource={master[tab] || []} columns={columns} />

      <Modal
        title={editing ? 'Edit option' : 'Add option'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={emptyForm}>
          <Form.Item name="label" label="Label" rules={[{ required: true }]}>
            <Input placeholder="Shown in the app" />
          </Form.Item>
          <Form.Item name="value" label="Value" rules={[{ required: true }]}>
            <Input placeholder="Stored on listings" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort order">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          {tab === 'availability' ? (
            <>
              <Form.Item name="color" label="Text color">
                <Input placeholder="#16A34A" />
              </Form.Item>
              <Form.Item name="bg" label="Background">
                <Input placeholder="#F0FDF4" />
              </Form.Item>
            </>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};

export default MasterDataPage;
