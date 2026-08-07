import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { LayoutDashboard, LayoutList, Map, ScrollText, Activity, LogOut, Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { useThemeStore } from '@/lib/theme-store';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Go to Dashboard', icon: LayoutDashboard, shortcut: 'G D', path: '/app' },
  { label: 'Go to Board', icon: LayoutList, shortcut: 'G B', path: '/app/board' },
  { label: 'Go to Roadmap', icon: Map, shortcut: 'G R', path: '/app/roadmap' },
  { label: 'Go to Changelog', icon: ScrollText, shortcut: 'G C', path: '/app/changelog' },
  { label: 'Go to Activity', icon: Activity, shortcut: 'G A', path: '/app/activity' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Cmd/Ctrl + K to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  function run(fn: () => void) {
    fn();
    setCommandPaletteOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12%]"
      style={{ background: 'rgba(8,7,13,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-[560px] rounded-xl border border-border bg-surface overflow-hidden shadow-[0_30px_80px_-10px_rgba(0,0,0,0.5),0_0_0_1px_var(--border-2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <span className="text-tx2 text-base">⌕</span>
            <Command.Input
              className="flex-1 bg-transparent border-none outline-none text-base text-tx placeholder:text-tx3 font-[family-name:var(--font-body)]"
              placeholder="Search or jump to..."
              autoFocus
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 border border-border rounded text-tx2">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-[380px] overflow-auto py-2">
            <Command.Empty className="py-6 text-center text-sm text-tx3">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigate"
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-tx3"
            >
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => run(() => navigate(item.path))}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] data-[selected=true]:border-l-2 data-[selected=true]:border-grad2 border-l-2 border-transparent"
                >
                  <item.icon size={16} className="text-tx2" />
                  <span className="flex-1">{item.label}</span>
                  <kbd className="text-[11px] font-mono text-tx3">{item.shortcut}</kbd>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Actions"
              className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-tx3"
            >
              <Command.Item
                value="Toggle theme"
                onSelect={() => run(toggleTheme)}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] border-l-2 border-transparent"
              >
                {theme === 'dark' ? <Sun size={16} className="text-tx2" /> : <Moon size={16} className="text-tx2" />}
                <span className="flex-1">Toggle theme</span>
                <kbd className="text-[11px] font-mono text-tx3">T</kbd>
              </Command.Item>
              <Command.Item
                value="Sign out"
                onSelect={() => run(() => { logout(); navigate('/login'); })}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] border-l-2 border-transparent"
              >
                <LogOut size={16} className="text-tx2" />
                <span className="flex-1">Sign out</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex gap-4 px-4 py-2.5 border-t border-border text-[10px] font-mono text-tx3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span className="ml-auto">murmr</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
