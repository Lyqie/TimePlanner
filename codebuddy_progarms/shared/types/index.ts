// 前后端共享的领域模型与 API DTO 契约。
// 修改此处即全量类型校验，避免契约漂移。

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type PomodoroType = 'focus' | 'break';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// API 返回的嵌套引用（序列化后的精简对象）
export interface CategoryRef {
  id: string;
  name: string;
  color: string;
}
export interface TaskRef {
  id: string;
  title: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  priority: Priority;
  status: TaskStatus;
  categoryId?: string | null;
  estimatedMinutes?: number | null;
  category?: CategoryRef | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface TimeBlock {
  id: string;
  title: string;
  taskId?: string | null;
  categoryId?: string | null;
  color?: string | null;
  start: string; // ISO datetime
  end: string; // ISO datetime
  category?: CategoryRef | null;
  task?: TaskRef | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface PomodoroSession {
  id: string;
  taskId?: string | null;
  type: PomodoroType;
  startedAt: string; // ISO
  endedAt?: string | null;
  durationMin: number;
  task?: TaskRef | null;
  createdAt: string; // ISO
}

// ---- 创建 / 更新输入 ----
export type CreateCategoryInput = { name: string; color: string };
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateTaskInput = {
  title: string;
  notes?: string;
  priority?: Priority;
  status?: TaskStatus;
  categoryId?: string;
  estimatedMinutes?: number;
};
export type UpdateTaskInput = Partial<CreateTaskInput>;

export type CreateTimeBlockInput = {
  title: string;
  taskId?: string;
  categoryId?: string;
  color?: string;
  start: string; // ISO
  end: string; // ISO
};
export type UpdateTimeBlockInput = Partial<CreateTimeBlockInput>;

export type CreatePomodoroInput = {
  taskId?: string;
  type?: PomodoroType;
  startedAt?: string; // ISO
  endedAt?: string; // ISO
  durationMin: number;
};

// ---- 统计报表 ----
export interface DailyFocus {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface CategoryStat {
  categoryId: string | null;
  name: string;
  color: string;
  minutes: number;
  count: number;
}

export interface TaskCompletionStat {
  taskId: string;
  title: string;
  focusMinutes: number;
  pomodoroCount: number;
  done: boolean;
}

export interface ReportSummary {
  rangeStart: string;
  rangeEnd: string;
  totalFocusMinutes: number;
  totalPomodoros: number;
  completedTasks: number;
  daily: DailyFocus[];
  byCategory: CategoryStat[];
  topTasks: TaskCompletionStat[];
}

export interface DashboardSummary {
  date: string; // YYYY-MM-DD
  taskTotal: number;
  taskDone: number;
  taskDoing: number;
  focusMinutesToday: number;
  timeBlocksToday: number;
  utilization: number; // 0~1，已排程工时/可用工时
}

// ---- 错误响应 ----
export interface ApiError {
  error: string;
  message?: string;
}
