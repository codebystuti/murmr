import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { LayoutDashboard, LayoutList, Map, ScrollText, Activity, LogOut, Sun, Moon, FileText } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { useThemeStore } from '@/lib/theme-store';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/features/posts/hooks/usePosts';
import { queryClient } from '@/lib/queryClient';

const NAV_ITEMS = [
  { label: 'Go to Dashboard', icon: LayoutDashboard, shortcut: 'G D', key: 'd', path: '/app' },
  { label: 'Go to Board', icon: LayoutList, shortcut: 'G B', key: 'b', path: '/app/board' },
  { label: 'Go to Roadmap', icon: Map, shortcut: 'G R', key: 'r', path: '/app/roadmap' },
  { label: 'Go to Changelog', icon: ScrollText, shortcut: 'G C', key: 'c', path: '/app/changelog' },
  { label: 'Go to Activity', icon: Activity, shortcut: 'G A', key: 'a', path: '/app/activity' },
];

const PALETTE_ATTR = 'data-command-palette';

/** True while a modal dialog other than the palette is open (Radix dialogs, the mobile nav drawer, …). */
function isOtherModalOpen(): boolean {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"]'),
  ).some((el) => {
    if (el.hasAttribute(PALETTE_ATTR)) return false;
    if (el.getAttribute('aria-modal') === 'true') return true;
    // Radix dialog content keeps data-state; a closing (animating out) dialog no longer counts.
    return el.getAttribute('data-state') === 'open';
  });
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: allPosts = [] } = usePosts();
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout>>();
  const panelRef = useRef<HTMLDivElement>(null);
  // Last element focused outside the palette, so closing it can hand focus back. (Tracked continuously:
  // by the time an effect runs on open, the input has already taken focus.)
  const lastOutsideFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const outside = (t: EventTarget | null): t is HTMLElement => t instanceof HTMLElement && !t.closest(`[${PALETTE_ATTR}]`);
    const onFocusIn = (e: FocusEvent) => {
      if (outside(e.target)) lastOutsideFocus.current = e.target;
    };
    // Focus dropped to <body> (e.g. a click on empty page): there is nothing to hand back to.
    const onFocusOut = (e: FocusEvent) => {
      if (outside(e.target) && e.relatedTarget === null) lastOutsideFocus.current = null;
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const matchedPosts = query.trim().length >= 2
    ? allPosts.filter((p) => new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i').test(p.title))
    : [];

  // Global keyboard shortcuts: Cmd/Ctrl+K, sequential G→key, T for theme
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K — toggles the palette, but never stacks it on top of another modal
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (!commandPaletteOpen && isOtherModalOpen()) return;
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Single-key shortcuts only outside text fields, with the palette closed and no modal open
      if (commandPaletteOpen || isTypingTarget(e.target) || isOtherModalOpen()) {
        pendingG.current = false;
        return;
      }

      // T — toggle theme
      if (e.key === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        toggleTheme();
        return;
      }

      // G → second key navigation
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingG.current = true;
        clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { pendingG.current = false; }, 500);
        return;
      }

      if (pendingG.current) {
        pendingG.current = false;
        clearTimeout(gTimer.current);
        const item = NAV_ITEMS.find((n) => n.key === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          navigate(item.path);
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, toggleTheme, navigate]);

  // While open, the palette is a modal: Esc closes only the palette (captured before any dialog
  // underneath sees it), Tab stays inside it, and focus goes back where it was on close.
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const opener = lastOutsideFocus.current;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setCommandPaletteOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        e.preventDefault();
        const items = Array.from(
          panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        );
        if (items.length === 0) return;
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey
          ? items[(index <= 0 ? items.length : index) - 1]
          : items[(index + 1) % items.length];
        next.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      requestAnimationFrame(() => {
        // Commands that navigate unmount the opener; only restore when it is still on screen.
        if (opener?.isConnected && document.activeElement === document.body) opener.focus({ preventScroll: true });
      });
    };
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Clear search when palette closes
  useEffect(() => {
    if (!commandPaletteOpen) setQuery('');
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  function run(fn: () => void) {
    fn();
    setCommandPaletteOpen(false);
  }

  const filteredNav = NAV_ITEMS.filter((item) =>
    !query.trim() || item.label.toLowerCase().includes(query.toLowerCase())
  );

  const showToggleTheme = !query.trim() || 'toggle theme'.includes(query.toLowerCase());
  const showSignOut = !query.trim() || 'sign out'.includes(query.toLowerCase());
  const hasNoResults = query.trim() &&
    matchedPosts.length === 0 &&
    filteredNav.length === 0 &&
    !showToggleTheme &&
    !showSignOut;

  return (
    <div
      className="murmr-palette-backdrop fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12%]"
      style={{ background: 'rgba(8,7,13,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-command-palette=""
        className="murmr-palette-panel w-full max-w-[560px] rounded-xl border border-border bg-surface overflow-hidden shadow-[0_30px_80px_-10px_rgba(0,0,0,0.5),0_0_0_1px_var(--border-2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} label="Command palette">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <span className="text-tx2 text-base" aria-hidden="true">⌕</span>
            <Command.Input
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-tx placeholder:text-tx3 font-[family-name:var(--font-body)]"
              placeholder="Search or jump to..."
              aria-label="Search posts or jump to a page"
              autoFocus
              value={query}
              onValueChange={setQuery}
            />
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 border border-border rounded text-tx2">
              esc
            </kbd>
          </div>

          <Command.List className="max-h-[380px] overflow-auto py-2">
            {hasNoResults && (
              <Command.Empty className="py-6 text-center text-sm text-tx3">
                No results for &ldquo;{query}&rdquo;
              </Command.Empty>
            )}

            {/* Nav — first, so a page name + Enter goes to that page rather than a post that mentions it */}
            {filteredNav.length > 0 && (
              <Command.Group
                heading="Navigate"
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-tx3"
              >
                {filteredNav.map((item) => (
                  <Command.Item
                    key={item.path}
                    value={item.path}
                    onSelect={() => run(() => navigate(item.path))}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] data-[selected=true]:border-l-2 data-[selected=true]:border-grad2 border-l-2 border-transparent"
                  >
                    <item.icon size={16} className="text-tx2" />
                    <span className="flex-1">{item.label}</span>
                    <kbd className="text-[11px] font-mono text-tx3">{item.shortcut}</kbd>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Posts — only shown when query is 2+ chars */}
            {matchedPosts.length > 0 && (
              <Command.Group
                heading="Posts"
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-tx3"
              >
                {matchedPosts.slice(0, 6).map((post) => (
                  <Command.Item
                    key={post.id}
                    value={post.id}
                    onSelect={() => run(() => navigate(`/app/post/${post.id}`))}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] data-[selected=true]:border-l-2 data-[selected=true]:border-grad2 border-l-2 border-transparent"
                  >
                    <FileText size={16} className="text-tx2 shrink-0" />
                    <span className="flex-1 truncate">{post.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Actions */}
            {(showToggleTheme || showSignOut) && (
              <Command.Group
                heading="Actions"
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-tx3"
              >
                {showToggleTheme && (
                  <Command.Item
                    value="toggle-theme"
                    onSelect={() => run(toggleTheme)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] border-l-2 border-transparent"
                  >
                    {theme === 'dark' ? <Sun size={16} className="text-tx2" /> : <Moon size={16} className="text-tx2" />}
                    <span className="flex-1">Toggle theme</span>
                    <kbd className="text-[11px] font-mono text-tx3">T</kbd>
                  </Command.Item>
                )}
                {showSignOut && (
                  <Command.Item
                    value="sign-out"
                    onSelect={() => run(() => { logout(); queryClient.clear(); navigate('/login'); })}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-tx data-[selected=true]:bg-[color-mix(in_oklab,var(--grad-1)_12%,transparent)] border-l-2 border-transparent"
                  >
                    <LogOut size={16} className="text-tx2" />
                    <span className="flex-1">Sign out</span>
                  </Command.Item>
                )}
              </Command.Group>
            )}
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
