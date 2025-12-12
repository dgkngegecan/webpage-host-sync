'use client';

import { useState, useEffect } from 'react';
import { getFeedbackRequests, updateFeedbackStatus } from '@/app/actions/requests';
import { RequestStatus } from '@/types/enums';

interface FeedbackRequest {
    id: string;
    serviceType: string;
    description: string;
    status: RequestStatus;
    rating: number | null;
    feedback: string | null;
    adminResponse: string | null;
    isPublic: boolean;
    user: {
        name: string | null;
        email: string;
    } | null;
    createdAt: Date;
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        const data = await getFeedbackRequests();
        setFeedbacks(data as any); // Type casting needed due to serialization
        setLoading(false);
    };

    const handleUpdate = async (id: string, adminResponse: string, isPublic: boolean) => {
        await updateFeedbackStatus(id, adminResponse, isPublic);
        loadFeedbacks();
    };

    if (loading) return <div className="text-white">Yükleniyor...</div>;

    return (
        <div>
            <h1 className="mb-8 text-3xl font-bold text-white">Müşteri Yorumları</h1>
            <div className="grid gap-6">
                {feedbacks.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-bg-card p-6">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-white">{item.user?.name || item.user?.email}</h3>
                                <p className="text-sm text-text-secondary">{item.serviceType} - {new Date(item.createdAt).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-400">{'★'.repeat(item.rating || 0)}</span>
                                <span className="text-gray-600">{'★'.repeat(5 - (item.rating || 0))}</span>
                            </div>
                        </div>

                        <div className="mb-4 rounded-lg bg-bg-secondary p-4">
                            <p className="text-white">{item.feedback}</p>
                        </div>

                        <div className="border-t border-border pt-4">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const response = (form.elements.namedItem('response') as HTMLInputElement).value;
                                    const isPublic = (form.elements.namedItem('isPublic') as HTMLInputElement).checked;
                                    handleUpdate(item.id, response, isPublic);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-text-secondary">Yanıtınız</label>
                                    <textarea
                                        name="response"
                                        defaultValue={item.adminResponse || ''}
                                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white"
                                        rows={2}
                                        placeholder="Müşteriye yanıt yazın..."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        defaultChecked={item.isPublic}
                                        id={`public-${item.id}`}
                                        className="h-4 w-4 rounded border-border bg-bg-secondary"
                                    />
                                    <label htmlFor={`public-${item.id}`} className="text-sm text-white">
                                        Sitede Yayınla
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-primary hover:bg-accent-hover"
                                >
                                    Güncelle
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
                {feedbacks.length === 0 && (
                    <p className="text-text-secondary">Henüz değerlendirme yok.</p>
                )}
            </div>
        </div>
    );
}
