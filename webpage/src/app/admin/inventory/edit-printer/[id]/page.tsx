import prisma from "@/lib/prisma";
import EditPrinterForm from "./EditPrinterForm";
import { notFound } from "next/navigation";

export default async function EditPrinterPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const printer = await prisma.printer.findUnique({
        where: { id: params.id }
    });

    if (!printer) {
        notFound();
    }

    return (
        <div className="max-w-2xl py-12 pt-32 mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-white">Yazıcıyı Düzenle</h1>
            <EditPrinterForm printer={printer} />
        </div>
    );
}
