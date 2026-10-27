import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Skeleton, message } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

const AppSettingsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      form.setFieldsValue(await adminApi.settings());
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async values => {
    setSaving(true);
    try {
      form.setFieldsValue(await adminApi.updateSettings(values));
      message.success('Settings saved. New bookings use them straight away.');
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="App settings"
        description="Fees and limits the mobile app uses. Existing bookings keep the fee and tax they were charged."
      />
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleSave} className="max-w-2xl">
          <Card title="Payments" className="mb-4">
            <Form.Item
              name="platformFee"
              label="Platform fee per visit (₹)"
              extra="Added to the price the customer pays."
              rules={[{ required: true, type: 'number', min: 0 }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item
              name="taxAmount"
              label="Tax per visit (₹)"
              extra="Taken from the host's share, as a fixed amount."
              rules={[{ required: true, type: 'number', min: 0 }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </Card>

          <Card title="Search and filters" className="mb-4">
            <Form.Item
              name={['discovery', 'maxPrice']}
              label="Highest price on the price filter (₹)"
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item
              name={['discovery', 'maxDistanceKm']}
              label="Default search radius (km)"
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item
              name={['discovery', 'quickFilterMaxPrice']}
              label={'"Under ₹…" quick filter price'}
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>
          </Card>

          <Card title="Support" className="mb-4">
            <Form.Item
              name={['support', 'email']}
              label="Support email shown in the app"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>
          </Card>

          <Button type="primary" htmlType="submit" loading={saving}>
            Save settings
          </Button>
        </Form>
      )}
    </div>
  );
};

export default AppSettingsPage;
