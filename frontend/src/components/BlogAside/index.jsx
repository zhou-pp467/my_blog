import React from "react";
import { Button, Modal } from 'antd'
import { StarOutlined, UserOutlined, HeartOutlined, PlusOutlined } from '@ant-design/icons'
import { defaultImg } from '@/utils/utils'
import { history, useModel } from 'umi'
import cls from 'classnames'
import styles from './index.less'
import * as apis from "@/services/ant-design-pro/api"

export default (props) => {
    const { initialState, setInitialState } = useModel('@@initialState')
    const { currentUser } = initialState
    const { userInfo, userInfo: {
        avatar = "",
        username = "",
        isForked = false,
        userId,
        role,
        forkNumber,
        followerNumber
    },
        cb
        // handleForkUser
    } = props
    let {
        blogSide,
        userCard,
        avatarHolder,
        avatarImg,
        antCenterName,
        userInfoStyle,
        mt_12,
        flexRow,
    } = styles
    const IconStyle = {
        fontSize: 20,
        marginRight: 8
    }


    /**关注 */
    const handleForkUser = async (id) => {
        try {
            let res = await apis[isForked ? "cancelForkUser" : "forkUser"]({
                userId: id
            })
            if (res) {
                // setIsForked(!isForked)
                cb && cb()
            } else {
                message.error(isForked ? "取消关注失败" : "关注失败")
            }
        } catch (error) {

        }
    }

    if (!Object.keys(userInfo).length) {
        return null
    }

    return <div className={blogSide}>
        <div className={userCard}>
            <div className={avatarHolder} onClick={() => {
                if (location.pathname !== "/fork-detail") history.push(`/fork-detail?id=${userId}`)
            }}>
                <img alt="" className={avatarImg} src={avatar ? avatar : defaultImg} />
                <div className={antCenterName}>{username}</div>
            </div>




            {currentUser?.userId !== userId ? <div style={{ textAlign: "center" }}>
                <Button type={isForked ? "default" : "primary"} shape="round" onClick={() => {
                    if (currentUser?.userId) {
                        handleForkUser(userId)
                    } else {
                        Modal.warning({
                            okText: "去登录",
                            closable: true,
                            onOk: () => { history.push('/user/login') },
                            title: '您还未登录，快去登录吧~',
                        })
                    }

                }}
                    style={{ textAlign: "center" }}
                    icon={isForked ? null : <PlusOutlined style={{ fontSize: 16 }} />} size={18}
                >
                    {isForked ? "已关注" : "关注"}
                </Button>
            </div> : null}

            <div className={userInfoStyle}>
                <div className={mt_12}>
                    <UserOutlined style={IconStyle} />
                    <span>{role == 0 ? "管理员" : "博主"}</span>
                </div>
                <div className={mt_12}>
                    <HeartOutlined style={IconStyle} />
                    <span >关注</span>
                    <span >{forkNumber}</span>
                </div>
                <div className={cls([mt_12, flexRow])}>
                    <StarOutlined style={IconStyle} />
                    <span>粉丝</span>
                    <span>{followerNumber}</span>
                </div>
            </div>
        </div>
    </div>
}