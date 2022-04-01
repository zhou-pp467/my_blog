import React, { useState, useEffect } from "react";
import BlogAside from '@/components/BlogAside';
import * as apis from '@/services/ant-design-pro/api'
import Articles from '@/components/Articles'
import styles from './index.less'

export default (props) => {


    const [info, setUserInfo] = useState({

    })
    /**
       * 获取博客详情
       */
    useEffect(() => {
        queryInfo()
    }, [])

    /**请求博客内容 */
    const queryInfo = async () => {
        let { location: { query: { id = "" } } } = props
        try {
            let res = await apis.getQueryInfo({ userId: id })
            if (res) setUserInfo(res)
        } catch (error) {
        }
    }

    const { articleStyle } = styles

    return <div>
        {info?.userInfo ? <BlogAside userInfo={info.userInfo} cb={queryInfo} /> : null}
        {info?.myBlogList ? <div className={articleStyle}><Articles listData={info.myBlogList} /></div> : null}
    </div>
}