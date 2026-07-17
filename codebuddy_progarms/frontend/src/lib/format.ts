export function formatMinutes(min: number): string {
  if (min < 60) return `${min} 分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} 小时 ${m} 分` : `${h} 小时`;
}

export function timeRange(start: string, end: string): string {
  const f = (s: string) =>
    new Date(s).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return `${f(start)} - ${f(end)}`;
}

export function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(str: string): string {
  // datetime-local 字符串按本地时间处理，后端 new Date() 会正确转为 ISO
  return str;
}
