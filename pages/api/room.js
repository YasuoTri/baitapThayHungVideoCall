import { createStringeeToken } from "../../lib/stringeeAuth";

export default async function handler(req, res) {
  const authToken = createStringeeToken(
    process.env.STRINGEE_KEY_SID,
    process.env.STRINGEE_KEY_SECRET
  );

  try {
    // Tạo phòng mới
    if (req.method === "POST") {
      const roomRes = await fetch("https://api.stringee.com/v1/room2/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-STRINGEE-AUTH": authToken,
        },
        body: JSON.stringify({
          name: req.body.roomName,
          uniqueName: req.body.roomId,
        }),
      });
      return res.status(roomRes.status).json(await roomRes.json());
    }

    // Xóa phòng
    if (req.method === "DELETE") {
      const deleteRes = await fetch(
        "https://api.stringee.com/v1/room2/delete",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-STRINGEE-AUTH": authToken,
          },
          body: JSON.stringify({ roomId: req.body.roomId }),
        }
      );
      return res.status(deleteRes.status).json(await deleteRes.json());
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
