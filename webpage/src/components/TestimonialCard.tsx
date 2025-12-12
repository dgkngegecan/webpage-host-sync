import React from 'react';

interface TestimonialProps {
    text: string;
    author: string;
    role: string;
    initial: string;
}

export default function TestimonialCard({ text, author, role, initial }: TestimonialProps) {
    return (
        <div className="rounded-xl border border-border bg-bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,212,255,0.1)]">
            <p className="mb-6 italic text-text-secondary">"{text}"</p>
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gradient-start to-gradient-end text-lg font-bold text-white shadow-lg">
                    {initial}
                </div>
                <div>
                    <strong className="block text-white">{author}</strong>
                    <span className="text-sm text-accent">{role}</span>
                </div>
            </div>
        </div>
    );
}
