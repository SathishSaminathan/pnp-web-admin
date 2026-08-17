import React from 'react';
import { Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { str } from '../utils/userDetailHelpers.jsx';

const AddressCard = ({ addr, label }) => {
    if (!addr) return null;
    const line1 = addr.line1 ?? addr.addressLine1;
    const line2 = addr.line2 ?? addr.addressLine2;
    const city = addr.cityName ?? str(addr.city);
    const state = addr.stateName ?? str(addr.state);
    const country = addr.countryName ?? str(addr.country);
    const postCode = addr.pincode ?? addr.postCode;

    return (
        <InfoCard>
            <SectionHeader icon={<HomeOutlined />} title={label} />
            <Grid2>
                {line1 && <Field label="Address Line 1" value={line1} full />}
                {line2 && <Field label="Address Line 2" value={line2} full />}
                <Field label="City" value={city} />
                <Field label="State" value={state} />
                <Field label="Country" value={country} />
                <Field label="Post Code" value={postCode} />
            </Grid2>
        </InfoCard>
    );
};

const AddressSection = ({ addresses }) => {
    if (!addresses?.residential && !addresses?.physical) {
        return <Empty description="No addresses found" />;
    }

    return (
        <div className="flex flex-col gap-6">
            <AddressCard addr={addresses?.residential} label="Residential Address" />
            <AddressCard addr={addresses?.physical} label="Physical Address" />
        </div>
    );
};

export default AddressSection;
