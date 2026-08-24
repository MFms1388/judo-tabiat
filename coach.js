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


  // وقتی وارد صفحه ارزیابی می‌شویم
  if (
    pageName ===
    "evaluations"
  ) {

    loadEvaluationPage();

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

  console.log(
    "Athletes loaded:",
    athletes
  );

  updateDashboardStats();

  createCoachCategoryFilter(
    athletes
  );

  renderCoachAthletes(
    athletes
  );

  fillEvaluationAthletes();

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

    } else {

      totalEvaluations.textContent =
        "۰";

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

  if (!grid) {
    return;
  }

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
              ${escapeHTML(
                message
              )}
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


  const bio =
    document.getElementById(
      "athleteBio"
    )?.value.trim();


  const photoUrl =
    document.getElementById(
      "athletePhotoUrl"
    )?.value.trim();


  if (
    !firstName ||
    !lastName
  ) {

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


  if (
    !/^\d{10}$/.test(
      nationalId
    )
  ) {

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


  fields.forEach(
    id => {

      const input =
        document.getElementById(
          id
        );

      if (input) {

        input.value =
          "";

      }

    }
  );

}


// ==================================================
// ==================================================
// EVALUATION SYSTEM
// ==================================================
// ==================================================


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
// LOAD EVALUATION PAGE
// ======================================

let evaluationPageLoaded =
  false;


async function loadEvaluationPage() {

  try {

    await Promise.all([
      loadEvaluationCriteria(),
      loadEvaluationPeriods()
    ]);

    fillEvaluationAthletes();

    evaluationPageLoaded =
      true;

    await loadEvaluations();

  } catch (error) {

    console.error(
      "Evaluation page error:",
      error
    );

  }

}


// ======================================
// FILL ATHLETE SELECT
// ======================================

function fillEvaluationAthletes() {

  const select =
    document.getElementById(
      "evaluationAthleteSelect"
    );

  if (!select) return;


  const oldValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

  `;


  if (
    !athletes ||
    athletes.length === 0
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      "";

    option.textContent =
      "هیچ ورزشکاری ثبت نشده است";

    option.disabled =
      true;

    select.appendChild(
      option
    );

    return;
  }


  athletes.forEach(
    athlete => {

      const option =
        document.createElement(
          "option"
        );


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
        athlete.age_group
          ? `${name} — ${athlete.age_group}`
          : name;


      select.appendChild(
        option
      );

    }
  );


  if (
    oldValue &&
    athletes.some(
      athlete =>
        athlete.id ===
        oldValue
    )
  ) {

    select.value =
      oldValue;

  }

}


// ======================================
// LOAD PERIODS
// ======================================

async function loadEvaluationPeriods() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "evaluation_periods"
      )
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

    showEvaluationMessage(
      "خطا در دریافت دوره‌های ارزیابی",
      error.message
    );

    return;
  }


  evaluationPeriods =
    data || [];


  fillEvaluationPeriods();

}


// ======================================
// FILL PERIOD SELECT
// ======================================

function fillEvaluationPeriods() {

  const select =
    document.getElementById(
      "evaluationPeriodSelect"
    );

  if (!select) return;


  const oldValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

  `;


  if (
    !evaluationPeriods ||
    evaluationPeriods.length === 0
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      "";

    option.textContent =
      "هیچ دوره‌ای ثبت نشده است";

    option.disabled =
      true;

    select.appendChild(
      option
    );

    return;
  }


  evaluationPeriods.forEach(
    period => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        period.id;


      let text =
        period.title;


      if (
        period.start_date ||
        period.end_date
      ) {

        const dates = [];

        if (period.start_date) {
          dates.push(
            formatDate(
              period.start_date
            )
          );
        }

        if (period.end_date) {
          dates.push(
            formatDate(
              period.end_date
            )
          );
        }

        text +=
          ` (${dates.join(" تا ")})`;

      }


      option.textContent =
        text;


      select.appendChild(
        option
      );

    }
  );


  if (
    oldValue &&
    evaluationPeriods.some(
      period =>
        period.id ===
        oldValue
    )
  ) {

    select.value =
      oldValue;

  }

}


// ======================================
// LOAD CRITERIA
// ======================================

async function loadEvaluationCriteria() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "evaluation_criteria"
      )
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

    evaluationCriteria =
      [];

    return;
  }


  evaluationCriteria =
    data || [];


  console.log(
    "Evaluation criteria:",
    evaluationCriteria
  );

}


// ======================================
// SELECT CHANGE EVENTS
// ======================================

if (
  evaluationAthleteSelect
) {

  evaluationAthleteSelect.addEventListener(
    "change",
    () => {

      loadEvaluations();

    }
  );

}


if (
  evaluationPeriodSelect
) {

  evaluationPeriodSelect.addEventListener(
    "change",
    () => {

      loadEvaluations();

    }
  );

}


// ======================================
// LOAD EVALUATIONS
// ======================================

async function loadEvaluations() {

  if (!evaluationsList) {
    return;
  }


  const athleteId =
    evaluationAthleteSelect
      ? evaluationAthleteSelect.value
      : "";


  const periodId =
    evaluationPeriodSelect
      ? evaluationPeriodSelect.value
      : "";


  if (
    !athleteId ||
    !periodId
  ) {

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          انتخاب ورزشکار و دوره
        </h2>

        <p>
          برای مشاهده ارزیابی‌ها، یک ورزشکار و یک دوره ارزیابی انتخاب کنید.
        </p>

      </div>

    `;

    return;
  }


  evaluationsList.innerHTML = `

    <div class="evaluation-empty">

      <div class="evaluation-empty-icon">
        ⏳
      </div>

      <h2>
        در حال دریافت...
      </h2>

      <p>
        لطفاً چند لحظه صبر کنید.
      </p>

    </div>

  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "evaluations"
      )
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
      "Load evaluations error:",
      error
    );

    showEvaluationMessage(
      "خطا در دریافت ارزیابی‌ها",
      error.message
    );

    return;
  }


  evaluations =
    data || [];


  if (
    evaluations.length === 0
  ) {

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          هنوز ارزیابی‌ای ثبت نشده است
        </h2>

        <p>
          برای شروع روی «ارزیابی جدید» بزنید.
        </p>

      </div>

    `;

    return;
  }


  await renderEvaluations(
    evaluations
  );

}


// ======================================
// RENDER EVALUATIONS
// ======================================

async function renderEvaluations(
  list
) {

  if (!evaluationsList) return;


  const athlete =
    athletes.find(
      item =>
        item.id ===
        evaluationAthleteSelect.value
    );


  const athleteName =
    athlete
      ? [
          athlete.first_name,
          athlete.last_name
        ]
          .filter(Boolean)
          .join(" ")
      : "ورزشکار";


  evaluationsList.innerHTML =
    "";


  for (
    const evaluation of list
  ) {

    const card =
      document.createElement(
        "div"
      );


    card.className =
      "evaluation-card";


    const scores =
      await getEvaluationScores(
        evaluation.id
      );


    const scoreRows =
      scores.length > 0
        ? scores
            .map(
              item => {

                const percent =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      Number(
                        item.score
                      ) * 10
                    )
                  );


                return `

                  <div
                    class="criteria-preview-row"
                  >

                    <div
                      class="criteria-preview-name"
                    >
                      ${escapeHTML(
                        item.criterion_name
                      )}
                    </div>

                    <div
                      class="criteria-preview-bar"
                    >

                      <div
                        class="criteria-preview-fill"
                        style="width:${percent}%"
                      ></div>

                    </div>

                    <div
                      class="criteria-preview-score"
                    >
                      ${escapeHTML(
                        toPersianNumber(
                          item.score
                        )
                      )}
                      /۱۰
                    </div>

                  </div>

                `;

              }
            )
            .join("")
        : `

            <p class="muted">
              برای این ارزیابی امتیازی ثبت نشده است.
            </p>

          `;


    const period =
      evaluationPeriods.find(
        item =>
          item.id ===
          evaluation.period_id
      );


    card.innerHTML = `

      <div
        class="evaluation-card-header"
      >

        <div
          class="evaluation-athlete"
        >

          <div
            class="evaluation-avatar"
          >
            🥋
          </div>

          <div>

            <h3>
              ${escapeHTML(
                athleteName
              )}
            </h3>

            <p>
              ${
                period
                  ? escapeHTML(
                      period.title
                    )
                  : "دوره ارزیابی"
              }
              —
              ${escapeHTML(
                formatDateTime(
                  evaluation.evaluated_at
                )
              )}
            </p>

          </div>

        </div>


        <div
          class="evaluation-score"
        >

          <span>
            امتیاز نهایی
          </span>

          <strong>
            ${escapeHTML(
              toPersianNumber(
                Number(
                  evaluation.total_score || 0
                ).toFixed(2)
              )
            )}
          </strong>

        </div>

      </div>


      <div
        class="criteria-preview"
      >
        ${scoreRows}
      </div>


      ${
        evaluation.notes
          ? `
            <div
              style="
                margin-top:18px;
                padding:12px;
                background:#f7f7f7;
                border-radius:12px;
              "
            >
              <strong>
                توضیحات:
              </strong>

              <div
                style="margin-top:5px;"
              >
                ${escapeHTML(
                  evaluation.notes
                )}
              </div>
            </div>
          `
          : ""
      }

    `;


    evaluationsList.appendChild(
      card
    );

  }

}


// ======================================
// GET SCORES
// ======================================

async function getEvaluationScores(
  evaluationId
) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "evaluation_scores"
      )
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


  return (
    data || []
  ).map(
    score => {

      const criterion =
        evaluationCriteria.find(
          item =>
            item.id ===
            score.criterion_id
        );


      return {

        ...score,

        criterion_name:
          criterion
            ? criterion.name
            : "معیار حذف‌شده"

      };

    }
  );

}


// ======================================
// NEW EVALUATION BUTTON
// ======================================

if (newEvaluationBtn) {

  newEvaluationBtn.addEventListener(
    "click",
    openNewEvaluationModal
  );

}


// ======================================
// NEW EVALUATION MODAL
// ======================================

function openNewEvaluationModal() {

  const athleteId =
    evaluationAthleteSelect
      ? evaluationAthleteSelect.value
      : "";


  const periodId =
    evaluationPeriodSelect
      ? evaluationPeriodSelect.value
      : "";


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


  if (
    !evaluationCriteria ||
    evaluationCriteria.length === 0
  ) {

    alert(
      "هیچ معیار فعالی برای ارزیابی وجود ندارد."
    );

    return;
  }


  createEvaluationModal(
    athleteId,
    periodId
  );

}


// ======================================
// CREATE EVALUATION MODAL
// ======================================

function createEvaluationModal(
  athleteId,
  periodId
) {

  const oldModal =
    document.getElementById(
      "newEvaluationModal"
    );


  if (oldModal) {
    oldModal.remove();
  }


  const athlete =
    athletes.find(
      item =>
        item.id ===
        athleteId
    );


  const period =
    evaluationPeriods.find(
      item =>
        item.id ===
        periodId
    );


  const athleteName =
    athlete
      ? [
          athlete.first_name,
          athlete.last_name
        ]
          .filter(Boolean)
          .join(" ")
      : "ورزشکار";


  const criteriaHTML =
    evaluationCriteria
      .map(
        criterion => `

          <div
            style="
              background:#f8f8f8;
              padding:15px;
              border-radius:14px;
              margin-bottom:12px;
            "
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
                gap:10px;
                align-items:center;
                margin-bottom:8px;
              "
            >

              <strong>
                ${escapeHTML(
                  criterion.name
                )}
              </strong>

              <span
                style="
                  color:#777;
                  font-size:13px;
                "
              >
                امتیاز ۰ تا ۱۰
              </span>

            </div>


            ${
              criterion.description
                ? `
                  <div
                    style="
                      color:#777;
                      font-size:12px;
                      margin-bottom:8px;
                    "
                  >
                    ${escapeHTML(
                      criterion.description
                    )}
                  </div>
                `
                : ""
            }


            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value="0"
              class="evaluation-score-input"
              data-criterion-id="${escapeHTML(
                criterion.id
              )}"
              style="
                width:100%;
                min-height:45px;
                padding:10px;
                border:1px solid #ddd;
                border-radius:10px;
                font-family:inherit;
                font-size:16px;
              "
            >

          </div>

        `
      )
      .join("");


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "newEvaluationModal";


  modal.className =
    "modal";


  modal.innerHTML = `

    <div
      class="modal-card"
      style="
        max-height:90vh;
        overflow-y:auto;
      "
    >

      <button
        type="button"
        class="close"
        id="closeNewEvaluationModal"
      >
        ×
      </button>


      <span class="eyebrow">
        NEW EVALUATION
      </span>


      <h2>
        ارزیابی جدید
      </h2>


      <p class="muted">
        ورزشکار:
        <strong>
          ${escapeHTML(
            athleteName
          )}
        </strong>
      </p>


      <p class="muted">
        دوره:
        <strong>
          ${
            period
              ? escapeHTML(
                  period.title
                )
              : ""
          }
        </strong>
      </p>


      <div
        style="
          margin-top:20px;
        "
      >

        ${criteriaHTML}

      </div>


      <label
        style="
          display:block;
          margin-top:15px;
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
            padding:12px;
            border:1px solid #ddd;
            border-radius:12px;
            font-family:inherit;
            resize:vertical;
          "
        ></textarea>

      </label>


      <div
        style="
          margin-top:15px;
          padding:14px;
          background:#f3f6f4;
          border-radius:12px;
          text-align:center;
        "
      >

        امتیاز نهایی:
        <strong
          id="newEvaluationTotal"
          style="font-size:22px;"
        >
          ۰
        </strong>

        از ۱۰

      </div>


      <button
        class="primary wide"
        id="saveNewEvaluationBtn"
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


  modal.classList.remove(
    "hidden"
  );


  const scoreInputs =
    modal.querySelectorAll(
      ".evaluation-score-input"
    );


  function updateTotal() {

    let total = 0;


    scoreInputs.forEach(
      input => {

        let value =
          Number(
            input.value
          );


        if (
          Number.isNaN(value)
        ) {
          value = 0;
        }


        value =
          Math.max(
            0,
            Math.min(
              10,
              value
            )
          );


        total +=
          value;

      }
    );


    const count =
      scoreInputs.length;


    const average =
      count > 0
        ? total / count
        : 0;


    const totalElement =
      document.getElementById(
        "newEvaluationTotal"
      );


    if (totalElement) {

      totalElement.textContent =
        toPersianNumber(
          average.toFixed(2)
        );

    }

  }


  scoreInputs.forEach(
    input => {

      input.addEventListener(
        "input",
        updateTotal
      );

    }
  );


  updateTotal();


  const closeBtn =
    document.getElementById(
      "closeNewEvaluationModal"
    );


  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      () => {

        modal.remove();

      }
    );

  }


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


  const saveBtn =
    document.getElementById(
      "saveNewEvaluationBtn"
    );


  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      () => {

        saveNewEvaluation(
          athleteId,
          periodId,
          scoreInputs,
          saveBtn
        );

      }
    );

  }

}


// ======================================
// SAVE NEW EVALUATION
// ======================================

async function saveNewEvaluation(
  athleteId,
  periodId,
  scoreInputs,
  saveBtn
) {

  if (
    !athleteId ||
    !periodId
  ) {

    alert(
      "ورزشکار یا دوره انتخاب نشده است."
    );

    return;
  }


  const {
    data: sessionData,
    error: sessionError
  } =
    await supabaseClient.auth.getSession();


  if (sessionError) {

    alert(
      "خطا در دریافت حساب مربی."
    );

    return;
  }


  const user =
    sessionData?.session?.user;


  if (!user) {

    alert(
      "جلسه ورود مربی پیدا نشد."
    );

    redirectToLogin();

    return;
  }


  const scores = [];


  scoreInputs.forEach(
    input => {

      let score =
        Number(
          input.value
        );


      if (
        Number.isNaN(score)
      ) {

        score = 0;

      }


      score =
        Math.max(
          0,
          Math.min(
            10,
            score
          )
        );


      scores.push({

        criterion_id:
          input.dataset
            .criterionId,

        score:
          score

      });

    }
  );


  if (
    scores.length === 0
  ) {

    alert(
      "هیچ معیاری برای ارزیابی وجود ندارد."
    );

    return;
  }


  const total =
    scores.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.score
        ),
      0
    );


  const average =
    total /
    scores.length;


  const notes =
    document.getElementById(
      "newEvaluationNotes"
    )?.value.trim() ||
    null;


  if (saveBtn) {

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "در حال ثبت...";

  }


  try {

    // ----------------------------------
    // 1. INSERT EVALUATION
    // ----------------------------------

    const {
      data: evaluation,
      error: evaluationError
    } =
      await supabaseClient
        .from(
          "evaluations"
        )
        .insert({

          athlete_id:
            athleteId,

          period_id:
            periodId,

          coach_id:
            user.id,

          total_score:
            Number(
              average.toFixed(2)
            ),

          notes:
            notes

        })
        .select()
        .single();


    if (evaluationError) {

      console.error(
        "Create evaluation error:",
        evaluationError
      );

      throw new Error(
        "ثبت ارزیابی انجام نشد:\n" +
        evaluationError.message
      );

    }


    // ----------------------------------
    // 2. INSERT SCORES
    // ----------------------------------

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
      error: scoresError
    } =
      await supabaseClient
        .from(
          "evaluation_scores"
        )
        .insert(
          scoreRows
        );


    if (scoresError) {

      console.error(
        "Create scores error:",
        scoresError
      );


      // اگر امتیازها ثبت نشدند،
      // ارزیابی اصلی را هم حذف می‌کنیم
      await supabaseClient
        .from(
          "evaluations"
        )
        .delete()
        .eq(
          "id",
          evaluation.id
        );


      throw new Error(
        "ثبت امتیاز معیارها انجام نشد:\n" +
        scoresError.message
      );

    }


    // ----------------------------------
    // 3. UPDATE ATHLETE TOTAL SCORE
    // ----------------------------------

    const {
      error: athleteUpdateError
    } =
      await supabaseClient
        .from(
          "athletes"
        )
        .update({

          total_score:
            Number(
              average.toFixed(2)
            )

        })
        .eq(
          "id",
          athleteId
        );


    if (athleteUpdateError) {

      console.warn(
        "Athlete total score update warning:",
        athleteUpdateError
      );

    }


    alert(
      "ارزیابی با موفقیت ثبت شد. ✅"
    );


    const modal =
      document.getElementById(
        "newEvaluationModal"
      );


    if (modal) {

      modal.remove();

    }


    await loadAthletes();

    await loadEvaluationPage();


    if (evaluationAthleteSelect) {

      evaluationAthleteSelect.value =
        athleteId;

    }


    if (evaluationPeriodSelect) {

      evaluationPeriodSelect.value =
        periodId;

    }


    await loadEvaluations();


  } catch (error) {

    console.error(
      "Save evaluation error:",
      error
    );


    alert(
      error.message ||
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


// ======================================
// EVALUATION MESSAGE
// ======================================

function showEvaluationMessage(
  title,
  message = ""
) {

  if (!evaluationsList) {
    return;
  }


  evaluationsList.innerHTML = `

    <div class="evaluation-empty">

      <div class="evaluation-empty-icon">
        ⚠️
      </div>

      <h2>
        ${escapeHTML(title)}
      </h2>

      ${
        message
          ? `
            <p
              style="
                margin-top:10px;
                direction:ltr;
                word-break:break-word;
              "
            >
              ${escapeHTML(message)}
            </p>
          `
          : ""
      }

    </div>

  `;

}


// ======================================
// DATE
// ======================================

function formatDate(
  value
) {

  if (!value) {
    return "";
  }


  try {

    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date.toLocaleDateString(
      "fa-IR"
    );

  } catch {

    return String(
      value
    );

  }

}


// ======================================
// DATE + TIME
// ======================================

function formatDateTime(
  value
) {

  if (!value) {
    return "";
  }


  try {

    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date.toLocaleString(
      "fa-IR",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  } catch {

    return String(
      value
    );

  }

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


  // آماده‌سازی اولیه ارزیابی
  await loadEvaluationPage();

}


startCoachApp();
