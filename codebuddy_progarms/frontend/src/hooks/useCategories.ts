import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../components/ui/Toast';
import type { CreateCategoryInput, UpdateCategoryInput } from '@app/shared';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.categories.list });
}

export function useCategoryMutations() {
  const qc = useQueryClient();
  const toast = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] });

  const create = useMutation({
    mutationFn: (d: CreateCategoryInput) => api.categories.create(d),
    onSuccess: () => {
      invalidate();
      toast.show('分类已添加');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      api.categories.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.show('分类已更新');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.categories.remove(id),
    onSuccess: () => {
      invalidate();
      toast.show('分类已删除');
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });

  return { create, update, remove };
}
