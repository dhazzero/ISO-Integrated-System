// app/api/companies/route.ts - List companies for login dropdown
import { NextResponse } from 'next/server';
import { getAllCompanies } from '@/lib/mongodb-tenant';

export async function GET() {
    try {
        const companies = await getAllCompanies();

        // Return only necessary fields for login dropdown
        const companyOptions = companies.map(company => ({
            code: company.code,
            name: company.name,
            logo: company.logo || null
        }));

        return NextResponse.json({
            companies: companyOptions
        });
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        // Return empty array on error to allow manual input
        return NextResponse.json({ companies: [] });
    }
}
