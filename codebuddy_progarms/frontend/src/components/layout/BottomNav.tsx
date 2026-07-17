import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ListTodo, Timer, BarChart3, LucideIcon } from 'lucide-react';

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const items: Item[] = [
  { to: '/', label: '首页', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: '日历', icon: CalendarDays },
  { to: '/tasks', label: '任务', icon: ListTodo },
  { to: '/pomodoro', label: '番茄', icon: Timer },
  { to: '/reports', label: '报表', icon: BarChart3 },
];

function NavItem({ to, label, icon: Icon, end }: Item) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition cursor-pointer ${
          isActive
            ? 'text-indigo-500'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={22}
            className={isActive ? 'drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]' : ''}
          />
          <span className="text-xs font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 h-20 glass border-t border-white/40 dark:border-slate-700/40">
      <div className="max-w-5xl mx-auto h-full px-2 flex items-center justify-around">
        {items.map((it) => (
          <NavItem key={it.to} {...it} />
        ))}
      </div>
    </nav>
  );
}
