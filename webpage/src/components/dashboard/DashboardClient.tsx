'use client';

import { useState } from 'react';
import Link from 'next/link';
import RequestCard from '@/components/RequestCard';
import ProfileForm from './ProfileForm';
import AddressManager from './AddressManager';
import PreferencesForm from './PreferencesForm';
import LegalConsents from './LegalConsents';
import { RequestStatus } from '@/types/enums';

interface DashboardClientProps {
    user: any;
    requests: any[];
    addresses: any[];
    savedFiles: any[];
}

type Tab = 'REQUESTS' | 'PROFILE' | 'ADDRESSES' | 'PREFERENCES' | 'LEGAL';

export default function DashboardClient({ user, requests, addresses, savedFiles }: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('REQUESTS');

    const tabs = [
        { id: 'REQUESTS', label: 'Taleplerim', icon: '📦' },
        { id: 'PROFILE', label: 'Profil Bilgileri', icon: '👤' },
        { id: 'ADDRESSES', label: 'Adreslerim', icon: '📍' },
        { id: 'PREFERENCES', label: 'Baskı Tercihleri', icon: '⚙️' },
        { id: 'LEGAL', label: 'Yasal İzinler', icon: '⚖️' },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-12 pt-32">
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white">Hesabım</h1>
                    <p className="text-text-secondary">Hoş geldin, {user.name || user.email}</p>
                </div>
                <Link
                    href="/quote"
                    className="rounded-full bg-accent px-6 py-2 font-semibold text-bg-primary transition-all hover:bg-accent-hover"
                >
                    Yeni Talep Oluştur
                </Link>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0">
                    <nav className="flex flex-col gap-2 rounded-xl border border-border bg-bg-card p-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-accent text-bg-primary'
                                    : 'text-text-secondary hover:bg-bg-secondary hover:text-white'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1">
                    {activeTab === 'REQUESTS' && (
                        <div>
                            <h2 className="mb-6 text-2xl font-bold text-white">Taleplerim</h2>
                            {requests.length === 0 ? (
                                <div className="rounded-xl border border-border bg-bg-card p-12 text-center">
                                    <p className="mb-4 text-text-secondary">Henüz bir baskı talebiniz bulunmuyor.</p>
                                    <Link href="/quote" className="text-accent hover:underline">
                                        İlk talebinizi oluşturun
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {requests.map((req) => (
                                        <RequestCard
                                            key={req.id}
                                            {...req}
                                            status={req.status as RequestStatus}
                                            addresses={addresses}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'PROFILE' && <ProfileForm user={user} />}
                    {activeTab === 'ADDRESSES' && <AddressManager addresses={addresses} />}
                    {activeTab === 'PREFERENCES' && <PreferencesForm user={user} />}
                    {activeTab === 'LEGAL' && <LegalConsents user={user} />}
                </div>
            </div>
        </div>
    );
}
