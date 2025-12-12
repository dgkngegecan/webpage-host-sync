'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePrinter } from '@/app/actions/printers';
import { Printer } from '@prisma/client';

interface EditPrinterFormProps {
    printer: Printer;
}

import { useToast } from '@/context/ToastContext';

export default function EditPrinterForm({ printer }: EditPrinterFormProps) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            await updatePrinter(printer.id, formData);
            success('Yazıcı güncellendi');
            router.push('/admin/inventory');
            router.refresh();
        } catch (err) {
            console.error('Error updating printer:', err);
            error('Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-bg-card p-8">
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Yazıcı Adı</label>
                <input
                    name="name"
                    type="text"
                    defaultValue={printer.name}
                    required
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Model</label>
                <input
                    name="model"
                    type="text"
                    defaultValue={printer.model}
                    required
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Açıklama</label>
                <textarea
                    name="description"
                    defaultValue={printer.description || ''}
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
                        defaultValue={printer.buildVolume || ''}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        placeholder="256x256x256 mm"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Katman Kalınlığı</label>
                    <input
                        name="layerHeight"
                        type="text"
                        defaultValue={printer.layerHeight || ''}
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
                    defaultValue={printer.materials || ''}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    placeholder="PLA, PETG, ABS, vb."
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Özellikler (Virgülle ayırın)</label>
                <textarea
                    name="features"
                    defaultValue={printer.features || ''}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    rows={2}
                    placeholder="AMS Ünitesi, Yapay Zeka, vb."
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Yeni Görsel Yükle (Opsiyonel)</label>
                <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                />
                {printer.imageUrl && (
                    <p className="mt-2 text-sm text-text-secondary">Mevcut görsel korunacak, değiştirmek için yeni dosya seçin.</p>
                )}
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
