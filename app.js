const modal = document.getElementById('loginModal');

const open = () => {
  modal.classList.remove('hidden');
};

const close = () => {
  modal.classList.add('hidden');
};


// ورود
document.getElementById('loginBtn').addEventListener('click', open);
document.getElementById('coachLogin').addEventListener('click', open);


// بستن پنجره
document.getElementById('closeModal').addEventListener('click', close);

modal.addEventListener('click', e => {
  if (e.target === modal) {
    close();
  }
});


// ------------------------------
// ورزشکار آزمایشی
// ------------------------------

const athletes = [
  {
    id: 1,
    name: "محمد احمدی",
    category: "نوجوانان",
    weight: "۶۶ کیلوگرم",
    belt: "قهوه‌ای",
    score: "۸.۲"
  }
];


// نمایش ورزشکاران

const grid = document.getElementById('athleteGrid');
const emptyState = document.getElementById('emptyState');

function renderAthletes(list) {

  if (!grid) return;

  grid.innerHTML = '';

  if (list.length === 0) {

    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');

    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');

  list.forEach(athlete => {

    const card = document.createElement('div');

    card.className = 'athlete-card';

    card.innerHTML = `
      <div class="athlete-card-icon">🥋</div>

      <div class="athlete-card-content">

        <h3>${athlete.name}</h3>

        <p>${athlete.category} • ${athlete.weight}</p>

        <div class="athlete-card-footer">

          <span>کمربند ${athlete.belt}</span>

          <strong>${athlete.score}/10</strong>

        </div>

      </div>
    `;

    card.addEventListener('click', () => {

      window.location.href =
        `athlete.html?id=${athlete.id}`;

    });

    grid.appendChild(card);

  });
}


// اجرای اولیه
renderAthletes(athletes);
