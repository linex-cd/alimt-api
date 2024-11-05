function sha1(buffer) {
    // 辅助函数，用于右移
    function rotl(n, s) {
        return (n << s) | (n >>> (32 - s));
    }

    // 填充消息
    const message = Buffer.from(buffer);
    const messageLength = message.length * 8;
    const paddedMessage = Buffer.concat([
        message,
        Buffer.from([0x80]),
        Buffer.alloc((56 - (message.length + 1) % 64) % 64, 0),
        Buffer.alloc(8)
    ]);

    // 写入消息长度
    paddedMessage.writeUInt32BE((messageLength / Math.pow(2, 32)) >>> 0, paddedMessage.length - 8);
    paddedMessage.writeUInt32BE(messageLength >>> 0, paddedMessage.length - 4);

    // 初始化 SHA-1 常量
    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;

    // 处理每个 512 位块
    for (let i = 0; i < paddedMessage.length; i += 64) {
        const chunk = paddedMessage.slice(i, i + 64);
        const w = new Array(80);

        for (let j = 0; j < 16; j++) {
            w[j] = chunk.readUInt32BE(j * 4);
        }
        for (let j = 16; j < 80; j++) {
            w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }

        // 初始化变量
        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;

        for (let j = 0; j < 80; j++) {
            let f, k;
            if (j < 20) {
                f = (b & c) | (~b & d);
                k = 0x5a827999;
            } else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ed9eba1;
            } else if (j < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8f1bbcdc;
            } else {
                f = b ^ c ^ d;
                k = 0xca62c1d6;
            }

            const temp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
            e = d;
            d = c;
            c = rotl(b, 30) >>> 0;
            b = a;
            a = temp;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
    }

    // 拼接并返回最终的哈希结果
    return Buffer.concat([
        Buffer.from([h0 >>> 24, (h0 >> 16) & 0xff, (h0 >> 8) & 0xff, h0 & 0xff]),
        Buffer.from([h1 >>> 24, (h1 >> 16) & 0xff, (h1 >> 8) & 0xff, h1 & 0xff]),
        Buffer.from([h2 >>> 24, (h2 >> 16) & 0xff, (h2 >> 8) & 0xff, h2 & 0xff]),
        Buffer.from([h3 >>> 24, (h3 >> 16) & 0xff, (h3 >> 8) & 0xff, h3 & 0xff]),
        Buffer.from([h4 >>> 24, (h4 >> 16) & 0xff, (h4 >> 8) & 0xff, h4 & 0xff])
    ]);
}

// 使用自定义 SHA-1 实现 HMAC-SHA1
function hmacSha1(key, message) {
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
