import PricingManager from "@/components/admin/PricingManager";

export default function PricingPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Fiyatlandırma Yönetimi</h1>
            <p className="text-text-secondary">
                Hızlı fiyat hesaplama motoru için temel parametreleri ve malzeme maliyetlerini buradan yönetebilirsiniz.
            </p>
            <PricingManager />
        </div>
    );
}
