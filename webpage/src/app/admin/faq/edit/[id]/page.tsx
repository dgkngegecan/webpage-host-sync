import prisma from "@/lib/prisma";
import EditFAQForm from "./EditFAQForm";
import { notFound } from "next/navigation";

export default async function EditFAQPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const faq = await prisma.fAQ.findUnique({
        where: { id: params.id }
    });

    if (!faq) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl py-12 pt-32">
            <h1 className="mb-8 text-3xl font-bold text-white">Soruyu Düzenle</h1>
            <EditFAQForm faq={faq} />
        </div>
    );
}
