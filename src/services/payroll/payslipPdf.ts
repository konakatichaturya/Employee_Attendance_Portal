import { jsPDF } from 'jspdf';
import type { Employee } from '../../types';
import type { Payslip } from './payslipCalculator';
import { formatPayCurrency as formatCurrency } from './currency';

export function downloadPayslipPdf(
  employee: Pick<Employee, 'name' | 'id' | 'department' | 'email'>,
  payslip: Payslip,
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 40, 90);
  doc.text('WorkTrack', marginX, y);

  doc.setFontSize(11);
  doc.setTextColor(90, 100, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Payslip', doc.internal.pageSize.getWidth() - marginX, y, { align: 'right' });

  y += 10;
  doc.setDrawColor(220, 224, 232);
  doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);

  y += 32;
  doc.setFontSize(15);
  doc.setTextColor(20, 30, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(payslip.monthLabel, marginX, y);

  y += 28;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 78, 95);
  const infoRows: [string, string][] = [
    ['Employee', employee.name],
    ['Employee ID', employee.id],
    ['Department', employee.department],
    ['Email', employee.email],
  ];
  infoRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginX + 120, y);
    y += 18;
  });

  y += 16;
  doc.setFillColor(244, 246, 251);
  doc.roundedRect(marginX, y, doc.internal.pageSize.getWidth() - marginX * 2, 118, 6, 6, 'F');

  let rowY = y + 28;
  const col2 = doc.internal.pageSize.getWidth() / 2 + 10;

  const summaryRows: [string, string][] = [
    ['Base Salary', formatCurrency(payslip.baseSalary)],
    ['Days in Month', `${payslip.daysInMonth}`],
    ['Per-Day Rate', formatCurrency(Math.round(payslip.perDayRate))],
    ['Deducted Days', `${payslip.deductedDays}`],
  ];
  summaryRows.forEach(([label, value], i) => {
    const x = i % 2 === 0 ? marginX + 20 : col2;
    const rY = rowY + Math.floor(i / 2) * 34;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 118, 135);
    doc.setFontSize(9.5);
    doc.text(label.toUpperCase(), x, rY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 38, 55);
    doc.setFontSize(13);
    doc.text(value, x, rY + 18);
  });

  y += 140;

  if (payslip.deductions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(20, 30, 50);
    doc.text('Deduction Breakdown', marginX, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 78, 95);
    payslip.deductions.forEach((d) => {
      doc.text(`${d.type} leave beyond balance`, marginX, y);
      doc.text(`${d.days} day(s)`, doc.internal.pageSize.getWidth() - marginX, y, { align: 'right' });
      y += 16;
    });
    y += 10;
  }

  doc.setDrawColor(220, 224, 232);
  doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);
  y += 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 30, 50);
  doc.text('Total Deduction', marginX, y);
  doc.text(`- ${formatCurrency(payslip.deductionAmount)}`, doc.internal.pageSize.getWidth() - marginX, y, { align: 'right' });

  y += 28;
  doc.setFontSize(14);
  doc.setTextColor(20, 110, 70);
  doc.text('Net Pay', marginX, y);
  doc.text(formatCurrency(payslip.netPay), doc.internal.pageSize.getWidth() - marginX, y, { align: 'right' });

  y += 50;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(150, 156, 168);
  doc.text('This is a system-generated payslip from WorkTrack and does not require a signature.', marginX, y);

  doc.save(`Payslip-${employee.id}-${payslip.year}-${String(payslip.month).padStart(2, '0')}.pdf`);
}
