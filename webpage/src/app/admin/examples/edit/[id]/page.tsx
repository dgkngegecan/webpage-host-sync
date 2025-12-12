import prisma from "@/lib/prisma";
import EditExampleForm from "./EditExampleForm";
import { notFound } from "next/navigation";

export default async function EditExamplePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const example = await prisma.examplePrint.findUnique({
        where: { id: params.id }
    });

    if (!example) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl py-12 pt-32">
            <h1 className="mb-8 text-3xl font-bold text-white">Örnek Baskıyı Düzenle</h1>
            <EditExampleForm example={example} />
        </div>
    );
}
