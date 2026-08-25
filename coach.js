// ============================================================
// طبیعت جودو | COACH.JS
// پنل مدیریت مربی
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


function getPeriodName(period) {

  if (!period) {
    return "دوره نامشخص";
  }

  return (
    period.title ||
    period.name ||
    period.period_name ||
    "دوره بدون عنوان"
  );

}


function showError(title, error) {

  console.error(title, error);

  alert(
    title +
    "\n\n" +
    (
      error?.message ||
      "خطای نامشخص"
    )
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

      console.error(
        "Session error:",
        error
      );

      return null;

    }


    if (
      !data ||
      !data.session ||
      !data.session.user
    ) {

      console.warn(
        "کاربر وارد حساب نشده است."
      );

      return null;

    }


    const user =
      data.session.user;


    const email =
      user.email || "";


    const emailElement =
      document.getElementById(
        "coachEmail"
      );


    if (emailElement) {

      emailElement.textContent =
        email;

    }


    return user;

  } catch (error) {

    console.error(
      "Session check error:",
      error
    );

    return null;

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
    return;
  }


  button.addEventListener(
    "click",
    async function () {

      button.disabled = true;
      button.textContent = "در حال خروج...";


      try {

        const {
          error
        } =
          await supabaseClient.auth.signOut();


        if (error) {

          console.error(
            "Logout error:",
            error
          );

        }


        window.location.href =
          "index.html";

      } catch (error) {

        console.error(
          error
        );

        window.location.href =
          "index.html";

      }

    }
  );

}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadAthletes() {

  try {

    let result =
      await supabaseClient
        .from("Athletes")
        .select("*");


    /*
      اگر جدول با حروف کوچک باشد
    */

    if (result.error) {

      console.warn(
        "Athletes table failed:",
        result.error
      );


      result =
        await supabaseClient
          .from("athletes")
          .select("*");

    }


    if (result.error) {

      showError(
        "ورزشکاران بارگذاری نشدند.",
        result.error
      );

      athletes = [];

      renderAthletes();
      fillAthleteSelect();
      fillAthleteFilter();

      return [];

    }


    athletes =
      result.data || [];


    /*
      مرتب‌سازی سمت مرورگر
      تا نبودن created_at باعث خطا نشود.
    */

    athletes.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateB - dateA;

      }
    );


    renderAthletes();

    fillAthleteFilter();

    fillAthleteSelect();

    updateDashboardStats();


    console.log(
      "Athletes loaded:",
      athletes
    );


    return athletes;

  } catch (error) {

    console.error(
      "Load athletes error:",
      error
    );

    athletes = [];

    renderAthletes();

    return [];

  }

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
              athlete.age_group ||
              athlete.ageGroup ||
              ""
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

          const ageGroup =
            athlete.age_group ||
            "";


          return (
            String(ageGroup) ===
            String(filterValue)
          );

        }
      );

  }


  if (!list.length) {

    container.innerHTML = `

      <div class="empty-panel">

        <div>
          👥
        </div>

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
            athlete.weight !== null &&
            athlete.weight !== undefined
              ? athlete.weight
              : "—";


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
        function (event) {

          event.preventDefault();
          event.stopPropagation();


          openEvaluationForAthlete(
            this.dataset.athleteId
          );

        }
      );

    });

}


// ============================================================
// SEARCH
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
// ATHLETE MODAL
// ============================================================

function openAthleteModal() {

  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (!modal) {
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


  if (!modal) {
    return;
  }


  modal.classList.add(
    "hidden"
  );

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


  if (
    !firstName ||
    !lastName
  ) {

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
        "Athletes insert error:",
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


    updateDashboardStats();

  } catch (error) {

    showError(
      "خطایی هنگام ثبت ورزشکار رخ داد.",
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
// DASHBOARD
// ============================================================

function updateDashboardStats() {

  const athleteElement =
    document.getElementById(
      "totalAthletes"
    );


  if (athleteElement) {

    athleteElement.textContent =
      coachPersianNumber(
        athletes.length
      );

  }


  const evaluationElement =
    document.getElementById(
      "totalEvaluations"
    );


  if (evaluationElement) {

    evaluationElement.textContent =
      coachPersianNumber(
        evaluations.length
      );

  }


  const attendanceElement =
    document.getElementById(
      "todayAttendance"
    );


  if (attendanceElement) {

    attendanceElement.textContent =
      "۰";

  }


  const achievementElement =
    document.getElementById(
      "totalAchievements"
    );


  if (achievementElement) {

    achievementElement.textContent =
      "۰";

  }

}


// ============================================================
// LOAD EVALUATION PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  try {

    const result =
      await supabaseClient
        .from("evaluation_periods")
        .select("*");


    if (result.error) {

      console.error(
        "Evaluation periods error:",
        result.error
      );

      evaluationPeriods = [];

      return [];

    }


    evaluationPeriods =
      result.data || [];


    evaluationPeriods.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateA - dateB;

      }
    );


    console.log(
      "Evaluation periods:",
      evaluationPeriods
    );


    return evaluationPeriods;

  } catch (error) {

    console.error(
      "Periods load error:",
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

  try {

    const result =
      await supabaseClient
        .from("evaluation_criteria")
        .select("*");


    if (result.error) {

      console.error(
        "Criteria error:",
        result.error
      );

      evaluationCriteria = [];

      return [];

    }


    evaluationCriteria =
      result.data || [];


    evaluationCriteria.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateA - dateB;

      }
    );


    console.log(
      "Evaluation criteria:",
      evaluationCriteria
    );


    return evaluationCriteria;

  } catch (error) {

    console.error(
      "Criteria load error:",
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

  try {

    /*
      مهم:
      اینجا دیگر created_at را داخل ORDER BY
      نمی‌گذاریم؛ چون قبلاً همین موضوع خطا داده بود.
    */

    const result =
      await supabaseClient
        .from("evaluations")
        .select("*");


    if (result.error) {

      console.error(
        "Evaluations error:",
        result.error
      );

      evaluations = [];

      return [];

    }


    evaluations =
      result.data || [];


    evaluations.sort(
      (a, b) => {

        const dateA =
          new Date(
            a.created_at || 0
          ).getTime();

        const dateB =
          new Date(
            b.created_at || 0
          ).getTime();

        return dateB - dateA;

      }
    );


    console.log(
      "Evaluations:",
      evaluations
    );


    return evaluations;

  } catch (error) {

    console.error(
      "Load evaluations error:",
      error
    );

    evaluations = [];

    return [];

  }

}


// ============================================================
// SELECTS
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
              value="${coachEscapeHTML(
                period.id
              )}"
            >
              ${coachEscapeHTML(
                getPeriodName(
                  period
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
// OPEN NEW EVALUATION
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
        !periodSelect ||
        !evaluationPeriods.length
      ) {

        alert(
          "هنوز هیچ دوره ارزیابی‌ای ثبت نشده است."
        );

        return;

      }


      if (
        evaluationPeriods.length === 1
      ) {

        periodSelect.value =
          String(
            evaluationPeriods[0].id
          );

      }


      if (!periodSelect.value) {

        alert(
          "لطفاً یک دوره ارزیابی را انتخاب کنید."
        );

        return;

      }


      createEvaluationModal(
        athleteId,
        periodSelect.value
      );

    },
    50
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


    .evaluation-save:disabled {

      opacity:
        .6;

      cursor:
        wait;

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
            getPeriodName(
              period
            )
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

                هنوز هیچ معیاری
                برای ارزیابی ایجاد نشده است.

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


        const scoreElement =
          modal.querySelector(
            `[id="score-${CSS.escape(
              range.dataset.criterionId
            )}"]`
          );


        if (scoreElement) {

          scoreElement.textContent =
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
      function () {

        modal.remove();

      }
    );

  }


  const saveButton =
    modal.querySelector(
      "#saveEvaluation"
    );


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      function () {

        saveEvaluation(
          athleteId,
          periodId,
          ranges,
          modal
        );

      }
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

    button.disabled = true;

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
      created_at را اینجا نمی‌فرستیم.
      اگر دیتابیس default داشته باشد،
      خودش مقدار را ثبت می‌کند.
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
      "Evaluation payload:",
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
        .id;


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
          "Evaluation scores error:",
          scoreResult.error
        );


        alert(
          "ارزیابی اصلی ثبت شد، اما امتیاز معیارها ثبت نشد.\n\n" +
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
      "خطایی هنگام ثبت ارزیابی رخ داد.",
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
                        getPeriodName(
                          period
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
// EVALUATION PAGE
// ============================================================

async function prepareEvaluationPage() {

  fillAthleteSelect();

  fillPeriodSelect();

  renderEvaluationList();

}


// ============================================================
// EVALUATION BUTTON
// ============================================================

function initializeEvaluationButton() {

  const button =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      openEvaluationFromSelectors();

    }
  );

}


// ============================================================
// START
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | پنل مربی شروع شد"
  );


  /*
    اول رویدادهای دکمه‌ها را فعال می‌کنیم.
    بنابراین حتی اگر دیتابیس خطا داشته باشد،
    دکمه‌ها از کار نمی‌افتند.
  */

  initializeNavigation();

  initializeLogout();

  initializeAthleteModal();

  initializeAthleteSearch();

  initializeEvaluationButton();


  await checkCoachSession();


  /*
    اطلاعات را جداگانه می‌خوانیم.
    خطای یکی نباید اجرای بقیه را متوقف کند.
  */

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
    "🥋 پنل مربی آماده است."
  );


  console.log(
    "Athletes:",
    athletes
  );

  console.log(
    "Periods:",
    evaluationPeriods
  );

  console.log(
    "Criteria:",
    evaluationCriteria
  );

  console.log(
    "Evaluations:",
    evaluations
  );

}


// ============================================================
// RUN
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

window.loadAthletes =
  loadAthletes;

window.loadEvaluationPeriods =
  loadEvaluationPeriods;

window.loadEvaluationCriteria =
  loadEvaluationCriteria;

window.loadEvaluations =
  loadEvaluations;
