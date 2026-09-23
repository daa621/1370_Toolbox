(function(){
"use strict";
/**
 * 1) Überschrift
 */
const heading = document.querySelector("h1");

/**
 * 2) Hauptcontainer
 */
const mainContainer = document.querySelector(".main-container");

/**
 * 3) Linkes Panel
 */
const leftPanel = document.querySelector(".left-panel");
const rechenContainer = leftPanel.querySelector(".rechen-container");
const rechenPre = rechenContainer.querySelector("pre");
const statusPanel = leftPanel.querySelector(".status-panel");

function showStatus(msg, color = "var(--text)") {
  statusPanel.style.color = color;
  statusPanel.innerText = msg;

  // Toast feel: show briefly, linger a bit longer on errors
  statusPanel.classList.add("toast");
  clearTimeout(showStatus._t);
  const linger = (String(color).toLowerCase().includes("red")) ? 2400 : 1200;
  showStatus._t = setTimeout(() => statusPanel.classList.remove("toast"), linger);
}

/**
 * 4) Variablen
 */
let lines = [];
let currentLine = "";
// CLASSIC: Array + Operator
let classicTerms = [];
let classicLastOp = null;
// MODERN:
let total = null;
let lastOperator = null;
let calcMode = "classic";
const BLINK_CURSOR = "_";
let showCursor = true;

// History-Stack initialisieren
let historyStack = [];

// Funktion zum Speichern des aktuellen Zustands
function saveState() {
  const state = {
    lines: JSON.parse(JSON.stringify(lines)),
    currentLine: currentLine,
    classicTerms: JSON.parse(JSON.stringify(classicTerms)),
    classicLastOp: classicLastOp,
    total: total,
    lastOperator: lastOperator,
    calcMode: calcMode
  };
  historyStack.push(state);
  console.log("State saved:", state);
  console.log("History Stack:", historyStack);
}

// Funktion zum Wiederherstellen des letzten Zustands
function restoreState() {
  if (historyStack.length === 0) {
    showStatus("Keine weiteren Schritte rückgängig!", "red");
    return;
  }
  const lastState = historyStack.pop();
  console.log("Restoring state:", lastState);
  lines = lastState.lines;
  currentLine = lastState.currentLine;
  classicTerms = lastState.classicTerms;
  classicLastOp = lastState.classicLastOp;
  total = lastState.total;
  lastOperator = lastState.lastOperator;
  calcMode = lastState.calcMode;
  // Aktualisiere den Modus-Select
  const modeSelect = rightPanel.querySelector("select");
  modeSelect.value = calcMode;
  showStatus("Letzten Schritt rückgängig gemacht.", "blue");
  updateDisplay();
  console.log("Current lines after restore:", lines);
}

/**
 * 5) Anzeige aktualisieren
 */
function updateDisplay() {
  // "black" is used as the default color in the calculation logic.
  // In dark mode, pure black becomes unreadable on the tape background.
  // We map it to a CSS variable so the UI can theme it safely.
  const mapLineColor = (c) => {
    if (!c) return "var(--tape-text)";
    const s = String(c).trim().toLowerCase();
    return (s === "black") ? "var(--tape-text)" : c;
  };

  const htmlLines = lines.map(lineObj => {
    return `<span style="color:${mapLineColor(lineObj.color)}; font-weight:${lineObj.bold ? 'bold' : 'normal'}">${lineObj.text}</span>`;
  });
  const dispLine = currentLine + (showCursor ? BLINK_CURSOR : " ");
  htmlLines.push(`<span style="color:var(--tape-text); font-weight:normal">${dispLine}</span>`);
  rechenPre.innerHTML = htmlLines.join("\n");
  rechenContainer.scrollTop = rechenContainer.scrollHeight;
}

/**
 * 6) Zahl parsen / formatieren
 */
const decimalInput = document.querySelector(".decimal-container input");

function formatNumber(num) {
  const decimals = parseInt(decimalInput.value, 10) || 3;
  let fixedString = num.toFixed(decimals);
  let [intPart, fracPart] = fixedString.split(".");
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (fracPart) {
    return intPart + "," + fracPart;
  } else {
    return intPart;
  }
}

function parseNumber(str) {
  let isPercent = false;
  if (str.endsWith("%")) {
    isPercent = true;
    str = str.slice(0, -1);
  }
  const num = parseFloat(str.replace(",", "."));
  return { num, isPercent };
}

function showModal(message, onConfirm, onCancel) {
  // Modal erstellen
  const modalOverlay = document.createElement("div");
  modalOverlay.style.position = "fixed";
  modalOverlay.style.top = "0";
  modalOverlay.style.left = "0";
  modalOverlay.style.width = "100%";
  modalOverlay.style.height = "100%";
  modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modalOverlay.style.display = "flex";
  modalOverlay.style.justifyContent = "center";
  modalOverlay.style.alignItems = "center";
  modalOverlay.style.zIndex = "9999";

  const modalBox = document.createElement("div");
  modalBox.style.backgroundColor = "#ffffff";
  modalBox.style.padding = "20px";
  modalBox.style.borderRadius = "10px";
  modalBox.style.textAlign = "center";
  modalBox.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.5)";
  modalBox.style.width = "300px";

  const modalMessage = document.createElement("p");
  modalMessage.textContent = message;
  modalMessage.style.marginBottom = "20px";
  modalMessage.style.color = "#000000";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Ja, zurücksetzen";
  confirmButton.style.backgroundColor = "#ff0000";
  confirmButton.style.color = "#ffffff";
  confirmButton.style.border = "none";
  confirmButton.style.padding = "10px";
  confirmButton.style.borderRadius = "5px";
  confirmButton.style.cursor = "pointer";
  confirmButton.style.marginRight = "10px";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Abbrechen";
  cancelButton.style.backgroundColor = "#007bff";
  cancelButton.style.color = "#ffffff";
  cancelButton.style.border = "none";
  cancelButton.style.padding = "10px";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";

  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);
  modalBox.appendChild(modalMessage);
  modalBox.appendChild(buttonContainer);
  modalOverlay.appendChild(modalBox);
  document.body.appendChild(modalOverlay);

  // Event-Listener für die Buttons
  confirmButton.addEventListener("click", () => {
    onConfirm();
    document.body.removeChild(modalOverlay);
  });

  cancelButton.addEventListener("click", () => {
    if (onCancel) onCancel();
    document.body.removeChild(modalOverlay);
  });
}

/**
 * 7) Reset
 */
function resetAll() {
  showModal(
    "Bist Du sicher, dass Du den Rechenstreifen und alle Eingaben zurücksetzen möchtest?",
    () => {
      saveState();
      lines = [];
      currentLine = "";
      // Classic
      classicTerms = [];
      classicLastOp = null;
      // Modern
      total = null;
      lastOperator = null;
      // Eingabefelder leeren
      const nameInput = document.querySelector('input[placeholder="Name, Vorname"]');
      const pinInput = document.querySelector('input[placeholder="PIN"]');
      if (nameInput) nameInput.value = "";
      if (pinInput) pinInput.value = "";
      showStatus("Rechenstreifen zurückgesetzt!", "blue");
      updateDisplay();
    },
    () => {
      showStatus("Reset abgebrochen.", "red");
    }
  );
}

/**
 * 8) Key-Events
 */
leftPanel.addEventListener("click", () => {
  leftPanel.focus();
});

leftPanel.addEventListener("keydown", (ev) => {
  ev.preventDefault();

  // Keyboard-only UI: subtle feedback while typing
  leftPanel.classList.add("is-typing");
  clearTimeout(leftPanel._typingT);
  leftPanel._typingT = setTimeout(() => leftPanel.classList.remove("is-typing"), 380);

  const key = ev.key;
  if (key === "Delete") {
    resetAll();
    return;
  }
  if (key === "Enter") {
    handleEnter();
    return;
  }
  if (key === "Backspace") {
    saveState();
    currentLine = currentLine.slice(0, -1);
    updateDisplay();
    return;
  }
  if (["+", "-", "*", "/"].includes(key)) {
    saveState();
    handleOperator(key);
    return;
  }
  if (/[0-9,%.]/.test(key)) {
    saveState();
    if (key === ".") {
      if (!currentLine.includes(",")) {
        currentLine += ",";
      }
    } else if (key === "%") {
      if (!currentLine.includes("%")) {
        currentLine += "%";
      }
    } else {
      currentLine += key;
    }
    updateDisplay();
    return;
  }
});

/**
 * 9) CLASSIC
 */
function handleOperatorClassic(op) {
  saveState();
  const trim = currentLine.trim();
  if (!trim) {
    classicLastOp = op;
    return;
  }
  const { num, isPercent } = parseNumber(trim);
  if (isNaN(num)) {
    lines.push({ text: `??? ${currentLine}`, color: "black", bold: false });
    currentLine = "";
    updateDisplay();
    return;
  }
  let value = num;

// Classic Prozent-Verhalten (gewünscht):
// Bei + / -: y% meint "y Prozent vom aktuellen Zwischensaldo"
// Bei * / /: y% bleibt Faktor (y/100)
if (isPercent) {
  if (op === "+" || op === "-") {
    const base = classicTerms.reduce((acc, v) => acc + v, 0);
    value = base * (num / 100);
  } else {
    value = num / 100;
  }
}
let usedThisNumber = false;
  if (classicLastOp === "*" || classicLastOp === "/") {
    if (classicTerms.length === 0) {
      classicTerms.push(value);
      lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
    } else {
      let lastVal = classicTerms[classicTerms.length - 1];
      if (classicLastOp === "*") {
        let result = lastVal * value;
        classicTerms[classicTerms.length - 1] = result;
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
      } else {
        if (value === 0) {
          lines.push({ text: `${formatNumber(lastVal)}/0 => Division durch 0!`, color: "red", bold: false });
          currentLine = "";
          updateDisplay();
          return;
        }
        let result = lastVal / value;
        classicTerms[classicTerms.length - 1] = result;
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
      }
    }
    classicLastOp = null;
    usedThisNumber = true;
  }
  if (!usedThisNumber) {
    if (op === "+") {
      classicTerms.push(+value);
      lines.push({ text: (isPercent ? (formatNumber(num) + "%") : formatNumber(value)) + "+", color: "black", bold: false });
    } else if (op === "-") {
      classicTerms.push(-value);
      lines.push({ text: (isPercent ? (formatNumber(num) + "%") : formatNumber(value)) + "-", color: "red", bold: false });
    } else if (op === "*" || op === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value) + op, color: "black", bold: false });
      } else {
        lines.push({ text: formatNumber(value), color: "black", bold: false });
        classicTerms.push(value);
        lines.push({ text: op, color: "black", bold: false });
      }
    }
  }
  classicLastOp = op;
  currentLine = "";
  updateDisplay();
}


function handleEnterClassic() {
  saveState();
  const trim = currentLine.trim();
  const { num, isPercent } = parseNumber(trim);
  if (!isNaN(num) && trim !== "") {
    let value = num;

// Classic Prozent-Verhalten (gewünscht):
// Bei + / -: y% meint "y Prozent vom aktuellen Zwischensaldo"
// Bei * / /: y% bleibt Faktor (y/100)
if (isPercent) {
  if (classicLastOp === "+" || classicLastOp === "-") {
    const base = classicTerms.reduce((acc, v) => acc + v, 0);
    value = base * (num / 100);
  } else {
    value = num / 100;
  }
}
if (classicLastOp === "*" || classicLastOp === "/") {
      if (classicTerms.length === 0) {
        classicTerms.push(value);
        lines.push({ text: formatNumber(value), color: "black", bold: false });
      } else {
        let lastVal = classicTerms[classicTerms.length - 1];
        if (classicLastOp === "*") {
          let result = lastVal * value;
          classicTerms[classicTerms.length - 1] = result;
          lines.push({ text: formatNumber(value), color: "black", bold: false });
        } else {
          if (value === 0) {
            lines.push({ text: `/${value} => Division durch 0!`, color: "red", bold: false });
            currentLine = "";
            updateDisplay();
            return;
          }
          let result = lastVal / value;
          classicTerms[classicTerms.length - 1] = result;
          lines.push({ text: formatNumber(value), color: "black", bold: false });
        }
      }
      classicLastOp = null;
    } else {
      if (classicLastOp === "+" || classicLastOp === "-") {
        const operatorColor = (classicLastOp === "-") ? "red" : "black";
        const shown = isPercent ? (formatNumber(num) + "%" ) : formatNumber(value);
        lines.push({ text: shown + classicLastOp, color: operatorColor, bold: false });
        if (classicLastOp === "-") {
          classicTerms.push(-value);
        } else {
          classicTerms.push(+value);
        }
} else {
        classicTerms.push(+value);
        lines.push({ text: formatNumber(value), color: "black", bold: false });
      }
    }
  }
  let totalSum = classicTerms.reduce((acc, val) => acc + val, 0);
  let finalColor = (totalSum < 0 ? "red" : "black");
  lines.push({ text: formatNumber(totalSum), color: finalColor, bold: true });
  lines.push({ text: "", color: "black", bold: false });
  classicTerms = [];
  classicLastOp = null;
  currentLine = "";
  updateDisplay();
}

/**
 * 10) MODERN
 */
function handleOperatorModern(op) {
  saveState();
  const { num, isPercent } = parseNumber(currentLine.trim());
  if (!currentLine.trim() || isNaN(num)) {
    lastOperator = op;
    currentLine = "";
    updateDisplay();
    return;
  }
  if (lastOperator === null) {
    total = isPercent ? num / 100 : num;
    const color = (total < 0) ? "red" : "black";
    lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(num)) + op, color, bold: false });
    lastOperator = op;
    currentLine = "";
    updateDisplay();
    return;
  }
  let value = num;
  if (isPercent) {
    if (lastOperator === '+' || lastOperator === '-') {
      value = total * (num / 100);
    } else {
      value = num / 100;
    }
  }
  switch (lastOperator) {
    case "+":
      total += value;
      break;
    case "-":
      total -= value;
      break;
    case "*":
      total *= value;
      break;
    case "/":
      if (value === 0) {
        lines.push({ text: `${currentLine} (Division durch 0!)`, color: "red", bold: false });
        currentLine = "";
        updateDisplay();
        return;
      }
      total /= value;
      break;
  }
  const partialColor = (total < 0 ? "red" : "black");
  lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(value)) + lastOperator, color: partialColor, bold: false });
  lastOperator = op;
  currentLine = "";
  updateDisplay();
}

function handleEnterModern() {
  saveState();
  const { num, isPercent } = parseNumber(currentLine.trim());
  if (currentLine.trim() !== "" && !isNaN(num)) {
    let value = num;
    if (isPercent && lastOperator !== null) {
      if (lastOperator === "+" || lastOperator === "-") {
        value = total * (num / 100);
      } else {
        value = num / 100;
      }
    }
    switch (lastOperator) {
      case "+":
        total += value;
        break;
      case "-":
        total -= value;
        break;
      case "*":
        total *= value;
        break;
      case "/":
        if (value === 0) {
          lines.push({ text: `${currentLine} (Division durch 0!)`, color: "red", bold: false });
          currentLine = "";
          updateDisplay();
          return;
        }
        total /= value;
        break;
      default:
        total = isPercent ? num / 100 : num;
    }
    lines.push({ text: (isPercent ? `${formatNumber(num)}%` : formatNumber(value)) + (lastOperator || ""), color: "black", bold: false });
  }
  lines.push({ text: formatNumber(total), color: (total < 0 ? "red" : "black"), bold: true });
  lines.push({ text: "", color: "black", bold: false });
  total = null;
  lastOperator = null;
  updateDisplay();
}

/**
 * 11) Gemeinsame Handler
 */
function handleOperator(op) {
  if (calcMode === "classic") {
    handleOperatorClassic(op);
  } else {
    handleOperatorModern(op);
  }
}

function handleEnter() {
  // Small "result punch" to make Enter feel physical
  rechenContainer.classList.add("punch");
  clearTimeout(rechenContainer._punchT);
  rechenContainer._punchT = setTimeout(() => rechenContainer.classList.remove("punch"), 150);

  if (calcMode === "classic") {
    handleEnterClassic();
  } else {
    handleEnterModern();
  }
}

/**
 * 12) Rechter Bereich
 */
const rightPanel = document.querySelector(".right-panel");
const nameInput = rightPanel.querySelector('input[type="text"]');
const pinInput  = rightPanel.querySelector('input[type="password"]');

// Modus-Auswahl
const modeSelect = rightPanel.querySelector("select");
modeSelect.addEventListener("change", () => {
  saveState();
  calcMode = modeSelect.value;
  classicTerms = [];
  classicLastOp = null;
  total = null;
  lastOperator = null;
  lines = [];
  currentLine = "";
  showStatus(`Modus gewechselt zu: ${calcMode}`, "blue");
  updateDisplay();
});

// Operator-Buttons
const operatorButtons = rightPanel.querySelectorAll(".operator-container .button");
operatorButtons.forEach(button => {
  button.addEventListener("click", () => {
    saveState();
    const op = button.innerText;

    // "%" is not an operator in our calculator modes.
    // It behaves like a suffix to the current input (same as keyboard "%").
    if (op === "%") {
      if (!currentLine.includes("%")) currentLine += "%";
      updateDisplay();
      leftPanel.focus();
      return;
    }

    handleOperator(op);
    leftPanel.focus();
  });
});


// Reset-Button
const resetButton = rightPanel.querySelector(".reset-button");
resetButton.addEventListener("click", () => {
  resetAll();
  leftPanel.focus();
});

// Zurück-Button
const zurueckButton = rightPanel.querySelector(".zurueck-button");
zurueckButton.addEventListener("click", () => {
  restoreState();
  leftPanel.focus();
});

// Druck-Button mit neuem Header-Table
const druckenButton = rightPanel.querySelector(".drucken-button");
druckenButton.addEventListener("click", () => {
  if (lines.length === 0) {
    alert("Es gibt keine Daten zum Drucken.");
    return;
  }
  const newWindow = window.open("", "_blank", "width=800,height=600");
  if (!newWindow) {
    alert("Pop-up-Fenster wurde blockiert. Bitte erlaube Pop-ups für diese Seite.");
    return;
  }

  const now = new Date();
  const dateString = now.toISOString().split("T")[0];
  const timeString = now.toLocaleTimeString("de-DE");

  // Rechenstreifen-Inhalt
  const rechenstreifenContent = lines.map(line => {
    const lineText = line.bold
      ? `<strong>${line.text.trim()}</strong>`
      : line.text.trim();
    return `
      <tr>
        <td class="rechnung-text">${lineText}</td>
        <td class="user-input"><input type="text" name="note" /></td>
      </tr>`;
  }).join("");

  // Zusätzliche Zeilen im Druckbereich
  const additionalRows = `
    <tr>
      <td class="rechnung-text"><span style="font-family: Arial; font-weight: bold;">DE</span></td>
      <td class="user-input"><input type="text" name="de_field" /></td>
    </tr>
    <tr>
      <td class="rechnung-text"><span style="font-family: Arial; font-weight: bold;">DF</span></td>
      <td class="user-input"><input type="text" name="df_field" /></td>
    </tr>
    <tr>
      <td class="rechnung-text">&nbsp;</td>
      <td class="user-input">&nbsp;</td>
    </tr>
    <tr>
      <td class="rechnung-text">
        <select id="akteTypeDropdown" name="dropdown_akte">
          <option value="GH">zur GH-Akte</option>
          <option value="Pers">zur Pers-Akte</option>
        </select>
      </td>
      <td class="user-input" id="akteOptionsContainer"></td>
    </tr>
    <tr>
      <td class="rechnung-text"><span style="font-family: Arial; font-weight: bold;">Bezeichnung</span></td>
      <td class="user-input"><input type="text" name="bezeichnung_field" /></td>
    </tr>
  `;

  // Inline-Script für das Akten-Dropdown
  const inlineScript = `
    <script>
      (function(){
        function updateAkteOptions() {
          var dropdown = document.getElementById("akteTypeDropdown");
          var container = document.getElementById("akteOptionsContainer");
          if (!dropdown || !container) return;
          if (dropdown.value === "GH") {
            container.innerHTML = '<select name="gh_options">\
<option value="00001">00001 Abschlagszahlung</option>\
<option value="00002">00002 Bankverbindung</option>\
<option value="00003">00003 Bescheinigungen</option>\
<option value="00004">00004 Mutterschutz/Beschäftigungsverbot</option>\
<option value="00005">00005 Erstattungen</option>\
<option value="00006">00006 familienbezogene Entgeltbestandteile</option>\
<option value="00007">00007 Gehaltsvorschuss</option>\
<option value="00008">00008 Krankenbezüge/EFZ</option>\
<option value="00009">00009 private Nutzung Dienst-KfZ</option>\
<option value="00010">00010 private Telefonnutzung</option>\
<option value="00011">00011 Schadensersatzansprüche</option>\
<option value="00012">00012 Sonderberechnungen</option>\
<option value="00013">00013 sonstige Abzüge</option>\
<option value="00014">00014 Sonstiges</option>\
<option value="00015">00015 SV/Berufsständische Versorgung</option>\
<option value="00016">00016 Sterbegeld</option>\
<option value="00017">00017 Steuer</option>\
<option value="00018">00018 vermögenswirksame Leistungen</option>\
<option value="00019">00019 Werkswohnung</option>\
<option value="00020">00020 ZfA</option>\
<option value="00021">00021 Zeitzuschläge</option>\
<option value="00022">00022 Zulagen/Zuschläge</option>\
<option value="00023">00023 Zusatzversorgung</option>\
</select>';
          } else {
            container.innerHTML = '<input type="text" name="pers_input" />';
          }
        }
        document.getElementById("akteTypeDropdown").addEventListener("change", updateAkteOptions);
        updateAkteOptions();
      })();
    <\/script>
  `;

  // Neuer Header-Table für Name/PIN/Datum
  const headerTable = `
    <table style="width:100%; border-collapse: collapse; margin-bottom: 10px;">
      <tr>
        <td style="font-family: Arial; font-weight: bold; padding:4px;">Name:</td>
        <td style="border:1px solid #ccc; padding:4px; width:70%; height:16px;"></td>
      </tr>
      <tr>
        <td style="font-family: Arial; font-weight: bold; padding:4px;">PIN:</td>
        <td style="border:1px solid #ccc; padding:4px; width:70%; height:16px;"></td>
      </tr>
      <tr>
        <td style="font-family: Arial; font-weight: bold; padding:4px;">Datum:</td>
        <td style="padding:4px;">${dateString} ${timeString}</td>
      </tr>
    </table>
  `;

  // Gesamtes Print-HTML
  const printContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Druckansicht</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        color: #000;
        font-size: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        vertical-align: middle;
        font-family: 'Courier New', monospace;
        font-size: 12px;
      }
      .rechnung-text {
        text-align: right;
        padding-right: 12px;
      }
      .user-input input,
      .user-input select {
        width: 100%;
        padding: 4px;
        border: 1px solid #ccc;
        border-radius: 3px;
        font-size: 12px;
        box-sizing: border-box;
      }
      tr:hover {
        background-color: #f1f1f1;
      }
    </style>
  </head>
  <body>
    <h2>Tippstreifen 2.0 - Berechnung</h2>
    ${headerTable}
    <table>
      <thead>
        <tr>
          <th>Berechnung</th>
          <th>Notizen</th>
        </tr>
      </thead>
      <tbody>
        ${rechenstreifenContent}
        ${additionalRows}
      </tbody>
    </table>
    <div style="text-align:center; margin-top:20px;">
      <button onclick="window.print();">Drucken</button>
    </div>
    ${inlineScript}
  </body>
  </html>
  `;

  newWindow.document.open();
  newWindow.document.write(printContent);
  newWindow.document.close();
  newWindow.onload = () => newWindow.focus();
});

/**
 * 13) START
 */
console.log("Tippstreifen effects v0.1 active");
updateDisplay();
leftPanel.focus();
console.log("Tippstreifen calculator v1.13 loaded");
})();