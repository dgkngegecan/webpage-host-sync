'use client';

import { useState } from 'react';
import { addAddress, deleteAddress } from '@/app/actions/user';

interface Address {
    id: string;
    title: string;
    type: string;
    city: string;
    district: string;
    addressDetail: string;
    zipCode?: string | null;
}

interface AddressManagerProps {
    addresses: Address[];
}

import { useToast } from '@/context/ToastContext';

export default function AddressManager({ addresses }: AddressManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { success, error } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        type: 'SHIPPING',
        city: '',
        district: '',
        addressDetail: '',
        zipCode: ''
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addAddress(formData);
            success('Adres başarıyla eklendi.');
            setIsAdding(false);
            setFormData({ title: '', type: 'SHIPPING', city: '', district: '', addressDetail: '', zipCode: '' });
        } catch (err) {
            console.error(err);
            error((err as Error).message || 'Adres eklenirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
            try {
                await deleteAddress(id);
                success('Adres silindi.');
            } catch (err) {
                console.error(err);
                error((err as Error).message || 'Adres silinirken bir hata oluştu.');
            }
        }
    };

    return (
        <div className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Adreslerim</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-primary hover:bg-accent-hover"
                >
                    {isAdding ? 'İptal' : '+ Yeni Adres Ekle'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="space-y-4 rounded-lg border border-border bg-bg-secondary p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">Adres Başlığı</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                                placeholder="Ev, İş vb."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">Adres Tipi</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                            >
                                <option value="SHIPPING">Teslimat Adresi</option>
                                <option value="BILLING">Fatura Adresi</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">İl</label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">İlçe</label>
                            <input
                                type="text"
                                required
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-xs text-text-secondary">Açık Adres</label>
                            <textarea
                                required
                                value={formData.addressDetail}
                                onChange={e => setFormData({ ...formData, addressDetail: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-text-secondary">Posta Kodu</label>
                            <input
                                type="text"
                                value={formData.zipCode}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                className="w-full rounded border border-border bg-bg-card p-2 text-white"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded bg-accent py-2 font-bold text-bg-primary hover:bg-accent-hover disabled:opacity-50"
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {addresses.map(addr => (
                    <div key={addr.id} className="relative rounded-lg border border-border bg-bg-secondary p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-bold text-white">{addr.title}</span>
                            <span className="rounded bg-bg-card px-2 py-1 text-xs text-text-secondary">
                                {addr.type === 'SHIPPING' ? 'Teslimat' : 'Fatura'}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary">{addr.addressDetail}</p>
                        <p className="text-sm text-text-secondary">{addr.district} / {addr.city}</p>
                        <button
                            onClick={() => handleDelete(addr.id)}
                            className="absolute bottom-4 right-4 text-xs text-red-400 hover:underline"
                        >
                            Sil
                        </button>
                    </div>
                ))}
                {addresses.length === 0 && (
                    <p className="col-span-2 text-center text-text-secondary">Henüz kayıtlı adresiniz yok.</p>
                )}
            </div>
        </div>
    );
}
