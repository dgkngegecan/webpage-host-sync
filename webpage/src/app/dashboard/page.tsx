import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/api/auth/signin");
    }

    // Ensure user exists in DB and get ID
    const userWithData = await getUserData(session.user.email);

    if (!userWithData) {
        // Handle case where session exists but user not in DB (rare)
        redirect("/api/auth/signin");
    }

    const requests = await prisma.printRequest.findMany({
        where: {
            userId: userWithData.id // Use ID from DB, not session
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <DashboardClient
            user={{ ...session.user, ...userWithData }}
            requests={requests}
            addresses={userWithData?.addresses || []}
            savedFiles={[]}
        />
    );
}

async function getUserData(email: string) {
    return await prisma.user.findUnique({
        where: { email },
        include: {
            addresses: true,
        }
    });
}
