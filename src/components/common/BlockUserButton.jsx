import React, { useState } from 'react';
import { Button, Input, Modal, Popconfirm } from 'antd';

const BlockUserButton = ({ user, onToggle, loading }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Blocked by admin');

  if (!user?.id) return null;

  if (user.blocked) {
    return (
      <Popconfirm
        title="Unblock this user?"
        description="They can log in again. An account restored push will be sent to their device."
        onConfirm={() => onToggle(user, false, '')}
      >
        <Button size="small">Unblock</Button>
      </Popconfirm>
    );
  }

  return (
    <>
      <Button size="small" danger loading={loading} onClick={() => setOpen(true)}>
        Block
      </Button>
      <Modal
        title="Block this user?"
        open={open}
        okText="Block and notify"
        okButtonProps={{ danger: true, loading }}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          await onToggle(user, true, reason.trim() || 'Blocked by admin');
          setOpen(false);
        }}
      >
        <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
          They will not be able to use the app until you unblock them. A push notification will still be delivered to their device.
        </p>
        <Input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason shown in the notification"
        />
      </Modal>
    </>
  );
};

export default BlockUserButton;
