import Image from 'next/image';

interface Filament {
    id: string;
    type: string;
    color: string;
    stock: number;
    imageUrl: string | null;
    brand: string;
    pricePerGram: number;
    density?: number | null;
    tempNozzle?: string | null;
    tempBed?: string | null;
    additives?: string | null;
}

export default function FilamentStockDisplay({ filaments }: { filaments: Filament[] }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filaments.map((f) => (
                <div key={f.id} className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-all hover:border-accent/50">
                    {f.imageUrl ? (
                        <Image src={f.imageUrl} alt={f.type} width={64} height={64} className="rounded-lg object-cover" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-bg-secondary text-2xl">🧵</div>
                    )}
                    <div>
                        <h3 className="font-bold text-white">{f.type} - {f.color}</h3>
                        <p className="text-sm text-text-secondary">{f.brand}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${f.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-xs font-medium text-text-secondary">
                                {f.stock > 0 ? `Stokta (${f.stock}g)` : 'Tükendi'}
                            </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-accent">₺{f.pricePerGram.toFixed(2)} / g</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
