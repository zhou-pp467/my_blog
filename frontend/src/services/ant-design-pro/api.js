// @ts-ignore

/* eslint-disable */
// import { request } from 'umi';

import request from "@/utils/request";
import { Modal, Button, Space } from 'antd';
import Login from "@/pages/user/Login";
import { history } from 'umi';
const loginPath = '/user/login';




/**处理http请求 */
const httpReq = async (url, param, method, requestHeader = "") => {

  if (((param ?? "") != "") && Object.keys(param).length && param.hasOwnProperty("isNeedLogin")) {
    Modal.warning({
      okText: "去登录",
      closable: true,
      onOk: () => { history.push('/user/login') },
      title: '您还未登录，快去登录吧~',
    })
  } else {
    let result = await request(url, {
      method,
      data: param,
      requestHeader
    })

    if (result) {
      if (result.hasOwnProperty("businessCode")) {
        let { businessCode } = result
        if (businessCode * 1 === 1000) {
          return result?.content
        }
      } else {

        if (result.status == 400) {
          history.push(loginPath);
        } else if (result.status == 401) {

          if (url.indexOf("/api/token/refresh") > -1) {
            localStorage.clear()
            history.push(loginPath)
          } else {

            const refreshRes = await refreshToken({
              refresh: localStorage.getItem("refresh-token")
            })

            if (refreshRes && refreshRes.hasOwnProperty("access")) {
              let { access, refresh } = refreshRes
              localStorage.setItem("access-token", access)
              localStorage.setItem("refresh-token", refresh)

              let res = await request(url, {
                method,
                data: param,
                requestHeader: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: `Bearer ${access}`
                }
              })
              return res?.content;
            }
          }
        }
        else {
          return result
        }
      }

    } else {

      // if (url.indexOf("/api/token/refresh")) {
      //   localStorage.clear()
      //   history.push(loginPath)
      //   return null
      // }
      // console.log("await response ", result)
    }
  }

}




/**from 20211213 */

/**注册 POST   /api/user/register */
export async function register(param) {
  return httpReq(`/api/user/register`, param, 'POST')
}

/** 登录接口 POST /api/login/account */
export async function login(param) {
  return httpReq(`/api/login`, param, "POST")
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(param) {
  let c_token = localStorage.getItem("access-token") || "";
  // alert(11)
  let headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Authorization: `Bearer ${c_token}`,
  };
  return httpReq(`/api/getUserInfo`, param, "POST");
}

/**getToken POST */
export async function getToken(param) {

  return httpReq(`/api/token`, param, "POST", {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });
}

/**换取token  POST /api/refresh/token*/
export async function refreshToken(param) {
  return httpReq(`/api/token/refresh`, param, "POST");
}

/** 退出登录接口 POST /api/login/outLogin */

export async function outLogin(param) {
  return httpReq(`/api/logout`, param, "POST");
}

/**上传头像 POST /api/upload/avatar*/
export async function uploadAvatar(param) {
  return httpReq(`/api/upload/avatar`, param, "POST");
}

/**建立标签分类信息【管理员权限】 POST /api/addTag*/
export async function addTag(param) {
  return httpReq(`/api/addTag`, param, "POST");
}

/**删除标签分类信息【管理员权限】POST /api/deleteTagById */
export async function deleteTagById(param) {
  return httpReq(`/api/deleteTagById`, param, "POST");
}

/**修改标签分类信息【管理员权限 POST /api/modifyTag*/
export async function modifyTagById(param) {
  return httpReq(`/api/modifyTag`, param, "POST");
}

/**首页获取分类信息 GET /api/getCategoryMenu*/
export async function getCategoryMenu(param) {
  return httpReq(`/api/getCategoryMenu`, param, "GET");
}

/**发博客 POST  /api/blo*/
export async function sendBlog(param) {
  return httpReq(`/api/blog`, param, "POST");
}
/**透传博客内容 POST  /api/mapBlogById*/
export async function mapBlogById(param) {
  return httpReq(`/api/mapBlogById`, param, "POST");
}
/**修改博客 POST /api/modify/blog*/
export async function modifyBlog(param) {
  return httpReq(`/api/modify/blog`, param, "POST");
}

/**删除博客 POST /api/deleteBlogById*/
export async function deleteBlogById(param) {
  return httpReq(`/api/deleteBlogById`, param, "POST");
}

/**发评论 POST /api/comment*/
export async function comment(param) {
  return httpReq(`/api/comment`, param, "POST");
}

/**删除评论 POST /api/deleteCommentById*/
export async function deleteCommentById(param) {
  return httpReq(`/api/deleteCommentById`, param, "POST");
}


/**博客详情 GET /api/getBlogDetail*/
export async function getBlogDetail(param) {
  return httpReq(`/api/getBlogDetail`, param, "GET");
}

/**获取个人中心页面的数据【博客列表、权限拦截】POST /api/getPersonalCenter*/
export async function getPersonalCenter(param) {
  return httpReq(`/api/getPersonalCenter`, param, "POST");
}

/**查看fork和follower的个人中心 GET /api/query/info*/
export async function getQueryInfo(param) {
  return httpReq(`/api/query/info`, param, "GET");
}

/**关注 POST /api/forkUser*/
export async function forkUser(param) {
  return httpReq(`/api/forkUser`, param, "POST");
}

/**取消关注 POST /api/cancel/for*/
export async function cancelForkUser(param) {
  return httpReq(`/api/cancel/fork`, param, "POST");
}

/**修改用户信息 POST /api/modify/userInfo*/
export async function modifyUserInfo(param) {
  return httpReq(`/api/modify/userInfo`, param, "POST");
}

/**修改密码 POST /api/modify/password*/
export async function modifyPassword(param) {
  return httpReq(`/api/modify/password`, param, "POST");
}

/**查询标签列表【管理中心- 管理员权限/ 用户发博客页面】GET /api/getTags*/
export async function getTags(param) {
  return httpReq(`/api/getTags`, param, "GET");
}

