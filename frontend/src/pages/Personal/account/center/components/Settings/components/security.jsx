import React, { useState } from 'react';
import { List } from 'antd';
import { Modal, Form, Input, Checkbox, Button, message } from 'antd';
import ModalForm from '@/components/Modal';
import *as apis from '@/services/ant-design-pro/api'
const passwordStrength = {
  strong: <span className="strong">强</span>,
  medium: <span className="medium">中</span>,
  weak: <span className="weak">弱 Weak</span>,
};

const SecurityView = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm();
  const getData = () => [
    {
      title: '账户密码',
      actions: [<a onClick={handleModifyPW} key="Modify">修改</a>],
    },
    /**以下功能等迭代 */
    // {
    //   title: '密保手机',
    //   description: `已绑定手机：138****8293`,
    //   actions: [<a key="Modify">修改</a>],
    // },
    // {
    //   title: '密保问题',
    //   description: '未设置密保问题，密保问题可有效保护账户安全',
    //   actions: [<a key="Set">设置</a>],
    // },
    // {
    //   title: '备用邮箱',
    //   description: `已绑定邮箱：ant***sign.com`,
    //   actions: [<a key="Modify">修改</a>],
    // },
    // {
    //   title: 'MFA 设备',
    //   description: '未绑定 MFA 设备，绑定后，可以进行二次确认',
    //   actions: [<a key="bind">绑定</a>],
    // },
  ];

  const handleModifyPW = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleOk = async () => {

    let oldPwd = form.getFieldValue('oldPwd')
    let newPwd = form.getFieldValue('newPwd')
    if (!(oldPwd || newPwd)) return message.error("新旧密码不能为空")
    let res = await apis.modifyPassword({
      oldPwd,
      newPwd
    })
    if (res) {
      message.success("密码修改成功")
      setIsModalVisible(false)
    } else {
      message.error("密码修改失败")
    }
  }

  const onFinish = () => {

  }

  const onFinishFailed = () => {

  }

  // const checkConfirm = (_, value) => {
  //   if (value && value !== form.getFieldValue('newPwd')) {
  //     return message.error('两次输入的密码不匹配!');
  //   }

  //   return promise.resolve();
  // };

  const data = getData();
  return (
    <>
      <ModalForm
        destroyOnClose
        isModalVisible={isModalVisible} handleCancel={handleCancel}
        handleOk={handleOk}
        modalTitle={"修改密码"}
      >
        <Form

          preserve={false}
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          // onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="旧密码"
            name="oldPwd"
            rules={[{ required: true, message: '请输入旧密码!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPwd"
            rules={
              [
                { required: true, message: '请输入新密码!' },
              ]
            }

          >
            <Input.Password />
          </Form.Item>
        </Form>
      </ModalForm>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </>
  );
};

export default SecurityView;
