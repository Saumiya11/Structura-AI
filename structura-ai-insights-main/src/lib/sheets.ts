import { BridgeMaster, InspectionRecord, CitizenReport, ContractorRecord, AppData } from '@/types/bridge';

function getSheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function getCSVUrl(sheetUrl: string, sheetName: string): string {
  const sheetId = getSheetId(sheetUrl);
  if (!sheetId) throw new Error('Invalid Google Sheets URL');
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function num(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function parseBridges(rows: Record<string, string>[]): BridgeMaster[] {
  return rows.map(r => ({
    Bridge_ID: r['Bridge_ID'] || '',
    Bridge_Name: r['Bridge_Name'] || '',
    State: r['State'] || '',
    District: r['District'] || '',
    City: r['City'] || '',
    Latitude: num(r['Latitude']),
    Longitude: num(r['Longitude']),
    Year_Built: num(r['Year_Built']),
    Designer: r['Designer'] || '',
    Material: r['Material'] || '',
    Span_Meters: num(r['Span_Meters']),
    Design_Load_Tonnes: num(r['Design_Load_Tonnes']),
    Number_of_Lanes: num(r['Number_of_Lanes']),
    Current_Health_Pct: num(r['Current_Health_%'] || r['Current_Health_Pct']),
    Last_Inspection_Date: r['Last_Inspection_Date'] || '',
    Pending_Repairs: num(r['Pending_Repairs']),
    Daily_Traffic_Count: num(r['Daily_Traffic_Count']),
    Heavy_Vehicle_Pct: num(r['Heavy_Vehicle_%'] || r['Heavy_Vehicle_Pct']),
    Repair_Cost_Lakhs: num(r['Repair_Cost_Lakhs']),
    Officer_Name: r['Officer_Name'] || '',
    Officer_Phone: r['Officer_Phone'] || '',
    Officer_Designation: r['Officer_Designation'] || '',
    Notes: r['Notes'] || '',
  })).filter(b => b.Bridge_ID);
}

function parseInspections(rows: Record<string, string>[]): InspectionRecord[] {
  return rows.map(r => ({
    Bridge_ID: r['Bridge_ID'] || '',
    Inspection_Date: r['Inspection_Date'] || '',
    Inspector_Name: r['Inspector_Name'] || '',
    Health_Score_Pct: num(r['Health_Score_%'] || r['Health_Score_Pct']),
    Findings: r['Findings'] || '',
    Severity: r['Severity'] || '',
    Repair_Recommended: r['Repair_Recommended'] || '',
    Repairs_Done: r['Repairs_Done'] || '',
  })).filter(r => r.Bridge_ID);
}

function parseReports(rows: Record<string, string>[]): CitizenReport[] {
  return rows.map(r => ({
    Report_ID: r['Report_ID'] || '',
    Bridge_ID: r['Bridge_ID'] || '',
    Report_Date: r['Report_Date'] || '',
    Description: r['Description'] || '',
    Severity_1_to_10: num(r['Severity_1_to_10']),
    Status: r['Status'] || '',
    AI_Verdict: r['AI_Verdict'] || '',
  })).filter(r => r.Bridge_ID);
}

function parseContractors(rows: Record<string, string>[]): ContractorRecord[] {
  return rows.map(r => ({
    Bridge_ID: r['Bridge_ID'] || '',
    Contractor_Name: r['Contractor_Name'] || '',
    Work_Start_Date: r['Work_Start_Date'] || '',
    SLA_Deadline: r['SLA_Deadline'] || '',
    Budget_Allocated_Lakhs: num(r['Budget_Allocated_Lakhs']),
    Budget_Spent_Lakhs: num(r['Budget_Spent_Lakhs']),
    Progress_Pct: num(r['Progress_%'] || r['Progress_Pct']),
    Stage: r['Stage'] || '',
    Contact_Number: r['Contact_Number'] || '',
  })).filter(r => r.Bridge_ID);
}

export async function fetchSheetData(sheetUrl: string): Promise<AppData> {
  const sheets = ['BRIDGE_MASTER', 'INSPECTION_HISTORY', 'CITIZEN_REPORTS', 'CONTRACTOR_DATA'];
  const results = await Promise.allSettled(
    sheets.map(s => fetch(getCSVUrl(sheetUrl, s)).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch ${s}`);
      return r.text();
    }))
  );

  const getResult = (i: number): string => {
    const r = results[i];
    return r.status === 'fulfilled' ? r.value : '';
  };

  return {
    bridges: parseBridges(parseCSV(getResult(0))),
    inspections: parseInspections(parseCSV(getResult(1))),
    citizenReports: parseReports(parseCSV(getResult(2))),
    contractors: parseContractors(parseCSV(getResult(3))),
  };
}

export function validateSheetUrl(url: string): boolean {
  return /docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url);
}
