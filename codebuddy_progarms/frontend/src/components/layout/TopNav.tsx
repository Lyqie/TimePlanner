import { Link } from 'react-router-dom';
import { Moon, Sun, Timer } from 'lucide-react';
import { useUI } from '../../store/ui';

export default function TopNav() {
  const dark = useUI((s) => s.dark);
  const toggleDark = useUI((s) => s.toggleDark);

  return (
    <header className="fixed top-0 inset-x-0 z-30 h-16 glass border-b border-white/40 dark:border-slate-700/40">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-glow">
            <Timer size={18} />
          </span>
          <span className="text-lg font-semibold gradient-text">TimePlanner</span>
        </Link>
        <button
          onClick={toggleDark}
          className="grid place-items-center w-10 h-10 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/50 transition cursor-pointer"
          aria-label="切换主题"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
