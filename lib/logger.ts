// lib/logger.ts
export const logActivity = async (action: string, module: string, description: string) => {
    try {
        await fetch('/api/logs/security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, module, description }),
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};