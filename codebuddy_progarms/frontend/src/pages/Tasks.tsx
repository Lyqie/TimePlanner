import { useMemo, useState } from 'react';
import { Plus, Trash2, Check, Pencil, Tags } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Drawer from '../components/ui/Drawer';
import Dialog from '../components/ui/Dialog';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useTasks, useTaskMutations } from '../hooks/useTasks';
import { useCategories, useCategoryMutations } from '../hooks/useCategories';
import type { Task, CreateTaskInput, Priority, TaskStatus } from '@app/shared';

const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low: { label: '低', color: '#10B981' },
  medium: { label: '中', color: '#F59E0B' },
  high: { label: '高', color: '#EF4444' },
};

export default function Tasks() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<CreateTaskInput>({
    title: '',
    notes: '',
    priority: 'medium',
    status: 'todo',
    estimatedMinutes: undefined,
  });
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#6366F1');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (status) p.status = status;
    if (priority) p.priority = priority;
    if (categoryId) p.categoryId = categoryId;
    if (search) p.search = search;
    return p;
  }, [status, priority, categoryId, search]);

  const { data: tasks } = useTasks(params);
  const { data: categories } = useCategories();
  const { create, update, remove } = useTaskMutations();
  const { create: createCat, remove: removeCat } = useCategoryMutations();

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', notes: '', priority: 'medium', status: 'todo', estimatedMinutes: undefined });
    setOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({
      title: t.title,
      notes: t.notes ?? '',
      priority: t.priority,
      status: t.status,
      categoryId: t.categoryId ?? undefined,
      estimatedMinutes: t.estimatedMinutes ?? undefined,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.title) return;
    if (editing) update.mutate({ id: editing.id, data: form });
    else create.mutate(form);
    setOpen(false);
  };

  const list = tasks ?? [];
  const doing = list.filter((t) => t.status !== 'done');
  const done = list.filter((t) => t.status === 'done');

  const renderTask = (t: Task) => (
    <Card
      key={t.id}
      className="p-4 flex items-start gap-3 hover:-translate-y-0.5 transition cursor-pointer"
      onClick={() => openEdit(t)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          update.mutate({ id: t.id, data: { status: t.status === 'done' ? 'todo' : 'done' } });
        }}
        className={`mt-0.5 grid place-items-center w-5 h-5 rounded-md border shrink-0 ${
          t.status === 'done'
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 dark:border-slate-600'
        }`}
      >
        {t.status === 'done' && <Check size={14} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${t.status === 'done' ? 'line-through text-ink-soft' : ''}`}>
          {t.title}
        </div>
        {t.notes && (
          <div className="text-xs text-ink-soft dark:text-slate-400 mt-0.5 truncate">
            {t.notes}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: priorityMeta[t.priority].color + '22', color: priorityMeta[t.priority].color }}
          >
            {priorityMeta[t.priority].label}优先级
          </span>
          {t.category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.category.color + '22', color: t.category.color }}
            >
              {t.category.name}
            </span>
          )}
          {t.estimatedMinutes ? (
            <span className="text-xs text-ink-soft dark:text-slate-400">
              约 {t.estimatedMinutes} 分钟
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} className="text-slate-400 hover:text-indigo-500 cursor-pointer">
          <Pencil size={16} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); remove.mutate(t.id); }} className="text-slate-400 hover:text-red-500 cursor-pointer">
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">任务清单</h1>
          <p className="text-sm text-ink-soft dark:text-slate-400">管理你的待办，按优先级与分类推进。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatOpen(true)} className="gap-1">
            <Tags size={16} /> 分类
          </Button>
          <Button onClick={openCreate} className="gap-1">
            <Plus size={16} /> 新建
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Input placeholder="搜索任务" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          <option value="todo">待办</option>
          <option value="doing">进行中</option>
          <option value="done">已完成</option>
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">全部优先级</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </Select>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">全部分类</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        <h2 className="font-medium text-sm text-ink-soft dark:text-slate-400">进行中（{doing.length}）</h2>
        {doing.length ? doing.map(renderTask) : <p className="text-sm text-ink-soft dark:text-slate-400">暂无进行中的任务。</p>}
      </div>

      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm text-ink-soft dark:text-slate-400">已完成（{done.length}）</h2>
          {done.map(renderTask)}
        </div>
      )}

      <Drawer open={open} onClose={() => setOpen(false)} title={editing ? '编辑任务' : '新建任务'}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-soft dark:text-slate-400">标题</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="任务标题" />
          </div>
          <div>
            <label className="text-xs text-ink-soft dark:text-slate-400">备注</label>
            <Input value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="补充说明（可选）" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">优先级</label>
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">状态</label>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
                <option value="todo">待办</option>
                <option value="doing">进行中</option>
                <option value="done">已完成</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">分类</label>
              <Select value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value || undefined })}>
                <option value="">无</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-ink-soft dark:text-slate-400">预估时长（分钟）</label>
              <Input
                type="number"
                value={form.estimatedMinutes ?? ''}
                onChange={(e) =>
                  setForm({ ...form, estimatedMinutes: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>
          <Button onClick={save} className="w-full">
            保存
          </Button>
        </div>
      </Drawer>

      <Dialog open={catOpen} onClose={() => setCatOpen(false)} title="分类管理">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="分类名称" className="flex-1" />
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
            />
            <Button
              onClick={() => {
                if (!catName) return;
                createCat.mutate({ name: catName, color: catColor });
                setCatName('');
              }}
            >
              添加
            </Button>
          </div>
          <div className="space-y-2">
            {(categories ?? []).map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="flex-1">{c.name}</span>
                <button onClick={() => removeCat.mutate(c.id)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
