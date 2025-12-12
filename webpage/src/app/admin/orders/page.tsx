import prisma from "@/lib/prisma";
import OrderList from "@/components/admin/OrderList";

export default async function OrdersPage() {
    const orders = await prisma.printRequest.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div>
            <h1 className="mb-8 text-3xl font-bold text-white">Sipariş Yönetimi</h1>
            <OrderList orders={orders} />
        </div>
    );
}
