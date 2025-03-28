export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { event, callId, from, to } = req.body

  console.log('Webhook received:', { event, callId, from, to })

  // Xử lý sự kiện cuộc gọi
  if (event === 'answer') {
    // Logic khi có cuộc gọi đến
    return res.status(200).json({ 
      action: 'answer',
      record: false, // Tắt ghi âm
      appToPhone: 'auto' // Tự động kết nối
    })
  }

  res.status(200).json({ status: 'ignored' })
}