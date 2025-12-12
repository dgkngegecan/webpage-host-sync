'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateExample } from '@/app/actions/examples';
import { ExamplePrint } from '@prisma/client';

interface EditExampleFormProps {
    example: ExamplePrint;
}

import { useToast } from '@/context/ToastContext';

export default function EditExampleForm({ example }: EditExampleFormProps) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);

        try {
            await updateExample(example.id, formData);
            success('Örnek çalışma güncellendi');
            router.push('/admin/examples');
            router.refresh();
        } catch (err) {
            console.error('Error updating example:', err);
            error('Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-bg-card p-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Başlık</label>
                <input
                    name="title"
                    type="text"
                    defaultValue={example.title}
                    required
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Kategori</label>
                <select
                    name="category"
                    defaultValue={example.category}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                >
                    <option value="Mechanical">Mekanik</option>
                    <option value="Figure">Figür</option>
                    <option value="Prototype">Prototip</option>
                    <option value="Custom CAD">Özel Tasarım</option>
                </select>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Açıklama</label>
                <textarea
                    name="description"
                    defaultValue={example.description}
                    required
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Malzeme</label>
                    <input
                        name="material"
                        type="text"
                        defaultValue={example.material || ''}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        placeholder="Örn: PLA+"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Katman Yüksekliği</label>
                    <input
                        name="layerHeight"
                        type="text"
                        defaultValue={example.layerHeight || ''}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        placeholder="Örn: 0.2mm"
                    />
                </div>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Yazıcı Bilgisi</label>
                <input
                    name="printerInfo"
                    type="text"
                    defaultValue={example.printerInfo || ''}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    placeholder="Örn: Bambu Lab X1C"
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
                {example.imageUrl && (
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
