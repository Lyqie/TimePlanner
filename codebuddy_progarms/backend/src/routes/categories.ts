import { Router } from 'express';
import prisma from '../db';
import asyncHandler from '../lib/asyncHandler';
import { iso } from '../lib/format';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(cats.map(serialize));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, color } = req.body ?? {};
  if (!name || !color) {
    res.status(400).json({ error: 'INVALID', message: 'name 与 color 必填' });
    return;
  }
  const cat = await prisma.category.create({ data: { name, color } });
  res.status(201).json(serialize(cat));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { name, color } = req.body ?? {};
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;
  const cat = await prisma.category.update({ where: { id: req.params.id }, data });
  res.json(serialize(cat));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

function serialize(c: { id: string; name: string; color: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    createdAt: iso(c.createdAt),
    updatedAt: iso(c.updatedAt),
  };
}

export default router;
