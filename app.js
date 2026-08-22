// ======================================
// LOGIN
// ======================================

const modal = document.getElementById("loginModal");

function openLogin() {
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeLogin() {
  if (modal) {
    modal.classList.add("hidden");
  }
}

const loginBtn = document.getElementById("loginBtn");
const coachLogin = document.getElementById("coachLogin");
const closeModal = document.getElementById("closeModal");

if (loginBtn) {
  loginBtn.addEventListener("click", openLogin);
}

if (coachLogin) {
  coachLogin.addEventListener("click", openLogin);
}

if (closeModal) {
  closeModal.addEventListener("click", closeLogin);
}

if (modal) {
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeLogin();
    }
  });
}


// ======================================
// TEST ATHLETE
// ======================================

const athletes = [
  {
    id: "1f37b208-e8a9-41da-b2dc-4feda0e9c393",
    name: "محمد احمدی",
    category: "نوجوانان",
    weight: "۶۶ کیلوگرم",
    belt: "قهوه‌ای",
    score: "۰"
  }
];


// ======================================
// ATHLETE ELEMENTS
// ======================================

const grid = document.getElementById("athleteGrid");
const emptyState = document.getElementById("emptyState");


// ======================================
// RENDER ATHLETES
// ======================================

function renderAthletes() {

  if (!grid) return;

  grid.innerHTML = "";

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  grid.classList.remove("hidden");

  athletes.forEach(function (athlete) {

    const card = document.createElement("div");

    card.className = "athlete-card";

    card.innerHTML = `
      <div class="athlete-card-icon">
        🥋
      </div>

      <div class="athlete-card-content">

        <h3>${athlete.name}</h3>

        <p>
          ${athlete.category} • ${athlete.weight}
        </p>

        <div class="athlete-card-footer">

          <span>
            کمربند ${athlete.belt}
          </span>

          <strong>
            مشاهده پروفایل
          </strong>

        </div>

      </div>
    `;

    card.addEventListener("click", function () {

      window.location.href =
        "athlete.html?id=" + athlete.id;

    });

    grid.appendChild(card);

  });

}


// ======================================
// START
// ======================================

renderAthletes();
