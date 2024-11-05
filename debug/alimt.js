// 导入crypto加密模块
const crypto = require('crypto');
// 导入axios用于发送请求
const axios = require('axios');
 
function sendPost(url, body, ac_id, ac_secret) {
 
    const realUrl = new URL(url);
 
    // 下面字段用于进行加密签名
    const method = "POST"
    const accept = "application/json"
    const content_type = "application/json;chrset=utf-8"
    const path = realUrl.pathname
    const date = new Date().toGMTString()
    const host = realUrl.host
 
    // 将请求体进行MD5加密和Base64编码
    const bodyMd5 = MD5Base64Encode(body);
    console.log("1.加密后的请求体：", bodyMd5);
 
 
    // 生成唯一随机值
    const uuid = uuidv4();
    console.log("2.唯一随机值：", uuid);
 
    // 请求头SHA-1加密
    const arr = [method, accept, bodyMd5, content_type, date, "x-acs-signature-method:HMAC-SHA1", "x-acs-signature-nonce:" + uuid, "x-acs-version:2019-01-02", path]
    const stringToSign = arr.join("\n");
 
 
    // 2. 计算 HMAC-SHA1
    const signature = HMACSha1(stringToSign, ac_secret);
    console.log("4.计算后的HMAC-SHA1：", signature);
 
 
    // 3. 获得最终的Authorization
    const authHeader = "acs " + ac_id + ":" + signature;
 
    // 请求配置
    const config = {
        method,
        url,
        headers: {
            'Accept': accept,
            'Content-Type': content_type,
            'Content-MD5': bodyMd5,
            'Date': date,
            'Host': host,
            'Authorization': authHeader,
            'x-acs-signature-nonce': uuid,
            'x-acs-signature-method': 'HMAC-SHA1',
            'x-acs-version': '2019-01-02',
        },
        data: body
    };
 
 
    axios(config).then(function (response) {
        console.log(response.data);
    }).catch(function (error) {
        console.log(error);
        console.log("请求失败");
    })
 
}
 
 
/**
 * 将内容进行MD5加密后在进行Base64编码
 * @param {*} str 要加密的字符串
 */
function MD5Base64Encode(str) {
    if (!str) {
        console.log("加密的内容为空！！！");
        return "";
    }
    // 创建md5对象
    const md5 = crypto.createHash('md5');
    // 得到MD5的十六进制字符串
    const md5Hash = md5.update(str).digest('hex');
    // 将MD5的十六进制字符串转换为Base64编码
    const strMd5 = Buffer.from(md5Hash, 'hex').toString('base64');
    return strMd5;
}
 
/**
 * 计算 HMAC-SHA1
 * @param {*} data 要加密的数据
 * @param {*} key key值
 */
function HMACSha1(data, key) {
    // 创建一个HMAC-SHA1对象
    const hmac = crypto.createHmac('sha1', key);
    // 计算HMAC-SHA1
    const md5Hash = hmac.update(data).digest();
    // 最终签名
    const signature = Buffer.from(md5Hash, "hex").toString('base64');
    return signature;
}
 
 
/**
 * 生成一个唯一的UUID
 * @returns uuid
 */
function uuidv4() {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
}
// 这两个字段去阿里云获取
const ac_id = "";
const ac_secret = "";

const url = "http://mt.cn-hangzhou.aliyuncs.com/api/translate/web/ecommerce"

const body1 = "{\n" +  
	" \"FormatType\": \"text\",\n" +  
	" \"SourceLanguage\": \"auto\",\n" +  
	" \"TargetLanguage\": \"en\",\n" +  
	" \"SourceText\": \"大疆无人机\",\n" +  
	" \"Scene\": \"title\"\n" +  
	"}";


sendPost(url, body, ac_id, ac_secret)