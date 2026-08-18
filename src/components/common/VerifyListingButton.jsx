import React from 'react';
import { Button, Popconfirm } from 'antd';

const VerifyListingButton = ({ listing, onToggle, loading }) => {
  if (!listing?.id) return null;

  if (listing.verified) {
    return (
      <Popconfirm
        title="Remove verification?"
        description="This toilet will lose the Verified badge in the app. The owner will be notified."
        okText="Unverify"
        onConfirm={() => onToggle(listing, false)}
      >
        <Button size="small" loading={loading}>Unverify</Button>
      </Popconfirm>
    );
  }

  return (
    <Popconfirm
      title="Approve this listing?"
      description="This toilet will show as Verified in the app. The owner will be notified."
      okText="Approve"
      onConfirm={() => onToggle(listing, true)}
    >
      <Button size="small" type="primary" loading={loading}>Approve</Button>
    </Popconfirm>
  );
};

export default VerifyListingButton;
