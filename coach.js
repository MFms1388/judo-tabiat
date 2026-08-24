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

let athletes = [];


// ======================================
// LOAD ATHLETES
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

        <div>🥋</div>

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
            ⚖️ ${escapeHTML(weight)}
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
// ERROR
// ======================================

function showAthleteError(message = "") {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );

  if (!grid) return;

  grid.innerHTML = `

    <div class="empty-panel">

      <div>⚠️</div>

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
// HTML ESCAPE
// ======================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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


  const bio =
    document.getElementById(
      "athleteBio"
    )?.value.trim();


  const photoUrl =
    document.getElementById(
      "athletePhotoUrl"
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

          bio:
            bio || null,

          photo_url:
            photoUrl || null,

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


// ======================================
// EVALUATION DATA
// ======================================

let evaluationPeriods = [];

let evaluationCriteria = [];


// ======================================
// LOAD EVALUATION PERIODS
// ======================================

async function loadEvaluationPeriods() {

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

    return;

  }


  evaluationPeriods =
    data || [];


  populateEvaluationPeriods();

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
        active
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

    return;

  }


  evaluationCriteria =
    data || [];

}


// ======================================
// POPULATE ATHLETE SELECT
// ======================================

function populateEvaluationAthletes() {

  const select =
    document.getElementById(
      "evaluationAthlete"
    );

  if (!select) return;


  select.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

  `;


  athletes.forEach(athlete => {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      athlete.id;


    option.textContent =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ") ||
      "بدون نام";


    select.appendChild(
      option
    );

  });

}


// ======================================
// POPULATE PERIOD SELECT
// ======================================

function populateEvaluationPeriods() {

  const select =
    document.getElementById(
      "evaluationPeriod"
    );

  if (!select) return;


  select.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

  `;


  evaluationPeriods.forEach(period => {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      period.id;


    option.textContent =
      period.title;


    select.appendChild(
      option
    );

  });

}


// ======================================
// LOAD EVALUATIONS
// ======================================

async function loadEvaluations() {

  const athleteId =
    document.getElementById(
      "evaluationAthlete"
    )?.value;


  const periodId =
    document.getElementById(
      "evaluationPeriod"
    )?.value;


  if (!athleteId || !periodId) {

    renderEmptyEvaluations();

    return;

  }


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
      .eq(
        "athlete_id",
        athleteId
      )
      .eq(
        "period_id",
        periodId
      )
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

    return;

  }


  renderEvaluations(
    data || []
  );

}


// ======================================
// EMPTY EVALUATIONS
// ======================================

function renderEmptyEvaluations() {

  const box =
    document.getElementById(
      "evaluationResults"
    );

  if (!box) return;


  box.innerHTML = `

    <div class="empty-panel">

      <div>
        📊
      </div>

      <h2>
        هنوز ارزیابی‌ای ثبت نشده است
      </h2>

      <p>
        برای شروع، یک ورزشکار و دوره ارزیابی انتخاب کنید.
      </p>

    </div>

  `;

}


// ======================================
// RENDER EVALUATIONS
// ======================================

function renderEvaluations(list) {

  const box =
    document.getElementById(
      "evaluationResults"
    );

  if (!box) return;


  if (!list.length) {

    renderEmptyEvaluations();

    return;

  }


  box.innerHTML = "";


  list.forEach(evaluation => {

    const item =
      document.createElement("div");


    item.className =
      "evaluation-result-card";


    item.innerHTML = `

      <h3>
        امتیاز کل:
        ${escapeHTML(
          toPersianNumber(
            evaluation.total_score ?? 0
          )
        )}
      </h3>

      <p>
        تاریخ:
        ${escapeHTML(
          new Date(
            evaluation.evaluated_at
          ).toLocaleDateString("fa-IR")
        )}
      </p>

      ${
        evaluation.notes
          ? `
            <p>
              توضیحات:
              ${escapeHTML(
                evaluation.notes
              )}
            </p>
          `
          : ""
      }

    `;


    box.appendChild(item);

  });

}


// ======================================
// EVALUATION MODAL
// ======================================

const evaluationModal =
  document.getElementById(
    "evaluationModal"
  );

const newEvaluationBtn =
  document.getElementById(
    "newEvaluationBtn"
  );

const closeEvaluationModal =
  document.getElementById(
    "closeEvaluationModal"
  );


function openEvaluationModal() {

  if (!evaluationModal) return;


  if (
    !document.getElementById(
      "evaluationAthlete"
    )?.value ||
    !document.getElementById(
      "evaluationPeriod"
    )?.value
  ) {

    alert(
      "ابتدا ورزشکار و دوره ارزیابی را انتخاب کنید."
    );

    return;

  }


  renderEvaluationCriteria();


  evaluationModal.classList.remove(
    "hidden"
  );

}


function closeEvaluationForm() {

  if (!evaluationModal) return;

  evaluationModal.classList.add(
    "hidden"
  );

}


if (newEvaluationBtn) {

  newEvaluationBtn.addEventListener(
    "click",
    openEvaluationModal
  );

}


if (closeEvaluationModal) {

  closeEvaluationModal.addEventListener(
    "click",
    closeEvaluationForm
  );

}


if (evaluationModal) {

  evaluationModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        evaluationModal
      ) {

        closeEvaluationForm();

      }

    }
  );

}


// ======================================
// RENDER CRITERIA
// ======================================

function renderEvaluationCriteria() {

  const box =
    document.getElementById(
      "evaluationCriteriaList"
    );

  if (!box) return;


  box.innerHTML = "";


  if (!evaluationCriteria.length) {

    box.innerHTML = `

      <div class="empty-panel">

        <div>⚠️</div>

        <h3>
          هیچ معیار فعالی وجود ندارد
        </h3>

        <p>
          ابتدا در جدول evaluation_criteria معیار ایجاد کنید.
        </p>

      </div>

    `;

    return;

  }


  evaluationCriteria.forEach(
    criterion => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "evaluation-criterion-row";


      row.innerHTML = `

        <div>

          <strong>
            ${escapeHTML(
              criterion.name
            )}
          </strong>

          ${
            criterion.description
              ? `
                <small>
                  ${escapeHTML(
                    criterion.description
                  )}
                </small>
              `
              : ""
          }

        </div>


        <input
          class="criterion-score"
          data-criterion-id="${escapeHTML(
            criterion.id
          )}"
          type="number"
          min="0"
          max="10"
          step="0.1"
          value="0"
        >

      `;


      box.appendChild(row);

    }
  );

}


// ======================================
// SAVE EVALUATION
// ======================================

async function saveEvaluation() {

  const athleteId =
    document.getElementById(
      "evaluationAthlete"
    )?.value;


  const periodId =
    document.getElementById(
      "evaluationPeriod"
    )?.value;


  if (!athleteId || !periodId) {

    alert(
      "ورزشکار و دوره ارزیابی را انتخاب کنید."
    );

    return;

  }


  const scoreInputs =
    document.querySelectorAll(
      ".criterion-score"
    );


  if (!scoreInputs.length) {

    alert(
      "هیچ معیار ارزیابی وجود ندارد."
    );

    return;

  }


  let scores = [];


  scoreInputs.forEach(input => {

    let score =
      Number(input.value);


    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 10
    ) {

      score = 0;

    }


    scores.push({

      criterion_id:
        input.dataset.criterionId,

      score:
        score

    });

  });


  const totalScore =
    scores.length
      ? scores.reduce(
          (sum, item) =>
            sum + item.score,
          0
        ) / scores.length
      : 0;


  const {
    data: sessionData
  } =
    await supabaseClient.auth.getSession();


  const coachId =
    sessionData?.session?.user?.id ||
    null;


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
          coachId,

        total_score:
          Number(
            totalScore.toFixed(2)
          ),

        evaluated_at:
          new Date().toISOString()

      })
      .select()
      .single();


  if (evaluationError) {

    console.error(
      "Evaluation save error:",
      evaluationError
    );

    alert(
      "ثبت ارزیابی انجام نشد.\n\n" +
      evaluationError.message
    );

    return;

  }


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
    error: scoreError
  } =
    await supabaseClient
      .from("evaluation_scores")
      .insert(
        scoreRows
      );


  if (scoreError) {

    console.error(
      "Evaluation scores error:",
      scoreError
    );

    alert(
      "ارزیابی ایجاد شد اما نمره معیارها ذخیره نشد.\n\n" +
      scoreError.message
    );

    return;

  }


  alert(
    "ارزیابی با موفقیت ثبت شد."
  );


  closeEvaluationForm();

  await loadEvaluations();

}


// ======================================
// SAVE BUTTON
// ======================================

const saveEvaluationBtn =
  document.getElementById(
    "saveEvaluationBtn"
  );


if (saveEvaluationBtn) {

  saveEvaluationBtn.addEventListener(
    "click",
    saveEvaluation
  );

}


// ======================================
// EVALUATION SELECT EVENTS
// ======================================

const evaluationAthlete =
  document.getElementById(
    "evaluationAthlete"
  );


const evaluationPeriod =
  document.getElementById(
    "evaluationPeriod"
  );


if (evaluationAthlete) {

  evaluationAthlete.addEventListener(
    "change",
    loadEvaluations
  );

}


if (evaluationPeriod) {

  evaluationPeriod.addEventListener(
    "change",
    loadEvaluations
  );

}


// ======================================
// LOAD EVALUATION DATA
// ======================================

async function initializeEvaluation() {

  await loadEvaluationPeriods();

  await loadEvaluationCriteria();

  populateEvaluationAthletes();

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


  await loadAthletes();

  await initializeEvaluation();

}


startCoachApp();
