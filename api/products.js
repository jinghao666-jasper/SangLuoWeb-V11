import { connectDB } from './_db.js';
import { verifyToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = await connectDB();
  const col = db.collection('products');

  // GET /api/products — public
  if (req.method === 'GET') {
    const products = await col.find({}, { sort: { createdAt: -1 } }).toArray();
    return res.status(200).json(products);
  }

  // All write operations require admin token
  const user = verifyToken(req);
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ error: '需要管理员权限' });
  }

  // POST /api/products — create
  if (req.method === 'POST') {
    const { name, nameCn, style, abv, volume, grain, description, price } = req.body;
    if (!name || !nameCn) return res.status(400).json({ error: '产品名称为必填项' });
    const result = await col.insertOne({
      name, nameCn, style, abv, volume, grain, description, price,
      createdAt: new Date(),
    });
    return res.status(201).json({ success: true, id: result.insertedId });
  }

  // PUT /api/products?id=xxx — update
  if (req.method === 'PUT') {
    const { ObjectId } = await import('mongodb');
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: '缺少产品 ID' });
    await col.updateOne({ _id: new ObjectId(id) }, { $set: { ...req.body, updatedAt: new Date() } });
    return res.status(200).json({ success: true });
  }

  // DELETE /api/products?id=xxx — delete
  if (req.method === 'DELETE') {
    const { ObjectId } = await import('mongodb');
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: '缺少产品 ID' });
    await col.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
