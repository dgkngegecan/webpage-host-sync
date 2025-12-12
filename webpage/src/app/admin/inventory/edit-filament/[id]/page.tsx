import prisma from "@/lib/prisma";
import EditFilamentForm from "./EditFilamentForm";
import { notFound } from "next/navigation";

export default async function EditFilamentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const filament = await prisma.filament.findUnique({
        where: { id: params.id }
    });

    if (!filament) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl py-12 pt-32">
            <h1 className="mb-8 text-3xl font-bold text-white">Filamenti Düzenle</h1>
            <EditFilamentForm filament={filament} />
        </div>
    );
}
