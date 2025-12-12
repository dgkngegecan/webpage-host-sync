'use client';

import { PrintRequest, User } from "@prisma/client";
import { RequestStatus } from "@/types/enums";
import { updateRequestStatus } from "@/app/actions/requests";
import { getDownloadUrl } from "@/app/actions/download";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

interface OrderWithUser extends PrintRequest {
    user: User | null;
}

interface Props {
    orders: OrderWithUser[];
}

export default function OrderList({ orders }: Props) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-bg-card">
                <table className="w-full text-left text-sm text-text-secondary">
                    <thead className="bg-bg-secondary text-xs uppercase text-text-primary">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Kullanıcı</th>
                            <th className="px-6 py-3">Hizmet</th>
                            <th className="px-6 py-3">Tarih</th>
                            <th className="px-6 py-3">Durum</th>
                            <th className="px-6 py-3">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <OrderItem key={order.id} order={order} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
                {orders.map((order) => (
                    <OrderCardMobile key={order.id} order={order} />
                ))}
            </div>
        </>
    );
}

function OrderItem({ order }: { order: OrderWithUser }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState(order.status as RequestStatus);
    const [adminNote, setAdminNote] = useState(order.adminNote || '');
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');

    // Initialize base price: Use estimatedPrice if available, or calculate back from finalPrice if discount was applied
    const initialBasePrice = order.estimatedPrice || (order.discountApplied ? (order.finalPrice || 0) / (1 - order.discountApplied / 100) : (order.finalPrice || 0));
    const [basePrice, setBasePrice] = useState(initialBasePrice);
    const [discountRate, setDiscountRate] = useState(order.discountApplied || 0);
    const [finalPrice, setFinalPrice] = useState(order.finalPrice || 0);

    // Sync state with props when order updates (e.g. after revalidation)
    useEffect(() => {
        const newBase = order.estimatedPrice || (order.discountApplied ? (order.finalPrice || 0) / (1 - order.discountApplied / 100) : (order.finalPrice || 0));
        setBasePrice(newBase);
        setDiscountRate(order.discountApplied || 0);
        setFinalPrice(order.finalPrice || 0);
        setStatus(order.status as RequestStatus);
        setAdminNote(order.adminNote || '');
        setTrackingCode(order.trackingCode || '');
        setTrackingUrl(order.trackingUrl || '');
    }, [order]);

    const { success } = useToast();

    const getNextStatus = (current: RequestStatus): RequestStatus | null => {
        switch (current) {
            case RequestStatus.PENDING: return RequestStatus.QUOTED;
            case RequestStatus.QUOTED: return RequestStatus.APPROVED;
            case RequestStatus.APPROVED: return RequestStatus.DEVELOPING;
            case RequestStatus.DEVELOPING: return RequestStatus.PRINTING;
            case RequestStatus.PRINTING: return RequestStatus.PACKAGING;
            case RequestStatus.PACKAGING: return RequestStatus.SHIPPED;
            case RequestStatus.SHIPPED: return RequestStatus.DELIVERED;
            default: return null;
        }
    };

    const getPreviousStatus = (current: RequestStatus): RequestStatus | null => {
        switch (current) {
            case RequestStatus.QUOTED: return RequestStatus.PENDING;
            case RequestStatus.APPROVED: return RequestStatus.QUOTED;
            case RequestStatus.DEVELOPING: return RequestStatus.APPROVED;
            case RequestStatus.PRINTING: return RequestStatus.DEVELOPING;
            case RequestStatus.PACKAGING: return RequestStatus.PRINTING;
            case RequestStatus.SHIPPED: return RequestStatus.PACKAGING;
            case RequestStatus.DELIVERED: return RequestStatus.SHIPPED;
            default: return null;
        }
    };

    const handleUpdate = async (newStatus?: RequestStatus) => {
        const statusToUpdate = newStatus || status;
        await updateRequestStatus(order.id, statusToUpdate, adminNote, trackingCode, finalPrice, trackingUrl, discountRate);
        setStatus(statusToUpdate);
        success('Sipariş güncellendi');
    };

    const applyDiscount = (rate: number) => {
        if (discountRate === rate) {
            setDiscountRate(0);
            setFinalPrice(basePrice);
        } else {
            setDiscountRate(rate);
            const discounted = basePrice * (1 - rate / 100);
            setFinalPrice(Math.floor(discounted));
        }
    };

    const handlePriceChange = (val: number) => {
        setFinalPrice(val);
        // If price is manually changed, reset discount or update base price?
        // For simplicity, let's assume manual override sets the new base price and clears discount
        setBasePrice(val);
        setDiscountRate(0);
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!order.fileUrl) return;

        try {
            const downloadUrl = await getDownloadUrl(order.fileUrl);
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            } else {
                window.open(order.fileUrl, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
            window.open(order.fileUrl, '_blank');
        }
    };

    const nextStatus = getNextStatus(status);
    const prevStatus = getPreviousStatus(status);

    return (
        <>
            <tr className="border-b border-border hover:bg-bg-hover cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <td className="px-6 py-4 font-mono text-xs">{order.id.slice(-6)}</td>
                <td className="px-6 py-4 font-medium text-white">{order.user?.name || order.user?.email || 'Misafir'}</td>
                <td className="px-6 py-4">{order.serviceType}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold bg-white/10 text-white`}>
                        {status}
                    </span>
                </td>
                <td className="px-6 py-4 text-accent">
                    {isExpanded ? 'Gizle' : 'Detay'}
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-bg-secondary/50">
                    <td colSpan={6} className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-bold text-white">Sipariş Detayları</h4>
                                <p className="mb-2"><strong>Açıklama:</strong> {order.description}</p>
                                <p className="mb-2"><strong>Malzeme:</strong> {order.material || '-'}</p>
                                <p className="mb-2"><strong>Malzeme:</strong> {order.material || '-'}</p>
                                <div className="mb-2">
                                    <strong className="mb-1 block">Dosya:</strong>
                                    {order.fileUrl ? (
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-bg-primary"
                                            title="Dosyayı İndir"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            <span className="max-w-[150px] truncate md:max-w-[200px]">
                                                {(() => {
                                                    try {
                                                        const urlObj = new URL(order.fileUrl);
                                                        const filename = urlObj.pathname.split('/').pop();
                                                        return decodeURIComponent(filename || 'Dosya');
                                                    } catch {
                                                        return order.fileUrl.split('/').pop() || 'Dosya';
                                                    }
                                                })()}
                                            </span>
                                        </button>
                                    ) : (
                                        <span className="text-text-secondary">Yok</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-white">Yönetim</h4>

                                {/* Price Input - Required for PENDING -> QUOTED */}
                                <div>
                                    <label className="mb-1 block text-xs">Fiyat (₺)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={finalPrice}
                                            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                                            className="w-full rounded border border-border bg-bg-primary p-2 text-white"
                                            placeholder="0.00"
                                        />
                                        <div className="flex gap-1">
                                            {[5, 10, 20].map((discount) => (
                                                <button
                                                    key={discount}
                                                    onClick={() => applyDiscount(discount)}
                                                    className={`px-2 rounded border border-border text-xs transition-colors ${discountRate === discount ? 'bg-accent text-bg-primary border-accent' : 'bg-bg-secondary/50 hover:bg-accent hover:text-bg-primary'}`}
                                                    title={`%${discount} İndirim Uygula`}
                                                >
                                                    %{discount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Info - Relevant for SHIPPING */}
                                {(status === RequestStatus.PACKAGING || status === RequestStatus.SHIPPED || status === RequestStatus.DELIVERED) && (
                                    <>
                                        <div>
                                            <label className="mb-1 block text-xs">Kargo Takip Kodu</label>
                                            <input
                                                type="text"
                                                value={trackingCode}
                                                onChange={(e) => setTrackingCode(e.target.value)}
                                                className="w-full rounded border border-border bg-bg-primary p-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs">Kargo Takip Linki</label>
                                            <input
                                                type="text"
                                                value={trackingUrl}
                                                onChange={(e) => setTrackingUrl(e.target.value)}
                                                className="w-full rounded border border-border bg-bg-primary p-2 text-white"
                                                placeholder="https://kargo.com/takip/..."
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="mb-1 block text-xs">Admin Notu</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="w-full rounded border border-border bg-bg-primary p-2 text-white"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {prevStatus && (
                                        <button
                                            onClick={() => handleUpdate(prevStatus)}
                                            className="px-3 rounded border border-text-secondary text-text-secondary font-bold hover:bg-white/10"
                                            title={`Geri Al: ${prevStatus}`}
                                        >
                                            &larr;
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleUpdate()}
                                        className="flex-1 rounded border border-accent text-accent py-2 font-bold hover:bg-accent/10"
                                    >
                                        Bilgileri Güncelle
                                    </button>

                                    {nextStatus && (
                                        <button
                                            onClick={() => handleUpdate(nextStatus)}
                                            className="flex-1 rounded bg-accent py-2 font-bold text-bg-primary hover:bg-accent-hover"
                                        >
                                            İlerle: {nextStatus} &rarr;
                                        </button>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    {status === RequestStatus.APPROVED && (
                                        <button
                                            onClick={() => handleUpdate(RequestStatus.PRINTING)}
                                            className="col-span-2 rounded bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-700"
                                        >
                                            Baskıya Başla
                                        </button>
                                    )}
                                    {status === RequestStatus.PRINTING && (
                                        <button
                                            onClick={() => handleUpdate(RequestStatus.PACKAGING)}
                                            className="col-span-2 rounded bg-yellow-600 py-2 text-sm font-bold text-white hover:bg-yellow-700"
                                        >
                                            Paketle (Stok Düş)
                                        </button>
                                    )}
                                </div>

                                {status === RequestStatus.PENDING && (
                                    <button
                                        onClick={() => handleUpdate(RequestStatus.DENIED)}
                                        className="w-full rounded border border-red-500 text-red-500 py-2 font-bold hover:bg-red-500/10"
                                    >
                                        Reddet
                                    </button>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function OrderCardMobile({ order }: { order: OrderWithUser }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState(order.status as RequestStatus);
    const [adminNote, setAdminNote] = useState(order.adminNote || '');
    const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
    const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || '');

    const initialBasePrice = order.estimatedPrice || (order.discountApplied ? (order.finalPrice || 0) / (1 - order.discountApplied / 100) : (order.finalPrice || 0));
    const [basePrice, setBasePrice] = useState(initialBasePrice);
    const [discountRate, setDiscountRate] = useState(order.discountApplied || 0);
    const [finalPrice, setFinalPrice] = useState(order.finalPrice || 0);

    const { success } = useToast();

    useEffect(() => {
        const newBase = order.estimatedPrice || (order.discountApplied ? (order.finalPrice || 0) / (1 - order.discountApplied / 100) : (order.finalPrice || 0));
        setBasePrice(newBase);
        setDiscountRate(order.discountApplied || 0);
        setFinalPrice(order.finalPrice || 0);
        setStatus(order.status as RequestStatus);
        setAdminNote(order.adminNote || '');
        setTrackingCode(order.trackingCode || '');
        setTrackingUrl(order.trackingUrl || '');
    }, [order]);

    const handleUpdate = async (newStatus?: RequestStatus) => {
        const statusToUpdate = newStatus || status;
        await updateRequestStatus(order.id, statusToUpdate, adminNote, trackingCode, finalPrice, trackingUrl, discountRate);
        setStatus(statusToUpdate);
        success('Sipariş güncellendi');
    };

    const applyDiscount = (rate: number) => {
        if (discountRate === rate) {
            setDiscountRate(0);
            setFinalPrice(basePrice);
        } else {
            setDiscountRate(rate);
            const discounted = basePrice * (1 - rate / 100);
            setFinalPrice(Math.floor(discounted));
        }
    };

    const handlePriceChange = (val: number) => {
        setFinalPrice(val);
        setBasePrice(val);
        setDiscountRate(0);
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!order.fileUrl) return;

        try {
            const downloadUrl = await getDownloadUrl(order.fileUrl);
            if (downloadUrl) {
                window.open(downloadUrl, '_blank');
            } else {
                window.open(order.fileUrl, '_blank');
            }
        } catch (error) {
            console.error('Download error:', error);
            window.open(order.fileUrl, '_blank');
        }
    };

    const getNextStatus = (current: RequestStatus): RequestStatus | null => {
        switch (current) {
            case RequestStatus.PENDING: return RequestStatus.QUOTED;
            case RequestStatus.QUOTED: return RequestStatus.APPROVED;
            case RequestStatus.APPROVED: return RequestStatus.DEVELOPING;
            case RequestStatus.DEVELOPING: return RequestStatus.PRINTING;
            case RequestStatus.PRINTING: return RequestStatus.PACKAGING;
            case RequestStatus.PACKAGING: return RequestStatus.SHIPPED;
            case RequestStatus.SHIPPED: return RequestStatus.DELIVERED;
            default: return null;
        }
    };

    const getPreviousStatus = (current: RequestStatus): RequestStatus | null => {
        switch (current) {
            case RequestStatus.QUOTED: return RequestStatus.PENDING;
            case RequestStatus.APPROVED: return RequestStatus.QUOTED;
            case RequestStatus.DEVELOPING: return RequestStatus.APPROVED;
            case RequestStatus.PRINTING: return RequestStatus.DEVELOPING;
            case RequestStatus.PACKAGING: return RequestStatus.PRINTING;
            case RequestStatus.SHIPPED: return RequestStatus.PACKAGING;
            case RequestStatus.DELIVERED: return RequestStatus.SHIPPED;
            default: return null;
        }
    };

    const nextStatus = getNextStatus(status);
    const prevStatus = getPreviousStatus(status);

    return (
        <div className="rounded-xl border border-border bg-bg-card p-4">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-text-secondary">#{order.id.slice(-6)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold bg-white/10 text-white`}>
                            {status}
                        </span>
                    </div>
                    <h3 className="font-bold text-white">{order.user?.name || order.user?.email || 'Misafir'}</h3>
                    <p className="text-xs text-text-secondary">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                >
                    {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="bg-bg-secondary/50 p-2 rounded-lg">
                    <span className="block text-xs text-text-secondary mb-1">Hizmet</span>
                    <span className="text-white font-medium">{order.serviceType}</span>
                </div>
                <div className="bg-bg-secondary/50 p-2 rounded-lg">
                    <span className="block text-xs text-text-secondary mb-1">Malzeme</span>
                    <span className="text-white font-medium">{order.material || '-'}</span>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-4 border-t border-border pt-4">
                    <div>
                        <h4 className="text-sm font-bold text-white mb-2">Sipariş Detayları</h4>
                        <p className="text-sm text-text-secondary mb-2">{order.description}</p>

                        {order.fileUrl && (
                            <button
                                onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-bg-primary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                <span className="truncate max-w-[200px]">
                                    {(() => {
                                        try {
                                            const urlObj = new URL(order.fileUrl);
                                            const filename = urlObj.pathname.split('/').pop();
                                            return decodeURIComponent(filename || 'Dosya');
                                        } catch {
                                            return order.fileUrl.split('/').pop() || 'Dosya';
                                        }
                                    })()}
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white">Yönetim</h4>

                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">Fiyat (₺)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={finalPrice}
                                    onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                                    className="w-full rounded border border-border bg-bg-primary p-2 text-sm text-white"
                                    placeholder="0.00"
                                />
                                <div className="flex gap-1">
                                    {[5, 10, 20].map((discount) => (
                                        <button
                                            key={discount}
                                            onClick={() => applyDiscount(discount)}
                                            className={`px-2 rounded border border-border text-xs transition-colors ${discountRate === discount ? 'bg-accent text-bg-primary border-accent' : 'bg-bg-secondary/50 hover:bg-accent hover:text-bg-primary'}`}
                                            title={`%${discount} İndirim Uygula`}
                                        >
                                            %{discount}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {(status === RequestStatus.PACKAGING || status === RequestStatus.SHIPPED || status === RequestStatus.DELIVERED) && (
                            <>
                                <div>
                                    <label className="mb-1 block text-xs text-text-secondary">Takip Kodu</label>
                                    <input
                                        type="text"
                                        value={trackingCode}
                                        onChange={(e) => setTrackingCode(e.target.value)}
                                        className="w-full rounded border border-border bg-bg-primary p-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-text-secondary">Takip Linki</label>
                                    <input
                                        type="text"
                                        value={trackingUrl}
                                        onChange={(e) => setTrackingUrl(e.target.value)}
                                        className="w-full rounded border border-border bg-bg-primary p-2 text-sm text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">Admin Notu</label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full rounded border border-border bg-bg-primary p-2 text-sm text-white"
                                rows={2}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleUpdate()}
                                className="w-full rounded border border-accent text-accent py-2 text-sm font-bold hover:bg-accent/10"
                            >
                                Bilgileri Güncelle
                            </button>

                            <div className="flex gap-2">
                                {prevStatus && (
                                    <button
                                        onClick={() => handleUpdate(prevStatus)}
                                        className="px-3 rounded border border-text-secondary text-text-secondary font-bold hover:bg-white/10"
                                    >
                                        &larr;
                                    </button>
                                )}
                                {nextStatus && (
                                    <button
                                        onClick={() => handleUpdate(nextStatus)}
                                        className="flex-1 rounded bg-accent py-2 text-sm font-bold text-bg-primary hover:bg-accent-hover"
                                    >
                                        İlerle: {nextStatus} &rarr;
                                    </button>
                                )}
                            </div>

                            {status === RequestStatus.PENDING && (
                                <button
                                    onClick={() => handleUpdate(RequestStatus.DENIED)}
                                    className="w-full rounded border border-red-500 text-red-500 py-2 text-sm font-bold hover:bg-red-500/10"
                                >
                                    Reddet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
