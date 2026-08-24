// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================
// GLOBAL DATA
// ======================================

let athletes = [];
let evaluationPeriods = [];
let evaluationCriteria = [];
let evaluations = [];


// ======================================
// AUTH
// ======================================

async function checkCoachAccess() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    redirectToLogin();
    return false;
  }

  const session = data?.session;

  if (!session) {
    redirectToLogin();
    return false;
  }

  const email =
    session.user?.email?.toLowerCase();

  if (email !== "coach.judotabiat@gmail.com") {

    await supabaseClient.auth.signOut();

    alert(
      "شما اجازه ورود به پنل مربی را ندارید."
    );

    redirectToLogin();

    return false;
  }

  const coachEmail =
    document.getElementById("coachEmail");

  if (coachEmail) {
    coachEmail.textContent =
      session.user.email;
  }

  return true;
}


// ======================================
// REDIRECT
// ======================================

function redirectToLogin() {
  window.location.href = "index.html";
}


// ======================================
// ELEMENTS
// ======================================

const sidebar =
  document.getElementById("coachSidebar");

const menuBtn =
  document.getElementById("menuBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const navItems =
  document.querySelectorAll(".nav-item");

const coachPages =
  document.querySelectorAll(".coach-page");


// ======================================
// MOBILE MENU
// ======================================

if (menuBtn) {

  menuBtn.addEventListener("click", () => {

    if (!sidebar) return;

    sidebar.classList.toggle("open");

  });

}


// ======================================
// PAGE NAVIGATION
// ======================================

function openPage(pageName) {

  coachPages.forEach(page => {
    page.classList.remove("active");
  });

  navItems.forEach(item => {
    item.classList.remove("active");
  });

  const targetPage =
    document.getElementById(
      `page-${pageName}`
    );

  const targetNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );

  if (targetPage) {
    targetPage.classList.add("active");
  }

  if (targetNav) {
    targetNav.classList.add("active");
  }

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  // وقتی وارد بخش ارزیابی شدیم
  if (pageName === "evaluations") {
    loadEvaluationPage();
  }

}


// ======================================
// NAVIGATION EVENTS
// ======================================

navItems.forEach(item => {

  item.addEventListener("click", () => {

    const page =
      item.dataset.page;

    openPage(page);

  });

});


// ======================================
// QUICK ACTIONS
// ======================================

const quickCards =
  document.querySelectorAll("[data-go]");

quickCards.forEach(card => {

  card.addEventListener("click", () => {

    const page =
      card.dataset.go;

    openPage(page);

  });

});


// ======================================
// LOGOUT
// ======================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      const confirmLogout =
        confirm(
          "آیا می‌خواهید از حساب مربی خارج شوید؟"
        );

      if (!confirmLogout) {
        return;
      }

      await supabaseClient.auth.signOut();

      window.location.href =
        "index.html";

    }
  );

}


// ======================================
// ATHLETES
// ======================================

async function loadAthletes() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("athletes")
      .select(`
        id,
        profile_id,
        first_name,
        last_name,
        national_id,
        age_group,
        weight,
        photo_url,
        total_score,
        bio,
        created_at,
        updated_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(
      "Athletes error:",
      error
    );

    showAthleteError(
      error.message
    );

    return;
  }

  athletes =
    data || [];

  updateDashboardStats();

  createCoachCategoryFilter(
    athletes
  );

  renderCoachAthletes(
    athletes
  );

  // پر کردن لیست ورزشکاران ارزیابی
  populateEvaluationAthletes();

}


// ======================================
// DASHBOARD STATS
// ======================================

function updateDashboardStats() {

  const totalAthletes =
    document.getElementById(
      "totalAthletes"
    );

  if (totalAthletes) {

    totalAthletes.textContent =
      toPersianNumber(
        athletes.length
      );

  }


  const totalEvaluations =
    document.getElementById(
      "totalEvaluations"
    );

  if (totalEvaluations) {

    totalEvaluations.textContent =
      toPersianNumber(
        evaluations.length
      );

  }


  const todayAttendance =
    document.getElementById(
      "todayAttendance"
    );

  if (todayAttendance) {
    todayAttendance.textContent = "۰";
  }


  const totalAchievements =
    document.getElementById(
      "totalAchievements"
    );

  if (totalAchievements) {
    totalAchievements.textContent = "۰";
  }

}


// ======================================
// RENDER ATHLETES
// ======================================

function renderCoachAthletes(list) {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  if (!list || list.length === 0) {

    grid.innerHTML = `

      <div class="empty-panel">

        <div>
          🥋
        </div>

        <h2>
          هنوز ورزشکاری ثبت نشده است
        </h2>

        <p>
          از گزینه «افزودن ورزشکار»
          برای ثبت ورزشکار جدید استفاده کنید.
        </p>

      </div>

    `;

    return;
  }


  list.forEach(athlete => {

    const card =
      document.createElement("div");

    card.className =
      "coach-athlete-card";


    const name =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ") ||
      "بدون نام";


    const category =
      athlete.age_group ||
      "رده ثبت نشده";


    const weight =
      athlete.weight !== null &&
      athlete.weight !== undefined &&
      athlete.weight !== ""
        ? `${athlete.weight} کیلوگرم`
        : "وزن ثبت نشده";


    const score =
      athlete.total_score !== null &&
      athlete.total_score !== undefined
        ? athlete.total_score
        : 0;


    let photoHTML = `
      <div class="athlete-placeholder">
        🥋
      </div>
    `;


    if (athlete.photo_url) {

      photoHTML = `
        <img
          src="${escapeHTML(
            athlete.photo_url
          )}"
          alt="${escapeHTML(name)}"
          class="athlete-photo"
        >
      `;

    }


    card.innerHTML = `

      <div class="coach-athlete-icon">

        ${photoHTML}

      </div>


      <div class="coach-athlete-info">

        <h3>
          ${escapeHTML(name)}
        </h3>

        <p>
          ${escapeHTML(category)}
        </p>


        <div class="coach-athlete-meta">

          <span class="athlete-weight">

            ⚖️
            ${escapeHTML(weight)}

          </span>


          <span class="athlete-score">

            امتیاز:
            ${escapeHTML(
              toPersianNumber(score)
            )}

          </span>

        </div>

      </div>


      <button
        class="athlete-view-btn"
        type="button"
      >
        مشاهده پروفایل
      </button>

    `;


    const viewBtn =
      card.querySelector(
        ".athlete-view-btn"
      );


    if (viewBtn) {

      viewBtn.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          window.location.href =
            `athlete.html?id=${encodeURIComponent(
              athlete.id
            )}`;

        }
      );

    }


    card.addEventListener(
      "click",
      () => {

        window.location.href =
          `athlete.html?id=${encodeURIComponent(
            athlete.id
          )}`;

      }
    );


    grid.appendChild(card);

  });

}


// ======================================
// ATHLETE ERROR
// ======================================

function showAthleteError(message = "") {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );

  if (!grid) return;

  grid.innerHTML = `

    <div class="empty-panel">

      <div>
        ⚠️
      </div>

      <h2>
        خطا در دریافت ورزشکاران
      </h2>

      <p>
        دریافت اطلاعات ورزشکاران انجام نشد.
      </p>

      ${
        message
          ? `
            <small
              style="
                display:block;
                margin-top:10px;
                direction:ltr;
                word-break:break-word;
              "
            >
              ${escapeHTML(message)}
            </small>
          `
          : ""
      }

    </div>

  `;

}


// ======================================
// SEARCH
// ======================================

const coachSearch =
  document.getElementById(
    "coachSearch"
  );

const coachFilter =
  document.getElementById(
    "coachFilter"
  );


function filterCoachAthletes() {

  const search =
    coachSearch
      ? coachSearch.value
          .trim()
          .toLowerCase()
      : "";


  const category =
    coachFilter
      ? coachFilter.value
      : "all";


  const result =
    athletes.filter(
      athlete => {

        const name =
          [
            athlete.first_name,
            athlete.last_name
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        const nationalId =
          athlete.national_id
            ? String(
                athlete.national_id
              ).toLowerCase()
            : "";


        const athleteCategory =
          athlete.age_group || "";


        const matchesSearch =
          name.includes(search) ||
          nationalId.includes(search);


        const matchesCategory =
          category === "all" ||
          athleteCategory ===
            category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  renderCoachAthletes(
    result
  );

}


if (coachSearch) {

  coachSearch.addEventListener(
    "input",
    filterCoachAthletes
  );

}


if (coachFilter) {

  coachFilter.addEventListener(
    "change",
    filterCoachAthletes
  );

}


// ======================================
// CATEGORY FILTER
// ======================================

function createCoachCategoryFilter(list) {

  if (!coachFilter) return;


  const categories =
    [
      ...new Set(

        list
          .map(
            athlete =>
              athlete.age_group
          )
          .filter(Boolean)

      )
    ];


  coachFilter.innerHTML = `

    <option value="all">
      همه رده‌ها
    </option>

  `;


  categories.forEach(category => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      category;

    option.textContent =
      category;

    coachFilter.appendChild(
      option
    );

  });

}


// ======================================
// ADD ATHLETE MODAL
// ======================================

const athleteModal =
  document.getElementById(
    "athleteModal"
  );

const addAthleteBtn =
  document.getElementById(
    "addAthleteBtn"
  );

const closeAthleteModal =
  document.getElementById(
    "closeAthleteModal"
  );

const saveAthleteBtn =
  document.getElementById(
    "saveAthleteBtn"
  );


function openAthleteModal() {

  if (!athleteModal) return;

  athleteModal.classList.remove(
    "hidden"
  );

}


function closeAthleteForm() {

  if (!athleteModal) return;

  athleteModal.classList.add(
    "hidden"
  );

}


if (addAthleteBtn) {

  addAthleteBtn.addEventListener(
    "click",
    openAthleteModal
  );

}


if (closeAthleteModal) {

  closeAthleteModal.addEventListener(
    "click",
    closeAthleteForm
  );

}


if (athleteModal) {

  athleteModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        athleteModal
      ) {

        closeAthleteForm();

      }

    }
  );

}


// ======================================
// SAVE ATHLETE
// ======================================

async function saveAthlete() {

  const firstName =
    document.getElementById(
      "athleteFirstName"
    )?.value.trim();


  const lastName =
    document.getElementById(
      "athleteLastName"
    )?.value.trim();


  const ageGroup =
    document.getElementById(
      "athleteAgeGroup"
    )?.value.trim();


  const weightValue =
    document.getElementById(
      "athleteWeight"
    )?.value.trim();


  const nationalId =
    document.getElementById(
      "athleteNationalId"
    )?.value.trim();


  if (!firstName || !lastName) {

    alert(
      "نام و نام خانوادگی را وارد کنید."
    );

    return;
  }


  if (!nationalId) {

    alert(
      "کد ملی ورزشکار را وارد کنید."
    );

    return;
  }


  if (!/^\d{10}$/.test(nationalId)) {

    alert(
      "کد ملی باید ۱۰ رقم باشد."
    );

    return;
  }


  if (!saveAthleteBtn) {
    return;
  }


  saveAthleteBtn.disabled =
    true;

  saveAthleteBtn.textContent =
    "در حال ثبت...";


  try {

    const weight =
      weightValue
        ? Number(weightValue)
        : null;


    if (
      weightValue &&
      Number.isNaN(weight)
    ) {

      alert(
        "وزن وارد شده صحیح نیست."
      );

      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("athletes")
        .insert({

          first_name:
            firstName,

          last_name:
            lastName,

          national_id:
            nationalId,

          age_group:
            ageGroup || null,

          weight:
            weight,

          total_score:
            0

        });


    if (error) {

      console.error(
        "Save athlete error:",
        error
      );

      alert(
        "ثبت ورزشکار انجام نشد.\n\n" +
        error.message
      );

      return;
    }


    alert(
      "ورزشکار با موفقیت ثبت شد."
    );


    clearAthleteForm();

    closeAthleteForm();

    await loadAthletes();

    openPage(
      "athletes"
    );

  } catch (error) {

    console.error(error);

    alert(
      "خطایی هنگام ثبت ورزشکار رخ داد."
    );

  } finally {

    saveAthleteBtn.disabled =
      false;

    saveAthleteBtn.textContent =
      "ثبت ورزشکار";

  }

}


if (saveAthleteBtn) {

  saveAthleteBtn.addEventListener(
    "click",
    saveAthlete
  );

}


// ======================================
// CLEAR ATHLETE FORM
// ======================================

function clearAthleteForm() {

  const fields = [

    "athleteFirstName",
    "athleteLastName",
    "athleteAgeGroup",
    "athleteWeight",
    "athleteNationalId",
    "athleteBio",
    "athletePhotoUrl"

  ];


  fields.forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value = "";
    }

  });

}


// ======================================================
// ======================================================
// EVALUATION SYSTEM
// ======================================================
// ======================================================


// ======================================
// EVALUATION ELEMENTS
// ======================================

const evaluationAthleteSelect =
  document.getElementById(
    "evaluationAthleteSelect"
  );

const evaluationPeriodSelect =
  document.getElementById(
    "evaluationPeriodSelect"
  );

const newEvaluationBtn =
  document.getElementById(
    "newEvaluationBtn"
  );

const evaluationsList =
  document.getElementById(
    "evaluationsList"
  );


// ======================================
// LOAD EVALUATION PERIODS
// ======================================

async function loadEvaluationPeriods() {

  if (!evaluationPeriodSelect) {
    return;
  }

  evaluationPeriodSelect.innerHTML = `

    <option value="">
      در حال دریافت دوره‌ها...
    </option>

  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_periods")
      .select(`
        id,
        title,
        start_date,
        end_date,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Evaluation periods error:",
      error
    );

    evaluationPeriodSelect.innerHTML = `

      <option value="">
        خطا در دریافت دوره‌ها
      </option>

    `;

    return;
  }


  evaluationPeriods =
    data || [];


  if (evaluationPeriods.length === 0) {

    evaluationPeriodSelect.innerHTML = `

      <option value="">
        هنوز دوره ارزیابی ثبت نشده است
      </option>

    `;

    return;
  }


  evaluationPeriodSelect.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

  `;


  evaluationPeriods.forEach(period => {

    const option =
      document.createElement("option");

    option.value =
      period.id;

    option.textContent =
      period.title;

    evaluationPeriodSelect.appendChild(
      option
    );

  });

}


// ======================================
// LOAD EVALUATION CRITERIA
// ======================================

async function loadEvaluationCriteria() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_criteria")
      .select(`
        id,
        name,
        description,
        active,
        created_at
      `)
      .eq(
        "active",
        true
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Evaluation criteria error:",
      error
    );

    evaluationCriteria = [];

    return;
  }


  evaluationCriteria =
    data || [];

}


// ======================================
// POPULATE ATHLETE SELECT
// ======================================

function populateEvaluationAthletes() {

  if (!evaluationAthleteSelect) {
    return;
  }


  evaluationAthleteSelect.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

  `;


  if (!athletes.length) {
    return;
  }


  athletes.forEach(athlete => {

    const option =
      document.createElement("option");


    option.value =
      athlete.id;


    const name =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ") ||
      "بدون نام";


    option.textContent =
      name;


    evaluationAthleteSelect.appendChild(
      option
    );

  });

}


// ======================================
// LOAD EVALUATIONS
// ======================================

async function loadEvaluations() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluations")
      .select(`
        id,
        athlete_id,
        period_id,
        coach_id,
        total_score,
        notes,
        evaluated_at
      `)
      .order(
        "evaluated_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Evaluations error:",
      error
    );

    evaluations = [];

    return;
  }


  evaluations =
    data || [];


  updateDashboardStats();

}


// ======================================
// LOAD EVALUATION PAGE
// ======================================

let evaluationPageLoaded =
  false;


async function loadEvaluationPage() {

  if (!evaluationPageLoaded) {

    await Promise.all([

      loadEvaluationPeriods(),

      loadEvaluationCriteria(),

      loadEvaluations()

    ]);

    populateEvaluationAthletes();

    evaluationPageLoaded =
      true;

  }

  renderSelectedEvaluations();

}


// ======================================
// SELECTION EVENTS
// ======================================

if (evaluationAthleteSelect) {

  evaluationAthleteSelect.addEventListener(
    "change",
    () => {

      renderSelectedEvaluations();

    }
  );

}


if (evaluationPeriodSelect) {

  evaluationPeriodSelect.addEventListener(
    "change",
    () => {

      renderSelectedEvaluations();

    }
  );

}


// ======================================
// RENDER SELECTED EVALUATIONS
// ======================================

async function renderSelectedEvaluations() {

  if (!evaluationsList) {
    return;
  }


  const athleteId =
    evaluationAthleteSelect?.value ||
    "";

  const periodId =
    evaluationPeriodSelect?.value ||
    "";


  if (!athleteId || !periodId) {

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          انتخاب ورزشکار و دوره
        </h2>

        <p>
          برای مشاهده ارزیابی‌ها،
          یک ورزشکار و یک دوره ارزیابی را انتخاب کنید.
        </p>

      </div>

    `;

    return;

  }


  const selected =
    evaluations.filter(
      evaluation =>
        evaluation.athlete_id ===
          athleteId &&
        evaluation.period_id ===
          periodId
    );


  if (!selected.length) {

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          هنوز ارزیابی‌ای ثبت نشده است
        </h2>

        <p>
          برای این ورزشکار در این دوره
          ارزیابی‌ای ثبت نشده است.
        </p>

      </div>

    `;

    return;

  }


  evaluationsList.innerHTML = "";


  for (
    const evaluation
    of selected
  ) {

    await renderEvaluationCard(
      evaluation
    );

  }

}


// ======================================
// RENDER EVALUATION CARD
// ======================================

async function renderEvaluationCard(
  evaluation
) {

  const athlete =
    athletes.find(
      item =>
        item.id ===
        evaluation.athlete_id
    );


  const period =
    evaluationPeriods.find(
      item =>
        item.id ===
        evaluation.period_id
    );


  if (!athlete) {
    return;
  }


  const name =
    [
      athlete.first_name,
      athlete.last_name
    ]
      .filter(Boolean)
      .join(" ") ||
    "بدون نام";


  const periodTitle =
    period?.title ||
    "دوره نامشخص";


  const scores =
    await getEvaluationScores(
      evaluation.id
    );


  let criteriaHTML = "";


  if (scores.length) {

    criteriaHTML = scores
      .map(scoreRow => {

        const criterion =
          evaluationCriteria.find(
            criterion =>
              criterion.id ===
              scoreRow.criterion_id
          );


        if (!criterion) {
          return "";
        }


        const score =
          Number(
            scoreRow.score
          );


        const percentage =
          Math.max(
            0,
            Math.min(
              100,
              score * 10
            )
          );


        return `

          <div class="criteria-preview-row">

            <div class="criteria-preview-name">
              ${escapeHTML(
                criterion.name
              )}
            </div>

            <div class="criteria-preview-bar">

              <div
                class="criteria-preview-fill"
                style="width:${percentage}%"
              ></div>

            </div>

            <div class="criteria-preview-score">
              ${escapeHTML(
                toPersianNumber(score)
              )}
              /۱۰
            </div>

          </div>

        `;

      })
      .join("");

  }


  const card =
    document.createElement("div");

  card.className =
    "evaluation-card";


  let avatarHTML = `
    🥋
  `;


  if (athlete.photo_url) {

    avatarHTML = `
      <img
        src="${escapeHTML(
          athlete.photo_url
        )}"
        alt="${escapeHTML(name)}"
      >
    `;

  }


  card.innerHTML = `

    <div class="evaluation-card-header">

      <div class="evaluation-athlete">

        <div class="evaluation-avatar">
          ${avatarHTML}
        </div>

        <div>

          <h3>
            ${escapeHTML(name)}
          </h3>

          <p>
            ${escapeHTML(periodTitle)}
          </p>

        </div>

      </div>


      <div class="evaluation-score">

        <span>
          امتیاز نهایی
        </span>

        <strong>
          ${escapeHTML(
            toPersianNumber(
              evaluation.total_score ?? 0
            )
          )}
        </strong>

      </div>

    </div>


    <div class="criteria-preview">

      ${
        criteriaHTML ||
        `
          <p class="muted">
            امتیازی برای معیارها ثبت نشده است.
          </p>
        `
      }

    </div>

  `;


  evaluationsList.appendChild(
    card
  );

}


// ======================================
// GET EVALUATION SCORES
// ======================================

async function getEvaluationScores(
  evaluationId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_scores")
      .select(`
        id,
        evaluation_id,
        criterion_id,
        score
      `)
      .eq(
        "evaluation_id",
        evaluationId
      );


  if (error) {

    console.error(
      "Evaluation scores error:",
      error
    );

    return [];

  }


  return data || [];

}


// ======================================
// NEW EVALUATION
// ======================================

if (newEvaluationBtn) {

  newEvaluationBtn.addEventListener(
    "click",
    async () => {

      const athleteId =
        evaluationAthleteSelect?.value ||
        "";

      const periodId =
        evaluationPeriodSelect?.value ||
        "";


      if (!athleteId) {

        alert(
          "ابتدا یک ورزشکار انتخاب کنید."
        );

        return;

      }


      if (!periodId) {

        alert(
          "ابتدا یک دوره ارزیابی انتخاب کنید."
        );

        return;

      }


      await openNewEvaluationForm(
        athleteId,
        periodId
      );

    }
  );

}


// ======================================
// NEW EVALUATION FORM
// ======================================

async function openNewEvaluationForm(
  athleteId,
  periodId
) {

  if (!evaluationCriteria.length) {

    await loadEvaluationCriteria();

  }


  if (!evaluationCriteria.length) {

    alert(
      "هیچ معیار فعالی برای ارزیابی وجود ندارد."
    );

    return;

  }


  const athlete =
    athletes.find(
      item =>
        item.id === athleteId
    );


  const period =
    evaluationPeriods.find(
      item =>
        item.id === periodId
    );


  if (!athlete || !period) {
    return;
  }


  const name =
    [
      athlete.first_name,
      athlete.last_name
    ]
      .filter(Boolean)
      .join(" ");


  let criteriaHTML = "";


  evaluationCriteria.forEach(
    criterion => {

      criteriaHTML += `

        <label
          style="
            display:block;
            margin-bottom:15px;
          "
        >

          <span
            style="
              display:block;
              margin-bottom:6px;
              font-weight:600;
            "
          >
            ${escapeHTML(
              criterion.name
            )}
          </span>

          ${
            criterion.description
              ? `
                <small
                  style="
                    display:block;
                    color:#777;
                    margin-bottom:6px;
                  "
                >
                  ${escapeHTML(
                    criterion.description
                  )}
                </small>
              `
              : ""
          }

          <input
            class="evaluation-score-input"
            data-criterion-id="${escapeHTML(
              criterion.id
            )}"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value="0"
            placeholder="۰ تا ۱۰"
            style="
              width:100%;
              min-height:46px;
              padding:10px;
              border:1px solid #ddd;
              border-radius:10px;
              font-family:inherit;
              box-sizing:border-box;
            "
          >

        </label>

      `;

    }
  );


  const modal =
    document.createElement("div");

  modal.className =
    "modal";

  modal.style.zIndex =
    "9999";


  modal.innerHTML = `

    <div
      class="modal-card"
      style="
        max-height:90vh;
        overflow-y:auto;
      "
    >

      <button
        class="close"
        type="button"
        id="closeEvaluationModal"
      >
        ×
      </button>


      <span class="eyebrow">
        NEW EVALUATION
      </span>


      <h2>
        ارزیابی ${escapeHTML(name)}
      </h2>


      <p class="muted">
        دوره: ${escapeHTML(period.title)}
      </p>


      <div style="margin-top:20px;">

        ${criteriaHTML}

      </div>


      <label
        style="
          display:block;
          margin-top:10px;
        "
      >

        توضیحات

        <textarea
          id="newEvaluationNotes"
          rows="4"
          placeholder="توضیحات مربی درباره عملکرد ورزشکار..."
          style="
            width:100%;
            margin-top:7px;
            padding:10px;
            border:1px solid #ddd;
            border-radius:10px;
            font-family:inherit;
            box-sizing:border-box;
          "
        ></textarea>

      </label>


      <button
        class="primary wide"
        id="saveEvaluationBtn"
        type="button"
        style="margin-top:15px;"
      >
        ثبت ارزیابی
      </button>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  const closeBtn =
    modal.querySelector(
      "#closeEvaluationModal"
    );


  const saveBtn =
    modal.querySelector(
      "#saveEvaluationBtn"
    );


  closeBtn.addEventListener(
    "click",
    () => {

      modal.remove();

    }
  );


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {

        modal.remove();

      }

    }
  );


  saveBtn.addEventListener(
    "click",
    async () => {

      await saveNewEvaluation(
        modal,
        athleteId,
        periodId
      );

    }
  );

}


// ======================================
// SAVE NEW EVALUATION
// ======================================

async function saveNewEvaluation(
  modal,
  athleteId,
  periodId
) {

  const saveBtn =
    modal.querySelector(
      "#saveEvaluationBtn"
    );


  const inputs =
    modal.querySelectorAll(
      ".evaluation-score-input"
    );


  const notes =
    modal.querySelector(
      "#newEvaluationNotes"
    )?.value.trim() ||
    "";


  const scores = [];


  for (
    const input
    of inputs
  ) {

    const criterionId =
      input.dataset.criterionId;


    const score =
      Number(input.value);


    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 10
    ) {

      alert(
        "همه امتیازها باید بین ۰ تا ۱۰ باشند."
      );

      return;

    }


    scores.push({

      criterion_id:
        criterionId,

      score:
        score

    });

  }


  if (!scores.length) {

    alert(
      "هیچ معیاری برای ثبت وجود ندارد."
    );

    return;

  }


  // میانگین ساده؛ بدون ضریب
  const totalScore =
    scores.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(item.score),
      0
    ) /
    scores.length;


  if (saveBtn) {

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "در حال ثبت...";

  }


  try {

    // دریافت کاربر فعلی
    const {
      data: sessionData
    } =
      await supabaseClient.auth.getSession();


    const userId =
      sessionData?.session?.user?.id ||
      null;


    // ثبت ارزیابی اصلی
    const {
      data: evaluation,
      error: evaluationError
    } =
      await supabaseClient
        .from("evaluations")
        .insert({

          athlete_id:
            athleteId,

          period_id:
            periodId,

          coach_id:
            userId,

          total_score:
            Number(
              totalScore.toFixed(2)
            ),

          notes:
            notes || null

        })
        .select()
        .single();


    if (evaluationError) {

      console.error(
        "Create evaluation error:",
        evaluationError
      );

      alert(
        "ثبت ارزیابی انجام نشد.\n\n" +
        evaluationError.message
      );

      return;

    }


    // ثبت امتیاز معیارها
    const scoreRows =
      scores.map(item => ({

        evaluation_id:
          evaluation.id,

        criterion_id:
          item.criterion_id,

        score:
          item.score

      }));


    const {
      error: scoresError
    } =
      await supabaseClient
        .from("evaluation_scores")
        .insert(
          scoreRows
        );


    if (scoresError) {

      console.error(
        "Create evaluation scores error:",
        scoresError
      );


      // پاک کردن ارزیابی ناقص
      await supabaseClient
        .from("evaluations")
        .delete()
        .eq(
          "id",
          evaluation.id
        );


      alert(
        "ثبت امتیازهای ارزیابی انجام نشد.\n\n" +
        scoresError.message
      );

      return;

    }


    // بروزرسانی آرایه محلی
    evaluations.unshift(
      evaluation
    );


    updateDashboardStats();


    modal.remove();


    alert(
      "ارزیابی با موفقیت ثبت شد."
    );


    await renderSelectedEvaluations();


  } catch (error) {

    console.error(
      "Evaluation save error:",
      error
    );


    alert(
      "خطایی هنگام ثبت ارزیابی رخ داد."
    );

  } finally {

    if (saveBtn) {

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "ثبت ارزیابی";

    }

  }

}


// ======================================================
// UTILITY
// ======================================================


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ======================================
// PERSIAN NUMBERS
// ======================================

function toPersianNumber(value) {

  return String(value)
    .replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[digit]
    );

}


// ======================================
// START
// ======================================

async function startCoachApp() {

  const allowed =
    await checkCoachAccess();


  if (!allowed) {
    return;
  }


  // اول ورزشکاران
  await loadAthletes();


  // داده‌های ارزیابی را هم از ابتدا آماده می‌کنیم
  await Promise.all([

    loadEvaluationPeriods(),

    loadEvaluationCriteria(),

    loadEvaluations()

  ]);


  populateEvaluationAthletes();

  updateDashboardStats();

}


// ======================================
// START APP
// ======================================

startCoachApp();
