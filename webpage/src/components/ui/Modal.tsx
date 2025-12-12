'use client';

import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-border bg-bg-card p-6 shadow-2xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-text-secondary hover:bg-bg-secondary hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="text-text-secondary">
                    {children}
                </div>
            </div>
        </div>
    );
}
