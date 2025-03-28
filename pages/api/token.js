import { createRoomToken } from '../../lib/stringeeAuth';

export default async function handler(req, res) {
  const { userId, roomId } = req.query;

  try {
    if (!userId || !roomId) {
      throw new Error('Missing userId or roomId');
    }

    const token = createRoomToken(
      process.env.STRINGEE_KEY_SID,
      process.env.STRINGEE_KEY_SECRET,
      roomId,
      userId
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: "Failed to generate token",
      details: error.message 
    });
  }
}