import { Router } from 'express';
import prisma from '../db';
import asyncHandler from '../lib/asyncHandler';
import { iso } from '../lib/format';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { start, end } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (start || end) {
    const range: Record<string, Date> = {};
    if (start) range.gte = new Date(start);
    if (end) range.lte = new Date(end);
    where.start = range;
  }
  const blocks = await prisma.timeBlock.findMany({
    where,
    orderBy: { start: 'asc' },
    include: { category: true, task: true },
  });
  res.json(blocks.map(serialize));
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, taskId, categoryId, color, start, end } = req.body ?? {};
  if (!title || !start || !end) {
    res.status(400).json({ error: 'INVALID', message: 'title、start、end 必填' });
    return;
  }
  const block = await prisma.timeBlock.create({
    data: {
      title,
      taskId: taskId || null,
      categoryId: categoryId || null,
      color: color || null,
      start: new Date(start),
      end: new Date(end),
    },
    include: { category: true, task: true },
  });
  res.status(201).json(serialize(block));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { title, taskId, categoryId, color, start, end } = req.body ?? {};
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (taskId !== undefined) data.taskId = taskId || null;
  if (categoryId !== undefined) data.categoryId = categoryId || null;
  if (color !== undefined) data.color = color || null;
  if (start !== undefined) data.start = new Date(start);
  if (end !== undefined) data.end = new Date(end);
  const block = await prisma.timeBlock.update({ where: { id: req.params.id }, data, include: { category: true, task: true } });
  res.json(serialize(block));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.timeBlock.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

function serialize(b: any) {
  return {
    id: b.id,
    title: b.title,
    taskId: b.taskId,
    categoryId: b.categoryId,
    color: b.color,
    start: iso(b.start),
    end: iso(b.end),
    category: b.category ? { id: b.category.id, name: b.category.name, color: b.category.color } : null,
    task: b.task ? { id: b.task.id, title: b.task.title } : null,
    createdAt: iso(b.createdAt),
    updatedAt: iso(b.updatedAt),
  };
}

export default router;
