import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Tag, Space, Button, Modal, Form, Input, Select, Drawer, Descriptions, Popconfirm, message, Dropdown } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, MoreOutlined } from '@ant-design/icons';
import { requestsApi } from '../../api/modules/requests';

const { Title, Text } = Typography;

const RequestsList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // CRUD States
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [form] = Form.useForm();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestsApi.getAllRequests();
            setRequests(response?.data?.requests ?? []);
        } catch {
            message.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleView = (record) => {
        setSelectedRequest(record);
        setIsViewDrawerVisible(true);
    };

    const handleDelete = (id) => {
        const updatedRequests = requests.filter(r => r.id !== id);
        setRequests(updatedRequests);
        message.success("Request deleted successfully");
    };

    const handleStatusChange = (id, newStatus) => {
        const updatedRequests = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
        setRequests(updatedRequests);
        message.success(`Request marked as ${newStatus.replace('_', ' ')}`);
    };

    const handleAddSubmit = (values) => {
        const newRequest = {
            id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
            ...values,
            date: new Date().toISOString(),
            status: 'pending'
        };
        setRequests([newRequest, ...requests]);
        message.success("Request created successfully");
        setIsAddModalVisible(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Request ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: 'Merchant',
            dataIndex: 'merchant',
            key: 'merchant',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                if (status === 'approved') color = 'green';
                if (status === 'rejected') color = 'red';
                if (status === 'action_required') color = 'orange';
                return <Tag color={color} className="rounded-full px-3">{status.replace('_', ' ').toUpperCase()}</Tag>;
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
                                { key: 'view', label: 'View Details', icon: <EyeOutlined /> },
                                ...(record.status === 'pending' ? [
                                    { type: 'divider' },
                                    { key: 'approve', label: 'Approve', icon: <CheckCircleOutlined /> },
                                    { key: 'reject',  label: 'Reject',  icon: <CloseCircleOutlined />, danger: true },
                                ] : []),
                                { type: 'divider' },
                                { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
                            ],
                            onClick: ({ key }) => {
                                if (key === 'view') {
                                    handleView(record);
                                } else if (key === 'approve') {
                                    Modal.confirm({
                                        title:  'Approve this request?',
                                        onOk:   () => handleStatusChange(record.id, 'approved'),
                                        okText: 'Approve',
                                    });
                                } else if (key === 'reject') {
                                    Modal.confirm({
                                        title:         'Reject this request?',
                                        onOk:          () => handleStatusChange(record.id, 'rejected'),
                                        okButtonProps: { danger: true },
                                        okText:        'Reject',
                                    });
                                } else if (key === 'delete') {
                                    Modal.confirm({
                                        title:         'Delete this request?',
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
                        {record.status === 'pending' && (
                            <>
                                <Popconfirm title="Approve this request?" onConfirm={() => handleStatusChange(record.id, 'approved')}>
                                    <Button type="text" className="text-green-600" icon={<CheckCircleOutlined />} />
                                </Popconfirm>
                                <Popconfirm title="Reject this request?" onConfirm={() => handleStatusChange(record.id, 'rejected')}>
                                    <Button type="text" danger icon={<CloseCircleOutlined />} />
                                </Popconfirm>
                            </>
                        )}
                        <Popconfirm
                            title="Delete this request?"
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
                <Title level={3} className="!m-0 text-gray-800">Account Requests</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>Create Request</Button>
            </div>

            <Card className="rounded-2xl border-none shadow-sm shadow-blue-900/5">
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    className="custom-minimal-table"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Add Request Modal */}
            <Modal
                title="Create New Request"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Submit"
            >
                <Form form={form} layout="vertical" onFinish={handleAddSubmit} className="mt-4">
                    <Form.Item name="merchant" label="Merchant Name" rules={[{ required: true }]}>
                        <Input placeholder="Enter merchant name" />
                    </Form.Item>
                    <Form.Item name="type" label="Request Type" rules={[{ required: true }]}>
                        <Select placeholder="Select type">
                            <Select.Option value="Account Setup">Account Setup</Select.Option>
                            <Select.Option value="Limit Increase">Limit Increase</Select.Option>
                            <Select.Option value="KYC Update">KYC Update</Select.Option>
                            <Select.Option value="New Currency">New Currency</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Request Drawer */}
            <Drawer
                title="Request Details"
                placement="right"
                onClose={() => setIsViewDrawerVisible(false)}
                open={isViewDrawerVisible}
                width={400}
            >
                {selectedRequest && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Request ID">{selectedRequest.id}</Descriptions.Item>
                        <Descriptions.Item label="Merchant">{selectedRequest.merchant}</Descriptions.Item>
                        <Descriptions.Item label="Type">{selectedRequest.type}</Descriptions.Item>
                        <Descriptions.Item label="Date">{new Date(selectedRequest.date).toLocaleString()}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <span className="capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default RequestsList;
