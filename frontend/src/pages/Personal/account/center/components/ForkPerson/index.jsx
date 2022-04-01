import React, { useState } from "react";
import { List, Avatar, Button, Skeleton } from 'antd';
import { defaultImg } from "@/utils/utils";
import { history } from 'umi'


export default (props) => {
    let { listData, handleForkUser } = props

    const clickToForkDetail = id => history.push(`/fork-detail?id=${id}`)
    return <List
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={listData}
        renderItem={item => {
            let { isForked, avatar, username, userId } = item
            return <List.Item
                actions={[<Button style={{ width: 100 }} type={isForked ? "default" : "primary"} onClick={() => {
                    handleForkUser && handleForkUser(item)
                }}>{isForked ? "已关注" : "关注"}</Button>]}
            >
                <List.Item.Meta
                    avatar={<div style={{ cursor: "pointer" }} onClick={() => {
                        clickToForkDetail(userId)
                    }}><Avatar src={avatar || defaultImg} /></div>}
                    title={<div>{username}</div>}
                />
            </List.Item>
        }}
    />
}