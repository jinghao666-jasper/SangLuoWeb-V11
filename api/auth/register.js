import bcrypt from 'bcryptjs';
import { connectDB } from '../_db.js';
import { signToken } from '../_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: '姓名、邮箱和密码为必填项' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' });
  }

  try {
    const db = await connectDB();
    const users = db.collection('users');

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: '该邮箱已注册' });

    const hash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      name,
      email: email.toLowerCase(),
      password: hash,
      role: 'member',
      createdAt: new Date(),
    });

    const token = signToken({ id: result.insertedId.toString(), email, role: 'member' });
    return res.status(201).json({ success: true, token, name, role: 'member' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
