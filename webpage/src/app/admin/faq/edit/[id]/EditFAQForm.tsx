'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFAQ } from '@/app/actions/faq';
import { FAQ } from '@prisma/client';

interface EditFAQFormProps {
    faq: FAQ;
}

import { useToast } from '@/context/ToastContext';

export default function EditFAQForm({ faq }: EditFAQFormProps) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        question: faq.question,
        answer: faq.answer,
        order: faq.order
    });

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await updateFAQ(faq.id, formData);
            success('FAQ güncellendi');
            router.push('/admin/faq');
            router.refresh();
        } catch (err) {
            console.error('Error updating FAQ:', err);
            error('Hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-bg-card p-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Soru</label>
                <input
                    type="text"
                    required
                    value={formData.question}
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Cevap</label>
                <textarea
                    required
                    value={formData.answer}
                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    rows={4}
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Sıra</label>
                <input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
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
                    {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
            </div>
        </form>
    );
}
