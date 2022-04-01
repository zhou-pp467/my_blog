export const defaultImg = "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"

export const htmlToText = html => html.replace(/<\/?.+?\/?>/g, "")


// 解析Url参数
export function parseUrlQuery() {
    let { search, hash } = window.location

    const queryJson = {}

    if (!search && hash.indexOf('?') !== -1) {
        search = '?' + hash.split('?')[1];
    }

    let query = search.match(/([?&])[^&]+/ig);
    if (query) {
        query.forEach(function (str) {
            let arr;
            str = str.substring(1);
            str = str.replace(/=/, '==');
            arr = str.split('==');
            queryJson[arr[0]] = arr[1] ? arr[1] : ''
        })
    }

    return queryJson
}

// 获取相应参数
export function getUrlQuery(key) {
    const queryJson = parseUrlQuery()

    return queryJson[key]
}