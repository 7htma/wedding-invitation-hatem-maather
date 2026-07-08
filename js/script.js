const CONFIG = window.CONFIG || {};
const STORAGE_KEY = window.STORAGE_KEY || "hatem_maather_rsvp_entries";

const $ = (id) => document.getElementById(id);
const names = `${CONFIG.groom || "حاتم"} ومآثر`;

function pad(value) { return String(value).padStart(2, "0"); }
function getEntries() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function saveEntryLocal(entry) { const entries = getEntries(); entries.unshift(entry); localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
function setText(id, value) { const el = $(id); if (el) el.textContent = value; }

function hydrateContent() {
  setText("openingNames", `${CONFIG.groom} ومآثر`);
  setText("mainNames", `${CONFIG.groom} ومآثر`);
  setText("dateText", CONFIG.displayDate);
  setText("venueText", CONFIG.venue);
  setText("locationText", CONFIG.location);
  setText("hostOne", CONFIG.hosts?.[0] || "");
  setText("hostTwo", CONFIG.hosts?.[1] || "");
  const mapsBtn = $("mapsBtn"); if (mapsBtn) mapsBtn.href = CONFIG.mapsUrl;
  const whatsappBtn = $("whatsappBtn");
  if (whatsappBtn) {
    const link = location.href.split("#")[0];
    const msg = `يشرفنا حضوركم حفل زفاف ${CONFIG.groom} ومآثر يوم ${CONFIG.displayDate} في ${CONFIG.venue} - ${CONFIG.location}.\nرابط الدعوة: ${link}`;
    whatsappBtn.href = `https://wa.me/${CONFIG.whatsappNumber || ""}?text=${encodeURIComponent(msg)}`;
  }
}

function openInvitation() {
  const opening = $("openingScreen");
  const transition = $("transitionScreen");
  const content = $("invitationContent");
  opening?.classList.remove("is-active");
  setTimeout(() => { if (opening) opening.hidden = true; if (transition) { transition.hidden = false; transition.classList.add("is-active"); } }, 450);
  setTimeout(() => { if (transition) { transition.classList.remove("is-active"); transition.hidden = true; } if (content) content.hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); }, 2350);
}

function setupOpening() {
  const pearl = $("pearlHandle");
  if (!pearl) return;
  let startY = null;
  pearl.addEventListener("click", openInvitation);
  pearl.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") openInvitation(); });
  pearl.addEventListener("pointerdown", (event) => { startY = event.clientY; pearl.setPointerCapture?.(event.pointerId); });
  pearl.addEventListener("pointermove", (event) => {
    if (startY === null) return;
    const diff = startY - event.clientY;
    if (diff > 70) { startY = null; openInvitation(); }
  });
  pearl.addEventListener("pointerup", () => { startY = null; });
}

function startCountdown() {
  const target = new Date(CONFIG.weddingDate || "2026-08-06T19:30:00+04:00").getTime();
  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const day = 86400000, hour = 3600000, minute = 60000;
    setText("days", pad(Math.floor(diff / day)));
    setText("hours", pad(Math.floor((diff % day) / hour)));
    setText("minutes", pad(Math.floor((diff % hour) / minute)));
    setText("seconds", pad(Math.floor((diff % minute) / 1000)));
  };
  update(); setInterval(update, 1000);
}

function makeIcsDate(date) { return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; }
function downloadCalendar() {
  const start = new Date(CONFIG.weddingDate);
  const end = new Date(start.getTime() + (CONFIG.eventDurationHours || 4) * 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hatem Maather Wedding//AR",
    "BEGIN:VEVENT", `UID:${Date.now()}@hatem-maather-wedding`,
    `DTSTAMP:${makeIcsDate(new Date())}`, `DTSTART:${makeIcsDate(start)}`, `DTEND:${makeIcsDate(end)}`,
    `SUMMARY:دعوة زفاف ${CONFIG.groom} ومآثر`, `LOCATION:${CONFIG.venue} - ${CONFIG.location}`,
    "DESCRIPTION:دعوة زفاف رقمية", "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "hatem-maather-wedding.ics"; a.click(); URL.revokeObjectURL(url);
}

async function copyLink() {
  try { await navigator.clipboard.writeText(location.href.split("#")[0]); alert("تم نسخ رابط الدعوة"); }
  catch { prompt("انسخ الرابط:", location.href.split("#")[0]); }
}

async function shareInvitation() {
  const shareData = { title: "دعوة زفاف حاتم ومآثر", text: `يشرفنا حضوركم حفل زفاف ${CONFIG.groom} ومآثر`, url: location.href.split("#")[0] };
  if (navigator.share) await navigator.share(shareData); else copyLink();
}

function showGuestCard(entry) {
  const card = $("guestCard"); if (!card) return;
  setText("guestCardName", entry.name);
  setText("guestCardAttendance", entry.attendance);
  setText("guestCardGuests", `عدد الحضور: ${entry.guestsCount}`);
  setText("guestCardTime", new Date(entry.timestamp).toLocaleString("ar-OM"));
  card.hidden = false;
}

async function submitToEndpoint(entry) {
  if (!CONFIG.rsvpEndpoint || CONFIG.rsvpEndpoint.includes("PUT_GOOGLE_SCRIPT_URL")) {
    saveEntryLocal(entry);
    return { localOnly: true };
  }
  const response = await fetch(CONFIG.rsvpEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(entry) });
  saveEntryLocal(entry);
  return { sent: true, response };
}

function setupRsvp() {
  const openBtn = $("openRsvpBtn"), panel = $("rsvpPanel"), form = $("rsvpForm"), status = $("formStatus");
  openBtn?.addEventListener("click", () => { const next = panel.hidden; panel.hidden = !next; openBtn.setAttribute("aria-expanded", String(next)); });
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entry = {
      timestamp: new Date().toISOString(),
      name: $("guestName").value.trim(), phone: $("guestPhone").value.trim(),
      attendance: $("attendance").value, guestsCount: $("guestsCount").value,
      message: $("message").value.trim(), userAgent: navigator.userAgent
    };
    status.textContent = "جاري حفظ التأكيد...";
    try {
      const result = await submitToEndpoint(entry);
      status.textContent = result.localOnly ? "تم الحفظ محليًا. ربط Google Sheets غير مفعل بعد." : "تم إرسال تأكيد الحضور بنجاح.";
      showGuestCard(entry); form.reset(); $("guestsCount").value = 1;
    } catch (error) {
      saveEntryLocal(entry); status.textContent = "تم الحفظ محليًا بسبب تعذر الاتصال."; showGuestCard(entry);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateContent(); setupOpening(); startCountdown(); setupRsvp();
  $("calendarBtn")?.addEventListener("click", downloadCalendar);
  $("copyLinkBtn")?.addEventListener("click", copyLink);
  $("shareBtn")?.addEventListener("click", shareInvitation);
});
