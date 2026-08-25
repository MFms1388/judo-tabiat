// ============================================================
// طبیعت جودو | COACH.JS
// پنل مدیریت مربی - نسخه اصلاح شده
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";

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


// ============================================================
// HELPERS
// ============================================================

function coachEscapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  return div.innerHTML;
}


function coachPersianNumber(value) {

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

    const result =
      await supabaseClient.auth.getSession();

    if (result.error) {

      console.error(
        "Session error:",
        result.error
      );

      return;

    }


    const session =
      result.data?.session;


    const emailElement =
      document.getElementById(
        "coachEmail"
      );


    if (!session?.user) {

      if (emailElement) {

        emailElement.textContent =
          "وارد نشده";

      }

      return;

    }


    if (emailElement) {

      emailElement.textContent =
        session.user.email || "مربی";

    }

  } catch (error) {

    console.error(
      "Session check error:",
      error
    );

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

      item.classList.remove("active");

      if (
        item.dataset.page ===
        pageName
      ) {

        item.classList.add("active");

      }

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


// ============================================================
// NAVIGATION INITIALIZE
// ============================================================

function initializeNavigation() {

  console.log(
    "Navigation initialized"
  );


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

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

      button.addEventListener(
        "click",
        function () {

          const page =
            this.dataset.go;

          if (page) {

            openPage(page);

          }

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
    sidebar
  ) {

    menuBtn.addEventListener(
      "click",
      function () {

        sidebar.classList.toggle(
          "open"
        );

      }
    );

  }

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutCoach() {

  try {

    const result =
      await supabaseClient.auth.signOut();


    if (result.error) {

      showError(
        "خروج انجام نشد.",
        result.error
      );

      return;

    }


    window.location.href =
      "index.html";


  } catch (error) {

    showError(
      "خطا هنگام خروج.",
      error
    );

  }

}


function initializeLogout() {

  const button =
    document.getElementById(
      "logoutBtn"
    );


  if (!button) {

    console.warn(
      "logoutBtn پیدا نشد"
    );

    return;

  }


  button.addEventListener(
    "click",
    logoutCoach
  );

}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadAthletes() {

  console.log(
    "Loading athletes..."
  );


  try {

    /*
      عمداً از created_at برای order
      استفاده نمی‌کنیم.
    */

    let result =
      await supabaseClient
        .from("Athletes")
        .select("*");


    if (
      result.error
    ) {

      console.warn(
        "Athletes uppercase failed:",
        result.error
      );


      result =
        await supabaseClient
          .from("athletes")
          .select("*");

    }


    if (result.error) {

      showError(
        "ورزشکاران از Supabase خوانده نشدند.",
        result.error
      );

      athletes = [];

      renderAthletes();

      return [];

    }


    athletes =
      result.data || [];


    console.log(
      "Athletes loaded:",
      athletes
    );


    renderAthletes();

    fillAthleteFilter();

    fillAthleteSelect();

    updateDashboardStats();


    return athletes;


  } catch (error) {

    showError(
      "خطا در دریافت ورزشکاران.",
      error
    );

    athletes = [];

    renderAthletes();

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


  const searchInput =
    document.getElementById(
      "coachSearch"
    );


  const filter =
    document.getElementById(
      "coachFilter"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const filterValue =
    filter
      ? filter.value
      : "all";


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
              athlete.national_id ||
              ""
            ).toLowerCase();


          return (
            name.includes(search) ||
            nationalId.includes(search)
          );

        }
      );

  }


  if (
    filterValue &&
    filterValue !== "all"
  ) {

    list =
      list.filter(
        athlete => {

          return String(
            athlete.age_group || ""
          ) === String(
            filterValue
          );

        }
      );

  }


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-panel">

        <div>👥</div>

        <h2>
          ورزشکاری پیدا نشد
        </h2>

        <p>
          هنوز ورزشکاری ثبت نشده یا نتیجه‌ای مطابق جستجو وجود ندارد.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    list
      .map(athlete => {

        const name =
          getAthleteName(
            athlete
          );


        const ageGroup =
          athlete.age_group ||
          "—";


        const weight =
          athlete.weight ??
          "—";


        const nationalId =
          athlete.national_id ||
          "—";


        const photo =
          athlete.photo_url ||
          "";


        return `

          <div
            class="athlete-card"
            data-athlete-id="${coachEscapeHTML(
              athlete.id
            )}"
          >

            <div class="athlete-card-image">

              ${
                photo
                  ? `
                    <img
                      src="${coachEscapeHTML(
                        photo
                      )}"
                      alt="${coachEscapeHTML(
                        name
                      )}"
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
                        font-size:40px;
                      "
                    >
                      🥋
                    </div>
                  `
              }

            </div>


            <div class="athlete-card-content">

              <h3>
                ${coachEscapeHTML(
                  name
                )}
              </h3>

              <p>
                رده:
                ${coachEscapeHTML(
                  ageGroup
                )}
              </p>

              <p>
                وزن:
                ${coachPersianNumber(
                  weight
                )}
                کیلو
              </p>

              <p>
                کد ملی:
                ${coachEscapeHTML(
                  nationalId
                )}
              </p>


              <button
                type="button"
                class="primary wide athlete-evaluation-btn"
                data-athlete-id="${coachEscapeHTML(
                  athlete.id
                )}"
              >
                📊 ارزیابی جدید
              </button>

            </div>

          </div>

        `;

      })
      .join("");


  container
    .querySelectorAll(
      ".athlete-evaluation-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();


          const athleteId =
            this.dataset.athleteId;


          openEvaluationForAthlete(
            athleteId
          );

        }
      );

    });

}


// ============================================================
// ATHLETE FILTER
// ============================================================

function fillAthleteFilter() {

  const filter =
    document.getElementById(
      "coachFilter"
    );


  if (!filter) {
    return;
  }


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
              value="${coachEscapeHTML(
                group
              )}"
            >
              ${coachEscapeHTML(
                group
              )}
            </option>

          `
        )
        .join("")
    }

  `;

}


// ============================================================
// ATHLETE SEARCH
// ============================================================

function initializeAthleteSearch() {

  const search =
    document.getElementById(
      "coachSearch"
    );


  const filter =
    document.getElementById(
      "coachFilter"
    );


  if (search) {

    search.addEventListener(
      "input",
      renderAthletes
    );

  }


  if (filter) {

    filter.addEventListener(
      "change",
      renderAthletes
    );

  }

}


// ============================================================
// ADD ATHLETE MODAL
// ============================================================

function openAthleteModal() {

  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (!modal) {

    alert(
      "athleteModal در coach.html پیدا نشد."
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
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.value = "";

      }

    });

}


// ============================================================
// ATHLETE MODAL INITIALIZE
// ============================================================

function initializeAthleteModal() {

  console.log(
    "Initializing athlete modal..."
  );


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


  console.log({
    addAthleteBtn: !!openButton,
    closeAthleteModal: !!closeButton,
    saveAthleteBtn: !!saveButton
  });


  if (openButton) {

    openButton.addEventListener(
      "click",
      function () {

        clearAthleteForm();

        openAthleteModal();

      }
    );

  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeAthleteModal
    );

  }


  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (modal) {

    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          modal
        ) {

          closeAthleteModal();

        }

      }
    );

  }


  if (saveButton) {

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


  const weight =
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
        weight
          ? Number(weight)
          : null,

      national_id:
        nationalId || null,

      bio:
        bio || null,

      photo_url:
        photoUrl || null

    };


    let result =
      await supabaseClient
        .from("Athletes")
        .insert(
          athleteData
        )
        .select()
        .single();


    if (result.error) {

      console.warn(
        "Uppercase insert failed:",
        result.error
      );


      result =
        await supabaseClient
          .from("athletes")
          .insert(
            athleteData
          )
          .select()
          .single();

    }


    if (result.error) {

      showError(
        "ثبت ورزشکار انجام نشد.",
        result.error
      );

      return;

    }


    alert(
      "ورزشکار با موفقیت ثبت شد."
    );


    closeAthleteModal();


    await loadAthletes();


    fillAthleteFilter();


    fillAthleteSelect();


    updateDashboardStats();


  } catch (error) {

    showError(
      "خطا هنگام ثبت ورزشکار.",
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
// LOAD EVALUATION PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  console.log(
    "Loading evaluation periods..."
  );


  try {

    /*
      مهم:
      اینجا دیگر created_at را استفاده نمی‌کنیم.
    */

    const result =
      await supabaseClient
        .from("evaluation_periods")
        .select("*");


    if (result.error) {

      showError(
        "دوره‌های ارزیابی خوانده نشدند.",
        result.error
      );

      evaluationPeriods = [];

      return [];

    }


    evaluationPeriods =
      result.data || [];


    console.log(
      "Periods:",
      evaluationPeriods
    );


    return evaluationPeriods;


  } catch (error) {

    showError(
      "خطا در دریافت دوره‌های ارزیابی.",
      error
    );

    evaluationPeriods = [];

    return [];

  }

}


// ============================================================
// LOAD CRITERIA
// ============================================================

async function loadEvaluationCriteria() {

  console.log(
    "Loading evaluation criteria..."
  );


  try {

    const result =
      await supabaseClient
        .from("evaluation_criteria")
        .select("*");


    if (result.error) {

      showError(
        "معیارهای ارزیابی خوانده نشدند.",
        result.error
      );

      evaluationCriteria = [];

      return [];

    }


    evaluationCriteria =
      result.data || [];


    console.log(
      "Criteria:",
      evaluationCriteria
    );


    return evaluationCriteria;


  } catch (error) {

    showError(
      "خطا در دریافت معیارها.",
      error
    );

    evaluationCriteria = [];

    return [];

  }

}


// ============================================================
// LOAD EVALUATIONS
// ============================================================

async function loadEvaluations() {

  console.log(
    "Loading evaluations..."
  );


  try {

    const result =
      await supabaseClient
        .from("evaluations")
        .select("*");


    if (result.error) {

      showError(
        "ارزیابی‌های قبلی خوانده نشدند.",
        result.error
      );

      evaluations = [];

      return [];

    }


    evaluations =
      result.data || [];


    console.log(
      "Evaluations:",
      evaluations
    );


    return evaluations;


  } catch (error) {

    showError(
      "خطا در دریافت ارزیابی‌ها.",
      error
    );

    evaluations = [];

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


  select.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

    ${
      athletes
        .map(
          athlete => `

            <option
              value="${coachEscapeHTML(
                athlete.id
              )}"
            >
              ${coachEscapeHTML(
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


  select.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

    ${
      evaluationPeriods
        .map(
          period => {

            const title =
              period.title ||
              period.name ||
              period.period_name ||
              "دوره بدون عنوان";


            return `

              <option
                value="${coachEscapeHTML(
                  period.id
                )}"
              >
                ${coachEscapeHTML(
                  title
                )}
              </option>

            `;

          }
        )
        .join("")
    }

  `;

}


// ============================================================
// EVALUATION PAGE
// ============================================================

async function prepareEvaluationPage() {

  fillAthleteSelect();

  fillPeriodSelect();

  renderEvaluationList();

}


// ============================================================
// OPEN EVALUATION
// ============================================================

function openEvaluationFromSelectors() {

  const athleteSelect =
    document.getElementById(
      "evaluationAthleteSelect"
    );


  const periodSelect =
    document.getElementById(
      "evaluationPeriodSelect"
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


  createEvaluationModal(
    athleteId,
    periodId
  );

}


// ============================================================
// OPEN EVALUATION FOR ATHLETE
// ============================================================

function openEvaluationForAthlete(
  athleteId
) {

  openPage(
    "evaluations"
  );


  setTimeout(
    function () {

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
          String(
            athleteId
          );

      }


      if (
        !evaluationPeriods.length
      ) {

        alert(
          "هیچ دوره ارزیابی‌ای در سیستم پیدا نشد."
        );

        return;

      }


      if (
        periodSelect &&
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
          "لطفاً یک دوره ارزیابی را انتخاب کنید."
        );

      }

    },
    150
  );

}


// ============================================================
// EVALUATION MODAL STYLE
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

      position: fixed;
      inset: 0;
      z-index: 99999;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 15px;

      background:
        rgba(0,0,0,.65);

    }


    .evaluation-modal-card {

      width:
        min(650px,100%);

      max-height:
        92vh;

      overflow-y:
        auto;

      background:
        #fff;

      color:
        #111;

      border-radius:
        20px;

      padding:
        24px;

      position:
        relative;

      box-sizing:
        border-box;

      box-shadow:
        0 20px 70px
        rgba(0,0,0,.3);

    }


    .evaluation-close {

      position:
        absolute;

      top:
        12px;

      left:
        12px;

      width:
        38px;

      height:
        38px;

      border:
        none;

      border-radius:
        50%;

      background:
        #eee;

      font-size:
        25px;

      cursor:
        pointer;

    }


    .evaluation-info {

      background:
        #f0f7f3;

      border-radius:
        12px;

      padding:
        14px;

      line-height:
        2;

      margin:
        15px 0;

    }


    .evaluation-item {

      background:
        #f8faf9;

      border:
        1px solid #dfe7e2;

      border-radius:
        15px;

      padding:
        16px;

      margin-bottom:
        12px;

    }


    .evaluation-item-head {

      display:
        flex;

      justify-content:
        space-between;

      gap:
        10px;

      margin-bottom:
        8px;

    }


    .evaluation-item-score {

      background:
        #16834b;

      color:
        #fff;

      border-radius:
        9px;

      min-width:
        55px;

      padding:
        7px;

      text-align:
        center;

      font-weight:
        900;

    }


    .evaluation-range {

      width:
        100%;

      cursor:
        pointer;

    }


    .evaluation-notes {

      width:
        100%;

      min-height:
        100px;

      margin-top:
        8px;

      padding:
        12px;

      box-sizing:
        border-box;

      border:
        1px solid #ddd;

      border-radius:
        12px;

      font-family:
        inherit;

      resize:
        vertical;

    }


    .evaluation-total {

      margin-top:
        15px;

      padding:
        15px;

      text-align:
        center;

      background:
        #edf7f1;

      border-radius:
        12px;

      font-weight:
        bold;

    }


    .evaluation-total strong {

      color:
        #16834b;

      font-size:
        26px;

    }


    .evaluation-save {

      width:
        100%;

      min-height:
        52px;

      margin-top:
        15px;

      border:
        none;

      border-radius:
        12px;

      background:
        #16834b;

      color:
        white;

      font-family:
        inherit;

      font-size:
        16px;

      font-weight:
        800;

      cursor:
        pointer;

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


  const periodTitle =
    period.title ||
    period.name ||
    period.period_name ||
    "دوره بدون عنوان";


  modal.innerHTML = `

    <div
      class="evaluation-modal-card"
    >

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
          ${coachEscapeHTML(
            getAthleteName(
              athlete
            )
          )}
        </strong>

        <br>

        دوره:

        <strong>
          ${coachEscapeHTML(
            periodTitle
          )}
        </strong>

      </div>


      <div
        id="evaluationCriteriaContainer"
      >

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
                          ${coachEscapeHTML(
                            criterion.name ||
                            criterion.title ||
                            "معیار"
                          )}
                        </strong>


                        <span
                          class="evaluation-item-score"
                          id="score-${coachEscapeHTML(
                            criterion.id
                          )}"
                        >
                          ۰
                        </span>

                      </div>


                      ${
                        criterion.description
                          ? `

                            <p>
                              ${coachEscapeHTML(
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
                        data-criterion-id="${coachEscapeHTML(
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
                هنوز هیچ معیاری برای ارزیابی ایجاد نشده است.
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


      <div
        class="evaluation-total"
      >

        امتیاز نهایی:

        <strong
          id="evaluationTotal"
        >
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


        const score =
          modal.querySelector(
            "#score-" +
            CSS.escape(
              range.dataset
                .criterionId
            )
          );


        if (score) {

          score.textContent =
            coachPersianNumber(
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
        coachPersianNumber(
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


  const closeButton =
    modal.querySelector(
      "#evaluationClose"
    );


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      () => modal.remove()
    );

  }


  const saveButton =
    modal.querySelector(
      "#saveEvaluation"
    );


  if (saveButton) {

    saveButton.addEventListener(
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


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "در حال ثبت...";

  }


  try {

    const scores =
      [...ranges].map(
        range => ({

          criterion_id:
            range.dataset
              .criterionId,

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
            (
              sum,
              item
            ) =>
              sum +
              item.score,
            0
          ) /
          scores.length
        : 0;


    const notes =
      modal
        .querySelector(
          "#evaluationNotes"
        )
        ?.value
        .trim() || "";


    /*
      خیلی مهم:
      created_at را دیگر
      دستی ارسال نمی‌کنیم.
    */

    const payload = {

      athlete_id:
        athleteId,

      period_id:
        periodId,

      total_score:
        Number(
          totalScore.toFixed(2)
        ),

      notes:
        notes || null

    };


    console.log(
      "Saving evaluation:",
      payload
    );


    const evaluationResult =
      await supabaseClient
        .from("evaluations")
        .insert(
          payload
        )
        .select()
        .single();


    if (
      evaluationResult.error
    ) {

      showError(
        "ثبت ارزیابی انجام نشد.",
        evaluationResult.error
      );

      return;

    }


    const evaluationId =
      evaluationResult
        .data
        ?.id;


    /*
      ثبت امتیاز معیارها
    */

    if (
      scores.length &&
      evaluationId
    ) {

      const scoreRows =
        scores.map(
          item => ({

            evaluation_id:
              evaluationId,

            criterion_id:
              item.criterion_id,

            score:
              item.score

          })
        );


      const scoreResult =
        await supabaseClient
          .from(
            "evaluation_scores"
          )
          .insert(
            scoreRows
          );


      if (
        scoreResult.error
      ) {

        console.error(
          "Score insert error:",
          scoreResult.error
        );


        alert(
          "ارزیابی ثبت شد، اما امتیاز معیارها ثبت نشد.\n\n" +
          scoreResult.error.message
        );

      }

    }


    alert(
      "ارزیابی با موفقیت ثبت شد."
    );


    modal.remove();


    await loadEvaluations();


    updateDashboardStats();


    renderEvaluationList();


  } catch (error) {

    showError(
      "خطا هنگام ثبت ارزیابی.",
      error
    );

  } finally {

    if (button) {

      button.disabled =
        false;

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

      <div
        class="evaluation-empty"
      >

        <div
          class="evaluation-empty-icon"
        >
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
              evaluation.total_score ||
              0
            );


          const periodTitle =
            period?.title ||
            period?.name ||
            period?.period_name ||
            "دوره نامشخص";


          return `

            <div
              class="evaluation-card"
            >

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
                      ${coachEscapeHTML(
                        getAthleteName(
                          athlete
                        )
                      )}
                    </h3>


                    <p>
                      ${coachEscapeHTML(
                        periodTitle
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
                    ${coachPersianNumber(
                      score.toFixed(2)
                    )}
                  </strong>

                </div>

              </div>


              ${
                evaluation.notes
                  ? `

                    <p>

                      <strong>
                        توضیحات مربی:
                      </strong>

                      ${coachEscapeHTML(
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
// DASHBOARD
// ============================================================

function updateDashboardStats() {

  const totalAthletes =
    document.getElementById(
      "totalAthletes"
    );


  if (totalAthletes) {

    totalAthletes.textContent =
      coachPersianNumber(
        athletes.length
      );

  }


  const totalEvaluations =
    document.getElementById(
      "totalEvaluations"
    );


  if (totalEvaluations) {

    totalEvaluations.textContent =
      coachPersianNumber(
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
// INITIALIZE EVALUATION BUTTON
// ============================================================

function initializeEvaluationButton() {

  const button =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (!button) {

    console.warn(
      "newEvaluationBtn پیدا نشد"
    );

    return;

  }


  button.addEventListener(
    "click",
    openEvaluationFromSelectors
  );

}


// ============================================================
// GLOBAL DEBUG
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


// ============================================================
// START
// ============================================================

async function initializeCoach() {

  console.log(
    "===================================="
  );

  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );

  console.log(
    "Starting..."
  );


  /*
    ترتیب مهم است:
    اول Event ها را وصل می‌کنیم،
    بعد اطلاعات Supabase را می‌خوانیم.
  */

  initializeNavigation();

  initializeLogout();

  initializeAthleteModal();

  initializeAthleteSearch();

  initializeEvaluationButton();


  await checkCoachSession();


  await loadAthletes();

  await loadEvaluationPeriods();

  await loadEvaluationCriteria();

  await loadEvaluations();


  fillAthleteFilter();

  fillAthleteSelect();

  fillPeriodSelect();

  renderAthletes();

  renderEvaluationList();

  updateDashboardStats();


  openPage(
    "dashboard"
  );


  console.log(
    "🥋 Coach panel ready."
  );

}


// ============================================================
// DOM READY
// ============================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCoach
  );

} else {

  initializeCoach();

        }
