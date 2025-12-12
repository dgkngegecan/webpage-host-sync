'use client';

import React from 'react';
import { RequestStatus } from '@/types/enums';

interface RequestProps {
    id: string;
    serviceType: string;
    description: string;
    status: RequestStatus;
    createdAt: Date;
    trackingCode?: string | null;
    adminNote?: string | null;
    finalPrice?: number | null;
    discountApplied?: number | null;
    estimatedPrice?: number | null;
}

const statusColors: Record<RequestStatus, string> = {
    PENDING: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    QUOTED: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    APPROVED: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    DENIED: 'text-red-400 border-red-400/30 bg-red-400/10',
    DEVELOPING: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    PRINTING: 'text-accent border-accent/30 bg-accent/10',
    PACKAGING: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    SHIPPED: 'text-green-400 border-green-400/30 bg-green-400/10',
    DELIVERED: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
};

const statusLabels: Record<RequestStatus, string> = {
    PENDING: 'Beklemede',
    QUOTED: 'Teklif Verildi',
    APPROVED: 'Onaylandı',
    DENIED: 'Reddedildi',
    DEVELOPING: 'Geliştiriliyor',
    PRINTING: 'Baskıda',
    PACKAGING: 'Paketleniyor',
    SHIPPED: 'Kargolandı',
    DELIVERED: 'Teslim Edildi',
};

import { submitFeedback, reorderRequest } from '@/app/actions/requests';
import { useState } from 'react';
import OrderApprovalModal from './dashboard/OrderApprovalModal';
import { Address } from '@prisma/client';
import OrderStepper from './user/OrderStepper';
import { toast } from 'react-hot-toast';

export default function RequestCard({ id, serviceType, description, status, createdAt, trackingCode, trackingUrl, adminNote, finalPrice, discountApplied, estimatedPrice, rating, feedback, adminResponse, addresses = [] }: RequestProps & { trackingUrl?: string | null, rating?: number | null, feedback?: string | null, adminResponse?: string | null, addresses?: Address[] }) {
    const [userRating, setUserRating] = useState(0);
    const [userFeedback, setUserFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const handleFeedbackSubmit = async () => {
        if (userRating === 0) return;
        setIsSubmitting(true);
        await submitFeedback(id, userRating, userFeedback);
        setIsSubmitting(false);
    };

    const handleReorder = async () => {
        if (!confirm('Bu siparişi tekrar oluşturmak istediğinize emin misiniz?')) return;

        setIsReordering(true);
        try {
            await reorderRequest(id);
            toast.success('Sipariş başarıyla tekrar oluşturuldu!');
            // Optional: Scroll to top or refresh
        } catch (error) {
            toast.error('Sipariş oluşturulurken bir hata oluştu.');
            console.error(error);
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <>
            <OrderApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                requestId={id}
                addresses={addresses}
                price={finalPrice || 0}
            />

            <div className="rounded-xl border border-border bg-bg-card p-6 transition-all duration-300 hover:border-accent/50">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">{serviceType}</h3>
                        <span className="text-xs text-text-secondary">
                            {new Date(createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[status]}`}>
                        {statusLabels[status]}
                    </span>
                </div>

                <p className="mb-4 text-sm text-text-secondary line-clamp-2">{description}</p>

                <div className="mb-6 px-2">
                    <OrderStepper status={status} />
                </div>

                {(adminNote || trackingCode || finalPrice || status === 'DELIVERED' || status === 'QUOTED') && (
                    <div className="mt-4 space-y-2 rounded-lg bg-bg-secondary p-4 text-sm">
                        {finalPrice && (
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Fiyat:</span>
                                <div className="text-right">
                                    {discountApplied && discountApplied > 0 && (
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <span className="text-xs text-text-secondary line-through">
                                                ₺{(estimatedPrice || (finalPrice / (1 - discountApplied / 100))).toFixed(2)}
                                            </span>
                                            <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-bold text-green-400">
                                                %{discountApplied} İndirim
                                            </span>
                                        </div>
                                    )}
                                    <span className="font-bold text-white text-lg">₺{finalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {status === 'QUOTED' && (
                            <div className="mt-4 border-t border-border pt-4">
                                <p className="mb-3 text-xs text-text-secondary">
                                    Siparişiniz için fiyat teklifi oluşturuldu. Onaylayarak ödeme ve teslimat adımına geçebilirsiniz.
                                </p>
                                <button
                                    onClick={() => setIsApprovalModalOpen(true)}
                                    className="w-full rounded-lg bg-accent py-2 font-bold text-bg-primary transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20"
                                >
                                    Onayla ve Satın Al
                                </button>
                            </div>
                        )}

                        {trackingCode && (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Kargo Takip:</span>
                                    <span className="font-mono text-accent">{trackingCode}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(trackingCode)}
                                        className="ml-2 text-text-secondary transition-colors hover:text-white"
                                        title="Kodu Kopyala"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                        </svg>
                                    </button>
                                </div>
                                {trackingUrl && (
                                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                                        Kargo Takip Linki &rarr;
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Feedback Section */}
                        {status === 'DELIVERED' && !rating && (
                            <div className="border-t border-border pt-2">
                                <span className="block text-xs text-text-secondary mb-2">Hizmetimizi Değerlendirin:</span>
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setUserRating(star)} className={`text-lg ${star <= userRating ? 'text-yellow-400' : 'text-gray-600'}`}>★</button>
                                    ))}
                                </div>
                                <textarea
                                    value={userFeedback}
                                    onChange={(e) => setUserFeedback(e.target.value)}
                                    placeholder="Yorumunuz..."
                                    className="w-full rounded border border-border bg-bg-card p-2 text-xs text-white mb-2"
                                    rows={2}
                                />
                                <button
                                    onClick={handleFeedbackSubmit}
                                    disabled={isSubmitting || userRating === 0}
                                    className="w-full rounded bg-accent py-1 text-xs font-bold text-bg-primary disabled:opacity-50"
                                >
                                    Gönder
                                </button>
                            </div>
                        )}

                        {rating && (
                            <div className="border-t border-border pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">{'★'.repeat(rating)}</span>
                                    <span className="text-xs text-text-secondary">Değerlendirmeniz</span>
                                </div>
                                {feedback && <p className="mt-1 text-sm text-text-secondary">"{feedback}"</p>}

                                {adminResponse && (
                                    <div className="mt-2 rounded bg-bg-primary p-2">
                                        <span className="block text-xs font-bold text-accent mb-1">Gegebaskı Yanıtı:</span>
                                        <p className="text-sm text-white">{adminResponse}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
