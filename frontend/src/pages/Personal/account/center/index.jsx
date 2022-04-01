import { ProfileOutlined, SettingOutlined, UserOutlined, PlusOutlined, HomeOutlined, ContactsOutlined, ClusterOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Input, Row, Tag, message, Button } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { Link, useRequest, History, useModel } from 'umi';
import ForkUser from './components/ForkPerson';
import Articles from '@/components/Articles';
import styles from './Center.less';
import cls from 'classnames'
import Settings from './components/Settings'
import Admin from './components/Admin'
import *as apis from '@/services/ant-design-pro/api'
import { defaultImg } from '@/utils/utils'
import Modal from '@/components/Modal';
import NoLogin from "@/pages/404"

// const currentUser = {
//   name: 'Serati Ma',
//   avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
//   userid: '00000001',
//   email: 'antdesign@alipay.com',
//   signature: '海纳百川，有容乃大',
//   title: '交互专家',
//   group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
//   tags: [
//     {
//       key: '0',
//       label: '很有想法的',
//     },
//     {
//       key: '1',
//       label: '专注设计',
//     },
//     {
//       key: '2',
//       label: '辣~',
//     },
//     {
//       key: '3',
//       label: '大长腿',
//     },
//     {
//       key: '4',
//       label: '川妹子',
//     },
//     {
//       key: '5',
//       label: '海纳百川',
//     },
//   ],
//   notifyCount: 12,
//   unreadCount: 11,
//   country: 'China',
//   // access: getAccess(),
//   geographic: {
//     province: {
//       label: '浙江省',
//       key: '330000',
//     },
//     city: {
//       label: '杭州市',
//       key: '330100',
//     },
//   },
//   address: '西湖区工专路 77 号',
//   phone: '0752-268888888',
// }


const menuList = [
  {
    menuId: 0,
    menuType: "blog",
    menuName: "博客中心"
  },
  {
    menuId: 1,
    menuType: "settings",
    menuName: "设置中心"
  },
  {
    menuId: 2,
    menuType: "admin",
    menuName: "管理中心"
  }
]

const IconMap = {
  "blog": <ProfileOutlined />,
  "settings": <SettingOutlined />,
  "admin": <UserOutlined />
}


const loading = false;



const Center = () => {
  const { initialState, setInitialState } = useModel("@@initialState")
  const [tabKey, setTabKey] = useState('articles'); //  获取用户信息
  const [current, setCurrent] = useState(0) //当前高亮的tab
  const [personInfo, setPersonInfo] = useState({}) //个人中心信息
  const [blogId, setBlogId] = useState("")  //当前博客id
  const [isModalVisible, setIsModalVisible] = useState(false)  //删除框显隐藏
  const { currentUser, } = initialState

  if (!(currentUser?.userId)) {

    return <NoLogin status={403} needBtn={false} title="您还未登录，点击右上角去登录～" />

  }
  const { username, avatar } = currentUser

  /**初次请求数据 */
  useEffect(async () => {
    queryPersonInfo()
  }, [])

  /**
   * 查询当前数据
   * @param {*} current  当前索引
   */
  const queryPersonInfo = async (tabKey) => {
    try {
      let res = await apis.getPersonalCenter({})
      if (res) {
        setPersonInfo(res)
        if (tabKey) setTabKey(tabKey)
      }
    } catch (error) {

    }
  }


  //切换tab
  const clickToUrl = (_index, _item) => {
    let { menuType } = _item
    setCurrent(_index)
    switch (menuType) {
      case "blog":
        return renderBlog()
      case "settings":
        // history.push('/setting')
        return <><Settings /></>

      default:
        break
    }
  }

  /**博客 */
  const renderBlog = () => {

    return <Card
      className={styles.tabsCard}
      bordered={false}
      tabList={operationTabList}
      activeTabKey={tabKey}
      onTabChange={(_tabKey) => {
        setTabKey(_tabKey);
      }}
    >
      {renderChildrenByTabKey(tabKey)}
    </Card>
  }


  /**左侧菜单栏 */
  const renderTabs = () => {
    const { active } = styles
    return (
      <div className={styles.tabStyle}>
        {personInfo.asideMenu.map((_item, _index) => {
          let { menuId, menuName, menuType } = _item
          return (
            <p onClick={() => {
              clickToUrl(_index, _item)
            }} key={menuId} className={cls(current == _index ? active : null)}>
              {IconMap[menuType]}
              <span style={{
                marginLeft: 8,
              }}>{menuName}</span>
            </p>
          )
        })}

      </div>
    );
  }



  /**
   * @name Fn 处理关注/取消关注的函数
   * @param {*} item  当前关注/粉丝信息
   * @param {*} tabValue  当前博客中心所定的tab类型
   */
  const handleForkUser = async (item, tabValue) => {
    let { isForked, userId } = item
    try {
      let res = await apis[isForked ? "cancelForkUser" : "forkUser"]({ userId })
      if (res) {
        queryPersonInfo(tabValue)
      } else {
        message.error(isForked ? "取消关注失败" : "关注失败", 2)

      }
    } catch (error) {

    }
  }

  /**删除博客的回调 */
  const deleteCallBack = (id) => {
    setBlogId(id)
    clickModal(true)
  }

  /**删除对话框的处理函数*/
  const clickModal = async (type) => {
    if (type == true) {
      await apis.deleteBlogById({ blogId }).then(res => {
        if (res ?? "" !== "") {
          message.success("删除成功", 2)
          queryPersonInfo()
        } else {
          message.error("删除失败", 2)
        }
      })
    }
    return setIsModalVisible(false)
  }


  /**博客中心的tab列表 */
  const renderChildrenByTabKey = (tabValue) => {
    let { myBlogList, forkList, followerList, } = personInfo
    switch (tabValue) {
      case "articles":
        return <Articles listData={myBlogList} deleteCallBack={deleteCallBack} />;
      case "fork":
        return <ForkUser listData={forkList} handleForkUser={(item) => {
          handleForkUser(item, tabValue)
        }} />;
      case "follow":
        return <ForkUser listData={followerList} handleForkUser={(item) => {
          handleForkUser(item, tabValue)
        }} />;
      default:
        break;
    }
    return null;
  };

  if (!Object.keys(personInfo).length) {
    return null
  }

  /**博客中心右侧内容mapList */
  const operationTabList = [
    {
      key: 'articles',
      tab: (
        <span>
          博客文章
          <span
            style={{
              fontSize: 14,
            }}
          >
            {`(${personInfo?.myBlogList?.length})` || ""}
          </span>
        </span>
      ),
    },
    {
      key: 'fork',
      tab: (
        <span>
          关注者
          <span
            style={{
              fontSize: 14,
            }}
          >
            {`(${personInfo?.forkList?.length})` || ""}
          </span>
        </span>
      ),
    },
    {
      key: 'follow',
      tab: (
        <span>
          粉丝
          <span
            style={{
              fontSize: 14,
            }}
          >
            {`(${personInfo?.followerList?.length})` || ""}
          </span>
        </span>
      ),
    },
  ];

  return (
    <GridContent>
      <Row gutter={24}>
        <Col lg={7} md={24}>
          {/* 删除对话框 */}
          <Modal
            isModalVisible={isModalVisible}
            // modalTitle="确定删除该文章吗" 
            handleCancel={
              () => clickModal(false)
            }
            handleOk={() => clickModal(true)}
            children={<div>确定删除该文章吗</div>} />
          <Card
            bordered={false}
            style={{
              marginBottom: 24,
            }}
            loading={loading}
          >
            {!loading && Object.keys(currentUser).length && (
              <div className={styles.avatarHolder}>
                <img alt="" src={avatar || defaultImg} />
                <div className={styles.name}>{username}</div>
                <div>身份：{currentUser.role == 0 ? "管理员" : "博主"}</div>
                <div>加入博客时间：{personInfo.createTime}</div>

              </div>
            )}
          </Card>
          {
            personInfo?.asideMenu?.length ? <div className={styles.team}>
              {renderTabs()}
            </div> : null
          }
        </Col>
        <Col lg={17} md={24}>
          {current == 0 && renderBlog()}
          {current == 1 && <Settings />}
          {current == 2 && <Admin />}
        </Col>
      </Row>

    </GridContent>
  );

};

export default Center;
