import { RequestStatus } from "@/types/enums";
import React from "react";

interface OrderStepperProps {
    status: RequestStatus;
}

const steps = [
    { id: 'RECEIVED', label: 'Alındı', statuses: [RequestStatus.PENDING, RequestStatus.QUOTED] },
    { id: 'APPROVED', label: 'Onaylandı', statuses: [RequestStatus.APPROVED, RequestStatus.DEVELOPING] },
    { id: 'PRINTING', label: 'Baskıda', statuses: [RequestStatus.PRINTING, RequestStatus.PACKAGING] },
    { id: 'SHIPPED', label: 'Kargoda', statuses: [RequestStatus.SHIPPED] },
    { id: 'DELIVERED', label: 'Teslim Edildi', statuses: [RequestStatus.DELIVERED] },
];

export default function OrderStepper({ status }: OrderStepperProps) {
    // Determine current step index
    const getCurrentStepIndex = () => {
        if (status === RequestStatus.DENIED) return -1;

        for (let i = steps.length - 1; i >= 0; i--) {
            if (steps[i].statuses.includes(status)) {
                return i;
            }
        }

        // Fallback for sequential progress check if exact match not found (though statuses should cover all)
        // Check if status is "past" a step? 
        // Simpler: Just map all enums to an index.
        const statusOrder = [
            RequestStatus.PENDING,
            RequestStatus.QUOTED,
            RequestStatus.APPROVED,
            RequestStatus.DEVELOPING,
            RequestStatus.PRINTING,
            RequestStatus.PACKAGING,
            RequestStatus.SHIPPED,
            RequestStatus.DELIVERED
        ];

        const currentIndex = statusOrder.indexOf(status);

        // Map linear index to step index
        if (currentIndex <= 1) return 0; // PENDING, QUOTED -> RECEIVED
        if (currentIndex <= 3) return 1; // APPROVED, DEVELOPING -> APPROVED
        if (currentIndex <= 5) return 2; // PRINTING, PACKAGING -> PRINTING
        if (currentIndex === 6) return 3; // SHIPPED -> SHIPPED
        if (currentIndex === 7) return 4; // DELIVERED -> DELIVERED

        return 0;
    };

    const currentStep = getCurrentStepIndex();

    if (status === RequestStatus.DENIED) {
        return (
            <div className="w-full py-4">
                <div className="flex items-center justify-center rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
                    <span className="font-bold">Bu sipariş reddedildi.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-bg-secondary"></div>

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-accent transition-all duration-500"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                                        ? 'border-accent bg-accent text-bg-primary'
                                        : 'border-bg-secondary bg-bg-card text-text-secondary'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <span className="text-xs">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`absolute -bottom-6 whitespace-nowrap text-xs font-medium transition-colors ${isCompleted ? 'text-white' : 'text-text-secondary'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
