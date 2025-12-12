'use client';

import Modal from './Modal';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    isDanger = false,
    isLoading = false
}: ConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="mb-6">
                <p className="text-sm text-text-secondary">
                    {message}
                </p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${isDanger
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-accent hover:bg-accent/90'
                        }`}
                >
                    {isLoading ? 'İşleniyor...' : confirmText}
                </button>
            </div>
        </Modal>
    );
}
