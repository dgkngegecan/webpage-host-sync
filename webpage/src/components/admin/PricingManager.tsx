'use client';

import { useState, useEffect } from 'react';
import { getPricingConfig, updatePricingConfig, getFilaments, updateFilamentPrice } from '@/app/actions/pricing';
import { useToast } from '@/context/ToastContext';

interface Filament {
    id: string;
    type: string;
    color: string;
    brand: string;
    pricePerGram: number;
    density: number | null;
}

export default function PricingManager() {
    const [config, setConfig] = useState<Record<string, number>>({});
    const [filaments, setFilaments] = useState<Filament[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [conf, fils] = await Promise.all([getPricingConfig(), getFilaments()]);
            setConfig(conf);
            setFilaments(fils);
        } catch (err) {
            console.error(err);
            error('Veriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = async (key: string, value: number) => {
        try {
            await updatePricingConfig(key, value);
            setConfig(prev => ({ ...prev, [key]: value }));
            success(`${key} güncellendi`);
        } catch (err) {
            error('Güncelleme başarısız');
        }
    };

    const handleFilamentUpdate = async (id: string, field: 'pricePerGram' | 'density', value: number) => {
        const filament = filaments.find(f => f.id === id);
        if (!filament) return;

        const newPrice = field === 'pricePerGram' ? value : filament.pricePerGram;
        const newDensity = field === 'density' ? value : (filament.density || 1.24);

        try {
            await updateFilamentPrice(id, newPrice, newDensity);
            setFilaments(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
            success('Filament güncellendi');
        } catch (err) {
            error('Güncelleme başarısız');
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="space-y-8">
            {/* Global Settings */}
            <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Genel Fiyatlandırma Ayarları</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                            Başlangıç Ücreti (TL)
                        </label>
                        <input
                            type="number"
                            value={config['baseFee'] || 0}
                            onChange={(e) => handleConfigChange('baseFee', parseFloat(e.target.value))}
                            className="w-full rounded-lg border border-border bg-bg-primary p-3 text-white focus:border-accent focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-text-secondary">Her sipariş için eklenen sabit ücret.</p>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">
                            Kâr Marjı (Çarpan)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={config['markup'] || 0}
                            onChange={(e) => handleConfigChange('markup', parseFloat(e.target.value))}
                            className="w-full rounded-lg border border-border bg-bg-primary p-3 text-white focus:border-accent focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-text-secondary">Maliyet üzerine eklenecek çarpan (Örn: 3.0 = 3 katı).</p>
                    </div>
                </div>
            </div>

            {/* Filament Settings */}
            <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Filament Fiyatları ve Yoğunlukları</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-secondary">
                        <thead className="border-b border-border text-xs uppercase text-text-primary">
                            <tr>
                                <th className="px-4 py-3">Tür</th>
                                <th className="px-4 py-3">Marka/Renk</th>
                                <th className="px-4 py-3">Birim Fiyat (TL/g)</th>
                                <th className="px-4 py-3">Yoğunluk (g/cm³)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filaments.map((f) => (
                                <tr key={f.id} className="border-b border-border hover:bg-bg-secondary/50">
                                    <td className="px-4 py-3 font-medium text-white">{f.type}</td>
                                    <td className="px-4 py-3">{f.brand} - {f.color}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={f.pricePerGram}
                                            onChange={(e) => handleFilamentUpdate(f.id, 'pricePerGram', parseFloat(e.target.value))}
                                            className="w-24 rounded border border-border bg-bg-primary px-2 py-1 text-white focus:border-accent focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={f.density || 0}
                                            onChange={(e) => handleFilamentUpdate(f.id, 'density', parseFloat(e.target.value))}
                                            className="w-24 rounded border border-border bg-bg-primary px-2 py-1 text-white focus:border-accent focus:outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
