'use client';

import { useState, useCallback } from 'react';
import ModelViewer from '@/components/quote/ModelViewer';
import PriceCalculator from '@/components/quote/PriceCalculator';
import { calculateVolume, calculateBoundingBox } from '@/utils/geometry';
import * as THREE from 'three';
import { useToast } from '@/context/ToastContext';

export default function InstantQuotePage() {
    const [file, setFile] = useState<File | null>(null);
    const [volume, setVolume] = useState<number>(0);
    const [dimensions, setDimensions] = useState<THREE.Vector3 | null>(null);
    const [color, setColor] = useState<string>('#FF0000');
    const [material, setMaterial] = useState<string>('PLA (Standart)');
    const [price, setPrice] = useState<number>(0);
    const { error, success } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const extension = selectedFile.name.split('.').pop()?.toLowerCase();

            if (extension !== 'stl' && extension !== 'obj') {
                error('Sadece .stl ve .obj dosyaları desteklenir.');
                return;
            }

            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                error('Dosya boyutu çok büyük (Max 50MB).');
                return;
            }

            setFile(selectedFile);
            setVolume(0);
            setDimensions(null);
        }
    };

    const handleGeometryLoaded = useCallback((geometry: THREE.BufferGeometry) => {
        const vol = calculateVolume(geometry);
        const size = calculateBoundingBox(geometry);

        // Validation: Check max dimensions (X1C: 256x256x256mm)
        if (size.x > 256 || size.y > 256 || size.z > 256) {
            error(`Model boyutları çok büyük! (${size.x.toFixed(1)}x${size.y.toFixed(1)}x${size.z.toFixed(1)}mm). Max: 256x256x256mm`);
            setFile(null);
            return;
        }

        setVolume(vol);
        setDimensions(size);
        success('Model başarıyla yüklendi ve analiz edildi.');
    }, [error, success]);

    const [isUploading, setIsUploading] = useState(false);

    const handleAddToCart = async () => {
        if (!file || price <= 0) return;

        setIsUploading(true);
        try {
            // 1. Get Presigned URL
            const { getPresignedUrl } = await import('@/app/actions/upload');
            const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type || 'application/octet-stream');

            // 2. Upload to R2
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
            });

            if (!uploadRes.ok) throw new Error('Dosya yüklenemedi');

            // 3. Create Request
            const { createPrintRequest } = await import('@/app/actions/requests');
            await createPrintRequest({
                serviceType: 'FDM (Standart)',
                description: `Hızlı Fiyat Siparişi - Hacim: ${volume.toFixed(2)}cm3`,
                fileUrl: fileUrl,
                material: material,
                color: color,
                // userId is optional, will be handled by server action if logged in
            });

            success(`Sipariş başarıyla oluşturuldu! Fiyat: ${price} ₺`);
            // Optional: Redirect to dashboard
            // window.location.href = '/dashboard';

        } catch (err) {
            console.error(err);
            error('Sipariş oluşturulurken bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
                        <span className="text-gradient">Hızlı</span> Fiyat Al
                    </h1>
                    <p className="mx-auto max-w-2xl text-text-secondary">
                        3D modelinizi yükleyin, saniyeler içinde fiyat alın ve sipariş verin.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Viewer & Upload */}
                    <div className="lg:col-span-2 space-y-6">
                        <ModelViewer
                            file={file}
                            color={color}
                            onGeometryLoaded={handleGeometryLoaded}
                        />

                        {!file && (
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-border bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-text-secondary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold text-white">Yüklemek için tıklayın</span> veya sürükleyin</p>
                                        <p className="text-xs text-text-secondary">STL veya OBJ (MAX. 50MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".stl,.obj" onChange={handleFileChange} />
                                </label>
                            </div>
                        )}

                        {dimensions && (
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="rounded-lg bg-bg-secondary/30 p-3 border border-border">
                                    <span className="block text-xs text-text-secondary mb-1">Genişlik (X)</span>
                                    <span className="font-mono text-white">{dimensions.x.toFixed(1)} mm</span>
                                </div>
                                <div className="rounded-lg bg-bg-secondary/30 p-3 border border-border">
                                    <span className="block text-xs text-text-secondary mb-1">Derinlik (Y)</span>
                                    <span className="font-mono text-white">{dimensions.y.toFixed(1)} mm</span>
                                </div>
                                <div className="rounded-lg bg-bg-secondary/30 p-3 border border-border">
                                    <span className="block text-xs text-text-secondary mb-1">Yükseklik (Z)</span>
                                    <span className="font-mono text-white">{dimensions.z.toFixed(1)} mm</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Calculator */}
                    <div className="lg:col-span-1">
                        <PriceCalculator
                            volume={volume}
                            onPriceChange={setPrice}
                            onMaterialChange={setColor}
                            onMaterialSelect={setMaterial}
                        />

                        <button
                            onClick={handleAddToCart}
                            disabled={!file || price <= 0 || isUploading}
                            className="mt-4 w-full rounded-xl bg-accent py-4 text-lg font-bold text-bg-primary shadow-lg shadow-accent/20 transition-all hover:-translate-y-1 hover:shadow-accent/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isUploading ? 'Yükleniyor...' : 'Sepete Ekle'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
