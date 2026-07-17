import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import CalendarView from '../components/calendar/CalendarView';
import { useTimeBlocks, useTimeBlockMutations } from '../hooks/useTimeBlocks';
import { useTasks } from '../hooks/useTasks';
import { useCategories } from '../hooks/useCategories';
import { toLocalInput, fromLocalInput } from '../lib/format';
import type { TimeBlock, CreateTimeBlockInput } from '@app/shared';

type View = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

export default function Calendar() {
  const [view, setView] = useState<View>('timeGridWeek');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimeBlock | null>(null);
  const [form, setForm] = useState<CreateTimeBlockInput>({
    title: '',
    start: '',
    end: '',
    color: '#6366F1',
  });

  const { data: blocks } = useTimeBlocks();
  const { data: tasks } = useTasks();
  const { data: categories } = useCategories();
  const { create, update, remove } = useTimeBlockMutations();

  const events: EventInput[] = (blocks ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    start: b.start,
    end: b.end,
    backgroundColor: b.color || '#6366F1',
    borderColor: b.color || '#6366F1',
    extendedProps: { block: b },
  }));

  const openCreate = (info?: { start: string; end: string }) => {
    setEditing(null);
    setForm({ title: '', start: info?.start ?? '', end: info?.end ?? '', color: '#6366F1' });
    setOpen(true);
  };

  const openEdit = (b: TimeBlock) => {
    setEditing(b);
    setForm({
      title: b.title,
      start: toLocalInput(b.start),
      end: toLocalInput(b.end),
      color: b.color || '#6366F1',
      categoryId: b.categoryId ?? undefined,
      taskId: b.taskId ?? undefined,
    });
    setOpen(true);
  };

  const onSelect = (arg: DateSelectArg) => openCreate({ start: arg.startStr, end: arg.endStr });

  const onEventClick = (arg: EventClickArg) => {
    openEdit(arg.event.extendedProps.block as TimeBlock);
  };

  const onEventDrop = (arg: EventDropArg) => {
    const b = arg.event.extendedProps.block as TimeBlock;
    update.mutate({
      id: b.id,
      data: { start: arg.event.startStr, end: arg.event.endStr ?? b.end },
    });
  };

  const save = () => {
    if (!form.title || !form.start || !form.end) return;
    const payload: CreateTimeBlockInput = {
      title: form.title,
      start: fromLocalInput(form.start),
      end: fromLocalInput(form.end),
      color: form.color,
      categoryId: form.categoryId,
      taskId: form.taskId,
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
    setOpen(false);
  };

  const del = () => {
    if (editing) remove.mutate(editing.id);
    setOpen(false);
  };

  const views: { key: View; label: string }[] = [
    { key: 'timeGridDay', label: '日' },
    { key: 'timeGridWeek', label: '周' },
    { key: 'dayGridMonth', label: '月' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">日历排程</h1>
          <p className="text-sm text-ink-soft dark:text-slate-400">
            拖拽时间块，按分类着色安排你的一天。
          </p>
        </div>
        <Button onClick={() => openCreate()} className="gap-1">
          <Plus size={16} /> 新建
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 text-sm transition cursor-pointer ${
                view === v.key
                  ? 'bg-indigo-500 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 ml-auto">
          {(categories ?? []).map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-1 text-xs text-ink-soft dark:text-slate-400"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} /> {c.name}
            </span>
          ))}
        </div>
      </div>

      <Card className="p-3">
        <CalendarView
          events={events}
          view={view}
          onSelect={onSelect}
          onEventClick={onEventClick}
          onEventDrop={onEventDrop}
        />
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? '编辑时间块' : '新建时间块'}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-soft dark:text-slate-400">标题</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：撰写周报"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">开始</label>
              <Input
                type="datetime-local"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">结束</label>
              <Input
                type="datetime-local"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">关联任务</label>
              <Select
                value={form.taskId ?? ''}
                onChange={(e) => setForm({ ...form, taskId: e.target.value || undefined })}
              >
                <option value="">无</option>
                {(tasks ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">分类</label>
              <Select
                value={form.categoryId ?? ''}
                onChange={(e) => {
                  const cat = (categories ?? []).find((c) => c.id === e.target.value);
                  setForm({
                    ...form,
                    categoryId: e.target.value || undefined,
                    color: cat?.color ?? form.color,
                  });
                }}
              >
                <option value="">无</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-soft dark:text-slate-400">颜色</label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
          <div className="flex gap-3 pt-2">
            {editing && (
              <Button variant="danger" onClick={del} className="gap-1">
                <Trash2 size={16} /> 删除
              </Button>
            )}
            <Button onClick={save} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
