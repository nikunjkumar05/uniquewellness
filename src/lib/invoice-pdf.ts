export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  period: string;
  amount: number;
  status?: string | null;
};

export function buildInvoiceNumber(feeId: string, period: string) {
  return `INV-${period.replace(/-/g, "")}-${feeId.slice(0, 8).toUpperCase()}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function downloadInvoicePdf(data: InvoicePdfData) {
  if (typeof window === "undefined") return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const boxWidth = (contentWidth - 6) / 2;

  doc.setProperties({
    title: data.invoiceNumber,
    subject: "Invoice",
    author: "Unique Wellness Institute",
  });

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Unique Wellness Institute", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text("Invoice", pageWidth - margin, 20, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 25, pageWidth - margin, 25);

  const rows: Array<Array<{ label: string; value: string }>> = [
    [
      { label: "Invoice No.", value: data.invoiceNumber },
      { label: "Issued At", value: new Date(data.issuedAt).toLocaleString() },
    ],
    [
      { label: "Student", value: data.studentName || "—" },
      { label: "Email", value: data.studentEmail || "—" },
    ],
    [
      { label: "Course", value: data.courseTitle || "—" },
      { label: "Period", value: data.period || "—" },
    ],
    [
      { label: "Amount", value: formatCurrency(data.amount) },
      { label: "Status", value: data.status || "Paid" },
    ],
  ];

  let y = 34;
  for (const row of rows) {
    const boxHeight = 20;
    row.forEach((field, index) => {
      const x = index === 0 ? margin : margin + boxWidth + 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, "FD");
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(field.label, x + 4, y + 6);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      const valueLines = doc.splitTextToSize(field.value, boxWidth - 8);
      doc.text(valueLines, x + 4, y + 13);
    });
    y += 26;
  }

  y += 2;
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total payable: ${formatCurrency(data.amount)}`, margin + 5, y + 12);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "This invoice was generated from the Unique Wellness Institute dashboard.",
    margin,
    pageHeight - 16,
  );

  const fileName = `invoice-${safeFileName(data.invoiceNumber)}.pdf`;
  doc.save(fileName);
}
