'use client';

import { useState } from 'react';

interface SavedFile {
    id: string;
    name: string;
    url: string;
    size?: number | null;
    createdAt: Date;
}

interface FileLibraryProps {
    files: SavedFile[];
}

import { useToast } from '@/context/ToastContext';

export default function FileLibrary({ files }: FileLibraryProps) {
    const { info } = useToast();
    // Note: Actual file upload logic would require S3/Cloud storage integration
    // For now, this is a placeholder UI as requested

    return (
        <div className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Model Kütüphanem</h3>
                <button
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-bg-primary hover:bg-accent-hover"
                    onClick={() => info('Dosya yükleme özelliği henüz aktif değil (S3 entegrasyonu gerekli).')}
                >
                    + Yeni Model Yükle
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.map(file => (
                    <div key={file.id} className="group relative rounded-lg border border-border bg-bg-secondary p-4 transition-all hover:border-accent/50">
                        <div className="mb-2 flex h-32 items-center justify-center rounded bg-bg-card text-4xl text-text-secondary">
                            STL
                        </div>
                        <h4 className="truncate font-bold text-white" title={file.name}>{file.name}</h4>
                        <p className="text-xs text-text-secondary">
                            {new Date(file.createdAt).toLocaleDateString()} • {(file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown')}
                        </p>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 rounded bg-accent/10 py-1 text-xs font-bold text-accent hover:bg-accent hover:text-bg-primary">
                                Sipariş Ver
                            </button>
                            <button className="rounded bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white">
                                Sil
                            </button>
                        </div>
                    </div>
                ))}
                {files.length === 0 && (
                    <div className="col-span-full py-12 text-center text-text-secondary">
                        <p>Henüz kütüphanenizde kayıtlı model bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
