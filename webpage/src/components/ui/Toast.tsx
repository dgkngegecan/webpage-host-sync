'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsVisible(false);
            // Wait for exit animation to finish before removing
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, id, onClose]);

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
    };

    return createPortal(
        <div
            className={`pointer-events-auto mb-3 flex w-full max-w-sm items-center gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 ${bgColors[type]
                } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <span className="text-xl">{icons[type]}</span>
            <p className="font-medium">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(id), 300);
                }}
                className="ml-auto text-current opacity-70 hover:opacity-100"
            >
                ✕
            </button>
        </div>,
        document.getElementById('toast-container') || document.body
    );
}
