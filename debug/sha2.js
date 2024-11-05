function toUint8Array(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const arr = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; i++) {
        arr[i] = utf8.charCodeAt(i);
    }
    return arr;
}

function arrayBufferToHex(buffer) {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i++) {
        const byte = view.getUint8(i).toString(16).padStart(2, '0');
        hexCodes.push(byte);
    }
    return hexCodes.join('');
}

// SHA-1 实现
function sha1(message) {
    const msgUint8 = toUint8Array(message);
    const msgLength = msgUint8.length * 8;

    // 计算填充后的消息长度，确保为 512 位的倍数
    const paddedLength = (((msgUint8.length + 8) >> 6) + 1) << 6;
    const paddedMessage = new Uint8Array(paddedLength);

    // 复制消息内容并进行填充
    paddedMessage.set(msgUint8);
    paddedMessage[msgUint8.length] = 0x80;

    // 以大端格式添加消息长度
    const view = new DataView(paddedMessage.buffer);
    view.setUint32(paddedMessage.length - 4, msgLength, false);

    // 初始哈希值
    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;
    let words = new Uint32Array(80);

    for (let i = 0; i < paddedMessage.length; i += 64) {
        const w = new DataView(paddedMessage.buffer, i, 64);
        for (let j = 0; j < 16; j++) {
            words[j] = w.getUint32(j * 4, false); // 使用大端格式
        }
        for (let j = 16; j < 80; j++) {
            words[j] = (words[j - 3] ^ words[j - 8] ^ words[j - 14] ^ words[j - 16]) << 1 |
                        (words[j - 3] ^ words[j - 8] ^ words[j - 14] ^ words[j - 16]) >>> 31;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;

        for (let j = 0; j < 80; j++) {
            const temp = ((a << 5 | a >>> 27) + e + words[j] + (
                j < 20 ? (b & c | ~b & d) + 0x5a827999 :
                j < 40 ? (b ^ c ^ d) + 0x6ed9eba1 :
                j < 60 ? (b & c | b & d | c & d) + 0x8f1bbcdc :
                         (b ^ c ^ d) + 0xca62c1d6
            )) >>> 0;

            e = d;
            d = c;
            c = (b << 30 | b >>> 2) >>> 0;
            b = a;
            a = temp;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
    }

    const buffer = new ArrayBuffer(20);
    const hashView = new DataView(buffer);
    hashView.setUint32(0, h0, false);
    hashView.setUint32(4, h1, false);
    hashView.setUint32(8, h2, false);
    hashView.setUint32(12, h3, false);
    hashView.setUint32(16, h4, false);

    return new Uint8Array(buffer);
}

// HMAC-SHA1 实现
function hmacSha1(key, message) {
    const blockSize = 64;
    let keyUint8 = toUint8Array(key);

    // 如果 key 长度超过 blockSize，则对 key 进行哈希
    if (keyUint8.length > blockSize) {
        keyUint8 = sha1(key);
    }

    // 补齐 key 到 blockSize
    const paddedKey = new Uint8Array(blockSize);
    paddedKey.set(keyUint8);

    // 创建 ipad 和 opad
    const ipad = new Uint8Array(blockSize);
    const opad = new Uint8Array(blockSize);
    for (let i = 0; i < blockSize; i++) {
        ipad[i] = paddedKey[i] ^ 0x36;
        opad[i] = paddedKey[i] ^ 0x5c;
    }

    // 计算 HMAC-SHA1
    const innerMessage = new Uint8Array(ipad.length + message.length);
    innerMessage.set(ipad);
    innerMessage.set(toUint8Array(message), ipad.length);
    const innerHash = sha1(innerMessage);

    const outerMessage = new Uint8Array(opad.length + innerHash.length);
    outerMessage.set(opad);
    outerMessage.set(innerHash, opad.length);
    const hmac = sha1(outerMessage);

    return arrayBufferToHex(hmac.buffer); // 返回 hex 编码的 HMAC-SHA1
}

// 示例调用
const key = 'secret-key';
const message = 'Hello, HMAC-SHA1!';
console.log(hmacSha1(key, message));
