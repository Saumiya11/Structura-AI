import * as XLSX from 'xlsx';

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  const bridgeHeaders = [
    'Bridge_ID', 'Bridge_Name', 'State', 'District', 'City',
    'Latitude', 'Longitude', 'Year_Built', 'Designer', 'Material',
    'Span_Meters', 'Design_Load_Tonnes', 'Number_of_Lanes',
    'Current_Health_%', 'Last_Inspection_Date', 'Pending_Repairs',
    'Daily_Traffic_Count', 'Heavy_Vehicle_%', 'Repair_Cost_Lakhs',
    'Officer_Name', 'Officer_Phone', 'Officer_Designation', 'Notes'
  ];
  const bridgeSample = [
    'MH-001', 'Bandra-Worli Sea Link', 'Maharashtra', 'Mumbai', 'Mumbai',
    '19.0380', '72.8162', '2009', 'MSRDC', 'Steel-Concrete',
    '5600', '120', '8', '82', '2024-06-15', '2',
    '45000', '35', '120', 'Rajesh Kumar', '+919876543210', 'Chief Engineer', 'Cable-stayed bridge'
  ];
  const ws1 = XLSX.utils.aoa_to_sheet([bridgeHeaders, bridgeSample]);
  XLSX.utils.book_append_sheet(wb, ws1, 'BRIDGE_MASTER');

  const inspHeaders = [
    'Bridge_ID', 'Inspection_Date', 'Inspector_Name',
    'Health_Score_%', 'Findings', 'Severity',
    'Repair_Recommended', 'Repairs_Done'
  ];
  const inspSample = ['MH-001', '2024-06-15', 'Dr. Sharma', '82', 'Minor crack in pier 3', 'Low', 'Yes', 'No'];
  const ws2 = XLSX.utils.aoa_to_sheet([inspHeaders, inspSample]);
  XLSX.utils.book_append_sheet(wb, ws2, 'INSPECTION_HISTORY');

  const citHeaders = [
    'Report_ID', 'Bridge_ID', 'Report_Date',
    'Description', 'Severity_1_to_10', 'Status', 'AI_Verdict'
  ];
  const citSample = ['RPT-001', 'MH-001', '2024-07-01', 'Visible crack on railing', '4', 'Under Review', 'Low risk - cosmetic damage'];
  const ws3 = XLSX.utils.aoa_to_sheet([citHeaders, citSample]);
  XLSX.utils.book_append_sheet(wb, ws3, 'CITIZEN_REPORTS');

  const conHeaders = [
    'Bridge_ID', 'Contractor_Name', 'Work_Start_Date',
    'SLA_Deadline', 'Budget_Allocated_Lakhs', 'Budget_Spent_Lakhs',
    'Progress_%', 'Stage', 'Contact_Number'
  ];
  const conSample = ['MH-001', 'L&T Infrastructure', '2024-03-01', '2024-09-30', '85', '42', '55', 'In Progress', '+919876543211'];
  const ws4 = XLSX.utils.aoa_to_sheet([conHeaders, conSample]);
  XLSX.utils.book_append_sheet(wb, ws4, 'CONTRACTOR_DATA');

  XLSX.writeFile(wb, 'STRUCTURA_AI_Template.xlsx');
}
