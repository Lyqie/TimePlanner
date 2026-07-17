import { Router } from 'express';
import prisma from '../db';
import asyncHandler from '../lib/asyncHandler';
import { iso } from '../lib/format';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { status, priority, categoryId, search } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (categoryId) where.categoryId = categoryId;
  if (search) where.title = { contains: search };

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
  res.json(tasks.map(serialize));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, notes, priority, status, categoryId, estimatedMinutes } = req.body ?? {};
  if (!title) {
    res.status(400).json({ error: 'INVALID', message: 'title 必填' });
    return;
  }
  const task = await prisma.task.create({
    data: {
      title,
      notes: notes ?? null,
      priority: priority ?? 'medium',
      status: status ?? 'todo',
      categoryId: categoryId || null,
      estimatedMinutes: estimatedMinutes ?? null,
    },
    include: { category: true },
  });
  res.status(201).json(serialize(task));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { title, notes, priority, status, categoryId, estimatedMinutes } = req.body ?? {};
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (notes !== undefined) data.notes = notes;
  if (priority !== undefined) data.priority = priority;
  if (status !== undefined) data.status = status;
  if (categoryId !== undefined) data.categoryId = categoryId || null;
  if (estimatedMinutes !== undefined) data.estimatedMinutes = estimatedMinutes ?? null;
  const task = await prisma.task.update({ where: { id: req.params.id }, data, include: { category: true } });
  res.json(serialize(task));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

function serialize(t: any) {
  return {
    id: t.id,
    title: t.title,
    notes: t.notes,
    priority: t.priority,
    status: t.status,
    categoryId: t.categoryId,
    estimatedMinutes: t.estimatedMinutes,
    category: t.category ? { id: t.category.id, name: t.category.name, color: t.category.color } : null,
    createdAt: iso(t.createdAt),
    updatedAt: iso(t.updatedAt),
  };
}

export default router;
