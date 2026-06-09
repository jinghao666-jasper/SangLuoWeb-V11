import { connectDB } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: '姓名、邮箱和留言为必填项' });
  }

  try {
    const db = await connectDB();
    await db.collection('contacts').insertOne({
      name,
      email,
      phone: phone || '',
      message,
      createdAt: new Date(),
      read: false,
    });
    return res.status(200).json({ success: true, message: '留言已收到，我们会尽快与您联系' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
