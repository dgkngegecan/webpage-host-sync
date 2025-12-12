'use client';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
            Yazdır / PDF Kaydet
        </button>
    );
}
