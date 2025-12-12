'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/user';

interface PreferencesFormProps {
    user: any;
}

export default function PreferencesForm({ user }: PreferencesFormProps) {
    const [formData, setFormData] = useState({
        defaultMaterial: user.defaultMaterial || 'PLA',
        defaultQuality: user.defaultQuality || 'STANDARD',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateUserProfile(formData);
            setMessage('Tercihler güncellendi.');
        } catch (error) {
            setMessage('Hata oluştu.');
        }
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <h3 className="text-xl font-bold text-white">3D Baskı Tercihleri</h3>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Varsayılan Malzeme</label>
                    <select
                        value={formData.defaultMaterial}
                        onChange={e => setFormData({ ...formData, defaultMaterial: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                    >
                        <option value="PLA">PLA (Standart)</option>
                        <option value="PETG">PETG (Dayanıklı)</option>
                        <option value="ABS">ABS (Mühendislik)</option>
                        <option value="TPU">TPU (Esnek)</option>
                        <option value="RESIN">Reçine (Yüksek Detay)</option>
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Varsayılan Kalite</label>
                    <select
                        value={formData.defaultQuality}
                        onChange={e => setFormData({ ...formData, defaultQuality: e.target.value })}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                    >
                        <option value="DRAFT">Taslak (0.28mm)</option>
                        <option value="STANDARD">Standart (0.20mm)</option>
                        <option value="HIGH">Yüksek Detay (0.12mm)</option>
                        <option value="ULTRA">Ultra Detay (0.08mm)</option>
                    </select>
                </div>
            </div>

            {message && (
                <div className="rounded bg-green-500/10 p-3 text-green-400">
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
