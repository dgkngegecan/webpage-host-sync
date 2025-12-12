'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [totp, setTotp] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            email,
            password,
            totp,
            redirect: false,
        });

        if (res?.error) {
            setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
            <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-8 shadow-2xl">
                <h1 className="mb-8 text-center text-3xl font-bold text-white">Giriş Yap</h1>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-center text-sm text-red-400 border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">2FA Kodu (Admin)</label>
                        <input
                            type="text"
                            value={totp}
                            onChange={(e) => setTotp(e.target.value)}
                            placeholder="Sadece adminler için"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-gradient-start to-gradient-end py-3 font-bold text-white shadow-lg transition-all hover:opacity-90"
                    >
                        Giriş Yap
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-text-secondary">
                    Hesabınız yok mu?{' '}
                    <a href="/auth/register" className="font-bold text-accent hover:underline">
                        Kayıt Ol
                    </a>
                </div>
            </div>
        </div>
    );
}
