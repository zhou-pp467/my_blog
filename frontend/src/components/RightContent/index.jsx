import { Space, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { useModel, SelectLang, history } from 'umi';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import NoticeIcon from '../NoticeIcon/NoticeIcon';


const menu = [
  {
    type: "center",
    name: "个人中心"
  },
  {
    type: "setting",
    name: "设置"
  },
]

const GlobalHeaderRight = () => {
  const { initialState } = useModel('@@initialState');


  if (!initialState || !initialState.settings) {
    return null;
  }
  const { currentUser } = initialState

  const { navTheme, layout } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  /**
   * 写创作
   */
  const clickToCreate = () => {
    history.push("/blog-edit")
  }

  return (
    <Space className={className}>
      {
        currentUser?.username ? <>
          <NoticeIcon />
          {
            history.location.pathname !== "/blog-edit" && <Button type="primary" onClick={clickToCreate}>写创作</Button>
          }
          <Avatar menu={menu} />

        </> : <Button type="primary" onClick={() => {
          history.push("/user/login")
        }}>登录</Button>
      }
    </Space>
  );
};

export default GlobalHeaderRight;
