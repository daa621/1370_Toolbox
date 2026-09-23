(function () {
  "use strict";

  const form = document.getElementById("calculatorForm");
  const entitlementInput = document.getElementById("entitlement");
  const workdaysInput = document.getElementById("workdays");
  const weeklyHoursInput = document.getElementById("weeklyHours");
  const warning = document.getElementById("warning");
  const error = document.getElementById("error");
  const resultContent = document.getElementById("resultContent");
  const printButton = document.getElementById("printButton");

  const parseNumber = (value) => Number(String(value).trim().replace(/\s/g, "").replace(",", "."));
  const formatNumber = (value, digits = 3) => value.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  const formatHours = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    return `${Math.floor(totalMinutes / 60)} Std. ${totalMinutes % 60} Min.`;
  };
  const formatClock = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, "0")} Std.`;
  };
  const setText = (id, value) => { document.getElementById(id).textContent = value; };

  function calculate() {
    error.hidden = true;
    warning.hidden = true;
    const entitlement = parseNumber(entitlementInput.value);
    const workdays = parseNumber(workdaysInput.value);
    const weeklyHours = parseNumber(weeklyHoursInput.value);
    if (!Number.isFinite(entitlement) || entitlement < 0 || !Number.isFinite(workdays) || workdays < 1 || workdays > 7 || !Number.isFinite(weeklyHours) || weeklyHours <= 0) {
      error.textContent = "Bitte prüfe die Eingaben: Anspruch darf nicht negativ sein, Arbeitstage müssen zwischen 1 und 7 liegen und die Wochenarbeitszeit muss größer als 0 sein.";
      error.hidden = false;
      return;
    }

    const wholeDays = Math.floor(entitlement);
    const fraction = entitlement - wholeDays;
    const dailyHours = weeklyHours / workdays;
    const roundsUp = fraction >= 0.5;
    const vacationDays = roundsUp ? Math.ceil(entitlement) : wholeDays;
    const creditHours = roundsUp ? 0 : fraction * dailyHours;
    const creditMinutes = Math.round(creditHours * 60);

    if (roundsUp) {
      warning.textContent = `Sicherheitscheck: Der Nachkommaanteil beträgt ${formatNumber(fraction)} Tage und liegt bei mindestens 0,5. Der Anspruch wird daher auf ${vacationDays} volle Urlaubstage aufgerundet; es entsteht kein zusätzliches Zeitguthaben.`;
      warning.hidden = false;
    }

    setText("resultDays", vacationDays);
    setText("resultTime", roundsUp ? "0 Minuten" : `${creditMinutes} ${creditMinutes === 1 ? "Minute" : "Minuten"}`);
    setText("creditBadge", roundsUp ? "Aufgerundet" : "Restzeit");
    setText("resultEntitlement", `${formatNumber(entitlement)} Tage`);
    setText("resultDaily", formatHours(dailyHours));
    setText("resultFraction", `${formatNumber(fraction)} Tage`);
    setText("resultFormula", roundsUp ? `${formatNumber(fraction)} Tage ≥ 0,5 → Aufrundung auf ${vacationDays} Tage` : `${formatNumber(fraction)} Tage × ${formatClock(dailyHours)} = ${formatClock(creditHours)}`);
    setText("printDate", new Intl.DateTimeFormat("de-DE").format(new Date()));
    setText("printEntitlement", `${formatNumber(entitlement)} Tage`);
    setText("printDays", `${vacationDays} Tage`);
    setText("printTime", roundsUp ? "0 Minuten" : `${creditMinutes} Minuten`);
    setText("printWorkdays", `${formatNumber(workdays, 0)} Tage`);
    setText("printWeekly", `${formatNumber(weeklyHours)} Stunden`);
    setText("printDaily", formatHours(dailyHours));
    setText("printFraction", `${formatNumber(fraction)} Tage`);
    setText("printFormula", roundsUp ? `${formatNumber(fraction)} Tage ≥ 0,5 → Aufrundung auf ${vacationDays} volle Urlaubstage.` : `${formatNumber(fraction)} Tage × ${formatClock(dailyHours)} tägliche Arbeitszeit = ${formatClock(creditHours)} Zeitguthaben (gerundet: ${creditMinutes} Minuten).`);
    resultContent.hidden = false;
    printButton.disabled = false;
  }

  form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
  document.getElementById("resetButton").addEventListener("click", () => {
    form.reset(); entitlementInput.value = ""; workdaysInput.value = "5"; weeklyHoursInput.value = "";
    warning.hidden = true; error.hidden = true; resultContent.hidden = true; printButton.disabled = true;
  });
  printButton.addEventListener("click", () => window.print());
  calculate();
}());
