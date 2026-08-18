import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Radio, Select, Tabs, Tag, message } from 'antd';
import { BellOutlined, SendOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

const interpolate = (template, vars = {}) =>
  String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] == null ? '' : String(vars[key])));

const SendPushPage = () => {
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusSending, setStatusSending] = useState(false);
  const templateId = Form.useWatch('templateId', form);
  const audience = Form.useWatch('audience', form);
  const campaignTitle = Form.useWatch('title', form);
  const campaignBody = Form.useWatch('body', form);
  const statusUserId = Form.useWatch('userId', statusForm);
  const statusAction = Form.useWatch('action', statusForm) || 'account_blocked';
  const statusReason = Form.useWatch('reason', statusForm) || '';

  const campaignTemplates = useMemo(
    () => templates.filter(item => item.id !== 'account_blocked' && item.id !== 'account_enabled'),
    [templates],
  );
  const blockedTemplate = templates.find(item => item.id === 'account_blocked');
  const enabledTemplate = templates.find(item => item.id === 'account_enabled');
  const selectedTemplate = campaignTemplates.find(item => item.id === templateId) || null;
  const statusUser = users.find(item => item.id === statusUserId);

  const statusPreview = useMemo(() => {
    const template = statusAction === 'account_enabled' ? enabledTemplate : blockedTemplate;
    if (!template) return { title: '', body: '' };
    return {
      title: interpolate(template.title, { name: statusUser?.name || 'there', reason: statusReason ? `. Reason: ${statusReason}.` : '.' }),
      body: interpolate(template.body, { name: statusUser?.name || 'there', reason: statusReason ? `. Reason: ${statusReason}.` : '.' }),
    };
  }, [blockedTemplate, enabledTemplate, statusAction, statusReason, statusUser]);

  useEffect(() => {
    Promise.all([adminApi.pushTemplates(), adminApi.users()])
      .then(([templateRes, userRes]) => {
        const items = templateRes.items || [];
        setTemplates(items);
        setUsers(userRes.items || []);
        const first = items.find(item => item.id === 'broadcast');
        if (first) {
          form.setFieldsValue({
            templateId: first.id,
            audience: 'all',
            title: first.title,
            body: first.body,
          });
        }
        statusForm.setFieldsValue({ action: 'account_blocked' });
      })
      .catch(error => {
        message.error(error?.response?.data?.message || error?.message || 'Could not load push templates');
      })
      .finally(() => setLoading(false));
  }, [form, statusForm]);

  const applyTemplate = template => {
    form.setFieldsValue({
      templateId: template.id,
      audience: template.audience === 'user' ? 'user' : 'all',
      title: template.title,
      body: template.body,
    });
  };

  const handleSend = async values => {
    setSending(true);
    try {
      const res = await adminApi.sendPush({
        templateId: values.templateId,
        title: values.title,
        body: values.body,
        userId: values.audience === 'user' ? values.userId : undefined,
        data: { actionType: selectedTemplate?.actionType || 'BROADCAST' },
      });
      if (res?.ok) {
        message.success(values.audience === 'user' ? 'Push sent to the selected user' : 'Push sent to all subscribed devices');
      } else if (res?.result?.skipped) {
        message.warning(`Skipped: ${res.result.reason || 'no device token or Firebase not configured'}`);
      } else {
        message.error(res?.result?.error || 'Failed to send push');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to send push');
    } finally {
      setSending(false);
    }
  };

  const handleStatusSend = async values => {
    setStatusSending(true);
    try {
      const res = await adminApi.sendPush({
        templateId: values.action,
        title: statusPreview.title,
        body: statusPreview.body,
        userId: values.userId,
        vars: {
          name: statusUser?.name || 'there',
          reason: values.reason ? `. Reason: ${values.reason}.` : '.',
        },
        data: { actionType: values.action === 'account_enabled' ? 'ACCOUNT_ENABLED' : 'ACCOUNT_BLOCKED', reason: values.reason || '' },
      });
      if (res?.ok) {
        message.success(values.action === 'account_enabled' ? 'Account restored notification sent' : 'Account blocked notification sent');
      } else if (res?.result?.skipped) {
        message.warning(`Skipped: ${res.result.reason || 'this user has no device token'}`);
      } else {
        message.error(res?.result?.error || 'Failed to send notification');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Failed to send notification');
    } finally {
      setStatusSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Push notifications"
        description="Create a campaign from a template, or send the account blocked / restored message that also fires automatically from Users and Owners."
      />

      <Tabs
        defaultActiveKey="campaign"
        items={[
          {
            key: 'campaign',
            label: 'Send campaign',
            children: (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
                <Card loading={loading} className="pnp-table-card">
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Choose a template, then edit the copy before sending.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {campaignTemplates.map(template => {
                      const active = template.id === templateId;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template)}
                          className="text-left rounded-xl border p-3 transition-colors"
                          style={{
                            borderColor: active ? 'var(--color-primary, #2563eb)' : 'var(--border-color)',
                            background: active ? 'rgba(37,99,235,0.08)' : 'var(--bg-header)',
                          }}
                        >
                          <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{template.name}</div>
                          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{template.description}</div>
                          <Tag>{template.actionType}</Tag>
                        </button>
                      );
                    })}
                  </div>

                  <Form form={form} layout="vertical" onFinish={handleSend} initialValues={{ audience: 'all' }}>
                    <Form.Item name="templateId" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="audience" label="Send to">
                      <Radio.Group>
                        <Radio.Button value="all">All users (topic)</Radio.Button>
                        <Radio.Button value="user">One user</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                    {audience === 'user' ? (
                      <Form.Item name="userId" label="User" rules={[{ required: true, message: 'Select a user' }]}>
                        <Select
                          showSearch
                          placeholder="Search by name or phone"
                          optionFilterProp="label"
                          options={users.map(user => ({
                            value: user.id,
                            label: `${user.name || 'Unnamed'} · ${user.phone || '—'}${user.hasDeviceToken ? '' : ' · no device token'}`,
                          }))}
                        />
                      </Form.Item>
                    ) : null}
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
                      <Input maxLength={80} showCount />
                    </Form.Item>
                    <Form.Item name="body" label="Message" rules={[{ required: true, message: 'Message is required' }]}>
                      <Input.TextArea rows={4} maxLength={240} showCount />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={sending}>
                      Send notification
                    </Button>
                  </Form>
                </Card>

                <Card className="pnp-table-card" title="Preview">
                  <div className="rounded-2xl p-4" style={{ background: '#111827', color: '#fff' }}>
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                      <BellOutlined /> PNP
                    </div>
                    <div className="font-semibold mb-1">{campaignTitle || 'Title'}</div>
                    <div className="text-sm opacity-90">{campaignBody || 'Message preview'}</div>
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                    Topic sends use <code>pnp_broadcast</code>. Single-user sends use the stored FCM token, including blocked accounts.
                  </p>
                </Card>
              </div>
            ),
          },
          {
            key: 'account',
            label: 'Block / restore',
            children: (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
                <Card loading={loading} className="pnp-table-card">
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    These messages are sent automatically when you block or unblock someone on Users or Owners. You can also send them from here.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)' }}>
                      <StopOutlined className="mb-2 text-red-500" />
                      <div className="font-semibold">{blockedTemplate?.title || 'Account blocked'}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{blockedTemplate?.description}</div>
                    </div>
                    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)' }}>
                      <CheckCircleOutlined className="mb-2 text-emerald-500" />
                      <div className="font-semibold">{enabledTemplate?.title || 'Account restored'}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{enabledTemplate?.description}</div>
                    </div>
                  </div>

                  <Form form={statusForm} layout="vertical" onFinish={handleStatusSend} initialValues={{ action: 'account_blocked' }}>
                    <Form.Item name="action" label="Notification">
                      <Radio.Group>
                        <Radio.Button value="account_blocked">Blocked</Radio.Button>
                        <Radio.Button value="account_enabled">Restored / enabled</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item name="userId" label="User" rules={[{ required: true, message: 'Select a user' }]}>
                      <Select
                        showSearch
                        placeholder="Search by name or phone"
                        optionFilterProp="label"
                        options={users.map(user => ({
                          value: user.id,
                          label: `${user.name || 'Unnamed'} · ${user.phone || '—'}${user.blocked ? ' · blocked' : ''}${user.hasDeviceToken ? '' : ' · no device token'}`,
                        }))}
                      />
                    </Form.Item>
                    {statusAction === 'account_blocked' ? (
                      <Form.Item name="reason" label="Reason (optional)">
                        <Input placeholder="Blocked by admin" />
                      </Form.Item>
                    ) : null}
                    <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={statusSending}>
                      Send status notification
                    </Button>
                  </Form>
                </Card>

                <Card className="pnp-table-card" title="Preview">
                  <div className="rounded-2xl p-4" style={{ background: '#111827', color: '#fff' }}>
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                      <BellOutlined /> PNP
                    </div>
                    <div className="font-semibold mb-1">{statusPreview.title || 'Title'}</div>
                    <div className="text-sm opacity-90">{statusPreview.body || 'Message preview'}</div>
                  </div>
                  {statusUser && !statusUser.hasDeviceToken ? (
                    <p className="text-xs mt-3 text-amber-600">This user has no device token yet, so FCM cannot be delivered until they allow notifications.</p>
                  ) : (
                    <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                      Blocking from the Users page also sends this automatically. The device token is kept so a blocked user can still receive it.
                    </p>
                  )}
                </Card>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SendPushPage;
