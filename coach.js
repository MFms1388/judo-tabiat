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
let evaluationCriteria = [];
let evaluationPeriods = [];


// ======================================
// AUTH
// ======================================

async function checkCoachAccess() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {

    console.error(
      "Session error:",
      error
    );

    redirectToLogin();

    return false;
  }

  const session =
    data?.session;

  if (!session) {

    redirectToLogin();

    return false;
  }

  const email =
    session.user?.email?.toLowerCase();

  if (
    email !==
    "coach.judotabiat@gmail.com"
  ) {

    await supabaseClient.auth.signOut();

    alert(
      "شما اجازه ورود به پنل مربی را ندارید."
    );

    redirectToLogin();

    return false;
  }

  const coachEmail =
    document.getElementById(
      "coachEmail"
    );

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

  window.location.href =
    "index.html";

}


// ======================================
// ELEMENTS
// ======================================

const sidebar =
  document.getElementById(
    "coachSidebar"
  );

const menuBtn =
  document.getElementById(
    "menuBtn"
  );

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );

const coachPages =
  document.querySelectorAll(
    ".coach-page"
  );


// ======================================
// MOBILE MENU
// ======================================

if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      if (!sidebar) return;

      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


// ======================================
// PAGE NAVIGATION
// ======================================

function openPage(pageName) {

  coachPages.forEach(
    page => {

      page.classList.remove(
        "active"
      );

    }
  );

  navItems.forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );

  const targetPage =
    document.getElementById(
      `page-${pageName}`
    );

  const targetNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );

  if (targetPage) {

    targetPage.classList.add(
      "active"
    );

  }

  if (targetNav) {

    targetNav.classList.add(
      "active"
    );

  }

  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }

  if (
    pageName ===
    "evaluations"
  ) {

    loadEvaluationData();

  }

}


// ======================================
// NAVIGATION EVENTS
// ======================================

navItems.forEach(
  item => {

    item.addEventListener(
      "click",
      () => {

        const page =
          item.dataset.page;

        openPage(page);

      }
    );

  }
);


// ======================================
// QUICK ACTIONS
// ======================================

const quickCards =
  document.querySelectorAll(
    "[data-go]"
  );

quickCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        const page =
          card.dataset.go;

        openPage(page);

      }
    );

  }
);


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

  populateEvaluationAthletes();

}


// ======================================
// DASHBOARD STATS
// ======================================

async function updateDashboardStats() {

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

    const {
      count,
      error
    } =
      await supabaseClient
        .from("evaluations")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );

    if (!error) {

      totalEvaluations.textContent =
        toPersianNumber(
          count || 0
        );

    }

  }


  const todayAttendance =
    document.getElementById(
      "todayAttendance"
    );

  if (todayAttendance) {

    todayAttendance.textContent =
      "۰";

  }


  const totalAchievements =
    document.getElementById(
      "totalAchievements"
    );

  if (totalAchievements) {

    totalAchievements.textContent =
      "۰";

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

  if (!grid) return;

  grid.innerHTML = "";

  if (
    !list ||
    list.length === 0
  ) {

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


  list.forEach(
    athlete => {

      const card =
        document.createElement(
          "div"
        );

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

    }
  );

}


// ======================================
// ATHLETE ERROR
// ======================================

function showAthleteError(
  message = ""
) {

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


        return (
          (
            name.includes(search) ||
            nationalId.includes(search)
          ) &&
          (
            category === "all" ||
            athleteCategory === category
          )
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

function createCoachCategoryFilter(
  list
) {

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


  categories.forEach(
    category => {

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

    }
  );

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


  if (!saveAthleteBtn) return;

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


  fields.forEach(
    id => {

      const input =
        document.getElementById(id);

      if (input) {

        input.value = "";

      }

    }
  );

}


// ======================================
// EVALUATIONS
// ======================================


// --------------------------------------
// LOAD CRITERIA
// --------------------------------------

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
      "Criteria error:",
      error
    );

    evaluationCriteria = [];

    return;

  }


  evaluationCriteria =
    data || [];

}


// --------------------------------------
// LOAD PERIODS
// --------------------------------------

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
      "Periods error:",
      error
    );

    evaluationPeriods = [];

    return;

  }


  evaluationPeriods =
    data || [];

}


// --------------------------------------
// POPULATE ATHLETES
// --------------------------------------

function populateEvaluationAthletes() {

  const select =
    document.getElementById(
      "evaluationAthlete"
    );

  if (!select) return;


  const currentValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

  `;


  athletes.forEach(
    athlete => {

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

    }
  );


  if (currentValue) {

    select.value =
      currentValue;

  }

}


// --------------------------------------
// POPULATE PERIODS
// --------------------------------------

function populateEvaluationPeriods() {

  const select =
    document.getElementById(
      "evaluationPeriod"
    );

  if (!select) return;


  const currentValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

  `;


  evaluationPeriods.forEach(
    period => {

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

    }
  );


  if (currentValue) {

    select.value =
      currentValue;

  }

}


// --------------------------------------
// LOAD EVALUATION DATA
// --------------------------------------

async function loadEvaluationData() {

  await Promise.all([
    loadEvaluationCriteria(),
    loadEvaluationPeriods()
  ]);


  populateEvaluationAthletes();

  populateEvaluationPeriods();

  await loadExistingEvaluations();

}


// --------------------------------------
// LOAD EXISTING EVALUATIONS
// --------------------------------------

async function loadExistingEvaluations() {

  const container =
    document.getElementById(
      "evaluationContent"
    );

  if (!container) return;


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

    container.innerHTML = `

      <div class="empty-panel">

        <div>
          ⚠️
        </div>

        <h2>
          خطا در دریافت ارزیابی‌ها
        </h2>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

    return;

  }


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `

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

    return;

  }


  container.innerHTML = "";


  data.forEach(
    evaluation => {

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


      const name =
        athlete
          ? [
              athlete.first_name,
              athlete.last_name
            ]
              .filter(Boolean)
              .join(" ")
          : "ورزشکار نامشخص";


      const periodTitle =
        period
          ? period.title
          : "دوره نامشخص";


      const card =
        document.createElement(
          "div"
        );

      card.className =
        "evaluation-card";


      card.innerHTML = `

        <div>

          <strong>
            ${escapeHTML(name)}
          </strong>

          <small>
            ${escapeHTML(
              periodTitle
            )}
          </small>

        </div>


        <div class="evaluation-score">

          ${escapeHTML(
            toPersianNumber(
              evaluation.total_score ?? 0
            )
          )}

          / ۱۰

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}


// --------------------------------------
// NEW EVALUATION
// --------------------------------------

const newEvaluationBtn =
  document.getElementById(
    "newEvaluationBtn"
  );


if (newEvaluationBtn) {

  newEvaluationBtn.addEventListener(
    "click",
    openNewEvaluation
  );

}


// --------------------------------------
// OPEN NEW EVALUATION
// --------------------------------------

function openNewEvaluation() {

  const athleteSelect =
    document.getElementById(
      "evaluationAthlete"
    );

  const periodSelect =
    document.getElementById(
      "evaluationPeriod"
    );


  const athleteId =
    athleteSelect?.value;


  const periodId =
    periodSelect?.value;


  if (!athleteId) {

    alert(
      "ابتدا ورزشکار را انتخاب کنید."
    );

    return;

  }


  if (!periodId) {

    alert(
      "ابتدا دوره ارزیابی را انتخاب کنید."
    );

    return;

  }


  if (
    evaluationCriteria.length === 0
  ) {

    alert(
      "هیچ معیار فعالی برای ارزیابی وجود ندارد."
    );

    return;

  }


  showEvaluationForm(
    athleteId,
    periodId
  );

}


// --------------------------------------
// SHOW EVALUATION FORM
// --------------------------------------

function showEvaluationForm(
  athleteId,
  periodId
) {

  const container =
    document.getElementById(
      "evaluationContent"
    );

  if (!container) return;


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


  let criteriaHTML = "";


  evaluationCriteria.forEach(
    (criterion, index) => {

      criteriaHTML += `

        <div
          class="criterion-card"
        >

          <div>

            <strong>
              ${toPersianNumber(
                index + 1
              )}.
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
            type="number"
            min="0"
            max="10"
            step="0.1"
            data-criterion-id="${criterion.id}"
            placeholder="۰ تا ۱۰"
          >

        </div>

      `;

    }
  );


  container.innerHTML = `

    <div class="evaluation-form">

      <div class="evaluation-form-header">

        <div>

          <span class="eyebrow">
            NEW EVALUATION
          </span>

          <h2>
            ارزیابی
            ${escapeHTML(
              athlete
                ? [
                    athlete.first_name,
                    athlete.last_name
                  ]
                    .filter(Boolean)
                    .join(" ")
                : "ورزشکار"
            )}
          </h2>

          <p>
            ${escapeHTML(
              period
                ? period.title
                : ""
            )}
          </p>

        </div>

      </div>


      <div class="criteria-list">

        ${criteriaHTML}

      </div>


      <label>

        توضیحات مربی

        <textarea
          id="evaluationNotes"
          rows="4"
          placeholder="توضیحات و نکات مربی..."
        ></textarea>

      </label>


      <div class="evaluation-total">

        امتیاز نهایی:

        <strong id="evaluationTotal">
          ۰
        </strong>

        / ۱۰

      </div>


      <div class="evaluation-actions">

        <button
          class="primary"
          id="saveEvaluationBtn"
          type="button"
        >
          💾 ذخیره ارزیابی
        </button>


        <button
          class="secondary"
          id="cancelEvaluationBtn"
          type="button"
        >
          انصراف
        </button>

      </div>

    </div>

  `;


  const scoreInputs =
    container.querySelectorAll(
      ".criterion-score"
    );


  scoreInputs.forEach(
    input => {

      input.addEventListener(
        "input",
        calculateEvaluationTotal
      );

    }
  );


  const saveBtn =
    document.getElementById(
      "saveEvaluationBtn"
    );


  const cancelBtn =
    document.getElementById(
      "cancelEvaluationBtn"
    );


  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      () => {

        saveEvaluation(
          athleteId,
          periodId
        );

      }
    );

  }


  if (cancelBtn) {

    cancelBtn.addEventListener(
      "click",
      loadExistingEvaluations
    );

  }

}


// --------------------------------------
// CALCULATE TOTAL
// --------------------------------------

function calculateEvaluationTotal() {

  const inputs =
    document.querySelectorAll(
      ".criterion-score"
    );


  let total = 0;
  let count = 0;


  inputs.forEach(
    input => {

      const value =
        Number(input.value);


      if (
        input.value !== "" &&
        !Number.isNaN(value)
      ) {

        total += value;

        count++;

      }

    }
  );


  const average =
    count > 0
      ? total / count
      : 0;


  const totalElement =
    document.getElementById(
      "evaluationTotal"
    );


  if (totalElement) {

    totalElement.textContent =
      toPersianNumber(
        average.toFixed(1)
      );

  }

}


// --------------------------------------
// SAVE EVALUATION
// --------------------------------------

async function saveEvaluation(
  athleteId,
  periodId
) {

  const inputs =
    document.querySelectorAll(
      ".criterion-score"
    );


  if (
    !inputs ||
    inputs.length === 0
  ) {

    alert(
      "معیاری برای ارزیابی وجود ندارد."
    );

    return;

  }


  const scores = [];


  for (
    const input of inputs
  ) {

    if (
      input.value === ""
    ) {

      alert(
        "لطفاً برای همه معیارها نمره وارد کنید."
      );

      input.focus();

      return;

    }


    const score =
      Number(input.value);


    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 10
    ) {

      alert(
        "نمره هر معیار باید بین ۰ تا ۱۰ باشد."
      );

      input.focus();

      return;

    }


    scores.push({

      criterion_id:
        input.dataset.criterionId,

      score:
        score

    });

  }


  const notes =
    document.getElementById(
      "evaluationNotes"
    )?.value.trim() || "";


  const total =
    scores.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(item.score),
      0
    ) /
    scores.length;


  const saveBtn =
    document.getElementById(
      "saveEvaluationBtn"
    );


  if (saveBtn) {

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "در حال ذخیره...";

  }


  try {

    // -------------------------------
    // GET CURRENT USER
    // -------------------------------

    const {
      data: userData,
      error: userError
    } =
      await supabaseClient.auth.getUser();


    if (userError) {
      throw userError;
    }


    const user =
      userData?.user;


    if (!user) {

      throw new Error(
        "کاربر وارد نشده است."
      );

    }


    // -------------------------------
    // CREATE EVALUATION
    // -------------------------------

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
            user.id,

          total_score:
            Number(
              total.toFixed(2)
            ),

          notes:
            notes

        })
        .select()
        .single();


    if (evaluationError) {

      throw evaluationError;

    }


    // -------------------------------
    // CREATE SCORE ROWS
    // -------------------------------

    const scoreRows =
      scores.map(
        item => ({

          evaluation_id:
            evaluation.id,

          criterion_id:
            item.criterion_id,

          score:
            item.score

        })
      );


    const {
      error: scoreError
    } =
      await supabaseClient
        .from("evaluation_scores")
        .insert(
          scoreRows
        );


    if (scoreError) {

      // حذف ارزیابی اگر ذخیره نمرات شکست خورد
      await supabaseClient
        .from("evaluations")
        .delete()
        .eq(
          "id",
          evaluation.id
        );

      throw scoreError;

    }


    alert(
      "ارزیابی با موفقیت ثبت شد."
    );


    await loadExistingEvaluations();


  } catch (error) {

    console.error(
      "Save evaluation error:",
      error
    );


    alert(
      "ثبت ارزیابی انجام نشد.\n\n" +
      error.message
    );


  } finally {

    if (saveBtn) {

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "💾 ذخیره ارزیابی";

    }

  }

}


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(
  value
) {

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

function toPersianNumber(
  value
) {

  return String(value)
    .replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[digit]
    );

}


// ======================================
// CLEAR FORM
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


  fields.forEach(
    id => {

      const input =
        document.getElementById(
          id
        );

      if (input) {

        input.value = "";

      }

    }
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


  await loadAthletes();


  // بارگذاری اولیه بخش ارزیابی
  await loadEvaluationData();

}


startCoachApp();
