'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/user';

interface ProfileFormProps {
    user: any;
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        tckn: user.tckn || '',
        companyName: user.companyName || '',
        taxOffice: user.taxOffice || '',
        taxNumber: user.taxNumber || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateUserProfile(formData);
            setMessage('Profil başarıyla güncellendi.');
        } catch (error) {
            setMessage('Bir hata oluştu.');
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <h3 className="text-xl font-bold text-white">Kimlik ve İletişim Bilgileri</h3>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Ad Soyad</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Telefon Numarası</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                        placeholder="05XX XXX XX XX"
                    />
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <h4 className="mb-4 font-semibold text-white">Fatura Bilgileri (Bireysel)</h4>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">TC Kimlik No</label>
                    <input
                        type="text"
                        maxLength={11}
                        value={formData.tckn}
                        onChange={e => setFormData({ ...formData, tckn: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                    />
                </div>
            </div>

            <div className="border-t border-border pt-6">
                <h4 className="mb-4 font-semibold text-white">Fatura Bilgileri (Kurumsal - Opsiyonel)</h4>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Şirket Adı</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Vergi Dairesi</label>
                        <input
                            type="text"
                            value={formData.taxOffice}
                            onChange={e => setFormData({ ...formData, taxOffice: e.target.value })}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Vergi Numarası</label>
                        <input
                            type="text"
                            value={formData.taxNumber}
                            onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded ${message.includes('hata') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-accent px-6 py-2 font-bold text-bg-primary hover:bg-accent-hover disabled:opacity-50"
            >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
        </form>
    );
}
