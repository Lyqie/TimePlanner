import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useToast } from '../components/ui/Toast';
import type { CreatePomodoroInput } from '@app/shared';

export function usePomodoroMutations() {
  const qc = useQueryClient();
  const toast = useToast();

  const create = useMutation({
    mutationFn: (d: CreatePomodoroInput) => api.pomodoro.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e: Error) => toast.show(e.message, 'error'),
  });

  return { create };
}
