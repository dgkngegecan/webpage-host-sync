'use client';

import { useState, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import { useToast } from '@/context/ToastContext';
import { useSession } from 'next-auth/react';
import { submitQuote } from '@/app/actions/quote';

interface Filament {
    id: string;
    type: string;
    color: string;
    pricePerGram: number;
    density?: number | null;
}

interface InstantQuoteCalculatorProps {
    filaments: Filament[];
}

export default function InstantQuoteCalculator({ filaments }: InstantQuoteCalculatorProps) {
    const [file, setFile] = useState<File | null>(null);
    const [volume, setVolume] = useState<number | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
    const [weight, setWeight] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedFilamentId, setSelectedFilamentId] = useState<string>(filaments[0]?.id || '');
    const [sourceUnit, setSourceUnit] = useState<'mm' | 'cm' | 'm' | 'inch'>('mm');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { success, error } = useToast();

    // Submission state
    const [contactInfo, setContactInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session } = useSession();

    // Pre-fill email if logged in
    if (session?.user?.email && !contactInfo) {
        setContactInfo(session.user.email);
    }

    // Constants
    const DEFAULT_DENSITY = 1.24; // g/cm3 (PLA)
    const MIN_PRICE_THRESHOLD = 50; // TL

    // Pricing Factors
    const INFILL_FACTOR_LOW = 0.50; // 50% infill proxy
    const INFILL_FACTOR_HIGH = 0.70; // 70% infill proxy
    const MULTIPLIER_LOW = 0.95; // Safety multiplier for lower bound
    const MULTIPLIER_HIGH = 1.20; // Safety multiplier for upper bound

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();

            if (!['stl', 'obj', '3mf'].includes(ext || '')) {
                error('Lütfen geçerli bir .stl, .obj veya .3mf dosyası yükleyin.');
                return;
            }
            setFile(selectedFile);
            calculatePrice(selectedFile, selectedFilamentId, sourceUnit);
        }
    };

    const handleFilamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilamentId = e.target.value;
        setSelectedFilamentId(newFilamentId);
        if (file) {
            calculatePrice(file, newFilamentId, sourceUnit);
        }
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newUnit = e.target.value as 'mm' | 'cm' | 'm' | 'inch';
        setSourceUnit(newUnit);
        if (file) {
            calculatePrice(file, selectedFilamentId, newUnit);
        }
    };

    const calculateVolume = (geometry: THREE.BufferGeometry): number => {
        let vol = 0;
        const position = geometry.attributes.position;
        if (!position) return 0;

        const faces = position.count / 3;
        const p1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        const p3 = new THREE.Vector3();

        for (let i = 0; i < faces; i++) {
            p1.fromBufferAttribute(position, i * 3 + 0);
            p2.fromBufferAttribute(position, i * 3 + 1);
            p3.fromBufferAttribute(position, i * 3 + 2);
            vol += p1.dot(p2.cross(p3)) / 6.0;
        }
        return Math.abs(vol);
    };

    const calculatePrice = async (file: File, filamentId: string, unit: 'mm' | 'cm' | 'm' | 'inch') => {
        setIsCalculating(true);
        setVolume(null);
        setPriceRange(null);
        setWeight(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const ext = file.name.split('.').pop()?.toLowerCase();
            let totalVolume = 0;

            if (ext === 'stl') {
                const loader = new STLLoader();
                const geometry = loader.parse(arrayBuffer);
                totalVolume = calculateVolume(geometry);
            } else if (ext === 'obj') {
                const loader = new OBJLoader();
                const text = new TextDecoder().decode(arrayBuffer);
                const group = loader.parse(text);

                group.traverse((child: any) => {
                    if (child.isMesh) {
                        totalVolume += calculateVolume(child.geometry);
                    }
                });
            } else if (ext === '3mf') {
                const loader = new ThreeMFLoader();
                // 3MFLoader.parse usually returns a Group directly in newer versions or via callback
                // We'll try the direct return first, if it fails we might need to check the specific version behavior
                // But typically it parses ArrayBuffer
                const group = loader.parse(arrayBuffer);

                group.traverse((child: any) => {
                    if (child.isMesh) {
                        totalVolume += calculateVolume(child.geometry);
                    }
                });
            }

            // Convert raw volume to mm³ first (standard base)
            // Then convert mm³ to cm³
            let conversionFactor = 1;

            switch (unit) {
                case 'mm': // already in mm³
                    conversionFactor = 1;
                    break;
                case 'cm': // cm³ to mm³ = 1000
                    conversionFactor = 1000;
                    break;
                case 'm': // m³ to mm³ = 10^9
                    conversionFactor = 1000000000;
                    break;
                case 'inch': // inch³ to mm³ = 25.4^3 ≈ 16387.064
                    conversionFactor = 16387.064;
                    break;
            }

            const volumeMm3 = totalVolume * conversionFactor;
            const volumeCm3 = volumeMm3 / 1000;

            const selectedFilament = filaments.find(f => f.id === filamentId);
            const density = selectedFilament?.density || DEFAULT_DENSITY;
            const pricePerGram = selectedFilament?.pricePerGram || 3.0;

            // Calculate Solid Weight (100% infill)
            const solidWeightGrams = volumeCm3 * density;

            // Calculate Price Range
            // Lower Bound: 50% Infill Proxy * 0.95 Multiplier
            let priceLow = (solidWeightGrams * INFILL_FACTOR_LOW) * pricePerGram * MULTIPLIER_LOW;

            // Upper Bound: 70% Infill Proxy * 1.20 Multiplier
            let priceHigh = (solidWeightGrams * INFILL_FACTOR_HIGH) * pricePerGram * MULTIPLIER_HIGH;

            // Apply minimum price threshold
            priceLow = Math.max(priceLow, MIN_PRICE_THRESHOLD);
            priceHigh = Math.max(priceHigh, MIN_PRICE_THRESHOLD);

            // Ensure High is always >= Low (in case of weird edge cases with min price)
            priceHigh = Math.max(priceHigh, priceLow);

            setVolume(volumeCm3);
            setWeight(solidWeightGrams);
            setPriceRange({ min: priceLow, max: priceHigh });
            success('Fiyat aralığı hesaplandı!');
        } catch (err) {
            console.error(err);
            error('Dosya analiz edilirken bir hata oluştu. Lütfen dosya formatını kontrol edin.');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSubmit = async () => {
        if (!file || !priceRange || !volume || !weight) return;
        if (!contactInfo) {
            error('Lütfen iletişim bilgilerinizi giriniz (E-posta veya Telefon).');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filamentId', selectedFilamentId);
            formData.append('priceLow', priceRange.min.toString());
            formData.append('priceHigh', priceRange.max.toString());
            formData.append('volume', volume.toString());
            formData.append('weight', weight.toString());
            formData.append('contactInfo', contactInfo);

            const result = await submitQuote(formData);

            if (result.success) {
                success('Talebiniz alındı! En kısa sürede size dönüş yapacağız.');
                setFile(null);
                setPriceRange(null);
                setVolume(null);
                setWeight(null);
                setContactInfo('');
            } else {
                error('Talep gönderilirken bir hata oluştu.');
            }
        } catch (err) {
            console.error(err);
            error('Bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-bg-card p-8 shadow-2xl">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white">Hızlı Fiyat Hesapla</h2>
                <p className="mt-2 text-text-secondary">STL, OBJ veya 3MF dosyanızı yükleyin, tahmini baskı maliyetini hemen öğrenin.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Malzeme</label>
                    <select
                        value={selectedFilamentId}
                        onChange={handleFilamentChange}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    >
                        {filaments.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.type} - {f.color}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">Dosya Birimi</label>
                    <select
                        value={sourceUnit}
                        onChange={handleUnitChange}
                        className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                    >
                        <option value="mm">Milimetre (mm)</option>
                        <option value="cm">Santimetre (cm)</option>
                        <option value="m">Metre (m)</option>
                        <option value="inch">İnç (inch)</option>
                    </select>
                </div>
            </div>

            <div
                className="relative mb-8 flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-secondary/50 transition-colors hover:border-accent hover:bg-accent/5"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".stl,.obj,.3mf"
                    className="hidden"
                />
                <div className="text-6xl mb-4">📂</div>
                <p className="font-medium text-white">Dosya Seç veya Sürükle</p>
                <p className="text-sm text-text-secondary">STL, OBJ, 3MF</p>
            </div>

            {isCalculating && (
                <div className="mb-6 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
                    <p className="mt-2 text-accent">Analiz ediliyor...</p>
                </div>
            )}

            {priceRange !== null && volume !== null && weight !== null && (
                <div className="rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 p-6 text-center border border-accent/30">
                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-text-secondary">
                        <div className="rounded-lg bg-bg-secondary/50 p-2">
                            <span className="block text-xs uppercase tracking-wider opacity-70">Hacim</span>
                            <span className="font-semibold text-white">{volume.toFixed(2)} cm³</span>
                        </div>
                        <div className="rounded-lg bg-bg-secondary/50 p-2">
                            <span className="block text-xs uppercase tracking-wider opacity-70">Tahmini Ağırlık</span>
                            <span className="font-semibold text-white">
                                {weight > 1000 ? `${(weight / 1000).toFixed(2)} kg` : `${weight.toFixed(0)} g`}
                            </span>
                        </div>
                    </div>

                    <div className="mb-2">
                        <p className="text-sm text-text-secondary">Tahmini Fiyat Aralığı</p>
                        <p className="text-4xl font-bold text-white">
                            {priceRange.min === priceRange.max ? (
                                <span>₺{priceRange.min.toFixed(0)} <span className="text-lg font-normal text-text-secondary">(Minimum)</span></span>
                            ) : (
                                <span>₺{priceRange.min.toFixed(0)} - ₺{priceRange.max.toFixed(0)}</span>
                            )}
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary max-w-md mx-auto mb-4">
                        *Bu fiyat aralığı doluluk oranı ve destek yapılarına göre değişebilir. Kesin fiyat için incelemeye gönderin.
                    </p>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-text-secondary text-left">İletişim Bilgisi (E-posta / Tel)</label>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="ornek@email.com veya 0555..."
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-accent px-6 py-3 font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Gönderiliyor...' : 'İnceleme ve Kesin Fiyat İçin Gönder'}
                    </button>
                </div>
            )}
        </div>
    );
}
