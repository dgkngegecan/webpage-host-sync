'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end shadow-lg shadow-accent/20">
                        <span className="text-xl font-bold text-white">G</span>
                    </div>
                    <span className="text-xl font-bold text-white">Gegebaskı</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link href="/" className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/' ? 'text-white' : 'text-text-secondary'}`}>
                        Yazıcılar
                    </Link>
                    <Link href="/prints" className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/prints' ? 'text-white' : 'text-text-secondary'}`}>
                        Örnek Baskılar
                    </Link>
                    <Link href="/about" className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/about' ? 'text-white' : 'text-text-secondary'}`}>
                        Hakkımızda
                    </Link>
                    <Link href="/faq" className={`text-sm font-medium transition-colors hover:text-white ${pathname === '/faq' ? 'text-white' : 'text-text-secondary'}`}>
                        S.S.S.
                    </Link>
                    <Link href="/quote/instant" className={`text-sm font-medium transition-colors hover:text-accent ${pathname === '/quote/instant' ? 'text-accent' : 'text-text-secondary'}`}>
                        Hızlı Fiyat
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="hidden items-center gap-6 md:flex">
                    {session?.user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-white"
                            >
                                <span>{session.user.name || session.user.email}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-bg-card p-2 shadow-xl backdrop-blur-xl">
                                    <div className="mb-2 border-b border-border px-3 py-2">
                                        <p className="text-sm font-bold text-white">{session.user.name}</p>
                                        <p className="truncate text-xs text-text-secondary">{session.user.email}</p>
                                        <span className="mt-1 inline-block rounded bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                                            {session.user.role}
                                        </span>
                                    </div>

                                    {session.user.role === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-white"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}

                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-white"
                                    >
                                        Hesabım
                                    </Link>

                                    <button
                                        onClick={() => signOut()}
                                        className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-400/10"
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/api/auth/signin" className="text-text-secondary hover:text-white font-medium">
                            Giriş Yap
                        </Link>
                    )}

                    <Link
                        href="/quote"
                        className="rounded-full bg-gradient-to-r from-gradient-start to-gradient-end px-6 py-2 font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-accent/40"
                    >
                        Teklif Al
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-text-secondary hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-bg-secondary px-6 py-4">
                    <div className="flex flex-col gap-4">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-white">Yazıcılar</Link>
                        <Link href="/prints" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-white">Örnek Baskılar</Link>
                        <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-white">Hakkımızda</Link>
                        <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-white">S.S.S.</Link>
                        <Link href="/quote/instant" onClick={() => setIsMobileMenuOpen(false)} className="text-accent font-medium">Hızlı Fiyat</Link>
                        <Link href="/quote" onClick={() => setIsMobileMenuOpen(false)} className="text-accent font-semibold">Teklif Al</Link>

                        <div className="my-2 h-px bg-border" />

                        {session?.user ? (
                            <>
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold">
                                        {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{session.user.name}</p>
                                        <p className="text-xs text-text-secondary">{session.user.email}</p>
                                    </div>
                                </div>

                                {session.user.role === 'ADMIN' && (
                                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-2 py-2 text-text-secondary hover:bg-white/5 hover:text-white">
                                        Admin Panel
                                    </Link>
                                )}

                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-2 py-2 text-text-secondary hover:bg-white/5 hover:text-white">
                                    Hesabım
                                </Link>

                                <button onClick={() => signOut()} className="w-full rounded-lg px-2 py-2 text-left text-red-400 hover:bg-red-400/10">
                                    Çıkış Yap
                                </button>
                            </>
                        ) : (
                            <Link href="/api/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="block rounded-lg px-2 py-2 text-text-secondary hover:bg-white/5 hover:text-white">
                                Giriş Yap
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
