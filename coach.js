// ============================================================
// 🥋 طبیعت جودو | COACH.JS
// نسخه کامل و اصلاح شده
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


// ============================================================
// SUPABASE
// ============================================================

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ============================================================
// STATE
// ============================================================

let athletes = [];
let evaluationPeriods = [];
let evaluationCriteria = [];
let evaluations = [];
let evaluationScores = [];

let currentCoach = null;


// ============================================================
// HELPERS
// ============================================================

function escapeHTML(value) {

  const div = document.createElement("div");

  div.textContent =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return div.innerHTML;
}


function persianNumber(value) {

  return String(value).replace(
    /\d/g,
    d => "۰۱۲۳۴۵۶۷۸۹"[d]
  );

}


function getAthleteName(athlete) {

  if (!athlete) {
    return "بدون نام";
  }

  return [
    athlete.first_name,
    athlete.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "بدون نام";

}


function showError(title, error) {

  console.error(title, error);

  const message =
    error?.message ||
    error?.details ||
    error?.hint ||
    "خطای نامشخص";

  alert(
    title +
    "\n\n" +
    message
  );

}


// ============================================================
// SESSION
// ============================================================

async function checkCoachSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      showError(
        "خطا در بررسی ورود مربی",
        error
      );

      return false;

    }


    if (
      !data ||
      !data.session ||
      !data.session.user
    ) {

      alert(
        "جلسه ورود مربی پیدا نشد. لطفاً دوباره وارد شوید."
      );

      window.location.href =
        "index.html";

      return false;

    }


    currentCoach =
      data.session.user;


    const email =
      document.getElementById(
        "coachEmail"
      );


    if (email) {

      email.textContent =
        currentCoach.email ||
        "مربی";

    }


    console.log(
      "Coach:",
      currentCoach.id
    );


    return true;

  } catch (error) {

    showError(
      "خطا در بررسی حساب مربی",
      error
    );

    return false;

  }

}


// ============================================================
// NAVIGATION
// ============================================================

function openPage(pageName) {

  document
    .querySelectorAll(".coach-page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const target =
    document.getElementById(
      "page-" + pageName
    );


  if (target) {

    target.classList.add("active");

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageName
      );

    });


  const sidebar =
    document.getElementById(
      "coachSidebar"
    );


  if (sidebar) {

    sidebar.classList.remove("open");

  }


  if (pageName === "athletes") {

    renderAthletes();

  }


  if (pageName === "evaluations") {

    prepareEvaluationPage();

  }

}


function initializeNavigation() {

  /*
   * توجه:
   * coach.html خودش navigation دارد.
   * برای جلوگیری از دوبار اجرا شدن کلیک‌ها،
   * فقط در صورتی listener اضافه می‌کنیم
   * که قبلاً توسط همین فایل ثبت نشده باشد.
   */

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      if (
        item.dataset.coachNavigationReady === "1"
      ) {
        return;
      }

      item.dataset.coachNavigationReady = "1";

      item.addEventListener(
        "click",
        function () {

          openPage(
            this.dataset.page
          );

        }
      );

    });


  document
    .querySelectorAll(".quick-card")
    .forEach(button => {

      if (
        button.dataset.coachQuickReady === "1"
      ) {
        return;
      }

      button.dataset.coachQuickReady = "1";

      button.addEventListener(
        "click",
        function () {

          const page =
            this.dataset.go;

          if (!page) {
            return;
          }

          openPage(page);

        }
      );

    });


  const menuBtn =
    document.getElementById(
      "menuBtn"
    );


  const sidebar =
    document.getElementById(
      "coachSidebar"
    );


  if (
    menuBtn &&
    sidebar &&
    menuBtn.dataset.coachMenuReady !== "1"
  ) {

    menuBtn.dataset.coachMenuReady = "1";

    menuBtn.addEventListener(
      "click",
      function () {

        sidebar.classList.toggle("open");

      }
    );

  }

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

  const button =
    document.getElementById(
      "logoutBtn"
    );


  if (
    !button ||
    button.dataset.coachLogoutReady === "1"
  ) {
    return;
  }


  button.dataset.coachLogoutReady = "1";


  button.addEventListener(
    "click",
    async function () {

      button.disabled = true;

      button.textContent =
        "در حال خروج...";


      try {

        const {
          error
        } =
          await supabaseClient.auth.signOut();


        if (error) {

          showError(
            "خروج انجام نشد",
            error
          );

          button.disabled = false;

          button.textContent =
            "خروج";

          return;

        }


        window.location.href =
          "index.html";

      } catch (error) {

        showError(
          "خطا هنگام خروج",
          error
        );

        button.disabled = false;

        button.textContent =
          "خروج";

      }

    }
  );

}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadAthletes() {

  console.log(
    "📥 در حال دریافت ورزشکاران..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      athletes = [];

      showError(
        "ورزشکاران از دیتابیس خوانده نشدند",
        error
      );

      return [];

    }


    athletes =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "✅ Athletes:",
      athletes
    );


    fillAthleteFilter();

    fillAthleteSelect();

    renderAthletes();

    updateDashboardStats();


    return athletes;

  } catch (error) {

    athletes = [];

    showError(
      "خطا در دریافت ورزشکاران",
      error
    );

    return [];

  }

}


// ============================================================
// RENDER ATHLETES
// ============================================================

function renderAthletes() {

  const container =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!container) {
    return;
  }


  const search =
    document
      .getElementById(
        "coachSearch"
      )
      ?.value
      ?.trim()
      ?.toLowerCase() || "";


  const filter =
    document.getElementById(
      "coachFilter"
    )?.value || "all";


  let list =
    [...athletes];


  if (search) {

    list =
      list.filter(
        athlete => {

          const name =
            getAthleteName(
              athlete
            ).toLowerCase();


          const nationalId =
            String(
              athlete.national_id || ""
            ).toLowerCase();


          return (
            name.includes(search) ||
            nationalId.includes(search)
          );

        }
      );

  }


  if (filter !== "all") {

    list =
      list.filter(
        athlete =>
          String(
            athlete.age_group || ""
          ) === String(filter)
      );

  }


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-panel">

        <div>👥</div>

        <h2>
          هنوز ورزشکاری ثبت نشده است
        </h2>

        <p>
          از دکمه «افزودن ورزشکار» برای ثبت ورزشکار جدید استفاده کنید.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(
        athlete => {

          const name =
            getAthleteName(
              athlete
            );


          const ageGroup =
            athlete.age_group ||
            "—";


          const weight =
            athlete.weight === null ||
            athlete.weight === undefined
              ? "—"
              : athlete.weight;


          const nationalId =
            athlete.national_id ||
            "—";


          const photo =
            athlete.photo_url ||
            "";


          return `

            <div
              class="athlete-card"
              data-athlete-id="${escapeHTML(
                athlete.id
              )}"
            >

              <div class="athlete-card-image">

                ${
                  photo

                    ? `

                      <img
                        src="${escapeHTML(photo)}"
                        alt="${escapeHTML(name)}"
                        onerror="this.style.display='none';"
                      >

                    `

                    : `

                      <div
                        style="
                          width:100%;
                          height:100%;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          font-size:42px;
                        "
                      >
                        🥋
                      </div>

                    `
                }

              </div>


              <div class="athlete-card-content">

                <h3>
                  ${escapeHTML(name)}
                </h3>


                <p>
                  رده:
                  ${escapeHTML(ageGroup)}
                </p>


                <p>
                  وزن:
                  ${persianNumber(weight)}
                  کیلو
                </p>


                <p>
                  کد ملی:
                  ${escapeHTML(nationalId)}
                </p>


                <div
                  style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                    margin-top:12px;
                  "
                >

                  <button
                    type="button"
                    class="primary wide athlete-evaluation-btn"
                    data-athlete-id="${escapeHTML(
                      athlete.id
                    )}"
                  >
                    📊 ارزیابی جدید
                  </button>


                  <button
                    type="button"
                    class="athlete-profile-btn"
                    data-athlete-id="${escapeHTML(
                      athlete.id
                    )}"
                    style="
                      min-height:44px;
                      padding:8px 14px;
                      border:1px solid #16834b;
                      border-radius:12px;
                      background:#fff;
                      color:#16834b;
                      font-family:inherit;
                      cursor:pointer;
                    "
                  >
                    👤 صفحه ورزشکار
                  </button>

                </div>

              </div>

            </div>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      ".athlete-evaluation-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          openEvaluationForAthlete(
            this.dataset.athleteId
          );

        }
      );

    });


  container
    .querySelectorAll(
      ".athlete-profile-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          const id =
            this.dataset.athleteId;

          if (!id) {
            return;
          }


          window.location.href =
            "athlete.html?id=" +
            encodeURIComponent(id);

        }
      );

    });

}


// ============================================================
// FILTER
// ============================================================

function fillAthleteFilter() {

  const filter =
    document.getElementById(
      "coachFilter"
    );


  if (!filter) {
    return;
  }


  const currentValue =
    filter.value;


  const groups =
    [
      ...new Set(
        athletes
          .map(
            athlete =>
              athlete.age_group
          )
          .filter(Boolean)
      )
    ];


  filter.innerHTML = `

    <option value="all">
      همه رده‌ها
    </option>

    ${
      groups
        .map(
          group => `

            <option
              value="${escapeHTML(group)}"
            >
              ${escapeHTML(group)}
            </option>

          `
        )
        .join("")
    }

  `;


  if (
    groups.includes(currentValue)
  ) {

    filter.value =
      currentValue;

  }

}


function initializeAthleteSearch() {

  const search =
    document.getElementById(
      "coachSearch"
    );


  const filter =
    document.getElementById(
      "coachFilter"
    );


  if (
    search &&
    search.dataset.coachSearchReady !== "1"
  ) {

    search.dataset.coachSearchReady = "1";

    search.addEventListener(
      "input",
      renderAthletes
    );

  }


  if (
    filter &&
    filter.dataset.coachFilterReady !== "1"
  ) {

    filter.dataset.coachFilterReady = "1";

    filter.addEventListener(
      "change",
      renderAthletes
    );

  }

}


// ============================================================
// ATHLETE MODAL
// ============================================================

function openAthleteModal() {

  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (!modal) {

    alert(
      "پنجره افزودن ورزشکار در coach.html پیدا نشد."
    );

    return;

  }


  modal.classList.remove(
    "hidden"
  );

}


function closeAthleteModal() {

  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}


function clearAthleteForm() {

  [
    "athleteFirstName",
    "athleteLastName",
    "athleteAgeGroup",
    "athleteWeight",
    "athleteNationalId",
    "athleteBio",
    "athletePhotoUrl"
  ]
    .forEach(
      id => {

        const element =
          document.getElementById(id);

        if (element) {

          element.value = "";

        }

      }
    );

}


function initializeAthleteModal() {

  const openButton =
    document.getElementById(
      "addAthleteBtn"
    );


  const closeButton =
    document.getElementById(
      "closeAthleteModal"
    );


  const saveButton =
    document.getElementById(
      "saveAthleteBtn"
    );


  if (
    openButton &&
    openButton.dataset.coachAthleteReady !== "1"
  ) {

    openButton.dataset.coachAthleteReady = "1";

    openButton.addEventListener(
      "click",
      function () {

        clearAthleteForm();

        openAthleteModal();

      }
    );

  }


  if (
    closeButton &&
    closeButton.dataset.coachCloseReady !== "1"
  ) {

    closeButton.dataset.coachCloseReady = "1";

    closeButton.addEventListener(
      "click",
      closeAthleteModal
    );

  }


  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (
    modal &&
    modal.dataset.coachModalReady !== "1"
  ) {

    modal.dataset.coachModalReady = "1";

    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === modal
        ) {

          closeAthleteModal();

        }

      }
    );

  }


  if (
    saveButton &&
    saveButton.dataset.coachSaveReady !== "1"
  ) {

    saveButton.dataset.coachSaveReady = "1";

    saveButton.addEventListener(
      "click",
      saveAthlete
    );

  }

}


// ============================================================
// SAVE ATHLETE
// ============================================================

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
    )?.value;


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


  if (
    nationalId &&
    !/^\d{10}$/.test(nationalId)
  ) {

    alert(
      "کد ملی باید ۱۰ رقم باشد."
    );

    return;

  }


  const button =
    document.getElementById(
      "saveAthleteBtn"
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "در حال ثبت...";

  }


  try {

    const athleteData = {

      first_name:
        firstName,

      last_name:
        lastName,

      age_group:
        ageGroup || null,

      weight:
        weightValue === ""
          ? null
          : Number(weightValue),

      national_id:
        nationalId || null,

      bio:
        bio || null,

      photo_url:
        photoUrl || null

    };


    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .insert(
          athleteData
        )
        .select()
        .single();


    if (error) {

      showError(
        "ثبت ورزشکار انجام نشد",
        error
      );

      return;

    }


    console.log(
      "✅ Athlete created:",
      data
    );


    alert(
      "ورزشکار با موفقیت ثبت شد. ✅"
    );


    closeAthleteModal();

    await loadAthletes();

  } catch (error) {

    showError(
      "خطا هنگام ثبت ورزشکار",
      error
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "ثبت ورزشکار";

    }

  }

}


// ============================================================
// LOAD PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  console.log(
    "📥 در حال دریافت دوره‌های ارزیابی..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluation_periods")
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (error) {

      evaluationPeriods = [];

      showError(
        "دوره‌های ارزیابی خوانده نشدند",
        error
      );

      return [];

    }


    evaluationPeriods =
      data || [];


    console.log(
      "✅ Periods:",
      evaluationPeriods
    );


    fillPeriodSelect();


    return evaluationPeriods;

  } catch (error) {

    evaluationPeriods = [];

    showError(
      "خطا در دریافت دوره‌های ارزیابی",
      error
    );

    return [];

  }

}


// ============================================================
// LOAD CRITERIA
// ============================================================

async function loadEvaluationCriteria() {

  console.log(
    "📥 در حال دریافت معیارهای ارزیابی..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluation_criteria")
        .select("*")
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

      evaluationCriteria = [];

      showError(
        "معیارهای ارزیابی خوانده نشدند",
        error
      );

      return [];

    }


    evaluationCriteria =
      data || [];


    console.log(
      "✅ Criteria:",
      evaluationCriteria
    );


    return evaluationCriteria;

  } catch (error) {

    evaluationCriteria = [];

    showError(
      "خطا در دریافت معیارهای ارزیابی",
      error
    );

    return [];

  }

}


// ============================================================
// LOAD EVALUATIONS
// ============================================================

async function loadEvaluations() {

  console.log(
    "📥 در حال دریافت ارزیابی‌ها..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluations")
        .select("*")
        .order(
          "evaluated_at",
          {
            ascending: false
          }
        );


    if (error) {

      evaluations = [];

      showError(
        "ارزیابی‌های قبلی خوانده نشدند",
        error
      );

      return [];

    }


    evaluations =
      data || [];


    console.log(
      "✅ Evaluations:",
      evaluations
    );


    return evaluations;

  } catch (error) {

    evaluations = [];

    showError(
      "خطا در دریافت ارزیابی‌ها",
      error
    );

    return [];

  }

}


// ============================================================
// LOAD EVALUATION SCORES
// ============================================================

async function loadEvaluationScores() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluation_scores")
        .select("*");


    if (error) {

      evaluationScores = [];

      console.error(
        "Evaluation scores error:",
        error
      );

      return [];

    }


    evaluationScores =
      data || [];


    return evaluationScores;

  } catch (error) {

    evaluationScores = [];

    console.error(
      "Evaluation scores exception:",
      error
    );

    return [];

  }

}


// ============================================================
// ATHLETE SELECT
// ============================================================

function fillAthleteSelect() {

  const select =
    document.getElementById(
      "evaluationAthleteSelect"
    );


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

    ${
      athletes
        .map(
          athlete => `

            <option
              value="${escapeHTML(
                athlete.id
              )}"
            >
              ${escapeHTML(
                getAthleteName(
                  athlete
                )
              )}
            </option>

          `
        )
        .join("")
    }

  `;


  if (
    athletes.some(
      athlete =>
        String(athlete.id) ===
        String(currentValue)
    )
  ) {

    select.value =
      currentValue;

  }

}


// ============================================================
// PERIOD SELECT
// ============================================================

function fillPeriodSelect() {

  const select =
    document.getElementById(
      "evaluationPeriodSelect"
    );


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  select.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

    ${
      evaluationPeriods
        .map(
          period => `

            <option
              value="${escapeHTML(
                period.id
              )}"
            >
              ${escapeHTML(
                period.title ||
                "دوره بدون عنوان"
              )}
            </option>

          `
        )
        .join("")
    }

  `;


  if (
    evaluationPeriods.some(
      period =>
        String(period.id) ===
        String(currentValue)
    )
  ) {

    select.value =
      currentValue;

  }

}


// ============================================================
// NEW EVALUATION BUTTON
// ============================================================

function initializeEvaluationButton() {

  const button =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (
    !button ||
    button.dataset.coachEvaluationReady === "1"
  ) {
    return;
  }


  button.dataset.coachEvaluationReady = "1";


  button.addEventListener(
    "click",
    openEvaluationFromSelectors
  );

}


function openEvaluationFromSelectors() {

  const athleteId =
    document.getElementById(
      "evaluationAthleteSelect"
    )?.value;


  const periodId =
    document.getElementById(
      "evaluationPeriodSelect"
    )?.value;


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


  if (!evaluationCriteria.length) {

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


// ============================================================
// OPEN EVALUATION FOR ATHLETE
// ============================================================

async function openEvaluationForAthlete(
  athleteId
) {

  openPage(
    "evaluations"
  );


  fillAthleteSelect();

  fillPeriodSelect();


  const athleteSelect =
    document.getElementById(
      "evaluationAthleteSelect"
    );


  const periodSelect =
    document.getElementById(
      "evaluationPeriodSelect"
    );


  if (athleteSelect) {

    athleteSelect.value =
      String(athleteId);

  }


  if (
    evaluationPeriods.length === 1
  ) {

    periodSelect.value =
      String(
        evaluationPeriods[0].id
      );

  }


  if (
    periodSelect &&
    periodSelect.value
  ) {

    createEvaluationModal(
      athleteId,
      periodSelect.value
    );

  } else {

    alert(
      "دوره ارزیابی پیدا نشد.\nابتدا یک دوره ارزیابی ایجاد کنید."
    );

  }

}


// ============================================================
// EVALUATION MODAL CSS
// ============================================================

function addEvaluationModalStyle() {

  if (
    document.getElementById(
      "evaluation-modal-style"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "evaluation-modal-style";


  style.textContent = `

    #newEvaluationModal {

      position:fixed;
      inset:0;
      z-index:999999;

      display:flex;
      align-items:center;
      justify-content:center;

      padding:15px;

      background:rgba(0,0,0,.65);

    }


    .evaluation-modal-card {

      width:min(700px,100%);
      max-height:92vh;

      overflow-y:auto;

      background:#fff;
      color:#111;

      border-radius:22px;

      padding:25px;

      position:relative;

      box-sizing:border-box;

      box-shadow:
        0 20px 70px
        rgba(0,0,0,.3);

    }


    .evaluation-close {

      position:absolute;

      top:12px;
      left:12px;

      width:38px;
      height:38px;

      border:none;
      border-radius:50%;

      background:#eee;

      font-size:25px;

      cursor:pointer;

    }


    .evaluation-info {

      background:#f0f7f3;

      border-radius:14px;

      padding:15px;

      line-height:2;

      margin:18px 0;

    }


    .evaluation-item {

      background:#f8faf9;

      border:1px solid #dfe7e2;

      border-radius:15px;

      padding:16px;

      margin-bottom:12px;

    }


    .evaluation-item-head {

      display:flex;

      justify-content:space-between;

      align-items:center;

      gap:10px;

      margin-bottom:8px;

    }


    .evaluation-item-score {

      background:#16834b;

      color:#fff;

      border-radius:9px;

      min-width:60px;

      padding:7px;

      text-align:center;

      font-weight:900;

    }


    .evaluation-range {

      width:100%;

      cursor:pointer;

      accent-color:#16834b;

    }


    .evaluation-notes {

      width:100%;

      min-height:100px;

      margin-top:8px;

      padding:12px;

      box-sizing:border-box;

      border:1px solid #ddd;

      border-radius:12px;

      font-family:inherit;

      resize:vertical;

    }


    .evaluation-total {

      margin-top:15px;

      padding:15px;

      text-align:center;

      background:#edf7f1;

      border-radius:12px;

      font-weight:bold;

    }


    .evaluation-total strong {

      color:#16834b;

      font-size:27px;

    }


    .evaluation-save {

      width:100%;

      min-height:52px;

      margin-top:15px;

      border:none;

      border-radius:12px;

      background:#16834b;

      color:#fff;

      font-family:inherit;

      font-size:16px;

      font-weight:800;

      cursor:pointer;

    }


    .evaluation-save:disabled {

      opacity:.6;

      cursor:not-allowed;

    }

  `;


  document.head.appendChild(
    style
  );

}


// ============================================================
// CREATE EVALUATION MODAL
// ============================================================

function createEvaluationModal(
  athleteId,
  periodId
) {

  const old =
    document.getElementById(
      "newEvaluationModal"
    );


  if (old) {
    old.remove();
  }


  const athlete =
    athletes.find(
      item =>
        String(item.id) ===
        String(athleteId)
    );


  const period =
    evaluationPeriods.find(
      item =>
        String(item.id) ===
        String(periodId)
    );


  if (!athlete) {

    alert(
      "ورزشکار پیدا نشد."
    );

    return;

  }


  if (!period) {

    alert(
      "دوره ارزیابی پیدا نشد."
    );

    return;

  }


  addEvaluationModalStyle();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "newEvaluationModal";


  modal.innerHTML = `

    <div class="evaluation-modal-card">

      <button
        class="evaluation-close"
        id="evaluationClose"
        type="button"
      >
        ×
      </button>


      <h2>
        ارزیابی جدید
      </h2>


      <div class="evaluation-info">

        ورزشکار:

        <strong>
          ${escapeHTML(
            getAthleteName(athlete)
          )}
        </strong>

        <br>

        دوره:

        <strong>
          ${escapeHTML(
            period.title ||
            "دوره بدون عنوان"
          )}
        </strong>

      </div>


      <div id="evaluationCriteriaContainer">

        ${
          evaluationCriteria.length

            ? evaluationCriteria
                .map(
                  criterion => `

                    <div
                      class="evaluation-item"
                    >

                      <div
                        class="evaluation-item-head"
                      >

                        <strong>
                          ${escapeHTML(
                            criterion.name ||
                            "معیار"
                          )}
                        </strong>


                        <span
                          class="evaluation-item-score"
                          data-score-for="${escapeHTML(
                            criterion.id
                          )}"
                        >
                          ۰
                        </span>

                      </div>


                      ${
                        criterion.description
                          ? `

                            <p
                              style="
                                color:#777;
                                font-size:13px;
                              "
                            >
                              ${escapeHTML(
                                criterion.description
                              )}
                            </p>

                          `
                          : ""
                      }


                      <input
                        class="evaluation-range"
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value="0"
                        data-criterion-id="${escapeHTML(
                          criterion.id
                        )}"
                      >

                    </div>

                  `
                )
                .join("")

            : `

              <div
                style="
                  padding:20px;
                  text-align:center;
                  color:#777;
                "
              >
                هنوز هیچ معیار فعالی برای ارزیابی وجود ندارد.
              </div>

            `
        }

      </div>


      <label>

        توضیحات مربی

        <textarea
          id="evaluationNotes"
          class="evaluation-notes"
          placeholder="توضیحات مربی..."
        ></textarea>

      </label>


      <div class="evaluation-total">

        امتیاز نهایی:

        <strong id="evaluationTotal">
          ۰
        </strong>

        از ۱۰

      </div>


      <button
        class="evaluation-save"
        id="saveEvaluation"
        type="button"
      >
        ثبت ارزیابی
      </button>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  const ranges =
    modal.querySelectorAll(
      ".evaluation-range"
    );


  function updateTotal() {

    let total = 0;


    ranges.forEach(
      range => {

        const value =
          Number(
            range.value
          );


        total += value;


        const scoreElement =
          modal.querySelector(
            `[data-score-for="${CSS.escape(
              range.dataset.criterionId
            )}"]`
          );


        if (scoreElement) {

          scoreElement.textContent =
            persianNumber(
              value.toFixed(1)
            );

        }

      }
    );


    const average =
      ranges.length
        ? total / ranges.length
        : 0;


    const totalElement =
      modal.querySelector(
        "#evaluationTotal"
      );


    if (totalElement) {

      totalElement.textContent =
        persianNumber(
          average.toFixed(2)
        );

    }

  }


  ranges.forEach(
    range => {

      range.addEventListener(
        "input",
        updateTotal
      );

    }
  );


  updateTotal();


  modal
    .querySelector(
      "#evaluationClose"
    )
    ?.addEventListener(
      "click",
      () => modal.remove()
    );


  modal
    .querySelector(
      "#saveEvaluation"
    )
    ?.addEventListener(
      "click",
      () =>
        saveEvaluation(
          athleteId,
          periodId,
          ranges,
          modal
        )
    );

}


// ============================================================
// SAVE EVALUATION
// ============================================================

async function saveEvaluation(
  athleteId,
  periodId,
  ranges,
  modal
) {

  const button =
    modal.querySelector(
      "#saveEvaluation"
    );


  if (!currentCoach) {

    alert(
      "حساب مربی پیدا نشد. لطفاً دوباره وارد شوید."
    );

    return;

  }


  if (!ranges.length) {

    alert(
      "هیچ معیار فعالی برای این ارزیابی وجود ندارد."
    );

    return;

  }


  if (button) {

    button.disabled = true;

    button.textContent =
      "در حال ثبت...";

  }


  try {

    const scores =
      [...ranges]
        .map(
          range => ({

            criterion_id:
              range.dataset.criterionId,

            score:
              Number(
                Number(
                  range.value
                ).toFixed(1)
              )

          })
        );


    const totalScore =
      scores.length
        ? scores.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) / scores.length
        : 0;


    const notes =
      modal
        .querySelector(
          "#evaluationNotes"
        )
        ?.value
        ?.trim() || null;


    const evaluationPayload = {

      athlete_id:
        athleteId,

      coach_id:
        currentCoach.id,

      period_id:
        periodId,

      total_score:
        Number(
          totalScore.toFixed(2)
        ),

      notes:
        notes,

      evaluated_at:
        new Date().toISOString()

    };


    console.log(
      "📤 Evaluation:",
      evaluationPayload
    );


    // ========================================================
    // 1. CREATE EVALUATION
    // ========================================================

    const {
      data: evaluation,
      error: evaluationError
    } =
      await supabaseClient
        .from("evaluations")
        .insert(
          evaluationPayload
        )
        .select()
        .single();


    if (evaluationError) {

      showError(
        "ثبت ارزیابی انجام نشد",
        evaluationError
      );

      return;

    }


    if (
      !evaluation ||
      !evaluation.id
    ) {

      alert(
        "ارزیابی ساخته شد ولی شناسه آن دریافت نشد."
      );

      return;

    }


    // ========================================================
    // 2. CREATE SCORE ROWS
    // ========================================================

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

      /*
       * چون خود evaluation قبلاً ساخته شده،
       * آن را حذف نمی‌کنیم.
       */

      showError(
        "ارزیابی ثبت شد ولی امتیاز معیارها ثبت نشد",
        scoreError
      );

      return;

    }


    // ========================================================
    // 3. REFRESH
    // ========================================================

    alert(
      "ارزیابی با موفقیت ثبت شد. ✅"
    );


    modal.remove();


    await loadEvaluations();

    await loadEvaluationScores();

    updateDashboardStats();

    renderEvaluationList();


  } catch (error) {

    showError(
      "خطا هنگام ثبت ارزیابی",
      error
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "ثبت ارزیابی";

    }

  }

}


// ============================================================
// RENDER EVALUATIONS
// ============================================================

function renderEvaluationList() {

  const container =
    document.getElementById(
      "evaluationsList"
    );


  if (!container) {
    return;
  }


  if (!evaluations.length) {

    container.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          هنوز ارزیابی‌ای ثبت نشده است
        </h2>

        <p>
          برای شروع یک ارزیابی جدید ثبت کنید.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    evaluations
      .map(
        evaluation => {

          const athlete =
            athletes.find(
              item =>
                String(item.id) ===
                String(
                  evaluation.athlete_id
                )
            );


          const period =
            evaluationPeriods.find(
              item =>
                String(item.id) ===
                String(
                  evaluation.period_id
                )
            );


          const score =
            Number(
              evaluation.total_score || 0
            );


          const date =
            evaluation.evaluated_at
              ? new Date(
                  evaluation.evaluated_at
                ).toLocaleDateString(
                  "fa-IR"
                )
              : "—";


          const criteriaScores =
            evaluationScores.filter(
              item =>
                String(
                  item.evaluation_id
                ) ===
                String(
                  evaluation.id
                )
            );


          return `

            <div class="evaluation-card">

              <div class="evaluation-card-header">

                <div class="evaluation-athlete">

                  <div class="evaluation-avatar">
                    🥋
                  </div>


                  <div>

                    <h3>
                      ${escapeHTML(
                        getAthleteName(
                          athlete
                        )
                      )}
                    </h3>


                    <p>
                      ${escapeHTML(
                        period?.title ||
                        "دوره نامشخص"
                      )}
                    </p>


                    <p>
                      تاریخ:
                      ${escapeHTML(date)}
                    </p>

                  </div>

                </div>


                <div class="evaluation-score">

                  <span>
                    امتیاز نهایی
                  </span>

                  <strong>
                    ${persianNumber(
                      score.toFixed(2)
                    )}
                  </strong>

                </div>

              </div>


              ${
                criteriaScores.length

                  ? `

                    <div class="criteria-preview">

                      ${criteriaScores
                        .map(
                          item => {

                            const criterion =
                              evaluationCriteria.find(
                                c =>
                                  String(c.id) ===
                                  String(
                                    item.criterion_id
                                  )
                              );


                            const value =
                              Number(
                                item.score || 0
                              );


                            return `

                              <div
                                class="criteria-preview-row"
                              >

                                <div
                                  class="criteria-preview-name"
                                >
                                  ${escapeHTML(
                                    criterion?.name ||
                                    "معیار"
                                  )}
                                </div>


                                <div
                                  class="criteria-preview-bar"
                                >

                                  <div
                                    class="criteria-preview-fill"
                                    style="
                                      width:${Math.max(
                                        0,
                                        Math.min(
                                          100,
                                          value * 10
                                        )
                                      )}%;
                                    "
                                  ></div>

                                </div>


                                <div
                                  class="criteria-preview-score"
                                >
                                  ${persianNumber(
                                    value.toFixed(1)
                                  )}
                                </div>

                              </div>

                            `;

                          }
                        )
                        .join("")}

                    </div>

                  `

                  : ""
              }


              ${
                evaluation.notes

                  ? `

                    <p>

                      <strong>
                        توضیحات مربی:
                      </strong>

                      ${escapeHTML(
                        evaluation.notes
                      )}

                    </p>

                  `

                  : ""
              }

            </div>

          `;

        }
      )
      .join("");

}


// ============================================================
// PREPARE EVALUATION PAGE
// ============================================================

function prepareEvaluationPage() {

  fillAthleteSelect();

  fillPeriodSelect();

  renderEvaluationList();

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboardStats() {

  const totalAthletes =
    document.getElementById(
      "totalAthletes"
    );


  if (totalAthletes) {

    totalAthletes.textContent =
      persianNumber(
        athletes.length
      );

  }


  const totalEvaluations =
    document.getElementById(
      "totalEvaluations"
    );


  if (totalEvaluations) {

    totalEvaluations.textContent =
      persianNumber(
        evaluations.length
      );

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


// ============================================================
// INITIALIZE
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );


  // فعال‌سازی UI
  initializeNavigation();

  initializeLogout();

  initializeAthleteModal();

  initializeAthleteSearch();

  initializeEvaluationButton();


  // بررسی ورود
  const loggedIn =
    await checkCoachSession();


  if (!loggedIn) {
    return;
  }


  // دریافت داده‌ها
  await Promise.all([
    loadAthletes(),
    loadEvaluationPeriods(),
    loadEvaluationCriteria(),
    loadEvaluations(),
    loadEvaluationScores()
  ]);


  // پر کردن UI
  fillAthleteFilter();

  fillAthleteSelect();

  fillPeriodSelect();

  renderAthletes();

  renderEvaluationList();

  updateDashboardStats();


  // داشبورد
  openPage(
    "dashboard"
  );


  console.log(
    "✅ پنل مربی کاملاً آماده است."
  );

}


// ============================================================
// DOM READY
// ============================================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCoach
  );

} else {

  initializeCoach();

}


// ============================================================
// GLOBAL
// ============================================================

window.supabaseClient =
  supabaseClient;

window.openPage =
  openPage;

window.openAthleteModal =
  openAthleteModal;

window.closeAthleteModal =
  closeAthleteModal;

window.saveAthlete =
  saveAthlete;

window.createEvaluationModal =
  createEvaluationModal;

window.saveEvaluation =
  saveEvaluation;

window.openEvaluationForAthlete =
  openEvaluationForAthlete;

window.loadAthletes =
  loadAthletes;

window.loadEvaluationPeriods =
  loadEvaluationPeriods;

window.loadEvaluationCriteria =
  loadEvaluationCriteria;

window.loadEvaluations =
  loadEvaluations;

window.renderAthletes =
  renderAthletes;

window.renderEvaluationList =
  renderEvaluationList;
