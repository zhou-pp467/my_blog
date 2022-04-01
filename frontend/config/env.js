const configs = {
    //测试环境
    test: {
        API_SERVER: "http://192.168.1.8:8000"
    },
    //开发环境
    development: {
        API_SERVER: "http://192.168.1.8:8000"
    },
    //本地
    local: {
        API_SERVER: "http://192.168.1.8:8000"
    },
    //线上
    production: {
        API_SERVER: "http://ayrazdp.cn"
    }

}
console.log(process.env.NODE_ENV, "API_SERVER")

export default configs