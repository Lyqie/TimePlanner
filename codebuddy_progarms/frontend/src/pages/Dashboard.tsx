import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ListTodo, Timer, PieChart, LucideIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useDashboard } from '../hooks/useReports';
import { useTimeBlocks } from '../hooks/useTimeBlocks';
import { formatMinutes, timeRange } from '../lib/format';

export default function Dashboard() {
  const { data: dash } = useDashboard();
  const today = new Date().toISOString().slice(0, 10);
  const params = useMemo(
    () => ({ start: `${today}T00:00:00`, end: `${today}T23:59:59` }),
    [today],
  );
  const { data: blocks } = useTimeBlocks(params);

  const cards: {
    label: string;
    value: string | number;
    sub: string;
    icon: LucideIcon;
    color: string;
  }[] = [
    {
      label: '今日任务',
      value: dash?.taskTotal ?? 0,
      sub: `已完成 ${dash?.taskDone ?? 0}`,
      icon: ListTodo,
      color: 'from-indigo-500 to-indigo-400',
    },
    {
      label: '专注时长',
      value: formatMinutes(dash?.focusMinutesToday ?? 0),
      sub: `${dash?.timeBlocksToday ?? 0} 个时间块`,
      icon: Timer,
      color: 'from-purple-500 to-purple-400',
    },
    {
      label: '进行中',
      value: dash?.taskDoing ?? 0,
      sub: '任务进行中',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-400',
    },
    {
      label: '时间利用率',
      value: `${Math.round((dash?.utilization ?? 0) * 100)}%`,
      sub: '已排程占比',
      icon: PieChart,
      color: 'from-amber-500 to-amber-400',
    },
  ];

  const sorted = [...(blocks ?? [])].sort(
    (a, b) => +new Date(a.start) - +new Date(b.start),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">今日概览</h1>
        <p className="text-sm text-ink-soft dark:text-slate-400">
          规划你的时间，专注当下，复盘成长。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 relative overflow-hidden">
              <div
                className={`absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br ${c.color} opacity-20`}
              />
              <div className="flex items-center gap-2 text-ink-soft dark:text-slate-400">
                <c.icon size={16} />
                <span className="text-xs">{c.label}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold gradient-text">{c.value}</div>
              <div className="text-xs text-ink-soft dark:text-slate-400 mt-1">{c.sub}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">今日时间轴</h2>
          <Link to="/calendar" className="text-xs text-indigo-500">
            查看日历
          </Link>
        </div>
        {sorted.length > 0 ? (
          <div className="space-y-2">
            {sorted.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-14 text-xs text-ink-soft dark:text-slate-400 text-right">
                  {new Date(b.start).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: b.color || '#6366F1' }}
                />
                <div className="flex-1 text-sm truncate">{b.title}</div>
                <div className="text-xs text-ink-soft dark:text-slate-400">
                  {timeRange(b.start, b.end)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-soft dark:text-slate-400">
            今天还没有排程，去日历添加时间块吧。
          </p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/pomodoro">
          <Button className="w-full">开始专注</Button>
        </Link>
        <Link to="/tasks">
          <Button variant="outline" className="w-full">
            新建任务
          </Button>
        </Link>
      </div>
    </div>
  );
}
