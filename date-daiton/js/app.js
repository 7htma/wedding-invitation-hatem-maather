const scenes = Array.from(document.querySelectorAll('.scene'));
const state = {
  curtainOpened: false,
  routeStarted: false,
  ruleIndex: 0,
  accepted: false,
  sound: false,
};

const rules = [
  {
    title: 'القانون الأول',
    content: `
      <p>يُمنع التحدث خلال ديت ديتون عن المواضيع التالية:</p>
      <ul>
        <li>تجهيزات الزواج</li>
        <li>تجهيزات الشقة</li>
        <li>تجهيزات السفر</li>
      </ul>
    `,
  },
  {
    title: 'القانون الثاني',
    content: `
      <p>المواضيع المسموح التحدث بها:</p>
      <ul>
        <li>الأحوال الشخصية</li>
        <li>الحياة بشكل عام</li>
        <li>الضحك، الذكريات، والأشياء الخفيفة الجميلة</li>
      </ul>
    `,
  },
  {
    title: 'القانون الثالث',
    content: `
      <p>المواضيع الثلاثة السابقة بنتكلم عنها بعد ديت ديتون في المنزل.</p>
      <p>السبب: نأخذ راحتنا في الطلعة، ونخلي الريوق للضحك والهدوء والوناسة.</p>
    `,
  },
];

const $ = (id) => document.getElementById(id);

function goTo(sceneId) {
  scenes.forEach(scene => scene.classList.remove('active'));
  const target = $(sceneId);
  if (target) {
    target.classList.add('active');
    if (sceneId === 'sceneClass') {
      setTimeout(() => $('classTransition')?.remove(), 1500);
      renderRule();
    }
  }
}

function openCurtain() {
  if (state.curtainOpened) return;
  state.curtainOpened = true;

  const stage = $('curtainStage');
  const title = $('titleCard');
  const msg = $('inviteMessage');
  const speech = $('introSpeech');
  const button = $('openCurtainBtn');

  button.disabled = true;
  stage.classList.add('open');
  speech.textContent = 'تفضلي.. فتحت الدعوة';

  setTimeout(() => title.classList.add('hidden'), 520);
  setTimeout(() => {
    msg.classList.remove('hidden');
    msg.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 1700);
}

function renderRule() {
  const rule = rules[state.ruleIndex];
  $('ruleTitle').textContent = rule.title;
  $('ruleContent').innerHTML = rule.content;
  $('teacherAvatar')?.classList.remove('tap');
  void $('teacherAvatar')?.offsetWidth;
  $('teacherAvatar')?.classList.add('tap');
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
  const car = $('routeCar');
  const avatar = $('routeAvatar');
  const btn = $('rideBtn');
  btn.textContent = 'جاري التحرك...';
  avatar.classList.add('hide');
  setTimeout(() => car.classList.add('drive'), 350);
  setTimeout(() => {
    btn.textContent = 'وصلنا Bound café';
    $('routeNext').classList.remove('hidden');
  }, 3300);
}

function launchConfetti() {
  const app = $('app');
  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 1.2}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    app.appendChild(piece);
    setTimeout(() => piece.remove(), 4300);
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
  const avatar = $('finalAvatar');
  avatar.classList.add('climb');
  setTimeout(() => {
    avatar.classList.remove('climb');
    avatar.classList.add('dance');
    $('finalCard').classList.add('hidden');
    $('celebrationCard').classList.remove('hidden');
    launchConfetti();
  }, 1250);
}

async function shareInvite() {
  const url = location.href.split('#')[0];
  const text = 'دعوة ديت ديتون: موعدنا 11 يوليو 2026 الساعة 9:20 صباحًا إلى Bound café.';
  if (navigator.share) await navigator.share({ title: 'دعوة ديت ديتون', text, url });
  else {
    await navigator.clipboard.writeText(url);
    alert('تم نسخ رابط الدعوة');
  }
}

function toggleSound() {
  state.sound = !state.sound;
  $('soundBtn').textContent = state.sound ? '♫' : '♪';
  $('soundBtn').style.background = state.sound ? 'rgba(244,184,77,.82)' : 'rgba(255,255,255,.65)';
}

function init() {
  $('openCurtainBtn')?.addEventListener('click', (event) => {
    event.stopPropagation();
    openCurtain();
  });
  $('curtainStage')?.addEventListener('click', openCurtain);
  document.querySelectorAll('.next-scene').forEach(btn => btn.addEventListener('click', () => goTo(btn.dataset.next)));
  $('rideBtn')?.addEventListener('click', startRoute);
  $('nextRule')?.addEventListener('click', nextRule);
  $('prevRule')?.addEventListener('click', prevRule);
  document.querySelectorAll('.accept-btn').forEach(btn => btn.addEventListener('click', acceptInvite));
  $('shareBtn')?.addEventListener('click', shareInvite);
  $('soundBtn')?.addEventListener('click', toggleSound);
  $('soundBtn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') toggleSound();
  });
}

document.addEventListener('DOMContentLoaded', init);
