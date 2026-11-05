export interface GenericCert { heading: string; name: string; line1: string; line2?: string; id: string; date: string; accent?: [number, number, number] }
/** One reusable landscape A4 certificate (topic badge, all-topics master, event certificate). */
export async function generateGenericCertificate(c: GenericCert) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210, mid = W / 2, [r, g, b] = c.accent ?? [76, 29, 149];
  doc.setFillColor(252, 250, 255); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(r, g, b); doc.rect(0, 0, W, 14, 'F'); doc.rect(0, H - 14, W, 14, 'F');
  doc.setDrawColor(r, g, b); doc.setLineWidth(1.2); doc.rect(8, 22, W - 16, H - 44);
  doc.setTextColor(r, g, b); doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
  doc.text('Embedded IoT-Simulator', mid, 46, { align: 'center' });
  doc.setFontSize(21); doc.text(c.heading, mid, 60, { align: 'center', maxWidth: W - 40 });
  doc.setTextColor(60, 60, 80); doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.text('This is to certify that', mid, 76, { align: 'center' });
  doc.setTextColor(30, 20, 70); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(30);
  doc.text(c.name, mid, 92, { align: 'center', maxWidth: W - 60 });
  doc.setDrawColor(150, 150, 190); doc.setLineWidth(0.3); doc.line(mid - 70, 96, mid + 70, 96);
  doc.setTextColor(60, 60, 80); doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.text(doc.splitTextToSize(c.line1, W - 80), mid, 108, { align: 'center' });
  if (c.line2) doc.text(doc.splitTextToSize(c.line2, W - 80), mid, 128, { align: 'center' });
  doc.setFontSize(11); doc.setTextColor(r, g, b); doc.setFont('helvetica', 'bold');
  doc.text(`Date: ${c.date}`, 40, 160); doc.text(`Certificate ID: ${c.id}`, W - 40, 160, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 120, 140);
  doc.text('Issued by an educational demo platform. Verify the ID with your event organiser or teacher.', mid, H - 20, { align: 'center' });
  doc.save(`${c.heading.replace(/[^a-z0-9]+/gi, '-')}-${c.name.replace(/\s+/g, '_')}.pdf`);
}
