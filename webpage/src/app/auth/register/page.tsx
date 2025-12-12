'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { success, error } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                success('Kayıt başarılı! Giriş yapabilirsiniz.');
                router.push('/auth/signin');
            } else {
                const data = await res.json();
                error(data.error || 'Kayıt başarısız.');
            }
        } catch (err) {
            error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-bg-card p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-white">Kayıt Ol</h1>
                    <p className="text-text-secondary">Gegebaskı dünyasına katılın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">İsim Soyisim</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary focus:border-accent focus:outline-none"
                            placeholder="Adınız Soyadınız"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary focus:border-accent focus:outline-none"
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary focus:border-accent focus:outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-accent py-3 font-bold text-bg-primary transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-text-secondary">
                    Zaten hesabınız var mı?{' '}
                    <Link href="/auth/signin" className="font-bold text-accent hover:underline">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        </div>
    );
}
