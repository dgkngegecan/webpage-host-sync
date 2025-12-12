import React from 'react';

interface MaterialProps {
    title: string;
    description: string;
    pros: string[];
    cons: string[];
}

export default function MaterialCard({ title, description, pros, cons }: MaterialProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,212,255,0.1)]">
            {/* Top Gradient Border */}
            <div className="absolute left-0 right-0 top-0 h-1 scale-x-0 bg-gradient-to-r from-gradient-start to-gradient-end transition-transform duration-300 group-hover:scale-x-100"></div>

            <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
            <p className="mb-6 text-sm text-text-secondary">{description}</p>

            <div className="space-y-4">
                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase text-green-400">Avantajlar</h4>
                    <ul className="space-y-1">
                        {pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                                <span className="mt-0.5 text-green-400">✓</span>
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="mb-2 text-xs font-bold uppercase text-red-400">Dezavantajlar</h4>
                    <ul className="space-y-1">
                        {cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                                <span className="mt-0.5 text-red-400">✕</span>
                                <span>{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
