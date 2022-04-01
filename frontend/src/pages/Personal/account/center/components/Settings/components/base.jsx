import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, message } from 'antd';
import ProForm, {
  ProFormDependency,
  ProFormFieldSet,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useRequest, useModel } from 'umi';
import { queryCurrent } from '../service';
import { queryProvince, queryCity } from '../service';
import styles from './BaseView.less';
import { defaultImg } from '@/utils/utils';
import * as apis from '@/services/ant-design-pro/api'


const BaseView = () => {
  const { initialState, setInitialState } = useModel("@@initialState")
  const { currentUser, currentUser: { avatar } } = initialState
  const [userAvatar, setAvatar] = useState(avatar || defaultImg)
  /**此处代码留到后面学习 */
  // const { data: currentUser, loading } = useRequest(() => {
  //   return queryCurrent();
  // });

  // 头像组件 方便以后独立，增加裁剪之类的功能
  const AvatarView = ({ avatar }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload
        onChange={handleChange}
        showUploadList={false}
        action={"/api/upload/avatar"}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            更换头像
          </Button>
        </div>
      </Upload>
    </>
  );

  const handleChange = (info) => {
    let { file: { status, response } } = info
    if (status === "done") {
      if (response?.businessCode * 1 === 1000) return setAvatar(response.content)
    }
  }

  /**
   * @desc 提交更新信息
   * @param {*} values 
   */

  const handleFinish = async (values) => {

    let res = await apis.modifyUserInfo({ ...values, userName: values?.username, avatar: userAvatar })
    if (res) {
      message.success('更新基本信息成功');
      let result = await apis.currentUser({})
      if (result) {
        setInitialState((s) => ({ ...s, currentUser: result }));
      }
    }
  };

  return (
    <div className={styles.baseView}>
      <>
        <div className={styles.left}>
          <ProForm
            layout="vertical"
            onFinish={handleFinish}
            submitter={{
              resetButtonProps: {
                style: {
                  display: 'none',
                },
              },
              submitButtonProps: {
                children: '更新基本信息',
              },
            }}
            initialValues={{ ...currentUser }}
            // initialValues={{ ...currentUser, mobile: currentUser?.mobile }}
            hideRequiredMark
          >
            <ProFormText
              width="md"
              name="email"
              label="邮箱"
              rules={[
                {
                  required: true,
                  message: '请输入您的邮箱!',
                },
              ]}
            />
            <ProFormText
              width="md"
              name="username"
              label="昵称"
              rules={[
                {
                  required: true,
                  message: '请输入您的昵称!',
                },
              ]}
            />
            {/* <ProFormTextArea
                name="profile"
                label="个人简介"
                rules={[
                  {
                    required: true,
                    message: '请输入个人简介!',
                  },
                ]}
                placeholder="个人简介"
              /> */}
            {/* <ProFormSelect
                width="sm"
                name="country"
                label="国家/地区"
                rules={[
                  {
                    required: true,
                    message: '请输入您的国家或地区!',
                  },
                ]}
                options={[
                  {
                    label: '中国',
                    value: 'China',
                  },
                ]}
              /> */}
            {/* 
              <ProForm.Group title="所在省市" size={8}>
                <ProFormSelect
                  rules={[
                    {
                      required: true,
                      message: '请输入您的所在省!',
                    },
                  ]}
                  width="sm"
                  fieldProps={{
                    labelInValue: true,
                  }}
                  name="province"
                  className={styles.item}
                  request={async () => {
                    return queryProvince().then(({ data }) => {
                      return data.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                    });
                  }}
                />
                <ProFormDependency name={['province']}>
                  {({ province }) => {
                    return (
                      <ProFormSelect
                        params={{
                          key: province?.value,
                        }}
                        name="city"
                        width="sm"
                        rules={[
                          {
                            required: true,
                            message: '请输入您的所在城市!',
                          },
                        ]}
                        disabled={!province}
                        className={styles.item}
                        request={async () => {
                          if (!province?.key) {
                            return [];
                          }

                          return queryCity(province.key || '').then(({ data }) => {
                            return data.map((item) => {
                              return {
                                label: item.name,
                                value: item.id,
                              };
                            });
                          });
                        }}
                      />
                    );
                  }}
                </ProFormDependency>
              </ProForm.Group> */}
            {/* <ProFormText
                width="md"
                name="address"
                label="街道地址"
                rules={[
                  {
                    required: true,
                    message: '请输入您的街道地址!',
                  },
                ]}
              /> */}
            <ProFormText
              name="mobile"
              label="联系电话"
              // valuePropName="mobile"
              rules={[
                {
                  required: true,
                  message: '请输入您的联系电话!',
                },
                {
                  pattern: /^\d{11}$/,
                  message: '手机号格式错误!',
                },
                // {
                //   validator: validatorPhone,
                // },
              ]}
            />
            {/* <Input className={styles.phone_number} />
            </ProFormText> */}
          </ProForm>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={userAvatar} />
        </div>
      </>
    </div>
  );
};

export default BaseView;
