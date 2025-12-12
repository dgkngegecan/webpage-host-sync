'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFilament } from '@/app/actions/filaments';
import { useToast } from '@/context/ToastContext';

export default function AddFilamentPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            await createFilament(formData);
            success('Filament eklendi');
            router.push('/admin/inventory');
            router.refresh();
        } catch (err) {
            console.error('Error creating filament:', err);
            error('Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl py-12 pt-32">
            <h1 className="mb-8 text-3xl font-bold text-white">Yeni Filament Ekle</h1>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Tür</label>
                        <input
                            name="type"
                            type="text"
                            required
                            placeholder="PLA, PETG, ABS..."
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Renk</label>
                        <input
                            name="color"
                            type="text"
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Marka</label>
                        <input
                            name="brand"
                            type="text"
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Stok (gram)</label>
                        <input
                            name="stock"
                            type="number"
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Gram Fiyatı (₺)</label>
                        <input
                            name="pricePerGram"
                            type="number"
                            step="0.01"
                            required
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Yoğunluk (g/cm³)</label>
                        <input
                            name="density"
                            type="number"
                            step="0.01"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Nozzle Sıcaklığı (°C)</label>
                        <input
                            name="tempNozzle"
                            type="text"
                            placeholder="200-220"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Tabla Sıcaklığı (°C)</label>
                        <input
                            name="tempBed"
                            type="text"
                            placeholder="60"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Katkı Maddeleri (Opsiyonel)</label>
                        <input
                            name="additives"
                            type="text"
                            placeholder="Karbon Fiber, Ahşap, Simli..."
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Görsel Yükle</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-lg px-6 py-2 font-medium text-text-secondary hover:text-white"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-accent px-6 py-2 font-bold text-bg-primary hover:bg-accent-hover disabled:opacity-50"
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
