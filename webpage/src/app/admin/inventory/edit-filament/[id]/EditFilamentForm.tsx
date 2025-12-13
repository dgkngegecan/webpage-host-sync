'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFilament } from '@/app/actions/filaments';
import { Filament } from '@prisma/client';

interface EditFilamentFormProps {
    filament: Filament;
}

import { useToast } from '@/context/ToastContext';

export default function EditFilamentForm({ filament }: EditFilamentFormProps) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const form = event.currentTarget;
        const formData = new FormData(form);

        try {
            await updateFilament(filament.id, formData);
            success('Filament güncellendi');
            router.push('/admin/inventory');
            router.refresh();
        } catch (err: any) {
            console.error('Error updating filament:', err);
            error(err.message || 'Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Tür</label>
                    <input
                        name="type"
                        type="text"
                        defaultValue={filament.type}
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
                        defaultValue={filament.color}
                        required
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Marka</label>
                    <input
                        name="brand"
                        type="text"
                        defaultValue={filament.brand}
                        required
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Stok (gram)</label>
                    <input
                        name="stock"
                        type="number"
                        defaultValue={filament.stock}
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
                        defaultValue={filament.pricePerGram}
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
                        defaultValue={filament.density || ''}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Nozzle Sıcaklığı (°C)</label>
                    <input
                        name="tempNozzle"
                        type="text"
                        defaultValue={filament.tempNozzle || ''}
                        placeholder="200-220"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Tabla Sıcaklığı (°C)</label>
                    <input
                        name="tempBed"
                        type="text"
                        defaultValue={filament.tempBed || ''}
                        placeholder="60"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Katkı Maddeleri (Opsiyonel)</label>
                    <input
                        name="additives"
                        type="text"
                        defaultValue={filament.additives || ''}
                        placeholder="Karbon Fiber, Ahşap, Simli..."
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Yeni Görsel Yükle (Opsiyonel)</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                    {filament.imageUrl && (
                        <p className="mt-2 text-sm text-text-secondary">Mevcut görsel korunacak, değiştirmek için yeni dosya seçin.</p>
                    )}
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
                    {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
            </div>
        </form>
    );
}
