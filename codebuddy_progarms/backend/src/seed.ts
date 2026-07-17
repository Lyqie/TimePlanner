import prisma from './db';

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log('已存在分类，跳过 seed');
    return;
  }

  const cats = await Promise.all([
    prisma.category.create({ data: { name: '工作', color: '#6366F1' } }),
    prisma.category.create({ data: { name: '学习', color: '#8B5CF6' } }),
    prisma.category.create({ data: { name: '生活', color: '#10B981' } }),
    prisma.category.create({ data: { name: '休息', color: '#F59E0B' } }),
  ]);
  console.log('已创建分类:', cats.map((c) => c.name).join('、'));

  const [work, learn] = cats;
  const today = new Date();
  const at = (h: number, m = 0) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const task = await prisma.task.create({
    data: { title: '撰写周报', priority: 'high', status: 'doing', categoryId: work.id, estimatedMinutes: 60 },
  });
  await prisma.task.create({
    data: { title: '阅读《深度工作》', priority: 'medium', status: 'todo', categoryId: learn.id, estimatedMinutes: 45 },
  });
  await prisma.task.create({
    data: { title: '晨间锻炼', priority: 'low', status: 'todo', categoryId: cats[2].id, estimatedMinutes: 30 },
  });

  await prisma.timeBlock.create({
    data: { title: '撰写周报', taskId: task.id, categoryId: work.id, color: work.color, start: at(9, 0), end: at(10, 0) },
  });
  await prisma.timeBlock.create({
    data: { title: '深度工作', categoryId: work.id, color: work.color, start: at(10, 30), end: at(12, 0) },
  });
  await prisma.timeBlock.create({
    data: { title: '阅读', categoryId: learn.id, color: learn.color, start: at(14, 0), end: at(15, 0) },
  });

  await prisma.pomodoroSession.create({
    data: { taskId: task.id, type: 'focus', startedAt: at(9, 0), endedAt: at(9, 25), durationMin: 25 },
  });
  await prisma.pomodoroSession.create({
    data: { taskId: task.id, type: 'focus', startedAt: at(10, 30), endedAt: at(10, 55), durationMin: 25 },
  });

  console.log('示例数据已写入');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
