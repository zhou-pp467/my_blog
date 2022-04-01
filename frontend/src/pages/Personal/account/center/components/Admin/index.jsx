import React, { useState, useEffect, PureComponent, useRef } from "react";
import { Tag, Input, Button, Tooltip, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './index.less'
import * as apis from "@/services/ant-design-pro/api"



export default () => {
    const [tags, setTag] = useState([]);
    const [inputVisible, setInputVisible] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [editInputIndex, setEditInputIndex] = useState(-1)
    const [editInputValue, setEditInputValue] = useState("")
    const saveEditInputRef = useRef()
    const saveInputRef = useRef()
    //关闭


    /**初次进入effect */
    useEffect(async () => {
        queryTags()
    }, [])

    /**查询当前标签 */
    const queryTags = async () => {
        try {
            let res = await apis.getTags({})
            if (res) setTag(res)
        } catch (error) {

        }
    }

    /**删除标签 */
    const handleClose = async (removedTag) => {
        let { tagId } = removedTag
        try {
            let res = await apis.deleteTagById({ tagId })
            if (res) {
                message.success("删除成功", 1)
                queryTags()
            } else {
                message.error("删除失败，重新再试")
                setTimeout(() => {
                    queryTags()
                }, 200)
            }
        } catch (error) {
            message.error("删除失败，重新再试")
            setTimeout(() => {
                queryTags()
            }, 200)
        }
    };

    const showInput = () => {
        setInputVisible(true)

        setTimeout(() => {
            saveInputRef.current.focus()
        }, 200);
    };

    const handleInputChange = e => {
        setInputValue(e.target.value)
    };

    /**标签确认回调 */
    const handleInputConfirm = async () => {
        if (inputValue) {
            try {
                let res = await apis.addTag({
                    tagName: inputValue
                })
                if (res) {
                    queryTags()
                } else {
                    message.error("新增失败，稍后再试", 2)
                }
                setInputVisible(false)
                setInputValue("")
            } catch (error) {
                message.error("新增失败，稍后再试", 2)
                setInputVisible(false)
                setInputValue("")
            }
        } else {
            setInputVisible(false)
            setInputValue("")
        }
    };

    /**修改当前标签ipt输入的值 */
    const handleEditInputChange = e => {
        setEditInputValue(e.target.value)
    };

    /**修改当前标签Api请求 */
    const handleEditInputConfirm = async () => {
        if (!editInputValue) {
            return message.error("标签不能为空", 2)
        }
        let { tagId } = [...tags][editInputIndex]
        try {
            let res = await apis.modifyTagById({ tagName: editInputValue, tagId })
            if (res) {
                queryTags()
                setEditInputValue('')
                setEditInputIndex(-1)
            } else {
                message.error("修改标签失败", 2)
                setEditInputValue('')
                setEditInputIndex(-1)
            }
        } catch (error) {
            setEditInputValue('')
            setEditInputIndex(-1)
        }
    };

    return (

        <div className="admin-container">
            {/* <div style={{ marginBottom: 20 }}><Button type="primary">设置标签</Button></div> */}
            {tags && tags.length && tags.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input
                            ref={saveEditInputRef}
                            key={tag.tagId}
                            size="small"
                            className="tag-input"
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }

                const isLongTag = tag.tagName.length > 20;

                const tagElem = (
                    <Tag
                        className="edit-tag"
                        key={tag.tagId}
                        closable={true}
                        onClose={() => handleClose(tag)}
                    >
                        <span
                            onDoubleClick={e => {
                                setEditInputIndex(index)
                                setEditInputValue(tag.tagName)
                                setTimeout(() => {
                                    saveEditInputRef.current.focus()
                                }, 200)

                                e.preventDefault();
                            }}
                        >
                            {isLongTag ? `${tag.tagName.slice(0, 20)}...` : tag.tagName}
                        </span>
                    </Tag>
                );
                return isLongTag ? (
                    <Tooltip title={tag.tagName} key={tag.tagId}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}
            {inputVisible && (
                <Input
                    ref={saveInputRef}
                    type="text"
                    size="small"
                    className="tag-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible && (
                <Tag className="site-tag-plus" onClick={showInput}>
                    <PlusOutlined /> 设置标签
                </Tag>
            )}
        </div>
    );
}


