import bcrypt from 'bcryptjs';
import { connectDB } from '../_db.js';
import { signToken } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码为必填项' });
  }

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: '邮箱或密码错误' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: '邮箱或密码错误' });

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
    return res.status(200).json({ success: true, token, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
