import type { Request, Response, NextFunction } from 'express';
import type { ApiError } from '@app/shared';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'NOT_FOUND', message: '资源不存在' } satisfies ApiError);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[API Error]', err);
  const status = (err as { status?: number })?.status || 500;
  res.status(status).json({
    error: 'INTERNAL',
    message: (err as Error)?.message || '服务器内部错误',
  } satisfies ApiError);
}
