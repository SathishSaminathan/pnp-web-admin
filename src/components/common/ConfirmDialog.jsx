import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;

export const showConfirmDialog = ({ title, content, onConfirm, onCancel, okText = 'Confirm', okType = 'danger' }) => {
    confirm({
        title: title || 'Are you sure?',
        icon: <ExclamationCircleFilled />,
        content: content || 'This action cannot be undone.',
        okText: okText,
        okType: okType,
        cancelText: 'Cancel',
        onOk() {
            if (onConfirm) return onConfirm();
        },
        onCancel() {
            if (onCancel) return onCancel();
        },
        centered: true,
        maskClosable: true,
    });
};
