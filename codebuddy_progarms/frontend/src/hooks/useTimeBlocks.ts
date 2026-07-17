import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../components/ui/Toast';
import type { CreateTimeBlockInput, UpdateTimeBlockInput } from '@app/shared';

export function useTimeBlocks(params?: Record<string, string>) {
  return useQuery({ queryKey: ['timeblocks', params], queryFn: () => api.timeblocks.list(params) });
}

export function useTimeBlockMutations() {
  const qc = useQueryClient();
  const toast = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['timeblocks'] });
  const invalidateDash = () => qc.invalidateQueries({ queryKey: ['dashboard'] });

  const create = useMutation({
    mutationFn: (d: CreateTimeBlockInput) => api.timeblocks.create(d),
    onSuccess: () => {
      invalidate();
      invalidateDash();
      toast.show('时间块已添加');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeBlockInput }) =>
      api.timeblocks.update(id, data),
    onSuccess: () => {
      invalidate();
      invalidateDash();
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.timeblocks.remove(id),
    onSuccess: () => {
      invalidate();
      invalidateDash();
      toast.show('时间块已删除');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });

  return { create, update, remove };
}
