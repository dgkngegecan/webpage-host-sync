import Image from 'next/image';

interface PrintProps {
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    tags?: string[];
}

export default function PrintCard({ title, description, category, imageUrl, tags }: PrintProps) {
    return (
        <div className="group overflow-hidden rounded-xl border border-border bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,212,255,0.1)]">
            {/* Image Placeholder */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-bg-secondary to-bg-hover">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="absolute h-[200%] w-[200%] animate-[spin_20s_linear_infinite] bg-[radial-gradient(circle,rgba(0,212,255,0.1)_0%,transparent_70%)]"></div>
                )}
                <span className="relative z-10 rounded-full border border-accent bg-black/70 px-4 py-2 text-sm font-semibold text-accent backdrop-blur-sm">
                    {category}
                </span>
            </div>

            <div className="p-6">
                <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                <p className="mb-4 text-sm text-text-secondary">{description}</p>

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="rounded-lg border border-border bg-bg-secondary px-3 py-1 text-xs font-medium text-accent">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
