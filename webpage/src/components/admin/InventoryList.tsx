'use client';

import { Printer, Filament } from "@prisma/client";
import { PrinterStatus } from "@/types/enums";
import { updatePrinterStatus, deletePrinter } from "@/app/actions/printers";
import { updateFilamentStock, deleteFilament } from "@/app/actions/filaments";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

interface Props {
    printers: Printer[];
    filaments: Filament[];
}

export default function InventoryList({ printers, filaments }: Props) {
    const [selectedFilaments, setSelectedFilaments] = useState<string[]>([]);
    const { success, error } = useToast();

    const toggleSelectAll = () => {
        if (selectedFilaments.length === filaments.length) {
            setSelectedFilaments([]);
        } else {
            setSelectedFilaments(filaments.map(f => f.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedFilaments.includes(id)) {
            setSelectedFilaments(selectedFilaments.filter(fid => fid !== id));
        } else {
            setSelectedFilaments([...selectedFilaments, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`${selectedFilaments.length} filamenti silmek istediğinize emin misiniz?`)) return;

        try {
            await Promise.all(selectedFilaments.map(id => deleteFilament(id)));
            success(`${selectedFilaments.length} filament silindi`);
            setSelectedFilaments([]);
        } catch (err) {
            error('Silme işlemi sırasında hata oluştu');
        }
    };

    return (
        <div className="space-y-12">
            {/* Printers Section */}
            <section>
                <h2 className="mb-6 text-2xl font-bold text-white">Yazıcılar</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {printers.map((printer) => (
                        <PrinterItem key={printer.id} printer={printer} />
                    ))}
                </div>
            </section>

            {/* Filaments Section */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Filamentler</h2>
                    {selectedFilaments.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20"
                        >
                            Seçilenleri Sil ({selectedFilaments.length})
                        </button>
                    )}
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
                    <table className="w-full text-left text-sm text-text-secondary">
                        <thead className="bg-bg-secondary text-xs uppercase text-text-primary">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filaments.length > 0 && selectedFilaments.length === filaments.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-border bg-bg-primary text-accent focus:ring-accent"
                                    />
                                </th>
                                <th className="px-6 py-3">Tür</th>
                                <th className="px-6 py-3">Renk</th>
                                <th className="px-6 py-3">Stok (g)</th>
                                <th className="px-6 py-3">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filaments.map((filament) => (
                                <FilamentItem
                                    key={filament.id}
                                    filament={filament}
                                    selected={selectedFilaments.includes(filament.id)}
                                    onSelect={() => toggleSelect(filament.id)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function PrinterItem({ printer }: { printer: Printer }) {
    const [status, setStatus] = useState(printer.status as PrinterStatus);

    const handleStatusChange = async (newStatus: PrinterStatus) => {
        setStatus(newStatus);
        await updatePrinterStatus(printer.id, newStatus);
    };

    const handleDelete = async () => {
        if (confirm('Bu yazıcıyı silmek istediğinize emin misiniz?')) {
            await deletePrinter(printer.id);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {printer.imageUrl ? (
                        <Image src={printer.imageUrl} alt={printer.name} width={48} height={48} className="rounded-lg object-cover" />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-secondary text-xl">🖨️</div>
                    )}
                    <h3 className="font-bold text-white">{printer.name}</h3>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === 'ONLINE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {status}
                </span>
            </div>
            <div className="space-y-4">
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as PrinterStatus)}
                    className="w-full rounded-lg border border-border bg-bg-secondary p-2 text-white"
                >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="PRINTING">PRINTING</option>
                </select>
                <Link href={`/admin/inventory/edit-printer/${printer.id}`} className="block w-full rounded-lg border border-accent/50 p-2 text-center text-sm text-accent hover:bg-accent/10">
                    Düzenle
                </Link>
                <button onClick={handleDelete} className="w-full rounded-lg border border-red-500/50 p-2 text-sm text-red-400 hover:bg-red-500/10">
                    Sil
                </button>
            </div>
        </div>
    );
}

function FilamentItem({ filament, selected, onSelect }: { filament: Filament, selected: boolean, onSelect: () => void }) {
    const [stock, setStock] = useState(filament.stock);
    const { success } = useToast();

    const handleUpdate = async () => {
        await updateFilamentStock(filament.id, stock);
        success('Stok güncellendi');
    };

    const handleDelete = async () => {
        if (confirm('Bu filamenti silmek istediğinize emin misiniz?')) {
            await deleteFilament(filament.id);
        }
    };

    return (
        <tr className={`border-b border-border hover:bg-bg-hover ${selected ? 'bg-accent/5' : ''}`}>
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onSelect}
                    className="rounded border-border bg-bg-primary text-accent focus:ring-accent"
                />
            </td>
            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                {filament.imageUrl ? (
                    <Image src={filament.imageUrl} alt={filament.type} width={32} height={32} className="rounded object-cover" />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-bg-secondary text-sm">🧵</div>
                )}
                {filament.type}
            </td>
            <td className="px-6 py-4">{filament.color}</td>
            <td className="px-6 py-4">
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value))}
                    className="w-24 rounded border border-border bg-bg-secondary px-2 py-1 text-white"
                />
            </td>
            <td className="px-6 py-4 flex gap-4">
                <button onClick={handleUpdate} className="text-accent hover:underline">Güncelle</button>
                <Link href={`/admin/inventory/edit-filament/${filament.id}`} className="text-blue-400 hover:underline">
                    Düzenle
                </Link>
                <button onClick={handleDelete} className="text-red-400 hover:underline">Sil</button>
            </td>
        </tr>
    );
}
