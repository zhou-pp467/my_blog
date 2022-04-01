import 'braft-editor/dist/index.css'
import React from 'react'
import BraftEditor from 'braft-editor'
import { ContentUtils } from 'braft-utils'
import { ImageUtils } from 'braft-finder'
import { history } from 'umi';
import { Upload, Icon, Input, Button, Avatar, Tag, Select, Form, Modal, message } from 'antd'
import { AreaChartOutlined, PlusOutlined } from '@ant-design/icons'
import style from './index.less'
import * as apis from '@/services/ant-design-pro/api'
import axios from 'axios'
import TagModal from '@/components/Modal'
import { getUrlQuery } from '@/utils/utils'


const { Option } = Select;
export default class UploadDemo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editorState: BraftEditor.createEditorState("<p></p>"),//文章内容
      isModalVisible: false,//选择标签弹窗
      tagList: [],//标签列表
      tagId: [],//选中的标签
      blogTitle: "",//文章标题
      blogId: (getUrlQuery("id") ?? "" != "") ? getUrlQuery("id") : ""
    }

    this.editorRef = React.createRef()
  }


  componentDidMount() {
    if (this.state.blogId) this.mapBlogById()
  }

  /**编辑博客初始化接口 */
  mapBlogById = async () => {
    // mapBlogById  等服务端明天补充接口再调用
    await apis.mapBlogById({ blogId: this.state.blogId }).then(res => {
      let { blogId, blogContent, blogTitle, tagId } = res
      this.setState({
        // tagId: (tagId ?? "") !== "" ? tagId : "",
        tagId: [tagId],
        previewTagId: [tagId],
        blogTitle,
        editorState: BraftEditor.createEditorState(blogContent)
      })
    })
  }

  handleChange = (editorState) => {
    this.setState({ editorState })
  }

  uploadHandler = async (content) => {
    this.setState({
      editorState: ContentUtils.insertMedias(this.state.editorState, [{
        type: 'IMAGE',
        url: content
      }])
    })
  }

  /**点击发布文章回调*/
  releaseArticle = async () => {
    let { editorState, blogTitle } = this.state

    const errorHandler = {
      "title": "博文标题不能为空",
      "content": "博文内容不能为空",
      'less': "博文标题字数在5-100以内"
    }

    if (!blogTitle) {
      return Modal.error({
        content: errorHandler["title"]
      })
    }
    else if (blogTitle.length < 5 || blogTitle.length > 100) {
      return Modal.error({
        content: errorHandler["less"]
      })
    }
    else if (editorState.toHTML().length == 7) {
      return Modal.error({
        content: errorHandler["content"]
      })
    }
    try {
      await apis.getTags({}).then(res => {

        if ((res ?? "") !== "") {

          let { tagId } = this.state

          if (tagId.length) {
            let tagName = res.filter(_item => _item.tagId === tagId[0])[0]?.tagName || []
            this.setState({
              tagName
            })
          }
          //aryazdp.cn
          this.setState({
            tagList: res,
          })
        }

      })
    } catch (error) {

    }

    this.setState({
      isModalVisible: true,
    })
  }


  /**
   * 弹出发布标签蒙层
   * @param {*} bool 
   */
  handleBlogModal = async (bool) => {
    let { tagId, blogTitle, editorState, blogId, previewTagId } = this.state

    if (bool == true) {
      //判断是否有勾选标签，如果否，则提示
      if (!tagId.length) return message.error("请选择文章标签", 2)
      //如果是true的话，发布文章
      let param = {
        blogTitle,
        blogContent: editorState.toHTML(),
        tagId: Array.isArray(tagId) ? tagId[0] : tagId
      }
      //如果是编辑博客，请求加上博客id
      param = blogId ? { ...param, blogId } : param
      try {
        let res = await apis[`${blogId !== '' ? 'modifyBlog' : 'sendBlog'}`](param)

        if (res) {
          this.setState({
            isModalVisible: false
          }, () => {
            Modal.success({
              content: `${blogId ? '编辑' : '发布'}成功`,
              onOk: () => {
                //跳转到个人中心
                history.push("/center")
              }
            })
          })

        } else {
          message.error(`${blogId ? '编辑' : '发布'}失败`)
        }
      } catch (error) {
        message.error(`${blogId ? '编辑' : '发布'}失败`)
      }

    } else {

      this.setState({
        isModalVisible: false,
        tagId: previewTagId
      })
    }
  }


  /**
   * 选择标签【暂时只支持单选，不支持多选】
   */
  handleChangeTagSelect = (value) => {

    this.setState({
      // tagId: value,  //支持多选
      tagId: value.length ? value[0] : [] //支持单选
    })
  }

  /**
   * 文章标题变化
   * @param {*} e  change 事件event
   */
  changeBlogTitle = (e) => {
    this.setState({
      blogTitle: e.target.value
    })
  }


  render() {
    const { isModalVisible, tagList, tagId, blogTitle, tagName } = this.state
    const excludeControls = [
      'letter-spacing',
      'line-height',
      'clear',
      'headings',
      'remove-styles',
      'superscript',
      'subscript',
      'hr',
      'text-align'
    ]

    const extendControls = [
      {
        key: 'antd-uploader',
        type: 'component',
        component: (
          <Upload
            accept="image/*"
            showUploadList={false}
            action="/api/upload/avatar"
            onChange={(files) => {
              let file = files.file
              if (file?.status == "done" && file?.response?.businessCode == 1000) {
                this.uploadHandler(file.response.content)
              }
            }}
          >
            {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
            <button type="button" className="control-item button upload-button" data-title="插入图片">
              <AreaChartOutlined />
            </button>
          </Upload>
        )
      }
    ]

    return (

      <div className="editor-wrapper">
        {isModalVisible && <TagModal
          isModalVisible={isModalVisible}
          handleOk={() => this.handleBlogModal(true)}
          handleCancel={() => this.handleBlogModal(false)}
          modalTitle="发布博文"
          destroyOnClose
        >

          <Form.Item
            label="文章标签"
            name="文章标签"
            initialvalues=""
          // rules={[{ required: true, message: '请选择文章标签' }]}
          >
            <Select
              mode="multiple"
              size={"large"}
              placeholder="请选择标签"
              defaultValue={[tagName] || []}
              onChange={this.handleChangeTagSelect}
              style={{ width: '100%' }}
              maxTagCount={5}
              showArrow={true}

            >
              {tagList.length && tagList.map((_tag, _tagIndex) => {

                return <Option key={_tag.tagId}
                // disabled={tagId.includes(_tag.tagId)}
                >{_tag.tagName}</Option>
              })}
            </Select>
          </Form.Item>


        </TagModal>}
        <header className={style.editHeader}>
          <div className={style.topBar}>
            <Input className={style.title} value={blogTitle} placeholder="请输入文章标题" onChange={this.changeBlogTitle} />
          </div>
          <div className={style.rightContent}>
            <Button type="primary" style={{ width: 100, marginRight: 20 }} onClick={this.releaseArticle}>发布</Button>
          </div>
        </header>
        <main>
          <div className={style.editContent}>
            <div className={style.edit}
            >
              <BraftEditor
                ref={this.editorRef}
                value={this.state.editorState}
                onChange={this.handleChange}
                extendControls={extendControls}
                excludeControls={excludeControls}
              />
            </div>
            <div className={style.preview}  >
              <div className={style.previewTitle}>
                界面预览
              </div>
              <div id="content" className={style.htmlStyle} dangerouslySetInnerHTML={{ __html: this.state.editorState.toHTML() }}></div>
            </div>
          </div>
        </main>
      </div>
    )

  }

}