import React, { useEffect, useState } from 'react';
import styles from './index.less'
import { IconFont, Button, Comment, Avatar, Form, List, Input, message, Modal } from 'antd'
import { ExclamationCircleOutlined, UserOutlined, HeartOutlined, StarOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import cls from 'classnames'
import * as apis from '@/services/ant-design-pro/api'
import { useModel, history } from 'umi'
import moment from 'moment';
import NoFoundPage from '@/pages/404'
import DeleteModal from '@/components/Modal'
import { defaultImg } from '@/utils/utils'
import BlogAside from '@/components/BlogAside';
const { TextArea } = Input;



export default (props) => {
    const [blogInfo, setBlogInfo] = useState({})  //博客详情
    const { initialState, setInitialState } = useModel('@@initialState')
    const { currentUser } = initialState
    const [value, setvalue] = useState({
        submitValue: "",
        replyValue: ""
    })  //评论内容
    const [replyInfo, setReply] = useState({})  //回复者信息
    const [ifShowReply, setShowReply] = useState(false)
    const [submitValue, setSubmit] = useState("")
    const [showMore, setShowMore] = useState(false) //是否展示更多
    const [showDeleteModal, setShowDeleteModal] = useState(false) //是否展示确认删除蒙层
    const [deleteInfo, setDeleteInfo] = useState({})  //删除的内容
    const [isForked, setIsForked] = useState(false)   //是否已关注
    const [remarkBlog, setRemarkBlog] = useState(false) //是否已经做了网络请求


    /**
     * 获取博客详情
     */
    useEffect(() => {
        queryBlogDetail()
    }, [])

    /**请求博客内容 */
    const queryBlogDetail = async () => {
        let { location: { query: { blogId = "" } } } = props
        try {
            let res = await apis.getBlogDetail({ blogId })
            if (res) {
                setRemarkBlog(true)
                setBlogInfo(res)
            }
        } catch (error) {
        }
    }


    /**处理回复 */
    const handleReply = (item) => {
        setReply(item)
        setShowReply(true)
    }
    /**删除当前评论 */
    const handleDeleteReply = async () => {
        let { commentId } = deleteInfo
        try {
            let res = await apis.deleteCommentById({ commentId })
            if (res) {
                setShowDeleteModal(false)
                message.success("删除成功")
                queryBlogDetail()
            }
        } catch (error) {

        }
    }

    const CommentList = ({ comments }) => (
        <List
            dataSource={showMore ? comments : comments.slice(0, 5)}
            header={`${comments.length} 回复`}
            itemLayout="horizontal"
            renderItem={item => {
                let { ifDeleted, userName, userId, replyUserName, userAvatar, commentContent, commentDate, commentId, type } = item

                return (
                    <li>
                        <Comment
                            actions={
                                ifDeleted ? null :
                                    [
                                        <div style={{ cursor: "pointer" }}
                                            onClick={() => handleReply(item)}>
                                            回复
                                        </div>,
                                        <div style={{ cursor: "pointer", marginLeft: 12 }}
                                            onClick={() => {
                                                setShowDeleteModal(true)
                                                setDeleteInfo(item)
                                            }}>
                                            {
                                                currentUser?.userId ? <>{(currentUser.userId === userId || currentUser.userId === blogInfo.userId) ? " 删除" : ""}</> : <></>
                                            }

                                        </div>
                                    ]
                            }
                            author={`${userName} ${type == 0 ? "回复" : "评论"}  ${replyUserName}`}
                            avatar={userAvatar ? userAvatar : defaultImg}
                            content={commentContent}
                            datetime={commentDate}
                        >
                        </Comment>
                    </li>
                )
            }}
        >

        </List>
    );

    /**
     * @name 提交评论
     * @returns 
     */

    const handleSubmit = async ({
        type
    }) => {
        if (!value[`${type}Value`]) {
            return message.error("评论不能为空", 1);
        }
        /** */
        const { blogId, userInfo } = blogInfo

        let param = {
            commentContent: value[`${type}Value`],
            articleId: blogId,
            replyUserId: type === "submit" ? userInfo["userId"] : replyInfo["userId"],
            replyUserName: type === "submit" ? userInfo["username"] : replyInfo["userName"],
            type: type === "submit" ? 1 : 0
        };
        if (!(currentUser?.userId)) {
            param = { ...param, isNeedLogin: true }
        }

        try {
            await apis.comment(param).then(result => {
                if (result ?? "" !== "") {
                    message.success(`${type === "submit" ? "提交" : "回复"}成功`, 2)
                    setShowReply(false)
                    setvalue({
                        ...value,
                        [`${type}Value`]: ''
                    })
                    queryBlogDetail()
                }
            })
        } catch (error) {

        }
    };

    const handleChange = ({ key, inputValue }) => {
        setvalue({
            ...value,
            [`${key}Value`]: inputValue
        })
    };


    const renderComment = () => {
        let { commentList, userInfo: { avatar } } = blogInfo
        return <>
            {commentList.length > 0 && <CommentList comments={commentList} />}
            {ifShowReply ? <div style={{ paddingLeft: 40 }}>
                <Comment
                    avatar={<Avatar src={currentUser?.avatar ? currentUser.avatar : defaultImg} alt="评论头像" />}
                    content={
                        <>
                            <Form.Item>
                                <TextArea rows={4}
                                    onChange={(e) => handleChange({
                                        key: "reply",
                                        inputValue: e.target.value
                                    })}
                                    value={value['replyValue']} placeholder={`回复给用户：${replyInfo.userName}`} />
                            </Form.Item>
                            <Form.Item>
                                <Button onClick={() => handleSubmit({ type: "reply" })} type="primary">
                                    回复评论
                                </Button>
                            </Form.Item>
                        </>
                    }
                />
            </div>
                : null
            }

            {commentList.length > 5 && !showMore ? <div style={{ cursor: "pointer" }} onClick={() => {
                setShowMore(true)
            }}>查看更多</div> : null}

            {/* <Comment
                avatar={<Avatar src={avatar ? avatar : defaultImg} alt="评论头像" />}
                content={
                    <>
                        <Form.Item>
                            <TextArea rows={4} onChange={handleChange} value={value} placeholder={`回复给用户：${replyInfo.userName}`} />
                        </Form.Item>
                        <Form.Item>
                            <Button onClick={handleSubmit} type="primary">
                                回复评论
                            </Button>
                        </Form.Item>
                    </>
                }
            /> */}
        </>
    }

    /**关注 */
    // const handleForkUser = async (id) => {
    //     try {
    //         let res = await apis[isForked ? "cancelForkUser" : "forkUser"]({
    //             userId: id
    //         })
    //         if (res && res?.businessCode * 1 === 1000) {
    //             setIsForked(!isForked)
    //             queryBlogDetail()
    //         } else {
    //             message.error(isForked ? "取消关注失败" : "关注失败")
    //         }
    //     } catch (error) {

    //     }
    // }
    const { blogContainer,
        blogRightCenter,
        mr_8,
        article_title,
        infoStyle,
        blogContentStyle,
        blogContentView,
        commentWrapper,
        commentView
    } = styles




    if (!Object.keys(blogInfo).length) {
        if (remarkBlog) {
            return <NoFoundPage backHome="回首页" title={"您的文章走丢了～"} isHide={true} clickHome={() => {
                history.push("/")
            }}
            />
        } else {
            return null
        }

    } else {

        const { blogTitle, blogContent, commentList, createTime, userInfo, userInfo: { userId, username, avatar, followerNumber, forkNumber, role } } = blogInfo

        return <div className={blogContainer}>
            <DeleteModal
                // modalTitle="删除该条评论"
                children={<div style={{ display: "flex", alignItems: "center", fontSize: 18, fontWeight: "bold" }}><ExclamationCircleOutlined style={{
                    color: "red",
                    fontSize: 22,
                    marginRight: 6
                }} />是否确定删除评论</div>}
                handleOk={handleDeleteReply}
                handleCancel={() => {
                    setShowDeleteModal(false)
                }}
                isModalVisible={showDeleteModal}
            />
            <BlogAside userInfo={userInfo} cb={queryBlogDetail} />
            <div className={blogRightCenter}>
                <div className={blogContentView}>
                    <h1 className={article_title}>
                        {blogTitle}
                    </h1>
                    <div className={infoStyle}>
                        <img src={avatar ? avatar : defaultImg} alt="" style={{
                            borderRadius: "50%", width: 20, height: 20, marginRight: 4, verticalAlign: "middle"
                        }} />
                        <span className={mr_8} style={{ fontSize: 16 }}>{username}</span>
                        <span style={{ fontSize: 18, color: "rgba(0, 0, 0, 0.85)" }}>创建时间：{createTime}</span>
                    </div>
                    <div className={blogContentStyle}>
                        <p dangerouslySetInnerHTML={{ __html: blogContent }}></p>
                    </div>
                </div>

                {commentList.length ? <div className={commentView}>
                    {renderComment()}
                </div> : null}

                <div className={commentView}>
                    <Comment
                        avatar={<Avatar src={currentUser?.avatar ? currentUser.avatar : defaultImg} alt="评论头像" />}
                        content={
                            <>
                                <Form.Item>
                                    <TextArea rows={4} onChange={(e) => handleChange({
                                        key: "submit",
                                        inputValue: e.target.value
                                    })} value={value["submitValue"]} />
                                </Form.Item>
                                <Form.Item>
                                    <Button onClick={() => handleSubmit({ type: "submit" })} type="primary">
                                        提交评论
                                    </Button>
                                </Form.Item>
                            </>
                        }
                    />
                </div>

            </div>

        </div>
    }

}
