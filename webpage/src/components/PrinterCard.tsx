import React from 'react';

interface PrinterProps {
    name: string;
    model: string;
    specs: string[];
    status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'PRINTING' | 'IDLE';
    imageUrl?: string;
    className?: string; // Allow custom classes for specific background images if needed
}

export default function PrinterCard({ name, model, specs, status, className, imageUrl }: PrinterProps) {
    const isOnline = status === 'ONLINE' || status === 'PRINTING';

    return (
        <div className={`relative min-h-[350px] overflow-hidden rounded-xl border border-border bg-bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_15px_40px_rgba(0,212,255,0.2)] group ${className}`}>
            {/* Top Gradient Border Effect */}
            <div className="absolute left-0 right-0 top-0 h-1 scale-x-0 rounded-t-xl bg-gradient-to-r from-transparent via-gradient-start to-transparent opacity-0 transition-all duration-400 group-hover:scale-x-100 group-hover:opacity-100 group-hover:animate-gradient-shift"></div>

            {/* Status Indicator */}
            {/* Status Indicator */}
            <div className="absolute right-4 top-4 z-10">
                <div className="group/status flex items-center gap-2 rounded-full border border-white/10 bg-black/60 p-1.5 backdrop-blur-md transition-all duration-300 hover:px-4 hover:py-2">
                    <span className={`h-3 w-3 rounded-full animate-pulse ${status === 'IDLE' || status === 'ONLINE' ? 'bg-green-400 shadow-[0_0_10px_rgba(0,255,136,0.8)]' :
                        status === 'PRINTING' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.8)]' :
                            'bg-red-500 shadow-[0_0_10px_rgba(255,68,68,0.8)]'
                        }`}></span>
                    <span className="hidden w-0 overflow-hidden text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 group-hover/status:block group-hover/status:w-auto">
                        {status === 'IDLE' || status === 'ONLINE' ? 'Hazır' :
                            status === 'PRINTING' ? 'Yazdırıyor' :
                                'Bakımda'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="mb-2 text-2xl font-bold text-white">{name}</h3>
                <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-accent">{model}</p>

                <ul className="space-y-2">
                    {specs.map((spec, index) => (
                        <li key={index} className="border-b border-border py-2 text-sm text-text-secondary last:border-0">
                            {spec}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Background Image Overlay (Pseudo-element simulation) */}
            <div
                className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-25 transition-opacity duration-400 group-hover:opacity-45 pointer-events-none"
                style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
            ></div>
        </div>
    );
}
