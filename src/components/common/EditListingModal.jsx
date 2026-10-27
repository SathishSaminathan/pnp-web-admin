import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Modal, Select, Switch, TimePicker, message } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { adminApi } from '../../api/modules/admin';

dayjs.extend(customParseFormat);

const FORMAT = 'hh:mm A';

const parseHours = value => {
  const text = String(value || '').trim();
  if (/^24/i.test(text)) return { allDay: true };
  const [from, to] = text.split(/\s[-–]\s/);
  const open = dayjs(from, ['hh:mm A', 'h:mm A'], true);
  const close = dayjs(to, ['hh:mm A', 'h:mm A'], true);
  return {
    allDay: false,
    open: open.isValid() ? open : dayjs('06:00 AM', FORMAT),
    close: close.isValid() ? close : dayjs('10:00 PM', FORMAT),
  };
};

/** Admin edit of price, hours, availability, category and visibility. Verification and ratings are not editable here. */
const EditListingModal = ({ listing, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [master, setMaster] = useState({ categories: [], availability: [] });
  const [saving, setSaving] = useState(false);
  const allDay = Form.useWatch('allDay', form);

  useEffect(() => {
    adminApi.master().then(setMaster).catch(() => {});
  }, []);

  useEffect(() => {
    if (!listing) return;
    form.setFieldsValue({
      basePrice: listing.basePrice,
      availability: listing.availability,
      category: listing.category,
      enabled: listing.enabled !== false,
      ...parseHours(listing.operatingHours),
    });
  }, [listing, form]);

  const handleOk = async () => {
    const v = await form.validateFields();
    const operatingHours = v.allDay ? '24 Hours' : `${v.open.format(FORMAT)} - ${v.close.format(FORMAT)}`;
    setSaving(true);
    try {
      await adminApi.updateListing(listing.id, {
        basePrice: v.basePrice,
        operatingHours,
        availability: v.availability,
        category: v.category,
        enabled: v.enabled,
      });
      message.success('Listing updated');
      onSaved?.();
      onClose();
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not update listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={listing ? `Edit ${listing.name}` : 'Edit listing'}
      open={Boolean(listing)}
      onCancel={onClose}
      onOk={handleOk}
      okText="Save"
      confirmLoading={saving}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="basePrice" label="Price per use (₹)" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber className="w-full" min={0} />
        </Form.Item>
        <Form.Item name="allDay" label="Open 24 hours" valuePropName="checked">
          <Switch />
        </Form.Item>
        {allDay ? null : (
          <div className="flex gap-3">
            <Form.Item name="open" label="Opens" className="flex-1" rules={[{ required: true }]}>
              <TimePicker className="w-full" use12Hours format={FORMAT} minuteStep={5} needConfirm={false} />
            </Form.Item>
            <Form.Item name="close" label="Closes" className="flex-1" rules={[{ required: true }]}>
              <TimePicker className="w-full" use12Hours format={FORMAT} minuteStep={5} needConfirm={false} />
            </Form.Item>
          </div>
        )}
        <Form.Item name="availability" label="Availability" rules={[{ required: true }]}>
          <Select options={master.availability.map(i => ({ value: i.value, label: i.label }))} />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select options={master.categories.map(i => ({ value: i.value, label: i.label }))} />
        </Form.Item>
        <Form.Item name="enabled" label="Shown on the map" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditListingModal;
