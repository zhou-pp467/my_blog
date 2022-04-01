import { PageLoading } from '@ant-design/pro-layout';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import *as apis from './services/ant-design-pro/api';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */

export const initialStateConfig = {
  loading: <PageLoading />,
};
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */

export async function getInitialState() {


  /**获取token */
  const getAccessToken = async (values) => {
    try {
      const token = await apis.getToken(values);
      let { access, refresh } = token
      localStorage.setItem("access-token", access)
      localStorage.setItem("refresh-token", refresh)
      return true

    } catch (error) {

    }
  }

  const fetchUserInfo = async (values) => {
    try {
      const Auth = await getAccessToken(values)
      if (Auth) {
        const msg = await apis.currentUser({});
        if (msg) return msg
      }


    } catch (error) {

      // localStorage.clear()
      // history.push(loginPath);
    }

    // return undefined;
  }; // 如果是登录页面，不执行


  //这段代码暂时不执行
  if (history.location.pathname.indexOf("/user") < 0) {
    let c_token = localStorage.getItem("access-token") || ""
    if (c_token != "") {
      const msg = await apis.currentUser({});
      if (msg) {
        return {
          fetchUserInfo,
          currentUser: msg,
          settings: {},
        };
      } else {

      }
    }

  }

  return {
    fetchUserInfo,
    settings: {},
  };


} // ProLayout 支持的api https://procomponents.ant.design/components/layout

export const layout = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history; // 如果没有登录，重定向到 login
      //这段暂时注释掉
      if (!initialState?.currentUser && location.pathname.indexOf("/user") < 0) {
        // history.push(loginPath);
        // localStorage.clear()
      }
    },

  };
};
