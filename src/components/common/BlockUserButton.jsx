import React from 'react';
import { Button, Popconfirm } from 'antd';

const BlockUserButton = ({ user, onToggle, loading }) => {
  if (!user?.id) return null;

  if (user.blocked) {
    return (
      <Popconfirm
        title="Unblock this user?"
        description="They will be able to log in to the app again."
        onConfirm={() => onToggle(user, false)}
      >
        <Button size="small">Unblock</Button>
      </Popconfirm>
    );
  }

  return (
    <Popconfirm
      title="Block this user?"
      description="They will not be able to log in until you unblock them."
      okText="Block"
      okButtonProps={{ danger: true }}
      onConfirm={() => onToggle(user, true)}
    >
      <Button size="small" danger loading={loading}>Block</Button>
    </Popconfirm>
  );
};

export default BlockUserButton;
