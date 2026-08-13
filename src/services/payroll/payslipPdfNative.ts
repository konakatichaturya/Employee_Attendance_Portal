import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Employee } from '../../types';
import type { Payslip } from './payslipCalculator';
import { formatPayCurrency } from './currency';

function buildPayslipHtml(employee: Pick<Employee, 'name' | 'id' | 'department' | 'email'>, payslip: Payslip): string {
  const deductionRows = payslip.deductions
    .map(
      (d) => `
        <tr>
          <td>${d.type} leave beyond balance</td>
          <td class="right">${d.days} day(s)</td>
        </tr>`,
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1e2637; padding: 32px; }
          .brand { font-size: 22px; font-weight: 700; color: #14285a; }
          .subtitle { font-size: 12px; color: #5a647c; margin-top: 2px; }
          hr { border: none; border-top: 1px solid #dce0e8; margin: 16px 0; }
          .month { font-size: 17px; font-weight: 700; margin-bottom: 12px; }
          .info-row { font-size: 12px; color: #464e5f; margin-bottom: 6px; }
          .info-label { font-weight: 700; display: inline-block; width: 110px; }
          .summary { background: #f4f6fb; border-radius: 10px; padding: 18px 20px; margin: 18px 0; }
          .summary table { width: 100%; border-collapse: collapse; }
          .summary td { width: 50%; padding: 8px 0; vertical-align: top; }
          .summary .label { font-size: 9.5px; color: #6e768c; text-transform: uppercase; letter-spacing: 0.4px; }
          .summary .value { font-size: 15px; font-weight: 700; color: #1e2637; margin-top: 2px; }
          table.deductions { width: 100%; border-collapse: collapse; font-size: 11px; color: #464e5f; margin-top: 8px; }
          table.deductions td { padding: 6px 0; }
          .right { text-align: right; }
          .totals-row { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; margin-top: 14px; }
          .net-pay-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #146e46; margin-top: 12px; }
          .footer { font-size: 9px; color: #969ca8; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="brand">WorkTrack</div>
        <div class="subtitle">Payslip</div>
        <hr />
        <div class="month">${payslip.monthLabel}</div>
        <div class="info-row"><span class="info-label">Employee</span>${employee.name}</div>
        <div class="info-row"><span class="info-label">Employee ID</span>${employee.id}</div>
        <div class="info-row"><span class="info-label">Department</span>${employee.department}</div>
        <div class="info-row"><span class="info-label">Email</span>${employee.email}</div>

        <div class="summary">
          <table>
            <tr>
              <td>
                <div class="label">Base Salary</div>
                <div class="value">${formatPayCurrency(payslip.baseSalary)}</div>
              </td>
              <td>
                <div class="label">Days in Month</div>
                <div class="value">${payslip.daysInMonth}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div class="label">Per-Day Rate</div>
                <div class="value">${formatPayCurrency(Math.round(payslip.perDayRate))}</div>
              </td>
              <td>
                <div class="label">Deducted Days</div>
                <div class="value">${payslip.deductedDays}</div>
              </td>
            </tr>
          </table>
        </div>

        ${
          payslip.deductions.length > 0
            ? `<div style="font-weight:700; font-size: 12.5px; margin-bottom: 4px;">Deduction Breakdown</div>
               <table class="deductions">${deductionRows}</table>`
            : ''
        }

        <hr />
        <div class="totals-row"><span>Total Deduction</span><span>- ${formatPayCurrency(payslip.deductionAmount)}</span></div>
        <div class="net-pay-row"><span>Net Pay</span><span>${formatPayCurrency(payslip.netPay)}</span></div>

        <div class="footer">This is a system-generated payslip from WorkTrack and does not require a signature.</div>
      </body>
    </html>
  `;
}

export async function sharePayslipPdf(
  employee: Pick<Employee, 'name' | 'id' | 'department' | 'email'>,
  payslip: Payslip,
): Promise<void> {
  const html = buildPayslipHtml(employee, payslip);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Payslip — ${payslip.monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
