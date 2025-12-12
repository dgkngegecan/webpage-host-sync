'use client';

import { useState, useEffect } from 'react';

interface SystemStats {
    cpuUsage: number;
    memoryUsage: number;
    uptime: number;
}

export default function SystemHealth() {
    const [stats, setStats] = useState<SystemStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/health');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch system stats', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    if (!stats) return <div className="animate-pulse h-24 bg-bg-secondary/30 rounded-xl"></div>;

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-secondary">CPU Kullanımı</h3>
                    <span className={`text-lg font-bold ${stats.cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}`}>
                        %{stats.cpuUsage.toFixed(1)}
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-bg-primary">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${stats.cpuUsage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${stats.cpuUsage}%` }}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-secondary">RAM Kullanımı</h3>
                    <span className={`text-lg font-bold ${stats.memoryUsage > 80 ? 'text-yellow-500' : 'text-blue-500'}`}>
                        %{stats.memoryUsage.toFixed(1)}
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-bg-primary">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${stats.memoryUsage > 80 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                        style={{ width: `${stats.memoryUsage}%` }}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-secondary/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-secondary">Çalışma Süresi</h3>
                    <span className="text-lg font-bold text-white">
                        {Math.floor(stats.uptime / 3600)}s {Math.floor((stats.uptime % 3600) / 60)}dk
                    </span>
                </div>
                <p className="text-xs text-text-secondary">Sunucu aktif</p>
            </div>
        </div>
    );
}
