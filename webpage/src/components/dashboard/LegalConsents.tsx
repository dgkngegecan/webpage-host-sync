'use client';

import { useState } from 'react';
import { updateConsents } from '@/app/actions/user';

interface LegalConsentsProps {
    user: any;
}

export default function LegalConsents({ user }: LegalConsentsProps) {
    const [consents, setConsents] = useState({
        termsAccepted: !!user.termsAccepted,
        kvkkAccepted: !!user.kvkkAccepted,
        marketingAccepted: !!user.marketingAccepted,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggle = async (key: keyof typeof consents) => {
        const newValue = !consents[key];
        setConsents(prev => ({ ...prev, [key]: newValue }));

        // Auto-save on toggle
        setIsSubmitting(true);
        await updateConsents({ [key]: newValue });
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 rounded-xl border border-border bg-bg-card p-6">
            <h3 className="text-xl font-bold text-white">Yasal İzinler ve Onaylar</h3>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={consents.termsAccepted}
                        onChange={() => handleToggle('termsAccepted')}
                        className="mt-1 h-4 w-4 rounded border-border bg-bg-secondary text-accent focus:ring-accent"
                    />
                    <div>
                        <label className="block font-medium text-white">Üyelik Sözleşmesi ve Kullanım Koşulları</label>
                        <p className="text-xs text-text-secondary">
                            Hizmet şartlarını okudum ve kabul ediyorum.
                            <a href="#" className="ml-1 text-accent hover:underline">Sözleşmeyi Görüntüle</a>
                        </p>
                        {user.termsAccepted && <span className="text-xs text-green-400">Onaylandı: {new Date(user.termsAccepted).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={consents.kvkkAccepted}
                        onChange={() => handleToggle('kvkkAccepted')}
                        className="mt-1 h-4 w-4 rounded border-border bg-bg-secondary text-accent focus:ring-accent"
                    />
                    <div>
                        <label className="block font-medium text-white">KVKK Aydınlatma Metni</label>
                        <p className="text-xs text-text-secondary">
                            Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum.
                            <a href="#" className="ml-1 text-accent hover:underline">Metni Görüntüle</a>
                        </p>
                        {user.kvkkAccepted && <span className="text-xs text-green-400">Onaylandı: {new Date(user.kvkkAccepted).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={consents.marketingAccepted}
                        onChange={() => handleToggle('marketingAccepted')}
                        className="mt-1 h-4 w-4 rounded border-border bg-bg-secondary text-accent focus:ring-accent"
                    />
                    <div>
                        <label className="block font-medium text-white">Ticari Elektronik İleti İzni</label>
                        <p className="text-xs text-text-secondary">
                            Kampanya ve duyurulardan haberdar olmak için E-posta ve SMS gönderimine izin veriyorum.
                        </p>
                        {user.marketingAccepted && <span className="text-xs text-green-400">Onaylandı: {new Date(user.marketingAccepted).toLocaleDateString()}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
