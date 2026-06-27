import jsPDF from "jspdf";
import type { TriageResult } from "./triage-schema";
import { URGENCY_LEVELS } from "./triage-schema";

interface PdfData {
  symptomsText: string;
  patient: string;
  result: TriageResult;
  clarifyAnswers?: Record<string, string[]>;
}

export function generateTriagePdf(data: PdfData): void {
  const doc = new jsPDF();
  const level = URGENCY_LEVELS[data.result.urgencyLevel];
  const now = new Date().toLocaleString("it-IT");

  // Header
  doc.setFontSize(20);
  doc.setTextColor(11, 95, 165);
  doc.text("JetHealth", 20, 25);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Riepilogo orientamento sanitario", 20, 32);
  doc.text(now, 20, 38);

  // Line
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 42, 190, 42);

  // Urgency level
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Livello di urgenza", 20, 52);
  doc.setFontSize(16);
  doc.setTextColor(
    parseInt(level.color.slice(1, 3), 16),
    parseInt(level.color.slice(3, 5), 16),
    parseInt(level.color.slice(5, 7), 16)
  );
  doc.text(level.label, 20, 60);

  // Patient info
  let y = 72;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Paziente: ${data.patient}`, 20, y);
  y += 10;

  // Symptoms
  doc.text("Sintomi riferiti:", 20, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const sympLines = doc.splitTextToSize(data.symptomsText, 160);
  doc.text(sympLines, 20, y);
  y += sympLines.length * 5 + 8;

  // Clarify answers
  if (data.clarifyAnswers && Object.keys(data.clarifyAnswers).length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Risposte approfondimento:", 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    for (const [q, answers] of Object.entries(data.clarifyAnswers)) {
      if (answers.length > 0) {
        doc.text(`• ${q}: ${answers.join(", ")}`, 25, y);
        y += 5;
      }
    }
    y += 5;
  }

  // Action
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Azione consigliata:", 20, y);
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(data.result.actionLabel, 20, y);
  y += 10;

  // Explanation
  doc.text("Spiegazione:", 20, y);
  y += 6;
  doc.setFontSize(10);
  const expLines = doc.splitTextToSize(data.result.explanation, 160);
  doc.text(expLines, 20, y);
  y += expLines.length * 5 + 8;

  // Next steps
  if (data.result.nextSteps.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Prossimi passi:", 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    data.result.nextSteps.forEach((step, i) => {
      doc.text(`${i + 1}. ${step}`, 25, y);
      y += 5;
    });
    y += 5;
  }

  // Disclaimer
  doc.setDrawColor(229, 231, 235);
  doc.line(20, y, 190, y);
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    "Documento informativo generato dall'utente tramite JetHealth. Non costituisce diagnosi né referto medico.",
    20,
    y
  );
  y += 4;
  doc.text("In caso di emergenza chiamare il 112/118.", 20, y);

  doc.save(`jethealth-riepilogo-${Date.now()}.pdf`);
}
