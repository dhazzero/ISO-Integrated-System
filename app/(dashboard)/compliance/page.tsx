"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import ComplianceChecklist from "../../../components/compliance/compliance-checklist"
import AnnexAControls from "../../../components/compliance/annex-a-controls"
import IntegratedStandardTable from "../../../components/compliance/integrated-standard-table"
import OjkComplianceReport from "../../../components/compliance/ojk-compliance-report"
import { TrendingUp, BarChart3, FileText, CheckCircle2, AlertTriangle } from "lucide-react"


// Definisikan tipe data
interface StandardSummary {
    _id: string
    name: string
    total: number
    implemented: number
    compliance: number
    docsLinked: number
    docPercentage: number
}

interface ComplianceFeatures {
    checklist: boolean
    integrated: boolean
    annexA: boolean
    ojk: boolean
}

export default function CompliancePage() {
    const [standards, setStandards] = useState<StandardSummary[]>([])
    const [overallCompliance, setOverallCompliance] = useState<number>(0)
    const [totalClauses, setTotalClauses] = useState<number>(0)
    const [totalStandards, setTotalStandards] = useState<number>(0)
    const [totalCompliant, setTotalCompliant] = useState<number>(0)
    const [totalNonCompliant, setTotalNonCompliant] = useState<number>(0)
    const [totalPartial, setTotalPartial] = useState<number>(0)
    const [complianceFeatures, setComplianceFeatures] = useState<ComplianceFeatures>({
        checklist: true,
        integrated: true,
        annexA: true,
        ojk: true
    })
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [stdRes, ctrlRes, annexRes, ojkRes, settingsRes] = await Promise.all([
                fetch('/api/settings/standards'),
                fetch('/api/compliance/controls'),
                fetch('/api/compliance/annex-a'),
                fetch('/api/compliance/ojk-reports'),
                fetch('/api/settings/system-settings'),
            ])

            if (!stdRes.ok || !ctrlRes.ok || !annexRes.ok || !ojkRes.ok) {
                throw new Error('Gagal mengambil data kepatuhan')
            }

            const [stdData, ctrlData, annexData, ojkData, settingsData] = await Promise.all([
                stdRes.json(),
                ctrlRes.json(),
                annexRes.json(),
                ojkRes.json(),
                settingsRes.ok ? settingsRes.json() : {}
            ]) as any[]

            // Set compliance features with proper defaults
            const defaultFeatures = {
                checklist: true,
                integrated: true,
                annexA: true,
                ojk: true
            }

            if (settingsData.complianceFeatures) {
                // Merge saved settings with defaults (saved settings take precedence)
                setComplianceFeatures({
                    ...defaultFeatures,
                    ...settingsData.complianceFeatures
                })
            } else {
                setComplianceFeatures(defaultFeatures)
            }

            const implementedStatuses = ['Diterapkan', 'Diterapkan / Implemented', 'Implemented', 'Dilaporkan', 'Sudah Dilaporkan']
            const partialStatuses = ['Partial', 'Sebagian', 'Partially Implemented', 'Under Review']

            const summaries = stdData.map((std: { _id: string; name?: string; title?: string }) => {
                const name = std.name || std.title || ''
                const relatedControls = ctrlData.filter((c: any) => (c.relatedStandards || []).includes(name))
                const relatedAnnex = annexData.filter((a: any) => a.standardName === name)
                const total = relatedControls.length + relatedAnnex.length
                const implemented = [...relatedControls, ...relatedAnnex].filter((c: any) => implementedStatuses.includes(c.status)).length
                const docsLinked = relatedControls.filter(
                    (c: any) => Array.isArray(c.documentIds) && c.documentIds.length > 0
                ).length
                const compliance = total ? Math.round((implemented / total) * 100) : 0
                const docPercentage = relatedControls.length ? Math.round((docsLinked / relatedControls.length) * 100) : 0
                return {
                    _id: std._id,
                    name,
                    total,
                    implemented,
                    compliance,
                    docsLinked,
                    docPercentage,
                }
            })

            const normalizedOjk = (ojkData.records || ojkData).map((o: any) => ({ ...o, status: o.Status }));
            const allItems = [...ctrlData, ...annexData, ...normalizedOjk]
            const totalClausesAgg = allItems.length
            const totalStandardsAgg = Array.isArray(stdData) ? stdData.length : 0
            const totalCompliantAgg = allItems.filter((x: any) => implementedStatuses.includes(x.status || '')).length
            const totalPartialAgg = allItems.filter((x: any) => partialStatuses.includes(x.status || '')).length
            const totalNonCompliantAgg = allItems.filter((x: any) => {
                const s = x.status || ''
                return s && !implementedStatuses.includes(s) && !partialStatuses.includes(s)
            }).length
            const overallComplianceAgg = totalClausesAgg ? Math.round((totalCompliantAgg / totalClausesAgg) * 100) : 0

            setStandards(summaries)
            setTotalClauses(totalClausesAgg)
            setTotalStandards(totalStandardsAgg)
            setTotalCompliant(totalCompliantAgg)
            setTotalPartial(totalPartialAgg)
            setTotalNonCompliant(totalNonCompliantAgg)
            setOverallCompliance(overallComplianceAgg)
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message })
        }
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Pemetaan Kepatuhan</h1>
            </div>

            {/* Top Header Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Compliance</p>
                                <p className="text-3xl font-bold">{overallCompliance}%</p>
                                <div className="flex items-center mt-2">
                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">+5% from last month</span>
                                </div>
                            </div>
                            <BarChart3 className="h-12 w-12 text-blue-500" />
                        </div>
                        <Progress value={overallCompliance} className="mt-4" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Clauses</p>
                                <p className="text-3xl font-bold">{totalClauses}</p>
                                <p className="text-sm text-muted-foreground mt-2">Across {totalStandards} standards</p>
                            </div>
                            <FileText className="h-12 w-12 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                                <p className="text-3xl font-bold text-green-600">{totalCompliant}</p>
                                <p className="text-sm text-green-600 mt-2">
                                    {totalClauses ? Math.round((totalCompliant / totalClauses) * 100) : 0}% of total
                                </p>
                            </div>
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                                <p className="text-3xl font-bold text-red-600">{totalNonCompliant + totalPartial}</p>
                                <p className="text-sm text-red-600 mt-2">
                                    {totalClauses ? Math.round(((totalNonCompliant + totalPartial) / totalClauses) * 100) : 0}% of total
                                </p>
                            </div>
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>


            <Tabs defaultValue={
                complianceFeatures.checklist ? "checklist" :
                    complianceFeatures.integrated ? "integrated" :
                        complianceFeatures.annexA ? "annex-a" :
                            complianceFeatures.ojk ? "ojk-report" : ""
            } className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2">
                    {complianceFeatures.checklist && <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>}
                    {complianceFeatures.integrated && <TabsTrigger value="integrated">Integrated Standards</TabsTrigger>}
                    {complianceFeatures.annexA && <TabsTrigger value="annex-a">ISO 27001 Annex A</TabsTrigger>}
                    {complianceFeatures.ojk && <TabsTrigger value="ojk-report">Pelaporan Regulasi</TabsTrigger>}
                </TabsList>

                {complianceFeatures.checklist && (
                    <TabsContent value="checklist">
                        <ComplianceChecklist />
                    </TabsContent>
                )}
                {complianceFeatures.integrated && (
                    <TabsContent value="integrated">
                        <IntegratedStandardTable />
                    </TabsContent>
                )}
                {complianceFeatures.annexA && (
                    <TabsContent value="annex-a">
                        <AnnexAControls />
                    </TabsContent>
                )}
                {complianceFeatures.ojk && (
                    <TabsContent value="ojk-report">
                        <OjkComplianceReport />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}