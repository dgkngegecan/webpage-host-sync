'use client';

import { useState, useEffect } from 'react';

interface Material {
    id: string;
    name: string;
    density: number; // g/cm3
    pricePerGram: number; // TRY
    color: string;
}

const MATERIALS: Material[] = [
    { id: 'pla', name: 'PLA (Standart)', density: 1.24, pricePerGram: 1.5, color: '#FF0000' },
    { id: 'petg', name: 'PETG (Dayanıklı)', density: 1.27, pricePerGram: 1.8, color: '#0000FF' },
    { id: 'abs', name: 'ABS (Mühendislik)', density: 1.04, pricePerGram: 2.0, color: '#000000' },
    { id: 'asa', name: 'ASA (Dış Ortam)', density: 1.07, pricePerGram: 2.2, color: '#FFFFFF' },
    { id: 'tpu', name: 'TPU (Esnek)', density: 1.21, pricePerGram: 2.5, color: '#00FF00' },
];

interface Props {
    volume: number; // cm3
    onPriceChange?: (price: number) => void;
    onMaterialChange?: (color: string) => void;
    onMaterialSelect?: (materialName: string) => void;
}

export default function PriceCalculator({ volume, onPriceChange, onMaterialChange, onMaterialSelect }: Props) {
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('pla');
    const [infill, setInfill] = useState<number>(20); // %

    const selectedMaterial = MATERIALS.find(m => m.id === selectedMaterialId) || MATERIALS[0];

    useEffect(() => {
        if (onMaterialChange) {
            onMaterialChange(selectedMaterial.color);
        }
        if (onMaterialSelect) {
            onMaterialSelect(selectedMaterial.name);
        }
    }, [selectedMaterialId, onMaterialChange, onMaterialSelect]);

    const calculatePrice = () => {
        if (volume <= 0) return 0;

        // Heuristic Formula
        // Weight = Volume * Density * (ShellFactor + InfillFactor * InfillPercentage)
        // ShellFactor: 0.4 (Assume 3-4 walls/top/bottom take up 40% of volume for small parts, less for large)
        // InfillFactor: 0.6 (Remaining volume filled with infill)

        // Improved heuristic for general purpose:
        // Solid volume = Volume * 1.0
        // We approximate that a part is not 100% solid.
        // Let's say effective volume ratio = 0.2 (walls) + 0.8 * (infill / 100)

        const effectiveVolumeRatio = 0.3 + 0.7 * (infill / 100);
        const weight = volume * selectedMaterial.density * effectiveVolumeRatio;

        // Price = Weight * PricePerGram * Markup + BaseFee
        const markup = 3.0; // Profit margin (Increased from 2.0)
        const baseFee = 75; // Start fee (Increased from 50 to scale total price by 1.5x)

        const price = (weight * selectedMaterial.pricePerGram * markup) + baseFee;
        return Math.ceil(price);
    };

    const price = calculatePrice();

    useEffect(() => {
        if (onPriceChange) {
            onPriceChange(price);
        }
    }, [price, onPriceChange]);

    return (
        <div className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Baskı Ayarları</h3>

                {/* Material Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Malzeme</label>
                    <div className="grid grid-cols-1 gap-2">
                        {MATERIALS.map((mat) => (
                            <button
                                key={mat.id}
                                onClick={() => setSelectedMaterialId(mat.id)}
                                className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${selectedMaterialId === mat.id
                                    ? 'border-accent bg-accent/10 text-white'
                                    : 'border-border bg-bg-secondary/30 text-text-secondary hover:border-white/20 hover:text-white'
                                    }`}
                            >
                                <span className="font-medium">{mat.name}</span>
                                <span className="text-xs opacity-70">{mat.pricePerGram} ₺/g</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Infill Slider */}
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-text-secondary">Doluluk Oranı</label>
                        <span className="text-sm font-bold text-accent">%{infill}</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={infill}
                        onChange={(e) => setInfill(parseInt(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-bg-secondary accent-accent"
                    />
                    <div className="mt-1 flex justify-between text-xs text-text-secondary">
                        <span>%10 (Hafif)</span>
                        <span>%100 (Sağlam)</span>
                    </div>
                </div>

                {/* Color Picker */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Renk Önizleme</label>
                    <div className="grid grid-cols-8 gap-2">
                        {[
                            '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
                            '#C0C0C0', '#808080', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
                        ].map((c) => (
                            <button
                                key={c}
                                onClick={() => onMaterialChange && onMaterialChange(c)}
                                className="h-6 w-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Display */}
            <div className="border-t border-border pt-4">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Tahmini Fiyat</p>
                        <p className="text-xs text-text-secondary/50">*Kargo hariç</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-white">{price} ₺</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
