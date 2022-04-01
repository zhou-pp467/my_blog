import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';
const NoFoundPage = (props) => {
  let { title, backHome, clickHome, isHide, status, needBtn } = props

  return (
    <>
      <Result
        status={status || "404"}
        title={title}
        extra={
          <>{needBtn ? <Button type="primary" onClick={clickHome && clickHome}>
            {backHome || "Back Home"}
          </Button> : null}</>
        }
      />
    </>
  )
};

export default NoFoundPage;
