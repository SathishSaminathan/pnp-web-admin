import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Modal, Form, Input, Select, InputNumber, Drawer, Descriptions, Popconfirm, message, Dropdown } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { providersApi } from '../../api/modules/providers';
import { formatAmount } from '../../utils/number.utils';

const { Title, Text } = Typography;

const ProvidersList = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    // CRUD States
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [form] = Form.useForm();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await providersApi.getAllProviders();
            setProviders(response?.data?.providers ?? []);
        } catch {
            message.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleView = (record) => {
        setSelectedProvider(record);
        setIsViewDrawerVisible(true);
    };

    const handleDelete = (id) => {
        // Mock delete logic
        const updatedProviders = providers.filter(p => p.id !== id);
        setProviders(updatedProviders);
        message.success("Provider deleted successfully");
    };

    const handleAddSubmit = (values) => {
        // Mock add logic
        const newProvider = {
            id: `P-${Math.floor(Math.random() * 1000)}`,
            ...values,
            status: 'active'
        };
        setProviders([newProvider, ...providers]);
        message.success("Provider added successfully");
        setIsAddModalVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Provider Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Balance',
            key: 'balance',
            render: (_, record) => (
                <Text>${formatAmount(record.balance, { decimals: 0, maxDecimals: 0 })} {record.currency}</Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'maintenance') color = 'orange';
                if (status === 'offline') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) =>
                isMobile ? (
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'view',   label: 'View Details', icon: <EyeOutlined /> },
                                { type: 'divider' },
                                { key: 'delete', label: 'Delete',       icon: <DeleteOutlined />, danger: true },
                            ],
                            onClick: ({ key }) => {
                                if (key === 'view') {
                                    handleView(record);
                                } else if (key === 'delete') {
                                    Modal.confirm({
                                        title:         'Delete the provider',
                                        content:       'Are you sure to delete this provider?',
                                        onOk:          () => handleDelete(record.id),
                                        okButtonProps: { danger: true },
                                        okText:        'Delete',
                                        cancelText:    'No',
                                    });
                                }
                            },
                        }}
                    >
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                ) : (
                    <Space size="middle">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
                        <Popconfirm
                            title="Delete the provider"
                            description="Are you sure to delete this provider?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <Title level={3} className="!m-0 text-gray-800">Account Providers</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>Add Provider</Button>
            </div>

            <Card className="rounded-2xl border-none shadow-sm shadow-blue-900/5">
                <Table
                    columns={columns}
                    dataSource={providers}
                    rowKey="id"
                    loading={loading}
                    className="custom-minimal-table"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Add Provider Modal */}
            <Modal
                title="Add New Provider"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Add Provider"
            >
                <Form form={form} layout="vertical" onFinish={handleAddSubmit} className="mt-4">
                    <Form.Item name="name" label="Provider Name" rules={[{ required: true, message: 'Please enter provider name' }]}>
                        <Input placeholder="e.g. Stripe, PayPal" />
                    </Form.Item>
                    <Form.Item name="type" label="Provider Type" rules={[{ required: true }]}>
                        <Select placeholder="Select type">
                            <Select.Option value="Payment Gateway">Payment Gateway</Select.Option>
                            <Select.Option value="Wallet">Wallet</Select.Option>
                            <Select.Option value="Crypto Exchange">Crypto Exchange</Select.Option>
                            <Select.Option value="Bank">Bank</Select.Option>
                        </Select>
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item name="balance" label="Initial Balance" className="flex-1" rules={[{ required: true }]} initialValue={0}>
                            <InputNumber className="w-full" min={0} />
                        </Form.Item>
                        <Form.Item name="currency" label="Currency" className="flex-1" rules={[{ required: true }]}>
                            <Select placeholder="Currency">
                                <Select.Option value="USD">USD</Select.Option>
                                <Select.Option value="EUR">EUR</Select.Option>
                                <Select.Option value="GBP">GBP</Select.Option>
                                <Select.Option value="BTC">BTC</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* View Provider Drawer */}
            <Drawer
                title="Provider Details"
                placement="right"
                onClose={() => setIsViewDrawerVisible(false)}
                open={isViewDrawerVisible}
                width={400}
            >
                {selectedProvider && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Provider ID">{selectedProvider.id}</Descriptions.Item>
                        <Descriptions.Item label="Name">{selectedProvider.name}</Descriptions.Item>
                        <Descriptions.Item label="Type">{selectedProvider.type}</Descriptions.Item>
                        <Descriptions.Item label="Balance">${formatAmount(selectedProvider.balance, { decimals: 0, maxDecimals: 0 })} {selectedProvider.currency}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <span className="capitalize">{selectedProvider.status}</span>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default ProvidersList;
