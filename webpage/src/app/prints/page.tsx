import React from 'react';
import PrintCard from '@/components/PrintCard';
import { getCachedExamples } from '@/lib/cache';
import { ExamplePrint } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function PrintsPage() {
    const examples = await getCachedExamples();

    // Group examples by category
    const categories = examples.reduce((acc, example) => {
        const category = example.category || 'Diğer';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(example);
        return acc;
    }, {} as Record<string, ExamplePrint[]>);

    return (
        <div className="flex flex-col gap-20 py-12 pt-32">
            {/* Hero Section */}
            <section className="text-center">
                <h1 className="mb-4 text-5xl font-bold text-white">Örnek Baskılar</h1>
                <p className="text-xl text-text-secondary">Çalışmalarımızdan Seçmeler</p>
            </section>

            {/* Dynamic Categories */}
            {Object.entries(categories).map(([category, items]) => (
                <section key={category} className="mx-auto w-full max-w-7xl px-6">
                    <div className="mb-8 border-b-2 border-border pb-3">
                        <h2 className="relative inline-block text-3xl font-bold text-white after:absolute after:-bottom-[14px] after:left-0 after:h-[2px] after:w-[60px] after:bg-gradient-to-r after:from-gradient-start after:to-gradient-end">
                            {category}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <PrintCard
                                key={item.id}
                                title={item.title}
                                description={item.description}
                                category={item.category}
                                imageUrl={item.imageUrl || undefined}
                                tags={[
                                    item.material,
                                    item.layerHeight,
                                    item.printerInfo
                                ].filter(Boolean) as string[]}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {/* Contact Section */}
            <section className="mx-auto w-full max-w-7xl px-6 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white">Özel Baskı İster misiniz?</h2>
                <p className="mb-8 text-text-secondary">Proje gereksinimlerinizi konuşmak için bizimle iletişime geçin</p>
                <div className="flex flex-wrap justify-center gap-8">
                    <a href="https://wa.me/905455613765" target="_blank" className="flex min-w-[250px] items-center gap-4 rounded-xl border border-border bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-bg-hover hover:shadow-[0_5px_20px_rgba(0,212,255,0.2)]">
                        <span className="text-3xl">📱</span>
                        <div className="text-left">
                            <strong className="block text-accent">WhatsApp</strong>
                            <p className="text-text-secondary">+90 545 561 37 65</p>
                        </div>
                    </a>
                    <a href="mailto:gegebaski@gmail.com" className="flex min-w-[250px] items-center gap-4 rounded-xl border border-border bg-bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:bg-bg-hover hover:shadow-[0_5px_20px_rgba(0,212,255,0.2)]">
                        <span className="text-3xl">✉️</span>
                        <div className="text-left">
                            <strong className="block text-accent">E-posta</strong>
                            <p className="text-text-secondary">gegebaski@gmail.com</p>
                        </div>
                    </a>
                </div>
            </section>
        </div>
    );
}
