import prisma from "@/lib/prisma";
import { updatePrinterStatus } from "@/app/actions/printers";
import { updateFilamentStock } from "@/app/actions/filaments";
import Link from "next/link";
import InventoryList from "@/components/admin/InventoryList"; // We'll create a client component for interactivity

export default async function InventoryPage() {
    const printers = await prisma.printer.findMany();
    const filaments = await prisma.filament.findMany();

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Envanter Yönetimi</h1>
                <div className="flex gap-4">
                    <Link href="/admin/inventory/add-printer" className="rounded-lg bg-accent px-4 py-2 font-bold text-bg-primary hover:bg-accent-hover">
                        + Yazıcı Ekle
                    </Link>
                    <Link href="/admin/inventory/add-filament" className="rounded-lg bg-accent px-4 py-2 font-bold text-bg-primary hover:bg-accent-hover">
                        + Filament Ekle
                    </Link>
                </div>
            </div>
            <InventoryList printers={printers} filaments={filaments} />
        </div>
    );
}
