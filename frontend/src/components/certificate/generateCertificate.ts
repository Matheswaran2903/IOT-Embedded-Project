export interface CertificateData { name: string; school: string; cls: string; score: number; date: string; id: string }

export const makeCertificateId = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `EIS-${ymd}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

export async function generateCertificate(c: CertificateData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210, mid = W / 2;

  doc.setFillColor(250, 248, 255); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(76, 29, 149); doc.rect(0, 0, W, 14, 'F');
  doc.setFillColor(37, 99, 235); doc.rect(0, 14, W, 3, 'F');
  doc.setFillColor(76, 29, 149); doc.rect(0, H - 14, W, 14, 'F');
  doc.setFillColor(37, 99, 235); doc.rect(0, H - 17, W, 3, 'F');
  doc.setDrawColor(76, 29, 149); doc.setLineWidth(1.2); doc.rect(8, 22, W - 16, H - 44);
  doc.setDrawColor(37, 99, 235); doc.setLineWidth(0.4); doc.rect(11, 25, W - 22, H - 50);

  doc.setTextColor(76, 29, 149); doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
  doc.text('Embedded IoT-Simulator', mid, 46, { align: 'center' });
  doc.setTextColor(37, 99, 235); doc.setFontSize(22);
  doc.text('Certificate of Completion', mid, 60, { align: 'center' });

  doc.setTextColor(60, 60, 80); doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.text('This is to certify that', mid, 76, { align: 'center' });

  doc.setTextColor(30, 20, 70); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(32);
  doc.text(c.name, mid, 92, { align: 'center', maxWidth: W - 60 });
  doc.setDrawColor(150, 150, 190); doc.setLineWidth(0.3); doc.line(mid - 70, 96, mid + 70, 96);

  doc.setTextColor(60, 60, 80); doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  const body = `of ${c.school}, Class ${c.cls}, has successfully completed the Embedded IoT-Simulator virtual laboratory course on the thingZkit IoT kit and passed the final quiz with ${c.score} out of 100 marks.`;
  doc.text(doc.splitTextToSize(body, W - 80), mid, 108, { align: 'center' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(76, 29, 149);
  doc.text('Quiz marks', 55, 138); doc.text('Completion date', mid, 138, { align: 'center' }); doc.text('Certificate ID', W - 55, 138, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 20, 70); doc.setFontSize(13);
  doc.text(`${c.score} / 100`, 55, 146); doc.text(c.date, mid, 146, { align: 'center' }); doc.text(c.id, W - 55, 146, { align: 'right' });

  doc.setDrawColor(100, 100, 130); doc.setLineWidth(0.3); doc.line(mid - 40, 166, mid + 40, 166);
  doc.setFontSize(10); doc.setTextColor(110, 110, 130);
  doc.text('[ Institutional authorisation / signature placeholder ]', mid, 171, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Issued by the Embedded IoT-Simulator. Not an official qualification unless authorised by the institution.', mid, 177, { align: 'center' });

  doc.save(`IoT-Simulator-Certificate-${c.name.replace(/[^a-z0-9]+/gi, '_')}.pdf`);
}
