import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../components/ui/Toast';
import type { CreateTaskInput, UpdateTaskInput } from '@app/shared';

export function useTasks(params?: Record<string, string>) {
  return useQuery({ queryKey: ['tasks', params], queryFn: () => api.tasks.list(params) });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const toast = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  const invalidateDash = () => qc.invalidateQueries({ queryKey: ['dashboard'] });

  const create = useMutation({
    mutationFn: (d: CreateTaskInput) => api.tasks.create(d),
    onSuccess: () => {
      invalidate();
      invalidateDash();
      toast.show('任务已创建');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      api.tasks.update(id, data),
    onSuccess: () => {
      invalidate();
      invalidateDash();
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => {
      invalidate();
      invalidateDash();
      toast.show('任务已删除');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });

  return { create, update, remove };
}
