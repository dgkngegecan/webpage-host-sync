'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Address } from '@prisma/client';
import { approveQuote } from '@/app/actions/requests';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

interface OrderApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: string;
    addresses: Address[];
    price: number;
}

export default function OrderApprovalModal({ isOpen, onClose, requestId, addresses, price }: OrderApprovalModalProps) {
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error } = useToast();

    const handleApprove = async () => {
        if (!selectedAddressId) {
            error('Lütfen bir teslimat adresi seçin.');
            return;
        }

        setIsSubmitting(true);
        try {
            await approveQuote(requestId, selectedAddressId);
            success('Siparişiniz onaylandı! Teşekkür ederiz.');
            onClose();
        } catch (err) {
            error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Siparişi Onayla">
            <div className="space-y-6">
                <div className="rounded-lg bg-bg-secondary p-4">
                    <p className="text-sm text-text-secondary">Onaylanacak Tutar</p>
                    <p className="text-2xl font-bold text-accent">{price} ₺</p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Teslimat Adresi Seçin</label>
                    {addresses.length === 0 ? (
                        <div className="text-center">
                            <p className="mb-2 text-sm text-text-secondary">Kayıtlı adresiniz bulunmuyor.</p>
                            <Link
                                href="/dashboard"
                                className="text-sm text-accent hover:underline"
                                onClick={onClose}
                            >
                                + Yeni Adres Ekle
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {addresses.map((addr) => (
                                <label
                                    key={addr.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${selectedAddressId === addr.id
                                            ? 'border-accent bg-accent/10'
                                            : 'border-border bg-bg-secondary hover:border-text-secondary'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-medium text-white">{addr.title}</p>
                                        <p className="text-xs text-text-secondary">{addr.district}, {addr.city}</p>
                                        <p className="text-xs text-text-secondary">{addr.addressDetail}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={isSubmitting || !selectedAddressId}
                        className="rounded-lg bg-accent px-6 py-2 text-sm font-bold text-bg-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
                    >
                        {isSubmitting ? 'İşleniyor...' : 'Onayla ve Satın Al'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
