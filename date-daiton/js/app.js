const scenes = Array.from(document.querySelectorAll('.scene'));
const $ = (id) => document.getElementById(id);

const state = {
  opened: false,
  routeStarted: false,
  ruleIndex: 0,
  accepted: false,
  sound: false,
};

const rules = [
  {
    title: 'القانون الأول',
    body: `<p>يُمنع التحدث خلال ديت ديتون عن:</p><ul><li>تجهيزات الزواج</li><li>تجهيزات الشقة</li><li>تجهيزات السفر</li></ul>`,
  },
  {
    title: 'القانون الثاني',
    body: `<p>المواضيع المسموح التحدث بها:</p><ul><li>الأحوال الشخصية</li><li>الحياة بشكل عام</li><li>الضحك والذكريات والأشياء الخفيفة</li></ul>`,
  },
  {
    title: 'القانون الثالث',
    body: `<p>المواضيع الثلاثة السابقة بنتكلم عنها بعد ديت ديتون في المنزل.</p><p>عشان نأخذ راحتنا ونستمتع بالريوق والطلعة.</p>`,
  },
];

function goTo(sceneId) {
  scenes.forEach((scene) => scene.classList.remove('active'));
  const target = $(sceneId);
  if (!target) return;
  target.classList.add('active');
  if (sceneId === 'classScene') {
    const wipe = $('doorWipe');
    if (wipe) setTimeout(() => wipe.remove(), 1400);
    renderRule();
  }
}

function openInvite() {
  if (state.opened) return;
  state.opened = true;
  $('heroCard')?.classList.add('hidden');
  $('inviteCard')?.classList.remove('hidden');
}

function renderRule() {
  const rule = rules[state.ruleIndex];
  $('ruleTitle').textContent = rule.title;
  $('ruleBody').innerHTML = rule.body;
  $('prevRule').disabled = state.ruleIndex === 0;
  $('nextRule').textContent = state.ruleIndex === rules.length - 1 ? 'خلصنا القوانين' : 'القانون التالي';
  if (state.ruleIndex === rules.length - 1) $('classNext').classList.remove('hidden');
}

function nextRule() {
  if (state.ruleIndex < rules.length - 1) {
    state.ruleIndex += 1;
    renderRule();
  } else {
    $('classNext').classList.remove('hidden');
  }
}

function prevRule() {
  if (state.ruleIndex > 0) {
    state.ruleIndex -= 1;
    renderRule();
  }
}

function startRoute() {
  if (state.routeStarted) return;
  state.routeStarted = true;
  $('rideBtn').textContent = 'جاري التحرك...';
  $('routePerson')?.classList.add('hide');
  setTimeout(() => $('car')?.classList.add('drive'), 350);
  setTimeout(() => {
    $('rideBtn').textContent = 'وصلنا Bound café';
    $('routeNext').classList.remove('hidden');
  }, 3300);
}

function launchConfetti() {
  const app = $('app');
  for (let i = 0; i < 78; i += 1) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`;
    c.style.animationDelay = `${Math.random() * 1.2}s`;
    app.appendChild(c);
    setTimeout(() => c.remove(), 4400);
  }
}

function acceptInvite() {
  if (state.accepted) return;
  state.accepted = true;
  localStorage.setItem('date_daiton_acceptance', JSON.stringify({
    accepted: true,
    timestamp: new Date().toISOString(),
    date: '2026-07-11',
    startTime: '09:20',
    venue: 'Bound café',
  }));
  $('savedText').textContent = 'تم حفظ الموافقة داخل الدعوة.';
  const hatem = $('finalHatem');
  hatem.classList.add('climb');
  setTimeout(() => {
    hatem.classList.remove('climb');
    hatem.classList.add('dance');
    $('finalCard').classList.add('hidden');
    $('celebration').classList.remove('hidden');
    launchConfetti();
  }, 1200);
}

async function shareInvite() {
  const url = location.href.split('#')[0];
  const text = 'دعوة ديت ديتون: موعدنا 11 يوليو 2026 الساعة 9:20 صباحًا إلى Bound café.';
  if (navigator.share) await navigator.share({ title: 'دعوة ديت ديتون', text, url });
  else {
    await navigator.clipboard.writeText(url);
    alert('تم نسخ الرابط');
  }
}

function toggleSound() {
  state.sound = !state.sound;
  $('soundBtn').textContent = state.sound ? '♫' : '♪';
  $('soundBtn').style.background = state.sound ? 'rgba(244,186,84,.82)' : 'rgba(255,255,255,.65)';
}

function init() {
  $('openInviteBtn')?.addEventListener('click', openInvite);
  document.querySelectorAll('.next').forEach((btn) => btn.addEventListener('click', () => goTo(btn.dataset.next)));
  $('rideBtn')?.addEventListener('click', startRoute);
  $('nextRule')?.addEventListener('click', nextRule);
  $('prevRule')?.addEventListener('click', prevRule);
  document.querySelectorAll('.accept').forEach((btn) => btn.addEventListener('click', acceptInvite));
  $('shareBtn')?.addEventListener('click', shareInvite);
  $('soundBtn')?.addEventListener('click', toggleSound);
}

document.addEventListener('DOMContentLoaded', init);
