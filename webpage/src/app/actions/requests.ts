'use server'

import prisma from "@/lib/prisma";
import { RequestStatus } from "@/types/enums";
import { revalidatePath } from "next/cache";

export async function submitFeedback(id: string, rating: number, feedback: string) {
    await prisma.printRequest.update({
        where: { id },
        data: { rating, feedback }
    });
    revalidatePath('/dashboard');
}

export async function createPrintRequest(data: {
    userId?: string;
    serviceType: string;
    description: string;
    fileUrl?: string;
    material?: string;
    color?: string;
}) {
    const request = await prisma.printRequest.create({
        data: {
            userId: data.userId,
            serviceType: data.serviceType,
            description: data.description,
            fileUrl: data.fileUrl,
            material: data.material,
            color: data.color,
            status: 'PENDING'
        }
    });
    revalidatePath('/dashboard');
    revalidatePath('/admin/orders');
    return request;
}

export async function getPrintRequests() {
    return await prisma.printRequest.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateRequestStatus(id: string, status: RequestStatus, adminNote?: string, trackingCode?: string, finalPrice?: number, trackingUrl?: string, discountApplied?: number) {
    const request = await prisma.printRequest.update({
        where: { id },
        data: {
            status,
            adminNote,
            trackingCode,
            trackingUrl,
            finalPrice,
            discountApplied
        }
    });

    // Stock Deduction Logic
    if (status === 'PACKAGING') {
        try {
            // 1. Parse Material String (e.g., "PLA - Siyah")
            if (request.material) {
                const [type, color] = request.material.split(' - ').map(s => s.trim());

                // 2. Find Matching Filament
                const filament = await prisma.filament.findFirst({
                    where: {
                        type: { contains: type }, // Flexible match
                        color: { contains: color }
                    }
                });

                // 3. Deduct Stock
                if (filament) {
                    // Use usedFilament if available, otherwise estimate from description or default
                    // For now, we'll assume a default weight if not specified, or parse from description if possible
                    // Ideally, usedFilament should be set by admin before this step.
                    // Fallback: 50g (heuristic)
                    const amountToDeduct = request.usedFilament || 50;

                    await prisma.filament.update({
                        where: { id: filament.id },
                        data: { stock: { decrement: amountToDeduct } }
                    });
                    console.log(`Deducted ${amountToDeduct}g from ${filament.type} ${filament.color}`);
                }
            }
        } catch (error) {
            console.error('Stock deduction failed:', error);
            // Don't fail the request update just because stock failed
        }
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/orders');
    return request;
}
export async function getFeedbackRequests() {
    return await prisma.printRequest.findMany({
        where: {
            status: 'DELIVERED',
            rating: { not: null }
        },
        include: { user: true },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function updateFeedbackStatus(id: string, adminResponse: string, isPublic: boolean) {
    await prisma.printRequest.update({
        where: { id },
        data: { adminResponse, isPublic }
    });
    revalidatePath('/admin/feedback');
}

export async function approveQuote(requestId: string, addressId: string) {
    await prisma.printRequest.update({
        where: { id: requestId },
        data: {
            status: 'APPROVED',
            shippingAddressId: addressId
        }
    });
    revalidatePath('/dashboard');
}

export async function reorderRequest(id: string) {
    const originalRequest = await prisma.printRequest.findUnique({
        where: { id },
    });

    if (!originalRequest) {
        throw new Error("Sipariş bulunamadı");
    }

    const newRequest = await prisma.printRequest.create({
        data: {
            userId: originalRequest.userId,
            serviceType: originalRequest.serviceType,
            description: originalRequest.description,
            fileUrl: originalRequest.fileUrl, // Optimization: Reusing the same file URL
            material: originalRequest.material,
            color: originalRequest.color,
            status: 'PENDING',
            // Resetting pricing and admin fields
            estimatedPrice: originalRequest.estimatedPrice, // Keep estimated price as a baseline
        }
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin/orders');
    return newRequest;
}
