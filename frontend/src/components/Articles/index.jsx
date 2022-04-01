import React, { useEffect, useState } from 'react';
import { StarTwoTone, LikeOutlined, MessageFilled } from '@ant-design/icons';
import { useRequest, history } from 'umi';
import { List, Avatar } from 'antd';
import styles from './index.less';
import { defaultImg, htmlToText } from '@/utils/utils';


const Articles = (props) => {
  const { listData, deleteCallBack } = props
  const IconText = ({ icon, text }) => (
    <span>
      {icon} {text}
    </span>
  ); // 获取tab列表数据

  const handleClickBtn = async ({ type, id }) => {
    if (type === "edit") {
      history.push(`/blog-edit?id=${id}`)
    } else if (type === "delete") {
      deleteCallBack && deleteCallBack(id)
    } else {
      clickToBlogDetail(id)

    }
  }

  /**文章主要内容 */
  const ArticleListContent = ({ data: { createTime, blogContent, avatar, owner, href, blogId } }) => (
    <div className={styles.listContent} >
      <div className={styles.description} >{htmlToText(blogContent)}</div>
      <div className={styles.extra}>
        <div>
          <Avatar src={avatar || defaultImg} size="small" />
          <span style={{ marginLeft: 10 }}>发布在</span>
          <span>  {createTime}</span>
        </div>
        <div className={styles.edit}>
          {location.pathname === "/center" ? <>
            <span onClick={() => {
              handleClickBtn({ type: "preview", id: blogId })
            }}>浏览 ｜ </span><span onClick={() => {
              handleClickBtn({ type: "edit", id: blogId })
            }}>编辑 ｜ </span><span onClick={() => {
              handleClickBtn({ type: "delete", id: blogId })
            }}>删除</span></> : ""}
        </div>
      </div>
    </div>
  );

  /**
   * 跳转到博客详情
   * @param {*} id 博客id
   * @returns 
   */
  const clickToBlogDetail = id => history.push(`/blogDetail?blogId=${id}`)

  return (
    <List
      size="large"
      className={styles.articleList}
      rowKey="id"
      itemLayout="vertical"
      dataSource={listData || []}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          actions={[
            <IconText key="message" icon={<MessageFilled />} text={item.commentAmount} />,
          ]}
        >
          <List.Item.Meta
            title={
              <div className={styles.listItemMetaTitle} onClick={() => {
                clickToBlogDetail(item.blogId)
              }} >
                {item.blogTitle}
              </div>
            }
          />
          <ArticleListContent data={item} />
        </List.Item>
      )}
    />
  );
};

export default Articles;
