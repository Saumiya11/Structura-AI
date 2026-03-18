export interface BridgeMaster {
  Bridge_ID: string;
  Bridge_Name: string;
  State: string;
  District: string;
  City: string;
  Latitude: number;
  Longitude: number;
  Year_Built: number;
  Designer: string;
  Material: string;
  Span_Meters: number;
  Design_Load_Tonnes: number;
  Number_of_Lanes: number;
  Current_Health_Pct: number;
  Last_Inspection_Date: string;
  Pending_Repairs: number;
  Daily_Traffic_Count: number;
  Heavy_Vehicle_Pct: number;
  Repair_Cost_Lakhs: number;
  Officer_Name: string;
  Officer_Phone: string;
  Officer_Designation: string;
  Notes: string;
}

export interface InspectionRecord {
  Bridge_ID: string;
  Inspection_Date: string;
  Inspector_Name: string;
  Health_Score_Pct: number;
  Findings: string;
  Severity: string;
  Repair_Recommended: string;
  Repairs_Done: string;
}

export interface CitizenReport {
  Report_ID: string;
  Bridge_ID: string;
  Report_Date: string;
  Description: string;
  Severity_1_to_10: number;
  Status: string;
  AI_Verdict: string;
}

export interface ContractorRecord {
  Bridge_ID: string;
  Contractor_Name: string;
  Work_Start_Date: string;
  SLA_Deadline: string;
  Budget_Allocated_Lakhs: number;
  Budget_Spent_Lakhs: number;
  Progress_Pct: number;
  Stage: string;
  Contact_Number: string;
}

export type RiskStatus = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE';

export interface BridgeWithRisk extends BridgeMaster {
  riskScore: number;
  riskStatus: RiskStatus;
  remainingLife: number;
  ageFactor: number;
  trafficLoadFactor: number;
  inspectionOverdueFactor: number;
  citizenFactor: number;
}

export interface SheetConnection {
  id: string;
  url: string;
  departmentName: string;
  cityRegion: string;
  connectedAt: string;
  lastSynced: string;
}

export interface AppData {
  bridges: BridgeMaster[];
  inspections: InspectionRecord[];
  citizenReports: CitizenReport[];
  contractors: ContractorRecord[];
}
