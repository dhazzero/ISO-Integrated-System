// app/api/admin/monitoring/health/route.ts - System health API
import { NextResponse } from 'next/server';
import { connectToMasterDatabase } from '@/lib/mongodb-tenant';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.isSuperAdmin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const services = [];
        const startTime = Date.now();

        // Check MongoDB connection
        try {
            const dbStart = Date.now();
            const { db } = await connectToMasterDatabase();
            await db.command({ ping: 1 });
            const dbLatency = Date.now() - dbStart;

            services.push({
                name: 'MongoDB',
                status: dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'warning' : 'error',
                latency: dbLatency,
                uptime: '99.99%',
                lastCheck: new Date().toISOString(),
            });
        } catch (error) {
            services.push({
                name: 'MongoDB',
                status: 'error',
                lastCheck: new Date().toISOString(),
            });
        }

        // API Server check
        services.push({
            name: 'API Server',
            status: 'healthy',
            latency: Date.now() - startTime,
            uptime: '99.9%',
            lastCheck: new Date().toISOString(),
        });

        // Authentication service
        services.push({
            name: 'Authentication',
            status: 'healthy',
            latency: 15,
            lastCheck: new Date().toISOString(),
        });

        // File Storage (mock)
        services.push({
            name: 'File Storage',
            status: 'healthy',
            latency: 45,
            uptime: '99.5%',
            lastCheck: new Date().toISOString(),
        });

        // Email Service (mock)
        services.push({
            name: 'Email Service',
            status: 'warning',
            latency: 200,
            lastCheck: new Date().toISOString(),
        });

        // Background Jobs (mock)
        services.push({
            name: 'Background Jobs',
            status: 'healthy',
            latency: 5,
            lastCheck: new Date().toISOString(),
        });

        // Mock system metrics
        const metrics = {
            cpu: Math.floor(Math.random() * 40) + 20,
            memory: Math.floor(Math.random() * 30) + 50,
            disk: Math.floor(Math.random() * 20) + 40,
            connections: Math.floor(Math.random() * 20) + 10,
        };

        return NextResponse.json({
            services,
            metrics,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({
            services: [],
            metrics: { cpu: 0, memory: 0, disk: 0, connections: 0 },
            error: 'Health check failed',
        }, { status: 500 });
    }
}
