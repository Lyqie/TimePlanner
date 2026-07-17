import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useTimer, type TimerMode } from '../store/timer';
import { useTasks } from '../hooks/useTasks';
import { usePomodoroMutations } from '../hooks/usePomodoro';
import { useDashboard } from '../hooks/useReports';

function fmt(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro() {
  const { data: tasks } = useTasks();
  const { data: dash } = useDashboard();
  const { create } = usePomodoroMutations();
  const timer = useTimer();
  const running = useTimer((s) => s.running);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const s = useTimer.getState();
      const next = s.remaining - 1;
      if (next <= 0) {
        const finishedMin =
          s.mode === 'focus' ? s.workMin : s.mode === 'break' ? s.breakMin : s.longBreakMin;
        if (s.mode === 'focus') {
          const round = s.round + 1;
          useTimer.setState({ round });
          create.mutate({ taskId: s.taskId ?? undefined, type: 'focus', durationMin: finishedMin });
          const nextMode: TimerMode = round % s.roundsBeforeLong === 0 ? 'longBreak' : 'break';
          useTimer.setState({
            mode: nextMode,
            remaining: (nextMode === 'break' ? s.breakMin : s.longBreakMin) * 60,
            running: s.autoStart,
          });
        } else {
          useTimer.setState({ mode: 'focus', remaining: s.workMin * 60, running: s.autoStart });
        }
      } else {
        useTimer.setState({ remaining: next });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, create]);

  const total =
    (timer.mode === 'focus'
      ? timer.workMin
      : timer.mode === 'break'
        ? timer.breakMin
        : timer.longBreakMin) * 60;
  const progress = total ? 1 - timer.remaining / total : 0;
  const R = 120;
  const C = 2 * Math.PI * R;

  const modeLabel = timer.mode === 'focus' ? '专注' : timer.mode === 'break' ? '短休息' : '长休息';
  const activeTasks = (tasks ?? []).filter((t) => t.status !== 'done');

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">番茄钟</h1>
          <p className="text-sm text-ink-soft dark:text-slate-400">绑定任务，专注计时，自动记录。</p>
        </div>
        <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-1">
          <Settings size={16} /> 设置
        </Button>
      </div>

      <Card className="p-6 flex flex-col items-center">
        <span className="text-sm text-ink-soft dark:text-slate-400 mb-1">{modeLabel}</span>
        <div className="relative w-[280px] h-[280px] grid place-items-center animate-breathe">
          <svg width="280" height="280" className="absolute inset-0">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
            <circle cx="140" cy="140" r={R} stroke="rgba(148,163,184,0.2)" strokeWidth="12" fill="none" />
            <circle
              cx="140"
              cy="140"
              r={R}
              stroke="url(#grad)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              transform="rotate(-90 140 140)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center z-10">
            <div className="text-5xl font-semibold tabular-nums">{fmt(timer.remaining)}</div>
            <div className="text-xs text-ink-soft dark:text-slate-400 mt-1">第 {timer.round + 1} 个番茄</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          {running ? (
            <Button variant="outline" onClick={() => timer.pause()} className="gap-1">
              <Pause size={18} /> 暂停
            </Button>
          ) : (
            <Button onClick={() => timer.start()} className="gap-1">
              <Play size={18} /> 开始
            </Button>
          )}
          <Button variant="ghost" onClick={() => timer.reset()} className="gap-1">
            <RotateCcw size={18} /> 重置
          </Button>
        </div>

        <div className="w-full mt-5">
          <label className="text-xs text-ink-soft dark:text-slate-400">当前任务</label>
          <Select
            value={timer.taskId ?? ''}
            onChange={(e) => timer.setTask(e.target.value || null)}
            className="mt-1"
          >
            <option value="">未绑定任务</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-xs text-ink-soft dark:text-slate-400">今日专注</div>
          <div className="text-xl font-semibold gradient-text mt-1">
            {Math.floor((dash?.focusMinutesToday ?? 0) / 60)} 小时 {(dash?.focusMinutesToday ?? 0) % 60} 分
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-ink-soft dark:text-slate-400">今日时间块</div>
          <div className="text-xl font-semibold gradient-text mt-1">{dash?.timeBlocksToday ?? 0}</div>
        </Card>
      </div>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title="番茄钟设置">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">专注（分钟）</label>
              <Input
                type="number"
                value={timer.workMin}
                onChange={(e) => timer.setDurations({ workMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">短休（分钟）</label>
              <Input
                type="number"
                value={timer.breakMin}
                onChange={(e) => timer.setDurations({ breakMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">长休（分钟）</label>
              <Input
                type="number"
                value={timer.longBreakMin}
                onChange={(e) => timer.setDurations({ longBreakMin: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">长休间隔</label>
              <Input
                type="number"
                value={timer.roundsBeforeLong}
                onChange={(e) => timer.setDurations({ roundsBeforeLong: Number(e.target.value) })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={timer.autoStart}
              onChange={(e) => timer.setAutoStart(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            自动开始下一个时段
          </label>
          <Button onClick={() => setSettingsOpen(false)} className="w-full">
            完成
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
