import React from 'react';
import Link from 'next/link';
import MaterialCard from '@/components/MaterialCard';
import FilamentStockDisplay from '@/components/FilamentStockDisplay';
import { getCachedFAQs, getCachedFilaments } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
    const faqs = await getCachedFAQs();
    const filaments = await getCachedFilaments();

    return (
        <div className="flex flex-col gap-12 py-12 pt-24 md:gap-20 md:pt-32">
            {/* Hero Section */}
            <section className="text-center">
                <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Hakkımızda</h1>
                <p className="text-xl text-text-secondary">3D Baskı ile Geleceği Şekillendiriyoruz</p>
            </section>

            {/* About Content */}
            <section className="mx-auto max-w-4xl px-4 text-center md:px-6">
                <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">Biz Kimiz?</h2>
                <p className="mb-6 text-lg leading-relaxed text-text-secondary">
                    Gegebaskı olarak, 3D baskı teknolojisinin sunduğu sınırsız olanakları kullanarak,
                    müşterilerimize en yüksek kalitede baskı hizmetleri sunmaktayız. Hem kurumsal projeler
                    hem de kişisel hobi projeleri için çözümler üretiyoruz.
                </p>
                <p className="text-lg leading-relaxed text-text-secondary">
                    Modern 3D yazıcılarımız ve deneyimli ekibimizle, mekanik parçalardan detaylı figürlere,
                    prototiplerden özel tasarımlara kadar geniş bir yelpazede hizmet vermekteyiz.
                </p>
            </section>

            {/* Material Guide Section */}
            <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <h2 className="mb-8 text-center text-2xl font-bold text-white md:mb-12 md:text-3xl">Malzeme Rehberi</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <MaterialCard
                        title="PLA (Standart)"
                        description="Günlük kullanım ve görsel modeller için en popüler seçenek."
                        pros={["Ekonomik", "Yüksek detay kalitesi", "Geniş renk seçeneği", "Çevre dostu (Biyobozunur)"]}
                        cons={["Düşük ısı dayanımı (50°C)", "Kırılgan yapı", "Dış mekan için uygun değil"]}
                    />
                    <MaterialCard
                        title="PETG (Dayanıklı)"
                        description="Mekanik parçalar ve dış mekan kullanımı için ideal denge."
                        pros={["Yüksek darbe dayanımı", "Isıya dayanıklı (70°C)", "Esnek yapı", "Dış mekana uygun"]}
                        cons={["PLA kadar detaylı değil", "İpliklenme yapabilir"]}
                    />
                    <MaterialCard
                        title="ABS / ASA (Endüstriyel)"
                        description="Yüksek sıcaklık ve zorlu şartlar için profesyonel tercih."
                        pros={["Çok yüksek ısı dayanımı (100°C)", "Zımparalanabilir", "Aseton ile pürüzsüzleştirilebilir"]}
                        cons={["Baskı sırasında koku yayar", "Soğuma sırasında çatlayabilir (Warping)"]}
                    />
                    <MaterialCard
                        title="TPU (Esnek)"
                        description="Lastik benzeri esnek ve darbe emici parçalar için."
                        pros={["Çok esnek ve bükülebilir", "Yırtılmaya dayanıklı", "Darbe emici"]}
                        cons={["Yavaş baskı süresi", "Destek yapısı zor sökülür"]}
                    />
                </div>
            </section>

            {/* Filament Stock Section */}
            <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <h2 className="mb-8 text-center text-2xl font-bold text-white md:mb-12 md:text-3xl">Stok Durumu</h2>
                <FilamentStockDisplay filaments={filaments} />
            </section>

            {/* References Section */}
            <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <h2 className="mb-8 text-center text-2xl font-bold text-white md:mb-12 md:text-3xl">Referanslar</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: "Mekanik Parçalar", desc: "Endüstriyel dişli sistemleri, rulman yatakları ve özel mekanik komponentler" },
                        { title: "Prototipleme", desc: "Ürün geliştirme süreçlerinde hızlı prototip üretimi ve tasarım doğrulama" },
                        { title: "Figür ve Modeller", desc: "Yüksek detaylı karakter figürleri, minyatürler ve sanatsal modeller" },
                        { title: "Özel Tasarımlar", desc: "CAD destekli özel elektronik muhafazalar, aparatlar ve çözümler" }
                    ].map((ref, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-xl border border-border bg-bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,212,255,0.1)]">
                            <div className="absolute left-0 right-0 top-0 h-1 scale-x-0 bg-gradient-to-r from-gradient-start to-gradient-end transition-transform duration-300 group-hover:scale-x-100"></div>
                            <h3 className="mb-4 text-xl font-bold text-white">{ref.title}</h3>
                            <p className="text-sm text-text-secondary">{ref.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section (Integrated) */}
            <section className="mx-auto w-full max-w-4xl px-4 md:px-6">
                <h2 className="mb-8 text-center text-2xl font-bold text-white md:mb-12 md:text-3xl">Sıkça Sorulan Sorular</h2>
                <div className="space-y-4">
                    {faqs.slice(0, 3).map((item) => (
                        <details key={item.id} className="group rounded-xl border border-border bg-bg-card">
                            <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-white transition-colors hover:text-accent focus:outline-none">
                                {item.question}
                                <span className="ml-4 transition-transform group-open:rotate-180">▼</span>
                            </summary>
                            <div className="border-t border-border px-6 pb-6 pt-4 text-text-secondary">
                                <p>{item.answer}</p>
                            </div>
                        </details>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <Link href="/faq" className="font-semibold text-accent hover:underline">
                        Tüm Soruları Görüntüle &rarr;
                    </Link>
                </div>
            </section>
        </div>
    );
}
