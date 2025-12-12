import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    // Calculate CPU Usage
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
        for (const type in cpu.times) {
            total += (cpu.times as any)[type];
        }
        idle += cpu.times.idle;
    }

    // This is a snapshot, for real usage we'd need to compare two snapshots.
    // For simplicity in this "home server" context, we'll approximate load average.
    const loadAvg = os.loadavg()[0]; // 1 minute load average
    const cpuUsage = Math.min(100, (loadAvg / cpus.length) * 100);

    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    const uptime = os.uptime();

    return NextResponse.json({
        cpuUsage,
        memoryUsage,
        uptime
    });
}
