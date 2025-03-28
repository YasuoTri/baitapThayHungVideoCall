const { createRoomToken } = require("./lib/stringeeAuth");

async function testStringee() {
  console.log("=== KIỂM TRA CẤU HÌNH STRINGEE ===");

  // 1. Kiểm tra biến môi trường
  console.log(
    "Key SID:",
    process.env.STRINGEE_KEY_SID?.substring(0, 10) + "..."
  );
  console.log(
    "Key Secret:",
    process.env.STRINGEE_KEY_SECRET?.substring(0, 3) + "..."
  );

  const testUserId = "test_user_" + Math.floor(Math.random() * 1000);
  const testRoomId = "test_room_" + Math.floor(Math.random() * 1000);

  // 2. Test tạo room token
  try {
    const token = createRoomToken(
      process.env.STRINGEE_KEY_SID,
      process.env.STRINGEE_KEY_SECRET,
      testRoomId,
      testUserId,
      3600 // 1 hour expiration
    );
    
    console.log("✅ Room Token mẫu:", token.substring(0, 50) + "...");
    console.log("Test User ID:", testUserId);
    console.log("Test Room ID:", testRoomId);

    // Giải mã token để kiểm tra payload (chỉ để debug)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log("Token payload:", {
      roomId: payload.roomId,
      userId: payload.userId,
      permissions: payload.permissions,
      exp: new Date(payload.exp * 1000).toISOString()
    });

  } catch (e) {
    console.error("❌ Lỗi tạo token:", e.message);
    return;
  }

  // 3. Test kết nối API (nếu cần)
  try {
    const authToken = createRoomToken(
      process.env.STRINGEE_KEY_SID,
      process.env.STRINGEE_KEY_SECRET,
      testRoomId,
      "api_test_user",
      60
    );

    const response = await fetch("https://api.stringee.com/v1/room2/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-STRINGEE-AUTH": authToken,
      },
      body: JSON.stringify({
        name: "Test Room",
        uniqueName: testRoomId,
      }),
    });

    const responseText = await response.text();
    console.log("Create Room API Response:", responseText);

  } catch (error) {
    console.error("❌ Lỗi API:", {
      message: error.message,
      stack: error.stack,
    });
  }
}

testStringee();