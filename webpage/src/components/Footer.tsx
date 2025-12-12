import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-bg-secondary pt-12 pb-8 text-text-secondary">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-8 md:grid-cols-4 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold text-gradient">Gege</span>
                            <span className="text-2xl font-bold text-white">baskı</span>
                        </Link>
                        <p className="text-sm text-text-secondary">
                            Profesyonel 3D baskı ve tasarım hizmetleri. Fikirden gerçeğe, en hızlı yol.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Hızlı Erişim</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/quote/instant" className="hover:text-accent transition-colors">Anında Fiyat</Link></li>
                            <li><Link href="/prints" className="hover:text-accent transition-colors">Hazır Modeller</Link></li>
                            <li><Link href="/faq" className="hover:text-accent transition-colors">S.S.S.</Link></li>
                            <li><Link href="/about" className="hover:text-accent transition-colors">Hakkımızda</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-white mb-4">İletişim</h3>
                        <ul className="space-y-2 text-sm">
                            <li>info@gegebaski.com</li>
                            <li>İstanbul, Türkiye</li>
                        </ul>
                    </div>

                    {/* Trust Badges */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Güvenle Alışveriş</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center text-center p-2 rounded bg-bg-primary/50 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                                <span className="text-[10px] font-medium">Kalite Garantisi</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-2 rounded bg-bg-primary/50 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                                <span className="text-[10px] font-medium">Hızlı Kargo</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-2 rounded bg-bg-primary/50 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                                <span className="text-[10px] font-medium">Güvenli Ödeme</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-2 rounded bg-bg-primary/50 border border-border/50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-accent mb-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a16.002 16.002 0 0 0-4.649 4.763m0 0c-.37.093-.746.153-1.128.183" />
                                </svg>
                                <span className="text-[10px] font-medium">Çevre Dostu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} <span className="text-gradient font-bold">Gege</span>baskı. Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
}
