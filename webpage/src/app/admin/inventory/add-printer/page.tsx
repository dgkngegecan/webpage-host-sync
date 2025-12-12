'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPrinter } from '@/app/actions/printers';

import { useToast } from '@/context/ToastContext';

export default function AddPrinterPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            await createPrinter(formData);
            toast.success('Yazıcı başarıyla eklendi');
            router.push('/admin/inventory');
            router.refresh();
        } catch (error) {
            console.error('Error creating printer:', error);
            toast.error('Yazıcı eklenirken hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl py-12 pt-32 mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-white">Yeni Yazıcı Ekle</h1>
            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-8">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Yazıcı Adı</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Model</label>
                    <input
                        name="model"
                        type="text"
                        required
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Açıklama</label>
                    <textarea
                        name="description"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Baskı Hacmi</label>
                        <input
                            name="buildVolume"
                            type="text"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                            placeholder="256x256x256 mm"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Katman Kalınlığı</label>
                        <input
                            name="layerHeight"
                            type="text"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                            placeholder="0.05-0.3 mm"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Malzemeler</label>
                    <input
                        name="materials"
                        type="text"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        placeholder="PLA, PETG, ABS, vb."
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Özellikler (Virgülle ayırın)</label>
                    <textarea
                        name="features"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        rows={2}
                        placeholder="AMS Ünitesi, Yapay Zeka, vb."
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Görsel Yükle</label>
                    <input
                        name="image"
                        type="file"
                        accept="image/*"
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    />
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
