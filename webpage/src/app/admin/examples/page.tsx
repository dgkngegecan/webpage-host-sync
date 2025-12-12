'use client';

import { useState, useEffect } from 'react';
import { createExample, deleteExample, getExamples } from '@/app/actions/examples';
import { ExamplePrint } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';

export default function ExamplesPage() {
    const [examples, setExamples] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        loadExamples();
    }, []);

    const loadExamples = async () => {
        const data = await getExamples();
        setExamples(data);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.currentTarget);

        try {
            await createExample(formData);
            event.currentTarget.reset();
            loadExamples();
            toast.success('Örnek başarıyla eklendi');
        } catch (error) {
            console.error(error);
            toast.error('Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu örneği silmek istediğinize emin misiniz?')) {
            await deleteExample(id);
            loadExamples();
        }
    };

    return (
        <div>
            <h1 className="mb-8 text-3xl font-bold text-white">Örnek Baskı Yönetimi</h1>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Add Form */}
                <div className="rounded-xl border border-border bg-bg-card p-6">
                    <h2 className="mb-6 text-xl font-bold text-white">Yeni Örnek Ekle</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text-secondary">Başlık</label>
                            <input
                                name="title"
                                type="text"
                                required
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text-secondary">Kategori</label>
                            <select
                                name="category"
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
                                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                                    placeholder="Örn: PLA+"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-text-secondary">Katman Yüksekliği</label>
                                <input
                                    name="layerHeight"
                                    type="text"
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
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                                placeholder="Örn: Bambu Lab X1C"
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
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-accent py-3 font-bold text-bg-primary hover:bg-accent-hover disabled:opacity-50"
                        >
                            {isSubmitting ? 'Kaydediliyor...' : 'Ekle'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Mevcut Örnekler</h2>
                    {examples.map((example) => (
                        <div key={example.id} className="flex items-start justify-between rounded-xl border border-border bg-bg-card p-4">
                            <div className="flex gap-4">
                                {example.imageUrl ? (
                                    <Image src={example.imageUrl} alt={example.title} width={80} height={80} className="rounded-lg object-cover" />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-bg-secondary text-2xl">🖼️</div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white">{example.title}</h3>
                                    <p className="text-sm text-text-secondary">{example.category}</p>
                                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">{example.description}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link href={`/admin/examples/edit/${example.id}`} className="text-blue-400 hover:text-blue-300">
                                    Düzenle
                                </Link>
                                <button
                                    onClick={() => handleDelete(example.id)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
