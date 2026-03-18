import { BridgeMaster, BridgeWithRisk, InspectionRecord, CitizenReport, RiskStatus } from '@/types/bridge';

export function calculateRiskScore(
  bridge: BridgeMaster,
  inspections: InspectionRecord[],
  reports: CitizenReport[]
): { riskScore: number; riskStatus: RiskStatus; remainingLife: number; ageFactor: number; trafficLoadFactor: number; inspectionOverdueFactor: number; citizenFactor: number } {
  const currentYear = new Date().getFullYear();
  const healthFactor = (100 - (bridge.Current_Health_Pct || 100)) * 0.35;
  const age = currentYear - (bridge.Year_Built || currentYear);
  const ageFactor = Math.min((age / 60) * 100, 100);
  const trafficLoadFactor = bridge.Design_Load_Tonnes > 0
    ? Math.min((bridge.Daily_Traffic_Count / (bridge.Design_Load_Tonnes * 100)) * 100, 100)
    : 0;

  const lastInspDate = bridge.Last_Inspection_Date ? new Date(bridge.Last_Inspection_Date) : null;
  const monthsSince = lastInspDate
    ? (Date.now() - lastInspDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    : 24;
  const inspectionOverdueFactor = Math.min((monthsSince / 24) * 100, 100);

  const bridgeReports = reports.filter(r => r.Bridge_ID === bridge.Bridge_ID);
  const reportsThisYear = bridgeReports.filter(r => {
    const d = new Date(r.Report_Date);
    return d.getFullYear() === currentYear;
  }).length;
  const citizenFactor = Math.min(reportsThisYear * 10, 100);

  const riskScore = Math.round(
    healthFactor + ageFactor * 0.20 + trafficLoadFactor * 0.20
    + inspectionOverdueFactor * 0.15 + citizenFactor * 0.10
  );

  let riskStatus: RiskStatus = 'ROUTINE';
  if (riskScore >= 80) riskStatus = 'CRITICAL';
  else if (riskScore >= 60) riskStatus = 'HIGH';
  else if (riskScore >= 40) riskStatus = 'MODERATE';

  const designLife = 100;
  const remainingLife = Math.max(0, designLife - age);

  return { riskScore, riskStatus, remainingLife, ageFactor, trafficLoadFactor, inspectionOverdueFactor, citizenFactor };
}

export function enrichBridges(
  bridges: BridgeMaster[],
  inspections: InspectionRecord[],
  reports: CitizenReport[]
): BridgeWithRisk[] {
  return bridges.map(b => ({
    ...b,
    ...calculateRiskScore(b, inspections, reports),
  }));
}

export function getCostEscalation(currentCost: number, years: number): number {
  return Math.round(currentCost * Math.pow(1.35, years) * 100) / 100;
}

export function getRiskStatusColor(status: RiskStatus): string {
  switch (status) {
    case 'CRITICAL': return 'risk-critical';
    case 'HIGH': return 'risk-high';
    case 'MODERATE': return 'risk-moderate';
    case 'ROUTINE': return 'risk-routine';
  }
}
