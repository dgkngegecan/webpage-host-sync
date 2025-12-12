'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createPrintRequest } from '@/app/actions/requests';
import { getFilaments } from '@/app/actions/filaments';
import { Filament } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { getPresignedUrl } from '@/app/actions/upload';
import { useToast } from '@/context/ToastContext';

export default function QuotePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { success, error, warning } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filaments, setFilaments] = useState<Filament[]>([]);
    const [isCustomMaterial, setIsCustomMaterial] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        service: 'FDM',
        material: '',
        fileLink: '',
        description: ''
    });

    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        getFilaments().then(setFilaments);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            error('Dosya boyutu 50MB\'dan küçük olmalıdır.');
            return;
        }

        try {
            setUploadProgress(1);
            const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type);

            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setFormData(prev => ({ ...prev, fileLink: fileUrl }));
                    setUploadProgress(100);
                } else {
                    error('Yükleme başarısız oldu.');
                    setUploadProgress(0);
                }
            };

            xhr.onerror = () => {
                error('Yükleme hatası.');
                setUploadProgress(0);
            };

            xhr.send(file);
        } catch (err) {
            console.error('Upload error:', err);
            error('Yükleme başlatılamadı.');
            setUploadProgress(0);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'other') {
            setIsCustomMaterial(true);
            setFormData(prev => ({ ...prev, material: '' }));
        } else {
            setIsCustomMaterial(false);
            setFormData(prev => ({ ...prev, material: value }));
        }
    };

    const getFormattedMessage = () => {
        return `*Yeni Teklif İsteği*\n\n*Ad:* ${formData.name}\n*Hizmet:* ${formData.service}\n*Malzeme:* ${formData.material}\n*Dosya:* ${formData.fileLink}\n*Not:* ${formData.description}`;
    };

    const handleWhatsapp = () => {
        const text = encodeURIComponent(getFormattedMessage());
        window.open(`https://wa.me/905455613765?text=${text}`, '_blank');
    };

    const handleEmail = () => {
        const subject = encodeURIComponent("Gegebaskı Teklif İsteği");
        const body = encodeURIComponent(getFormattedMessage());
        window.location.href = `mailto:gegebaski@gmail.com?subject=${subject}&body=${body}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            warning("Lütfen talebinizi takip etmek için giriş yapın veya WhatsApp/E-posta seçeneklerini kullanın.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createPrintRequest({
                userId: session.user.id,
                serviceType: formData.service,
                description: formData.description,
                fileUrl: formData.fileLink,
                material: formData.material,
                color: 'Belirtilmedi' // Could add color field
            });
            success("Talebiniz başarıyla oluşturuldu! Hesabım sayfasından durumunu takip edebilirsiniz.");
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            error("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold text-white">Hemen Teklif Alın</h1>
                <p className="text-xl text-text-secondary">Projeniz için en uygun fiyatı öğrenin</p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-8 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-text-secondary">Ad Soyad</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Adınız Soyadınız"
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                    </div>

                    <div>
                        <label htmlFor="service" className="mb-2 block text-sm font-medium text-text-secondary">Hizmet Türü</label>
                        <select
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                            <option value="FDM">FDM Baskı (PLA/PETG/ABS)</option>
                            <option value="SLA">SLA Reçine Baskı (Figür/Hassas)</option>
                            <option value="Design">3D Tasarım / Modelleme</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="materialSelect" className="mb-2 block text-sm font-medium text-text-secondary">Tercih Edilen Malzeme</label>
                        <select
                            id="materialSelect"
                            onChange={handleMaterialChange}
                            className="mb-2 w-full rounded-lg border border-border bg-bg-secondary p-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            defaultValue=""
                        >
                            <option value="" disabled>Malzeme Seçin</option>
                            {filaments.map(f => (
                                <option key={f.id} value={`${f.type} - ${f.color}`}>
                                    {f.type} - {f.color} ({f.stock > 0 ? 'Stokta' : 'Tükendi'})
                                </option>
                            ))}
                            <option value="other">Diğer (Listede Yok)</option>
                        </select>

                        {isCustomMaterial && (
                            <input
                                type="text"
                                id="material"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="İstediğiniz malzemeyi belirtin..."
                                className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-secondary">Dosya Yükle (Opsiyonel)</label>

                        {!formData.fileLink ? (
                            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-bg-secondary p-6 transition-colors hover:border-accent hover:bg-accent/5">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    accept=".stl,.obj,.step,.stp,.3mf"
                                />
                                <div className="text-center">
                                    <span className="text-2xl">📂</span>
                                    <p className="mt-2 text-sm font-medium text-white">Dosya Seç veya Sürükle</p>
                                    <p className="text-xs text-text-secondary">STL, OBJ, STEP, 3MF (Max 50MB)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary p-3">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-xl">✅</span>
                                    <a href={formData.fileLink} target="_blank" rel="noopener noreferrer" className="truncate text-sm text-accent hover:underline">
                                        Yüklenen Dosya
                                    </a>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, fileLink: '' }))}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>Yükleniyor...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-bg-secondary">
                                    <div
                                        className="h-full bg-accent transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="mb-2 block text-sm font-medium text-text-secondary">Proje Detayları</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Boyutlar, adet, kullanım amacı ve diğer detaylar..."
                            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-white placeholder-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        {/* Database Submission (Primary) */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gradient-start to-gradient-end py-4 font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Gönderiliyor...' : 'Talebi Oluştur'}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="mx-4 flex-shrink-0 text-sm text-text-secondary">veya hızlı iletişim</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleWhatsapp}
                                className="flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 py-3 font-semibold text-green-400 transition-all hover:bg-green-500/20"
                            >
                                <span>📱</span> WhatsApp
                            </button>
                            <button
                                type="button"
                                onClick={handleEmail}
                                className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-3 font-semibold text-blue-400 transition-all hover:bg-blue-500/20"
                            >
                                <span>✉️</span> E-posta
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
