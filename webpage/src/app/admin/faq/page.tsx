'use client';

import { useState, useEffect } from 'react';
import { createFAQ, deleteFAQ, getFAQs } from '@/app/actions/faq';
import { FAQ } from '@prisma/client';
import Link from 'next/link';

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        order: 0
    });

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        const data = await getFAQs();
        setFaqs(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createFAQ(formData);
        setFormData({ question: '', answer: '', order: 0 });
        loadFAQs();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
            await deleteFAQ(id);
            loadFAQs();
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="mb-8 text-3xl font-bold text-white">Sıkça Sorulan Sorular Yönetimi</h1>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Add Form */}
                <div className="rounded-xl border border-border bg-bg-card p-6">
                    <h2 className="mb-6 text-xl font-bold text-white">Yeni Soru Ekle</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text-secondary">Soru</label>
                            <input
                                type="text"
                                required
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text-secondary">Cevap</label>
                            <textarea
                                required
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-text-secondary">Sıra</label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-accent py-3 font-bold text-bg-primary hover:bg-accent-hover"
                        >
                            Ekle
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Mevcut Sorular</h2>
                    {faqs.map((faq) => (
                        <div key={faq.id} className="rounded-xl border border-border bg-bg-card p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <h3 className="font-bold text-white">{faq.question}</h3>
                                <div className="flex gap-2">
                                    <Link href={`/admin/faq/edit/${faq.id}`} className="text-blue-400 hover:text-blue-300">
                                        Düzenle
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(faq.id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary">{faq.answer}</p>
                            <span className="mt-2 block text-xs text-text-secondary">Sıra: {faq.order}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
