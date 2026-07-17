import type {
  Category,
  Task,
  TimeBlock,
  PomodoroSession,
  ReportSummary,
  DashboardSummary,
  CreateTaskInput,
  UpdateTaskInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  CreatePomodoroInput,
} from '@app/shared';

const BASE = '/api/v1';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const e = await res.json();
      msg = e.message || e.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const qs = (params?: Record<string, string>) =>
  params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';

export const api = {
  categories: {
    list: () => req<Category[]>('/categories'),
    create: (data: CreateCategoryInput) =>
      req<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateCategoryInput) =>
      req<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => req<void>(`/categories/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: (params?: Record<string, string>) => req<Task[]>('/tasks' + qs(params)),
    create: (data: CreateTaskInput) =>
      req<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTaskInput) =>
      req<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => req<void>(`/tasks/${id}`, { method: 'DELETE' }),
  },
  timeblocks: {
    list: (params?: Record<string, string>) => req<TimeBlock[]>('/timeblocks' + qs(params)),
    create: (data: CreateTimeBlockInput) =>
      req<TimeBlock>('/timeblocks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTimeBlockInput) =>
      req<TimeBlock>(`/timeblocks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => req<void>(`/timeblocks/${id}`, { method: 'DELETE' }),
  },
  pomodoro: {
    create: (data: CreatePomodoroInput) =>
      req<PomodoroSession>('/pomodoro', { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: Record<string, string>) => req<PomodoroSession[]>('/pomodoro' + qs(params)),
  },
  reports: (params?: Record<string, string>) => req<ReportSummary>('/reports' + qs(params)),
  dashboard: (date?: string) =>
    req<DashboardSummary>('/reports/dashboard' + (date ? `?date=${date}` : '')),
};
