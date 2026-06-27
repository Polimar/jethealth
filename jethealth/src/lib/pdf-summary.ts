import { jsPDF } from "jspdf";
import { type TriageInput, type TriageResult } from "./triage-schema";

const URGENCY_LABEL: Record<string, string> = {
  low: "Bassa urgenza",
  medium: "Media urgenza",
  high: "Alta urgenza",
  emergency: "Emergenza",
};

export function generateTriagePdf(result: TriageResult, input: TriageInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const line = (
    text: string,
    opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {},
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 11);
    doc.setTextColor(...(opts.color ?? [30, 41, 59]));
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * (opts.size ?? 11) * 1.3 + (opts.gap ?? 4);
  };

  // Header
  doc.setFillColor(11, 95, 165);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("JetHealth", margin, 44);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Riepilogo orientamento sanitario", margin, 58);
  y = 100;

  // Disclaimer banner
  doc.setFillColor(254, 242, 242);
  doc.rect(margin, y - 14, maxWidth, 40, "F");
  line(
    "Questo documento NON è una diagnosi medica. Consulta sempre un professionista sanitario.",
    { size: 10, color: [185, 28, 28], gap: 14 },
  );

  line(`Data: ${new Date().toLocaleString("it-IT")}`, { size: 10, color: [100, 116, 139] });
  line(`Paziente: ${input.patient}`, { size: 10, color: [100, 116, 139], gap: 10 });

  line(`Livello di urgenza: ${URGENCY_LABEL[result.urgencyLevel] ?? result.urgencyLevel}`, {
    bold: true,
    size: 14,
    gap: 8,
  });

  line("Sintomi riferiti", { bold: true, size: 12 });
  if (input.freeText?.trim()) line(input.freeText.trim());
  const guided: string[] = [];
  if (input.duration) guided.push(`Durata: ${input.duration}`);
  guided.push(`Dolore: ${input.pain}/10`);
  guided.push(`Febbre: ${input.fever}`);
  guided.push(`Respiro: ${input.breath}`);
  if (input.factors.length) guided.push(`Fattori: ${input.factors.join(", ")}`);
  line(guided.join(" · "), { gap: 10 });

  line("Spiegazione", { bold: true, size: 12 });
  line(result.plainLanguageExplanation, { gap: 8 });

  if (result.nextSteps.length) {
    line("Cosa fare ora", { bold: true, size: 12 });
    result.nextSteps.forEach((s) => line(`•  ${s}`));
    y += 6;
  }

  if (result.watchFor.length) {
    line("Cosa monitorare", { bold: true, size: 12 });
    result.watchFor.forEach((s) => line(`•  ${s}`));
    y += 6;
  }

  line(result.safetyDisclaimer, { size: 9, color: [100, 116, 139], gap: 10 });
  line("Generato da JetHealth — Sistema di orientamento sanitario digitale", {
    size: 9,
    color: [148, 163, 184],
  });

  doc.save(`jethealth-riepilogo-${Date.now()}.pdf`);
}
