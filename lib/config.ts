// Application configuration constants
// This file contains system-wide configuration values

export const APP_CONFIG = {
    // Application name
    name: 'ISO Integrated System',

    // Application version - update this when releasing new versions
    version: '1.0.0',

    // License information
    licenseKey: 'ISO-2024-ENTERPRISE-001',

    // Default organization info
    defaultCompanyName: 'PT. Contoh Indonesia',
} as const;

// Export individual constants for convenience
export const APP_VERSION = APP_CONFIG.version;
export const APP_NAME = APP_CONFIG.name;
export const LICENSE_KEY = APP_CONFIG.licenseKey;
