// ============================================================
// طبیعت جودو | COACH.JS
// نسخه کامل و اصلاح شده
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


// ============================================================
// SUPABASE CLIENT
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

  const name = [
    athlete.first_name,
    athlete.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "بدون نام";
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


    const emailElement =
      document.getElementById(
        "coachEmail"
      );


    if (emailElement) {

      emailElement.textContent =
        currentCoach.email || "مربی";

    }


    console.log(
      "Coach:",
      currentCoach.id,
      currentCoach.email
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

      page.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      "page-" + pageName
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.remove(
        "active"
      );


      if (
        item.dataset.page ===
        pageName
      ) {

        item.classList.add(
          "active"
        );

      }

    });


  const sidebar =
    document.getElementById(
      "coachSidebar"
    );


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

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
    "در حال دریافت ورزشکاران..."
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

      console.error(
        "LOAD ATHLETES ERROR:",
        error
      );

      showError(
        "ورزشکاران از دیتابیس خوانده نشدند",
        error
      );

      return [];

    }


    athletes =
      data || [];


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
      .trim()
      .toLowerCase() || "";


  const filter =
    document.getElementById(
      "coachFilter"
    )?.value || "all";


  let list =
    [...athletes];


  // SEARCH

  if (search) {

    list =
      list.filter(
        athlete => {

          const name =
            getAthleteName(
              athlete
            )
              .toLowerCase();


          const nationalId =
            String(
              athlete.national_id ||
              ""
            )
              .toLowerCase();


          return (
            name.includes(search) ||
            nationalId.includes(search)
          );

        }
      );

  }


  // FILTER

  if (
    filter !== "all"
  ) {

    list =
      list.filter(
        athlete =>
          String(
            athlete.age_group || ""
          ) === String(filter)
      );

  }


  // EMPTY

  if (!list.length) {

    container.innerHTML = `

      <div class="empty-panel">

        <div>👥</div>

        <h2>
          ورزشکاری پیدا نشد
        </h2>

        <p>
          اگر ورزشکار در Supabase وجود دارد،
          خطای دسترسی دیتابیس را بررسی کنید.
        </p>

      </div>

    `;

    return;

  }


  // ==========================================================
  // ATHLETE CARDS
  // ==========================================================

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


        const athleteId =
          String(
            athlete.id
          );


        return `

          <div
            class="athlete-card"
            data-athlete-id="${escapeHTML(
              athleteId
            )}"
          >

            <!-- PHOTO -->

            <div class="athlete-card-image">

              ${
                photo
                  ? `
                    <img
                      src="${escapeHTML(
                        photo
                      )}"
                      alt="${escapeHTML(
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


            <!-- CONTENT -->

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


              <!-- ACTIONS -->

              <div
                class="athlete-card-actions"
                style="
                  display:grid;
                  grid-template-columns:1fr;
                  gap:9px;
                  margin-top:15px;
                "
              >

                <!-- VIEW PROFILE -->

                <button
                  type="button"
                  class="primary wide athlete-profile-btn"
                  data-athlete-id="${escapeHTML(
                    athleteId
                  )}"
                  style="
                    cursor:pointer;
                  "
                >
                  👤 مشاهده پروفایل
                </button>


                <!-- NEW EVALUATION -->

                <button
                  type="button"
                  class="primary wide athlete-evaluation-btn"
                  data-athlete-id="${escapeHTML(
                    athleteId
                  )}"
                  style="
                    cursor:pointer;
                  "
                >
                  📊 ارزیابی جدید
                </button>

              </div>

            </div>

          </div>

        `;

      })
      .join("");


  // ==========================================================
  // PROFILE BUTTON
  // ==========================================================

  container
    .querySelectorAll(
      ".athlete-profile-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          const athleteId =
            this.dataset.athleteId;


          if (!athleteId) {

            alert(
              "شناسه ورزشکار پیدا نشد."
            );

            return;

          }


          console.log(
            "Opening athlete profile:",
            athleteId
          );


          window.location.href =
            "athlete.html?id=" +
            encodeURIComponent(
              athleteId
            );

        }
      );

    });


  // ==========================================================
  // EVALUATION BUTTON
  // ==========================================================

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
            <option value="${escapeHTML(
              group
            )}">
              ${escapeHTML(group)}
            </option>
          `
        )
        .join("")
    }

  `;

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
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.value = "";

      }

    });

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


  if (openButton) {

    openButton.addEventListener(
      "click",
      function () {

        clearAthleteForm();

        openAthleteModal();

      }
    );

  } else {

    console.error(
      "addAthleteBtn پیدا نشد"
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
          event.target === modal
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
    )
      ?.value
      .trim();


  const lastName =
    document.getElementById(
      "athleteLastName"
    )
      ?.value
      .trim();


  const ageGroup =
    document.getElementById(
      "athleteAgeGroup"
    )
      ?.value
      .trim();


  const weight =
    document.getElementById(
      "athleteWeight"
    )
      ?.value;


  const nationalId =
    document.getElementById(
      "athleteNationalId"
    )
      ?.value
      .trim();


  const bio =
    document.getElementById(
      "athleteBio"
    )
      ?.value
      .trim();


  const photoUrl =
    document.getElementById(
      "athletePhotoUrl"
    )
      ?.value
      .trim();


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
        weight === ""
          ? null
          : Number(weight),

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
      "Athlete created:",
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
    "در حال دریافت دوره‌های ارزیابی..."
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
      "Periods:",
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
    "در حال دریافت معیارهای ارزیابی..."
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
      "Criteria:",
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
    "در حال دریافت ارزیابی‌ها..."
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
      "Evaluations:",
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
// SELECT ATHLETE
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

}


// ============================================================
// SELECT PERIOD
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

}


// ============================================================
// NEW EVALUATION
// ============================================================

function initializeEvaluationButton() {

  const button =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (!button) {

    console.error(
      "newEvaluationBtn پیدا نشد"
    );

    return;

  }


  button.addEventListener(
    "click",
    function () {

      openEvaluationFromSelectors();

    }
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


  createEvaluationModal(
    athleteId,
    periodId
  );

}


// ============================================================
// OPEN EVALUATION FROM ATHLETE
// ============================================================

function openEvaluationForAthlete(
  athleteId
) {

  openPage(
    "evaluations"
  );


  setTimeout(
    function () {

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
          "هیچ دوره ارزیابی‌ای پیدا نشد.\nابتدا یک دوره ارزیابی در دیتابیس ایجاد کنید."
        );

      }

    },
    100
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
      z-index: 999999;

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
        #ffffff;

      color:
        #111111;

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
        #eeeeee;

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
        #ffffff;

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
        #ffffff;

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
            getAthleteName(
              athlete
            )
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
                            <p>
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
    .addEventListener(
      "click",
      () => modal.remove()
    );


  modal
    .querySelector(
      "#saveEvaluation"
    )
    .addEventListener(
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
          ) / scores.length
        : 0;


    const notes =
      modal
        .querySelector(
          "#evaluationNotes"
        )
        ?.value
        .trim() || "";


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
      "Evaluation payload:",
      evaluationPayload
    );


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
      scores.length &&
      evaluation?.id
    ) {

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
          .from(
            "evaluation_scores"
          )
          .insert(
            scoreRows
          );


      if (scoreError) {

        console.error(
          "Evaluation scores error:",
          scoreError
        );


        alert(
          "خود ارزیابی ثبت شد، اما امتیاز معیارها ثبت نشد.\n\n" +
          scoreError.message
        );

      }

    }


    alert(
      "ارزیابی با موفقیت ثبت شد. ✅"
    );


    modal.remove();


    await loadEvaluations();

    renderEvaluationList();

    updateDashboardStats();


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


          const date =
            evaluation.evaluated_at
              ? new Date(
                  evaluation.evaluated_at
                )
                  .toLocaleDateString(
                    "fa-IR"
                  )
              : "—";


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
                      ${escapeHTML(
                        date
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
                    ${persianNumber(
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

                      ${escapeHTML(
                        evaluation.notes
                      )}

                    </p>
                  `
                  : ""
              }


              ${
                athlete?.id
                  ? `
                    <button
                      type="button"
                      class="primary athlete-profile-from-evaluation"
                      data-athlete-id="${escapeHTML(
                        athlete.id
                      )}"
                      style="
                        margin-top:12px;
                        cursor:pointer;
                      "
                    >
                      👤 مشاهده پروفایل ورزشکار
                    </button>
                  `
                  : ""
              }

            </div>

          `;

        }
      )
      .join("");


  container
    .querySelectorAll(
      ".athlete-profile-from-evaluation"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        function () {

          const athleteId =
            this.dataset.athleteId;


          if (!athleteId) {
            return;
          }


          window.location.href =
            "athlete.html?id=" +
            encodeURIComponent(
              athleteId
            );

        }
      );

    });

}


// ============================================================
// EVALUATION PAGE
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
// START
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );


  initializeNavigation();

  initializeLogout();

  initializeAthleteModal();

  initializeAthleteSearch();

  initializeEvaluationButton();


  const loggedIn =
    await checkCoachSession();


  if (!loggedIn) {
    return;
  }


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
    "✅ پنل مربی کاملاً آماده است."
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

window.renderAthletes =
  renderAthletes;

window.loadAthletes =
  loadAthletes;
