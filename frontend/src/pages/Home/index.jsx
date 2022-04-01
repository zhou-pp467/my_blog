import React, {
    useEffect, useState
} from 'react'
import { useHistory } from 'react-router-dom'
import { Tag, BackTop, Button } from 'antd'
import styles from './index.less'
import { categoryList } from './data'
import { List, Avatar, Space } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import cls from 'classnames'
import * as apis from '@/services/ant-design-pro/api'
import { htmlToText } from '@/utils/utils'


export default () => {
    const history = useHistory();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [categoryList, setCategoryList] = useState([]);

    /**首页获取分类信息 */
    useEffect(async () => {
        let res = await apis.getCategoryMenu({})
        if (res) setCategoryList(res)
    }, [])

    const {
        homeContainer,
        rightContent,
        asideStyle,
        asideItem,
        active,
        blogCenter,
        blogTitleStyle,
        twoWrapStyle
    } = styles




    const handleTagClick = (index) => {
        setCurrentIndex(index)
    }

    const handleClickBlogDetail = (item) => {
        history.push(`/blogDetail?blogId=${item.blogId}`)
    }

    return <div className={homeContainer}>
        <BackTop>
            <Button type="primary" shape="circle" icon={<VerticalAlignTopOutlined />} size={'large'} />
        </BackTop>

        <div className={asideStyle}>
            {
                categoryList.length ? categoryList.map((_item, _index) => {
                    let { tagName } = _item
                    return <div key={_index} onClick={() => { handleTagClick(_index) }} className={cls([asideItem, currentIndex == _index ? active : null])}>{tagName}</div>
                }) : null
            }
        </div>
        <div className={rightContent}>
            <div className={blogCenter}>
                {
                    categoryList.length ?
                        <List
                            itemLayout="vertical"
                            size="large"
                            dataSource={categoryList[currentIndex].blogList || []}
                            footer={null}
                            renderItem={(item, index) => (
                                <List.Item
                                    key={index}
                                    actions={[]}
                                    extra={
                                        <> <img
                                            width={120}
                                            alt="logo"
                                            src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                                        />
                                            {/* <div style={{ marginTop: 20, color: "#00000073" }}>{item.createTime}</div> */}
                                        </>
                                    }
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.avatar} />}
                                        title={<div className={blogTitleStyle} onClick={() => {
                                            handleClickBlogDetail(item)
                                        }}>{item.blogTitle}</div>}
                                        description={<div className={twoWrapStyle} >{htmlToText(item.blogContent)}</div>}
                                    />
                                    <div style={{ paddingLeft: 50, color: "#00000073" }}>
                                        <MessageOutlined /> {item.commentAmount}
                                        <span style={{ marginLeft: 18 }}>{item.createTime}</span>
                                    </div>

                                </List.Item>
                            )}
                        />
                        : null}
            </div>
        </div>
    </div>
}