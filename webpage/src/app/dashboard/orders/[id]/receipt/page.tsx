import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";

interface ReceiptPageProps {
    params: {
        id: string;
    };
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/auth/signin");
    }

    const request = await prisma.printRequest.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            shippingAddress: true,
        },
    });

    if (!request) {
        notFound();
    }

    // Security check: Only allow the owner or admin to view the receipt
    if (request.userId !== session.user.id && session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Calculate totals
    const subtotal = request.estimatedPrice || 0;
    const discountAmount = request.finalPrice && request.discountApplied
        ? (request.finalPrice / (1 - request.discountApplied / 100)) - request.finalPrice
        : 0;
    const total = request.finalPrice || subtotal;
    const taxRate = 0.20; // 20% KDV
    const taxAmount = total * taxRate; // Simplified tax calculation logic (assuming inclusive or exclusive based on business logic, here treating as included for display breakdown if needed, or just showing total)
    // Actually, usually small businesses show Total. Let's stick to simple breakdown.

    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-16 print:p-0">
            {/* No-Print Navigation */}
            <div className="mb-8 flex justify-between print:hidden">
                <Link
                    href="/dashboard"
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                    &larr; Panela Dön
                </Link>
                <button
                    onClick={() => { }} // This will be handled by client component wrapper or just standard window.print() via onclick in a client component. 
                    // Since this is a server component, we can't add onClick. 
                    // We'll add a simple script or just let the user use browser print.
                    // Actually, let's make a small client component for the print button or just use a link with javascript:window.print() which might not work in Next.js Link.
                    // Simplest: User uses browser print or we add a client component button.
                    // Let's add a client component button for better UX.
                    className="hidden" // Placeholder
                >
                    Yazdır
                </button>
                <PrintButton />
            </div>

            {/* Invoice Container */}
            <div className="mx-auto max-w-3xl border border-gray-200 p-8 shadow-sm print:max-w-none print:border-0 print:shadow-none">
                {/* Header */}
                <div className="mb-8 flex justify-between border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">GEGEBASKI</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            3D Baskı ve Tasarım Hizmetleri<br />
                            İstanbul, Türkiye<br />
                            info@gegebaski.com
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold text-gray-900">MAKBUZ</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            <strong>Tarih:</strong> {new Date(request.createdAt).toLocaleDateString("tr-TR")}<br />
                            <strong>Sipariş No:</strong> #{request.id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8 flex justify-between">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Sayın</h3>
                        <p className="mt-1 text-gray-900 font-medium">
                            {request.user?.name || request.user?.email}
                        </p>
                        {request.user?.companyName && (
                            <p className="text-sm text-gray-600">{request.user.companyName}</p>
                        )}
                        {request.shippingAddress && (
                            <p className="mt-2 text-sm text-gray-600 max-w-xs">
                                {request.shippingAddress.addressDetail}<br />
                                {request.shippingAddress.district}, {request.shippingAddress.city}
                            </p>
                        )}
                        {request.user?.taxNumber && (
                            <p className="mt-2 text-xs text-gray-500">
                                VKN: {request.user.taxNumber} / {request.user.taxOffice}
                            </p>
                        )}
                    </div>
                </div>

                {/* Items */}
                <table className="mb-8 w-full">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="py-3">Hizmet / Açıklama</th>
                            <th className="py-3 text-right">Tutar</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-900">
                        <tr className="border-b border-gray-100">
                            <td className="py-4">
                                <p className="font-medium">{request.serviceType} Baskı Hizmeti</p>
                                <p className="text-gray-500 text-xs mt-1">{request.description}</p>
                                {request.material && (
                                    <span className="inline-block mt-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {request.material} / {request.color}
                                    </span>
                                )}
                            </td>
                            <td className="py-4 text-right font-medium">
                                ₺{subtotal.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-right text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Ara Toplam:</span>
                            <span>₺{subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>İndirim (%{request.discountApplied}):</span>
                                <span>-₺{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                            <span>Genel Toplam:</span>
                            <span>₺{total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">* KDV Dahildir</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 border-t border-gray-200 pt-8 text-center text-xs text-gray-500">
                    <p>Gegebaskı'yı tercih ettiğiniz için teşekkür ederiz.</p>
                    <p className="mt-1">Bu belge bilgilendirme amaçlıdır, resmi fatura yerine geçmez.</p>
                </div>
            </div>
        </div>
    );
}


