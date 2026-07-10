'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { nav, site } from '@/lib/site';
import {
  IconPhone,
  IconMenu,
  IconClose,
  IconChevronDown,
  IconArrowRight,
} from './ui/Icon';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [treatOpen, setTreatOpen] = useState(false); // mobile submenu
  const [deskTreatOpen, setDeskTreatOpen] = useState(false); // desktop dropdown

  const panelRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuInteracted = useRef(false);

  // Solid-shadow header after slight scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
    setTreatOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus management for the mobile menu (open = focus first item, close = restore).
  // Skips the initial render so we never steal focus on page load; defers focus
  // to after paint so the just-revealed panel is focusable.
  useEffect(() => {
    if (open) {
      menuInteracted.current = true;
      const t = window.setTimeout(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        );
        (first ?? panelRef.current)?.focus();
      }, 60);
      return () => window.clearTimeout(t);
    }
    if (menuInteracted.current) toggleRef.current?.focus?.();
  }, [open]);

  // Robust Escape-to-close at the document level (works regardless of focus)
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open]);

  // Simple focus trap while the mobile menu is open
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    },
    [open],
  );

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-soft' : ''
      }`}
    >
      <div
        className={`border-b transition-colors duration-300 ${
          scrolled || open
            ? 'border-cream-300 bg-cream-50/90 backdrop-blur-md'
            : 'border-transparent bg-cream-50/70 backdrop-blur-md'
        }`}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
          <Logo />

          {/* ---------- Desktop nav ---------- */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {nav.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="group relative"
                  onMouseEnter={() => setDeskTreatOpen(true)}
                  onMouseLeave={() => setDeskTreatOpen(false)}
                  onFocus={() => setDeskTreatOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node))
                      setDeskTreatOpen(false);
                  }}
                >
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    aria-expanded={deskTreatOpen}
                    className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      isActive(item.href)
                        ? 'text-forest-900'
                        : 'text-forest-700 hover:text-forest-900'
                    }`}
                  >
                    {item.label}
                    <IconChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  {/* Dropdown */}
                  <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="w-72 rounded-2xl border border-cream-300 bg-white p-2 shadow-lift">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block rounded-xl px-3.5 py-3 transition-colors hover:bg-cream-100"
                        >
                          <span className="block text-sm font-semibold text-forest-900">
                            {child.label}
                          </span>
                          {child.description && (
                            <span className="mt-0.5 block text-xs text-muted">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'text-forest-900'
                      : 'text-forest-700 hover:text-forest-900'
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* ---------- Desktop CTAs ---------- */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href={site.phoneHref}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-forest-800 transition-colors hover:bg-forest-50"
            >
              <IconPhone className="h-4 w-4 text-forest-600" />
              {site.phone}
            </a>
            <Link href="/verify-insurance" className="btn-gold px-5 py-2.5 text-sm">
              Verify Insurance
            </Link>
          </div>

          {/* ---------- Mobile actions ---------- */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <a
              href={site.phoneHref}
              aria-label={`Call ${site.phone}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-800 text-cream-50 shadow-soft transition-colors hover:bg-forest-900"
            >
              <IconPhone className="h-5 w-5" />
            </a>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white text-forest-800 transition-colors hover:bg-cream-100"
            >
              {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Mobile menu panel ---------- */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        onKeyDown={onKeyDown}
        className={`lg:hidden fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 origin-top transition-all duration-300 ${
          open
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0'
        }`}
      >
        {/* backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-forest-950/30 backdrop-blur-sm"
        />
        <nav
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          tabIndex={-1}
          className={`relative mx-auto max-h-full w-full overflow-y-auto border-b border-cream-300 bg-cream-50 px-5 pb-8 pt-4 shadow-lift transition-transform duration-300 ${
            open ? 'translate-y-0' : '-translate-y-4'
          }`}
        >
          <ul className="flex flex-col divide-y divide-cream-300">
            {nav.map((item) =>
              item.children ? (
                <li key={item.label} className="py-1">
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className="flex-1 py-3 text-lg font-semibold text-forest-900"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTreatOpen((v) => !v)}
                      aria-label={
                        treatOpen
                          ? `Collapse ${item.label} submenu`
                          : `Expand ${item.label} submenu`
                      }
                      aria-expanded={treatOpen}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 hover:bg-cream-100"
                    >
                      <IconChevronDown
                        className={`h-5 w-5 transition-transform ${
                          treatOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {treatOpen && (
                    <ul className="mb-2 space-y-1 pl-1">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className="block rounded-xl px-3 py-2.5 text-forest-700 hover:bg-cream-100"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-4 text-lg font-semibold text-forest-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="mt-6 space-y-3">
            <Link href="/verify-insurance" className="btn-gold w-full">
              Verify Your Insurance
              <IconArrowRight className="h-5 w-5" />
            </Link>
            <a href={site.phoneHref} className="btn-primary w-full">
              <IconPhone className="h-5 w-5" />
              Call {site.phone}
            </a>
            <p className="pt-1 text-center text-sm text-muted">
              Confidential &amp; 100% online · Available across Texas
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
