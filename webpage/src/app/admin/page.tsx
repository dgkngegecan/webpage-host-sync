import prisma from "@/lib/prisma";
import { RequestStatus, PrinterStatus } from "@/types/enums";

export default async function AdminDashboard() {
    // Fetch Request Counts
    const requestCounts = await prisma.printRequest.groupBy({
        by: ['status'],
        _count: { status: true },
    });

    const rStats = requestCounts.reduce((acc: Record<string, number>, curr: { status: string, _count: { status: number } }) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {} as Record<string, number>);

    // Fetch Printer Counts
    const printerCounts = await prisma.printer.groupBy({
        by: ['status'],
        _count: { status: true },
    });

    const pStats = printerCounts.reduce((acc: Record<string, number>, curr: { status: string, _count: { status: number } }) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {} as Record<string, number>);

    const totalOrders = (Object.values(rStats) as number[]).reduce((a, b) => a + b, 0);

    // Fetch Low Stock Filaments
    const lowStockFilaments = await prisma.filament.findMany({
        where: { stock: { lte: 200 } }, // Threshold: 200g
        orderBy: { stock: 'asc' },
        take: 5
    });

    // Fetch Recent Orders
    const recentOrders = await prisma.printRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: true }
    });

    return (
        <div>
            <h1 className="mb-8 text-3xl font-bold text-white">Genel Bakış</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-bg-card p-6">
                    <h3 className="text-sm font-medium text-text-secondary">Toplam Sipariş</h3>
                    <p className="mt-2 text-3xl font-bold text-white">{totalOrders}</p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-6">
                    <h3 className="text-sm font-medium text-accent">Aktif Baskılar (Sipariş)</h3>
                    <p className="mt-2 text-3xl font-bold text-accent">{rStats[RequestStatus.PRINTING] || 0}</p>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
                    <h3 className="text-sm font-medium text-green-400">Çevrimiçi Yazıcılar</h3>
                    <p className="mt-2 text-3xl font-bold text-green-400">{pStats[PrinterStatus.ONLINE] || 0}</p>
                </div>
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-6">
                    <h3 className="text-sm font-medium text-orange-400">Çalışan Yazıcılar</h3>
                    <p className="mt-2 text-3xl font-bold text-orange-400">{pStats[PrinterStatus.PRINTING] || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Low Stock Alerts */}
                <div className="rounded-xl border border-border bg-bg-card p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">Kritik Stok Seviyeleri (&lt;200g)</h2>
                    {lowStockFilaments.length > 0 ? (
                        <div className="space-y-4">
                            {lowStockFilaments.map(f => (
                                <div key={f.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${f.stock === 0 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        <div>
                                            <p className="font-medium text-white">{f.type} - {f.color}</p>
                                            <p className="text-xs text-text-secondary">{f.brand}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${f.stock === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {f.stock}g
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary">Tüm stoklar yeterli seviyede.</p>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="rounded-xl border border-border bg-bg-card p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">Son Siparişler</h2>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-4">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-white">{order.user?.name || 'Misafir'}</p>
                                        <p className="text-xs text-text-secondary">{order.serviceType} - {new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                    <span className="rounded-full bg-bg-secondary px-2 py-1 text-xs text-text-secondary">
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary">Henüz sipariş yok.</p>
                    )}
                </div>
            </div>

            {/* Detailed Order Status */}
            <h2 className="mb-4 mt-8 text-xl font-bold text-white">Sipariş Durumları</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                <StatusCard label="Bekliyor" count={rStats[RequestStatus.PENDING]} color="yellow" />
                <StatusCard label="Onaylandı" count={rStats[RequestStatus.APPROVED]} color="blue" />
                <StatusCard label="Geliştiriliyor" count={rStats[RequestStatus.DEVELOPING]} color="purple" />
                <StatusCard label="Yazdırılıyor" count={rStats[RequestStatus.PRINTING]} color="orange" />
                <StatusCard label="Paketleniyor" count={rStats[RequestStatus.PACKAGING]} color="indigo" />
                <StatusCard label="Kargolandı" count={rStats[RequestStatus.SHIPPED]} color="teal" />
                <StatusCard label="Teslim Edildi" count={rStats[RequestStatus.DELIVERED]} color="green" />
                <StatusCard label="Reddedildi" count={rStats[RequestStatus.DENIED]} color="red" />
            </div>
        </div>
    );
}

function StatusCard({ label, count, color }: { label: string, count?: number, color: string }) {
    const colorClasses: Record<string, string> = {
        yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
        blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
        orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
        indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
        teal: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
        green: 'border-green-500/30 bg-green-500/10 text-green-400',
        red: 'border-red-500/30 bg-red-500/10 text-red-400',
    };

    return (
        <div className={`rounded-lg border p-4 text-center ${colorClasses[color] || 'border-border bg-bg-card text-white'}`}>
            <h4 className="text-xs font-medium uppercase opacity-80">{label}</h4>
            <p className="mt-1 text-2xl font-bold">{count || 0}</p>
        </div>
    );
}
