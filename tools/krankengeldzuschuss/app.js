(function () {
  "use strict";

  // Erweiterbare interne Zuordnungstabelle für Anspruch und Falllogik.
  const personGroups = {
    angestellter: { label: "Angestellter", eligible: true },
    arbeiter: { label: "Arbeiter", eligible: true },
    minijob: { label: "Minijob", eligible: false },
    auszubildender: { label: "Auszubildender", eligible: false },
    praktikant: { label: "Praktikant", eligible: false }
  };
  const FULL_TIME_HOURS = 39;
  const VWL_FULL_TIME = 6.65;
  const ALT_CASE_DATE = new Date(1994, 5, 30);
  const $ = (id) => document.getElementById(id);
  const parseNumber = (value) => Number(String(value).trim().replace(/\s/g, "").replace(",", "."));
  const money = (value) => `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  const parseDate = (value) => { const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!match) return null; const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])); return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null; };
  const dateText = (date) => date.toLocaleDateString("de-DE");
  const setText = (id, value) => { $(id).textContent = value; };
  const yearsLater = (date, years) => new Date(date.getFullYear() + years, date.getMonth(), date.getDate());
  Object.entries(personGroups).forEach(([value, item]) => $("personGroup").add(new Option(item.label, value)));
  const todayIso = new Date().toISOString().slice(0, 10);
  $("employmentStart").max = todayIso;
  $("illnessStart").max = todayIso;
  $("illnessStart").min = $("employmentStart").value;
  $("employmentStart").addEventListener("change", () => { $("illnessStart").min = $("employmentStart").value; });

  function calculate() {
    $("error").hidden = true;
    const groupKey = $("personGroup").value;
    const group = personGroups[groupKey];
    if (!group.eligible) { showIneligible(group.label); return; }
    const employment = parseDate($("employmentStart").value);
    const illness = parseDate($("illnessStart").value);
    const gross = parseNumber($("grossDaily").value);
    const net = parseNumber($("netDaily").value);
    const vacation = parseNumber($("netVacationPay").value);
    const vwlYes = $("vwlEntitlement").value === "yes";
    const weeklyHours = parseNumber($("weeklyHours").value);
    const invalidMoney = !Number.isFinite(gross) || gross < 0 || !Number.isFinite(net) || net < 0 || !Number.isFinite(vacation) || vacation < 0;
    const today = new Date(); today.setHours(23, 59, 59, 999);
    const dateProblem = !employment || !illness ? "Bitte gib beide Daten als gültige Kalenderdaten ein." : employment > illness ? "Der Beschäftigungsbeginn darf nicht nach dem Krankheitsbeginn liegen." : illness > today ? "Der Krankheitsbeginn darf nicht in der Zukunft liegen." : "";
    if (dateProblem || invalidMoney || (vwlYes && (!Number.isFinite(weeklyHours) || weeklyHours <= 0 || weeklyHours > FULL_TIME_HOURS))) {
      $("error").textContent = dateProblem || "Bitte prüfe die Eingaben: Geldbeträge dürfen nicht negativ sein. Die Wochenarbeitszeit muss zwischen 0 und 39 Stunden liegen.";
      $("error").hidden = false; return;
    }
    const anniversary = yearsLater(employment, 1);
    if (illness <= anniversary) { showIneligible(group.label, `Die Beschäftigungszeit beträgt am Krankheitsbeginn noch nicht mehr als ein Jahr (Stichtag: ${dateText(anniversary)}).`); return; }

    const isAlt = groupKey === "angestellter" && employment < ALT_CASE_DATE;
    const caseLabel = isAlt ? "Altfall" : "Neufall";
    const baseDaily = isAlt ? net : gross;
    const rawSubsidy = vacation - baseDaily * 30;
    const subsidy = Math.max(0, rawSubsidy);
    const vwl = vwlYes ? VWL_FULL_TIME * (weeklyHours / FULL_TIME_HOURS) : 0;
    const total = subsidy + vwl;
    $("eligibilityMark").textContent = "✓"; $("eligibilityTitle").textContent = "Anspruch grundsätzlich gegeben"; $("eligibilityText").textContent = "Die Eingaben erfüllen die Voraussetzungen für die Berechnung.";
    $("calculationResult").hidden = false; setText("caseType", caseLabel); setText("caseReason", isAlt ? "Nettokrankengeld als Berechnungsgrundlage" : "Bruttokrankengeld als Berechnungsgrundlage"); setText("resultAmount", money(subsidy)); setText("resultVwl", money(vwl)); setText("resultTotal", money(total));
    const formula = `${money(vacation)} − (${money(baseDaily)} × 30) = ${money(rawSubsidy)}${rawSubsidy < 0 ? " → 0,00 €" : ""}${vwlYes ? ` · VwL: ${money(vwl)}` : ""}`; setText("resultFormula", formula); fillPrint(group.label, caseLabel, employment, illness, gross, net, vacation, vwl, subsidy, total, formula); $("printButton").disabled = false;
  }
  function showIneligible(groupLabel, reason) { $("eligibilityMark").textContent = "!"; $("eligibilityTitle").textContent = "Keine Berechnung"; $("eligibilityText").textContent = reason || `${groupLabel} ist laut interner Zuordnung nicht anspruchsberechtigt.`; $("calculationResult").hidden = true; $("printButton").disabled = true; }
  function fillPrint(group, caseLabel, employment, illness, gross, net, vacation, vwl, subsidy, total, formula) { setText("printDate", dateText(new Date())); setText("printGroup", group); setText("printCase", caseLabel); setText("printEmployment", dateText(employment)); setText("printIllness", dateText(illness)); setText("printGross", money(gross)); setText("printNet", money(net)); setText("printVacation", money(vacation)); setText("printVwl", money(vwl)); setText("printFormula", formula); setText("printResult", money(subsidy)); setText("printVwlResult", money(vwl)); setText("printTotal", money(total)); }
  $("vwlEntitlement").addEventListener("change", () => { $("vwlFields").hidden = $("vwlEntitlement").value !== "yes"; });
  $("calculatorForm").addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  $("resetButton").addEventListener("click", () => { $("calculatorForm").reset(); $("vwlFields").hidden = true; $("error").hidden = true; $("calculationResult").hidden = true; $("eligibilityMark").textContent = "—"; $("eligibilityTitle").textContent = "Noch nicht geprüft"; $("eligibilityText").textContent = "Eingaben ergänzen und Berechnung starten."; $("printButton").disabled = true; });
  $("printButton").addEventListener("click", () => window.print());
}());
