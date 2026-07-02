"use client"

interface ComplianceDashboardProps {
    complianceData: Record<string, unknown>
}

const ComplianceDashboard = ({ complianceData }: ComplianceDashboardProps) => {
    return (
        <div className="p-4 border rounded-md text-sm text-muted-foreground">
            Compliance Dashboard placeholder ({Object.keys(complianceData).length} standards)
        </div>
    )
}

export default ComplianceDashboard