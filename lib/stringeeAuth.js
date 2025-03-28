const crypto = require('crypto');

function createRoomToken(keySid, keySecret, roomId, userId, expires = 3600) {
  const header = {
    typ: "JWT",
    alg: "HS256",
    cty: "stringee-api;v=1"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    jti: `${keySid}-${now}`,
    iss: keySid,
    exp: now + expires,
    userId: userId,
    roomId: roomId,
    permissions: {
      publish: true,
      subscribe: true,
      control_room: true
    }
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', keySecret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

module.exports = { createRoomToken };