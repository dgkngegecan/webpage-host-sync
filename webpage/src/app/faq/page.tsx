'use client';

import { useState } from 'react';

const faqs = [
    {
        question: 'Kargo süreci nasıl işliyor?',
        answer: 'Siparişiniz onaylandıktan sonra baskı sırasına alınır. Baskı tamamlandığında kalite kontrol yapılır ve özenle paketlenerek kargoya verilir. Kargo takip numarası size e-posta ve panel üzerinden iletilir.'
    },
    {
        question: 'Hangi malzemeleri kullanıyorsunuz?',
        answer: 'Genellikle PLA, PETG, ABS ve TPU gibi popüler ve dayanıklı malzemeler kullanıyoruz. Özel malzeme talepleriniz için bizimle iletişime geçebilirsiniz.'
    },
    {
        question: 'Baskı toleransları nedir?',
        answer: 'FDM baskı teknolojisinde standart toleransımız ±0.2mm\'dir. Hassas parçalar için lütfen sipariş notunda belirtiniz.'
    },
    {
        question: 'Maksimum baskı boyutu nedir?',
        answer: 'Bambu Lab X1 Carbon yazıcılarımızla 256 x 256 x 256 mm boyutlarına kadar tek parça baskı alabiliyoruz. Daha büyük parçalar için parçalı baskı ve birleştirme yöntemleri kullanıyoruz.'
    },
    {
        question: 'Dosya formatı ne olmalı?',
        answer: 'Sistemimiz .STL ve .OBJ formatlarını desteklemektedir. Dosya boyutunuz 50MB\'ı geçmemelidir.'
    },
    {
        question: 'İade politikanız nedir?',
        answer: 'Kişiye özel üretim yapıldığı için, üretim hatası olmadığı sürece iade kabul edilmemektedir. Ancak kargoda hasar gören veya hatalı basılan ürünler için ücretsiz yeniden baskı garantisi veriyoruz.'
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="mb-8 text-center text-3xl font-bold text-white">Sıkça Sorulan Sorular</h1>
            <div className="mx-auto max-w-2xl space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="overflow-hidden rounded-xl border border-border bg-bg-card">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="flex w-full items-center justify-between p-4 text-left font-bold text-white transition-colors hover:bg-bg-secondary"
                        >
                            <span>{faq.question}</span>
                            <span className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>
                        {openIndex === index && (
                            <div className="border-t border-border bg-bg-secondary/30 p-4 text-text-secondary">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
