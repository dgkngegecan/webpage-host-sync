import React from 'react';

interface PricingProps {
    title: string;
    price: string;
    description: string;
    features: string[];
}

export default function PricingCard({ title, price, description, features }: PricingProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,212,255,0.1)]">
            {/* Top Gradient Border */}
            <div className="absolute left-0 right-0 top-0 h-1 scale-x-0 bg-gradient-to-r from-gradient-start to-gradient-end transition-transform duration-300 group-hover:scale-x-100"></div>

            <h3 className="mb-4 text-2xl font-bold text-white">{title}</h3>
            <div className="mb-4 bg-gradient-to-br from-gradient-start to-gradient-end bg-clip-text text-4xl font-bold text-transparent">
                {price}
            </div>
            <p className="mb-6 text-sm text-text-secondary">{description}</p>

            <ul className="space-y-3 text-left">
                {features.map((feature, index) => (
                    <li key={index} className="relative pl-6 text-sm text-text-secondary">
                        <span className="absolute left-0 font-bold text-accent">✓</span>
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}
