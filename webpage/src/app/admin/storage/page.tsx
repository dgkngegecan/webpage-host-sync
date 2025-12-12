'use client';

import { useState, useEffect } from 'react';
import { listFiles, deleteFile, bulkDeleteOldFiles, StorageFile } from '@/app/actions/storage';
import { migrateAllFiles } from '@/app/actions/migration';
import { useToast } from '@/context/ToastContext';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function StoragePage() {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [folders, setFolders] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const { success, error, info } = useToast();

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        loadFiles(currentPath);
    }, [currentPath]);

    const loadFiles = async (prefix: string) => {
        setIsLoading(true);
        try {
            const data = await listFiles(prefix);
            setFiles(data.files);
            setFolders(data.folders);
        } catch (err) {
            error('Dosyalar yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigate = (folder: string) => {
        setCurrentPath(folder);
    };

    const handleUp = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        const newPath = parts.length > 0 ? parts.join('/') + '/' : '';
        setCurrentPath(newPath);
    };

    const confirmDelete = (key: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Dosyayı Sil',
            message: 'Bu dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            isDanger: true,
            onConfirm: () => handleDelete(key)
        });
    };

    const handleDelete = async (key: string) => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        try {
            const result = await deleteFile(key);
            if (result.success) {
                success('Dosya silindi.');
                setFiles(prev => prev.filter(f => f.key !== key));
            } else {
                error('Silme işlemi başarısız.');
            }
        } catch (err) {
            error('Bir hata oluştu.');
        }
    };

    const confirmBulkDelete = (days: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Toplu Silme',
            message: `${days} günden eski TÜM dosyalar silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?`,
            isDanger: true,
            onConfirm: () => handleBulkDelete(days)
        });
    };

    const handleBulkDelete = async (days: number) => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        setIsDeleting(true);
        try {
            const result = await bulkDeleteOldFiles(days);
            if (result.success) {
                success(`${result.count} dosya silindi.`);
                loadFiles(currentPath);
            } else {
                error('Toplu silme işlemi başarısız.');
            }
        } catch (err) {
            error('Bir hata oluştu.');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmMigration = () => {
        setModalConfig({
            isOpen: true,
            title: 'Dosyaları Taşı',
            message: 'TÜM dosyalar yeni isimlendirme düzenine (Klasör/Yıl/Ay/UUID) taşınacak. Veritabanı kayıtları güncellenecek. Bu işlem biraz zaman alabilir.',
            isDanger: false,
            onConfirm: () => handleMigration()
        });
    };

    const handleMigration = async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        setIsMigrating(true);
        info('Taşıma işlemi başlatıldı, lütfen bekleyin...');

        try {
            const result = await migrateAllFiles();
            if (result.success) {
                success(`İşlem tamamlandı! Taşınan: ${result.stats?.migrated}, Atlanan: ${result.stats?.skipped}, Hata: ${result.stats?.errors}`);
                loadFiles(currentPath);
            } else {
                error('Taşıma işlemi sırasında hata oluştu.');
            }
        } catch (err) {
            error('Bir hata oluştu.');
        } finally {
            setIsMigrating(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
            />

            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Depolama Yönetimi</h1>
                    <p className="text-text-secondary">R2 depolama alanını yönetin ve temizleyin.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={confirmMigration}
                        disabled={isMigrating || isDeleting}
                        className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
                    >
                        {isMigrating ? 'Taşınıyor...' : '🔄 Dosyaları Yeni Düzene Taşı'}
                    </button>
                    <button
                        onClick={() => confirmBulkDelete(30)}
                        disabled={isDeleting || isMigrating}
                        className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                        {isDeleting ? 'Siliniyor...' : '30 Günden Eski Dosyaları Sil'}
                    </button>
                    <button
                        onClick={() => confirmBulkDelete(7)}
                        disabled={isDeleting || isMigrating}
                        className="rounded-lg bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
                    >
                        {isDeleting ? 'Siliniyor...' : '7 Günden Eski Dosyaları Sil'}
                    </button>
                </div>
            </div>

            {/* Breadcrumbs / Navigation */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-bg-card p-3 border border-border">
                <button
                    onClick={() => setCurrentPath('')}
                    className={`text-sm font-medium hover:text-white ${!currentPath ? 'text-white' : 'text-text-secondary'}`}
                >
                    Root
                </button>
                {currentPath && (
                    <>
                        <span className="text-text-secondary">/</span>
                        <span className="text-sm font-medium text-white">{currentPath}</span>
                    </>
                )}
                {currentPath && (
                    <button
                        onClick={handleUp}
                        className="ml-auto text-xs text-accent hover:underline"
                    >
                        ⬆ Üst Klasör
                    </button>
                )}
            </div>

            {/* File Browser */}
            <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-bg-secondary text-text-secondary">
                            <tr>
                                <th className="px-6 py-4 font-medium w-12"></th>
                                <th className="px-6 py-4 font-medium">Ad</th>
                                <th className="px-6 py-4 font-medium">Boyut</th>
                                <th className="px-6 py-4 font-medium">Tarih</th>
                                <th className="px-6 py-4 font-medium text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : files.length === 0 && folders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                                        Klasör boş.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {/* Folders */}
                                    {folders.map((folder) => (
                                        <tr
                                            key={folder}
                                            className="cursor-pointer hover:bg-bg-secondary/50"
                                            onClick={() => handleNavigate(folder)}
                                        >
                                            <td className="px-6 py-4 text-xl">📁</td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {folder.replace(currentPath, '').replace('/', '')}
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">-</td>
                                            <td className="px-6 py-4 text-text-secondary">-</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-text-secondary text-xs">Aç &rarr;</span>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Files */}
                                    {files.map((file) => (
                                        <tr key={file.key} className="hover:bg-bg-secondary/50">
                                            <td className="px-6 py-4 text-xl">📄</td>
                                            <td className="px-6 py-4 text-white font-mono text-xs truncate max-w-xs" title={file.key}>
                                                {file.key.replace(currentPath, '')}
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                {formatSize(file.size)}
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                {file.lastModified.toLocaleDateString('tr-TR')} {file.lastModified.toLocaleTimeString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(file.key);
                                                    }}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
