const CONFIG = window.CONFIG || {};
const STORAGE_KEY = window.STORAGE_KEY || "hatem_maather_rsvp_entries";
let currentEntries = [];
const $ = (id) => document.getElementById(id);

function getLocalEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function setStatus(message) { const el = $("adminStatus"); if (el) el.textContent = message; }
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"]/g, (m) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[m]));
}

async function fetchEntries() {
  if (!CONFIG.rsvpEndpoint) {
    setStatus("يتم عرض البيانات المحفوظة محليًا لأن Google Sheets غير مربوط بعد.");
    return getLocalEntries();
  }
  try {
    const url = CONFIG.rsvpEndpoint + (CONFIG.rsvpEndpoint.includes("?") ? "&" : "?") + "action=list";
    const response = await fetch(url);
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.entries)) return data.entries;
    throw new Error("Unexpected response");
  } catch (error) {
    setStatus("تعذر جلب بيانات Google Sheets، لذلك تم عرض البيانات المحلية.");
    return getLocalEntries();
  }
}

function render(entries) {
  currentEntries = entries;
  const body = $("guestsTableBody");
  if (!body) return;
  if (!entries.length) {
    body.innerHTML = '<tr><td colspan="6">لا توجد تسجيلات حتى الآن.</td></tr>';
  } else {
    body.innerHTML = entries.map((entry) => `
      <tr>
        <td>${escapeHtml(entry.name)}</td>
        <td>${escapeHtml(entry.phone)}</td>
        <td>${escapeHtml(entry.attendance)}</td>
        <td>${escapeHtml(entry.guestsCount)}</td>
        <td>${escapeHtml(entry.message)}</td>
        <td>${entry.timestamp ? new Date(entry.timestamp).toLocaleString("ar-OM") : ""}</td>
      </tr>
    `).join("");
  }
  const attending = entries.filter((x) => x.attendance === "سأحضر بإذن الله");
  const totalGuests = attending.reduce((sum, x) => sum + Number(x.guestsCount || 0), 0);
  $("totalCount").textContent = entries.length;
  $("attendingCount").textContent = attending.length;
  $("guestTotalCount").textContent = totalGuests;
}

async function load() {
  setStatus("جاري تحديث البيانات...");
  const entries = await fetchEntries();
  render(entries);
  if (!CONFIG.rsvpEndpoint) setStatus("البيانات المعروضة محلية من نفس الجهاز فقط.");
  else setStatus("تم تحديث البيانات.");
}

function exportCsv() {
  const headers = ["timestamp","name","phone","attendance","guestsCount","message","userAgent"];
  const rows = [headers.join(",")].concat(currentEntries.map((entry) => headers.map((h) => `"${String(entry[h] || "").replace(/"/g, '""')}"`).join(",")));
  const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "wedding-rsvp.csv"; a.click(); URL.revokeObjectURL(url);
}

function clearLocal() {
  if (!confirm("هل تريد مسح البيانات المحلية من هذا الجهاز؟")) return;
  localStorage.removeItem(STORAGE_KEY); load();
}

document.addEventListener("DOMContentLoaded", () => {
  $("refreshBtn")?.addEventListener("click", load);
  $("exportCsvBtn")?.addEventListener("click", exportCsv);
  $("clearLocalBtn")?.addEventListener("click", clearLocal);
  load();
});
