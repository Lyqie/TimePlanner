import { Router } from 'express';
import prisma from '../db';
import asyncHandler from '../lib/asyncHandler';
import { iso } from '../lib/format';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const { taskId, type, startedAt, endedAt, durationMin } = req.body ?? {};
  if (durationMin == null) {
    res.status(400).json({ error: 'INVALID', message: 'durationMin 必填' });
    return;
  }
  const session = await prisma.pomodoroSession.create({
    data: {
      taskId: taskId || null,
      type: type ?? 'focus',
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : null,
      durationMin,
    },
  });
  res.status(201).json(serialize(session));
}));

router.get('/', asyncHandler(async (req, res) => {
  const { start, end } = req.query as Record<string, string | undefined>;
  const where: Record<string, unknown> = {};
  if (start || end) {
    const range: Record<string, Date> = {};
    if (start) range.gte = new Date(start);
    if (end) range.lte = new Date(end);
    where.startedAt = range;
  }
  const list = await prisma.pomodoroSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    include: { task: true },
  });
  res.json(list.map(serialize));
}));

function serialize(s: any) {
  return {
    id: s.id,
    taskId: s.taskId,
    type: s.type,
    startedAt: iso(s.startedAt),
    endedAt: iso(s.endedAt),
    durationMin: s.durationMin,
    createdAt: iso(s.createdAt),
    task: s.task ? { id: s.task.id, title: s.task.title } : null,
  };
}

export default router;
