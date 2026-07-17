import { Router } from 'express';
import prisma from '../db';
import asyncHandler from '../lib/asyncHandler';
import { startOfDay, endOfDay } from '../lib/date';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { start, end } = req.query as Record<string, string | undefined>;
  const rangeStart = start ? new Date(start) : startOfDay(new Date());
  const rangeEnd = end ? new Date(end) : endOfDay(new Date());

  const sessions = await prisma.pomodoroSession.findMany({
    where: { type: 'focus', startedAt: { gte: rangeStart, lte: rangeEnd } },
    include: { task: { include: { category: true } } },
  });

  const totalFocusMinutes = sessions.reduce((s, x) => s + x.durationMin, 0);
  const totalPomodoros = sessions.length;

  const dailyMap = new Map<string, number>();
  for (const s of sessions) {
    const day = s.startedAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + s.durationMin);
  }
  const daily = [...dailyMap.entries()].map(([date, minutes]) => ({ date, minutes }));

  const catMap = new Map<string, any>();
  for (const s of sessions) {
    const cat = s.task?.category;
    const key = cat?.id ?? 'none';
    if (!catMap.has(key)) {
      catMap.set(key, {
        categoryId: cat?.id ?? null,
        name: cat?.name ?? '未分类',
        color: cat?.color ?? '#94A3B8',
        minutes: 0,
        count: 0,
      });
    }
    const c = catMap.get(key);
    c.minutes += s.durationMin;
    c.count += 1;
  }
  const byCategory = [...catMap.values()];

  const taskMap = new Map<string, any>();
  for (const s of sessions) {
    if (!s.task) continue;
    if (!taskMap.has(s.taskId!)) {
      taskMap.set(s.taskId!, {
        taskId: s.taskId!,
        title: s.task.title,
        focusMinutes: 0,
        pomodoroCount: 0,
        done: s.task.status === 'done',
      });
    }
    const t = taskMap.get(s.taskId!);
    t.focusMinutes += s.durationMin;
    t.pomodoroCount += 1;
  }
  const topTasks = [...taskMap.values()].sort((a, b) => b.focusMinutes - a.focusMinutes).slice(0, 8);

  const completedTasks = await prisma.task.count({
    where: { status: 'done', updatedAt: { gte: rangeStart, lte: rangeEnd } },
  });

  res.json({
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    totalFocusMinutes,
    totalPomodoros,
    completedTasks,
    daily,
    byCategory,
    topTasks,
  });
}));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(String(req.query.date)) : new Date();
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [taskTotal, taskDone, taskDoing, blocks] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: 'done' } }),
    prisma.task.count({ where: { status: 'doing' } }),
    prisma.timeBlock.findMany({ where: { start: { gte: dayStart, lt: dayEnd } } }),
  ]);

  const focusSessions = await prisma.pomodoroSession.findMany({
    where: { type: 'focus', startedAt: { gte: dayStart, lt: dayEnd } },
  });
  const focusMinutesToday = focusSessions.reduce((s, x) => s + x.durationMin, 0);

  const scheduledMinutes = blocks.reduce(
    (s, b) => s + Math.max(0, (b.end.getTime() - b.start.getTime()) / 60000),
    0,
  );
  const utilization = Math.min(1, scheduledMinutes / (16 * 60));

  res.json({
    date: dayStart.toISOString().slice(0, 10),
    taskTotal,
    taskDone,
    taskDoing,
    focusMinutesToday,
    timeBlocksToday: blocks.length,
    utilization,
  });
}));

export default router;
