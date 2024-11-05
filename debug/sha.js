function hmacSha1(key, message) {
    // 定义 SHA1 哈希函数
    function sha1(buffer) {
        const crypto = require('crypto');
        return crypto.createHash('sha1').update(buffer).digest();
    }

    // 将 key 转换为 buffer
    const blockSize = 64; // SHA-1 的 block 大小为 64 字节
    let keyBuffer = Buffer.from(key);

    // 如果 key 大于 blockSize，则对其进行 hash
    if (keyBuffer.length > blockSize) {
        keyBuffer = sha1(keyBuffer);
    }

    // 将 key 补充到 blockSize 长度
    if (keyBuffer.length < blockSize) {
        keyBuffer = Buffer.concat([keyBuffer, Buffer.alloc(blockSize - keyBuffer.length)]);
    }

    // 生成 ipad 和 opad
    const ipad = Buffer.alloc(blockSize);
    const opad = Buffer.alloc(blockSize);
    for (let i = 0; i < blockSize; i++) {
        ipad[i] = keyBuffer[i] ^ 0x36;
        opad[i] = keyBuffer[i] ^ 0x5c;
    }

    // 执行 HMAC-SHA1 哈希
    const innerHash = sha1(Buffer.concat([ipad, Buffer.from(message)]));
    const hmac = sha1(Buffer.concat([opad, innerHash]));

    return hmac.toString('hex');
}

// 示例调用
const key = 'secret-key';
const message = 'Hello, HMAC-SHA1!';
console.log(hmacSha1(key, message));
