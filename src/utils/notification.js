import { message } from 'antd';

export const notifySuccess = (msg) => {
    message.success({ content: msg, duration: 3 });
};

export const notifyError = (msg) => {
    message.error({ content: msg, duration: 4 });
};

export const notifyWarning = (msg) => {
    message.warning({ content: msg, duration: 3 });
};

export const notifyInfo = (msg) => {
    message.info({ content: msg, duration: 3 });
};
