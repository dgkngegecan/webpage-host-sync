import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <AdminSidebar />

            {/* Main Content - Adjusted for fixed sidebar */}
            <main className="min-h-screen p-4 pt-24 transition-all md:p-8 md:pl-80">
                {children}
            </main>
        </div>
    );
}
