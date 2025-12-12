import Link from 'next/link';
import PrinterCard from '@/components/PrinterCard';
import PrintCard from '@/components/PrintCard';
import TestimonialCard from '@/components/TestimonialCard';
import { getCachedPrinters } from "@/lib/cache";

export default async function Home() {
  const printers = await getCachedPrinters();
  return (
    <div className="flex flex-col gap-12 pb-12 md:gap-20 md:pb-20">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-12 text-center md:py-20">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
          <span className="text-gradient">Ge</span>
          <span className="text-gradient">ge</span>
          <span className="text-white">baskı</span>
        </h1>
        <p className="mb-8 text-xl text-text-secondary">Kurumsal ve Hobi 3B Baskı Çözümleri</p>
        <Link
          href="/quote"
          className="rounded-full border border-white/10 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Hemen Teklif Al
        </Link>
      </section>

      {/* Printers Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white md:mb-12 md:text-4xl">3B Yazıcılarımız</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {printers.map((printer) => (
            <PrinterCard
              key={printer.id}
              name={printer.name}
              model={printer.model}
              status={printer.status as any}
              specs={[
                printer.buildVolume ? `Baskı Hacmi: ${printer.buildVolume}` : null,
                printer.layerHeight ? `Katman Kalınlığı: ${printer.layerHeight}` : null,
                printer.materials ? `Malzemeler: ${printer.materials}` : null,
                printer.features
              ].filter((spec): spec is string => Boolean(spec))}
              imageUrl={printer.imageUrl || undefined}
            />
          ))}
          {printers.length === 0 && (
            <div className="col-span-full text-center text-text-secondary">
              Henüz yazıcı eklenmemiş.
            </div>
          )}
        </div>
      </section>

      {/* Featured Prints Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white md:mb-12 md:text-4xl">Öne Çıkan Baskılar</h2>
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <PrintCard
            title="Hassas Dişli"
            description="PETG ile üretilmiş dayanıklı mekanik parça."
            category="Mekanik"
          />
          <PrintCard
            title="Karakter Modeli"
            description="Yüksek detaylı reçine baskı örneği."
            category="Figür"
          />
          <PrintCard
            title="Ürün Kasası"
            description="Hızlı prototipleme ile üretilmiş test ürünü."
            category="Prototip"
          />
        </div>
        <div className="text-center">
          <Link href="/prints" className="rounded-full border border-white/10 bg-white/5 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Tüm Örnekleri İncele
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-white md:mb-12 md:text-4xl">Müşteri Yorumları</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TestimonialCard
            text="Projem için çok hızlı ve kaliteli bir baskı aldım. İletişim harikaydı, kesinlikle tavsiye ederim."
            author="Ahmet Y."
            role="Mühendis"
            initial="A"
          />
          <TestimonialCard
            text="Figür baskılarımdaki detaylar inanılmaz. Reçine baskı kalitesi beklediğimden çok daha iyi."
            author="Zeynep K."
            role="Tasarımcı"
            initial="Z"
          />
          <TestimonialCard
            text="Kırılan parçamın aynısını tasarlayıp bastılar. Makinem tekrar çalışıyor, teşekkürler Gegebaskı!"
            author="Mehmet S."
            role="Hobi Kullanıcısı"
            initial="M"
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto w-full max-w-7xl px-4 text-center md:px-6">
        <h2 className="mb-8 text-3xl font-bold text-white md:mb-12 md:text-4xl">İletişime Geçin</h2>
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
