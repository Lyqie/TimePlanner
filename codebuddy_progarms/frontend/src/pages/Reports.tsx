import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useReports } from '../hooks/useReports';
import { formatMinutes } from '../lib/format';

type Range = 'week' | 'month' | 'custom';

function computeRange(range: Range, customStart: string, customEnd: string) {
  const now = new Date();
  if (range === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: s.toISOString(), end: now.toISOString() };
  }
  if (range === 'custom') {
    return {
      start: customStart ? new Date(customStart).toISOString() : now.toISOString(),
      end: customEnd ? new Date(customEnd).toISOString() : now.toISOString(),
    };
  }
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const s = new Date(now);
  s.setDate(now.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  return { start: s.toISOString(), end: now.toISOString() };
}

const tooltipStyle = {
  background: 'rgba(15,23,42,0.9)',
  border: 'none',
  borderRadius: 12,
  color: '#F1F5F9',
  fontSize: 12,
};

export default function Reports() {
  const [range, setRange] = useState<Range>('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { start, end } = useMemo(
    () => computeRange(range, customStart, customEnd),
    [range, customStart, customEnd],
  );
  const params = useMemo(() => ({ start, end }), [start, end]);
  const { data: report } = useReports(params);

  const ranges: { key: Range; label: string }[] = [
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'custom', label: '自定义' },
  ];

  const daily = (report?.daily ?? []).map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">统计报表</h1>
        <p className="text-sm text-ink-soft dark:text-slate-400">复盘你的专注分布与时间投入。</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 text-sm transition cursor-pointer ${
                range === r.key ? 'bg-indigo-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-2 py-1.5 text-sm"
            />
            <span className="text-sm text-ink-soft dark:text-slate-400">至</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-2 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-ink-soft dark:text-slate-400">总专注</div>
          <div className="text-xl font-semibold gradient-text mt-1">
            {formatMinutes(report?.totalFocusMinutes ?? 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-ink-soft dark:text-slate-400">番茄数</div>
          <div className="text-xl font-semibold gradient-text mt-1">{report?.totalPomodoros ?? 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-ink-soft dark:text-slate-400">完成任务</div>
          <div className="text-xl font-semibold gradient-text mt-1">{report?.completedTasks ?? 0}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-medium mb-3">每日专注时长</h2>
        {daily.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} unit="m" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} 分钟`, '专注']} />
              <Bar dataKey="minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-ink-soft dark:text-slate-400">该区间暂无专注记录。</p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="font-medium mb-3">分类时间占比</h2>
          {(report?.byCategory ?? []).length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={report!.byCategory}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {report!.byCategory.map((c) => (
                    <Cell key={c.categoryId ?? 'none'} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} 分钟`, '时长']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-ink-soft dark:text-slate-400">暂无分类数据。</p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-3">专注榜</h2>
          {(report?.topTasks ?? []).length ? (
            <div className="space-y-2">
              {report!.topTasks.map((t, i) => (
                <div key={t.taskId} className="flex items-center gap-3">
                  <span className="w-6 h-6 grid place-items-center rounded-full bg-indigo-500/15 text-indigo-500 text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{t.title}</span>
                  <span className="text-xs text-ink-soft dark:text-slate-400">
                    {t.pomodoroCount} 番茄 · {formatMinutes(t.focusMinutes)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft dark:text-slate-400">暂无专注任务。</p>
          )}
        </Card>
      </div>
    </div>
  );
}
