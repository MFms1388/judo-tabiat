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
// ابزارها
// ============================================================

function coachEscapeHTML(value) {
  const div = document.createElement("div");
  div.textContent =
    value === undefined || value === null
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
  if (!athlete) return "بدون نام";

  return [
    athlete.first_name,
    athlete.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "بدون نام";
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
      console.error(error);
      return;
    }

    if (
      !data ||
      !data.session ||
      !data.session.user
    ) {

      console.warn(
        "کاربر وارد حساب نشده است."
      );

      return;
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

  } catch (error) {

    console.error(
      "Session error:",
      error
    );

  }
}


// ============================================================
// NAVIGATION
// ============================================================

function openPage(pageName) {

  const pages =
    document.querySelectorAll(
      ".coach-page"
    );

  pages.forEach(page => {
    page.classList.remove("active");
  });


  const target =
    document.getElementById(
      "page-" + pageName
    );

  if (target) {
    target.classList.add("active");
  }


  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(item => {

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


function initializeNavigation() {

  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        openPage(
          item.dataset.page
        );

      }
    );

  });


  const quickButtons =
    document.querySelectorAll(
      ".quick-card"
    );

  quickButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.go;

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
      () => {

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

    const {
      error
    } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error(error);
    }

    window.location.href =
      "index.html";

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

}


function initializeLogout() {

  const button =
    document.getElementById(
      "logoutBtn"
    );

  if (!button) return;

  button.addEventListener(
    "click",
    logoutCoach
  );

}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadAthletes() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("Athletes")
        .select("*")
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

      // تلاش با نام کوچک جدول
      const retry =
        await supabaseClient
          .from("athletes")
          .select("*");

      if (!retry.error) {

        athletes =
          retry.data || [];

      } else {

        athletes = [];

        console.error(
          "Retry athletes error:",
          retry.error
        );

      }

    } else {

      athletes =
        data || [];

    }


    renderAthletes();

    updateDashboardStats();

    fillAthleteSelect();

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
// ATHLETES RENDER
// ============================================================

function renderAthletes() {

  const container =
    document.getElementById(
      "coachAthleteGrid"
    );

  if (!container) return;


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
              athlete.nationalId ||
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
            athlete.ageGroup ||
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
      .map(athlete => {

        const name =
          getAthleteName(
            athlete
          );


        const ageGroup =
          athlete.age_group ||
          athlete.ageGroup ||
          "—";


        const weight =
          athlete.weight !== undefined &&
          athlete.weight !== null
            ? athlete.weight
            : "—";


        const nationalId =
          athlete.national_id ||
          athlete.nationalId ||
          "—";


        const photo =
          athlete.photo_url ||
          athlete.photoUrl ||
          athlete.avatar_url ||
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
        event => {

          event.preventDefault();
          event.stopPropagation();

          const athleteId =
            button.dataset.athleteId;

          openEvaluationForAthlete(
            athleteId
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

  if (!filter) return;


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
            <option value="${coachEscapeHTML(
              group
            )}">
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

  if (!modal) return;

  modal.classList.remove(
    "hidden"
  );

}


function closeAthleteModal() {

  const modal =
    document.getElementById(
      "athleteModal"
    );

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );

}


function clearAthleteForm() {

  const ids = [
    "athleteFirstName",
    "athleteLastName",
    "athleteAgeGroup",
    "athleteWeight",
    "athleteNationalId",
    "athleteBio",
    "athletePhotoUrl"
  ];


  ids.forEach(id => {

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


  if (openButton) {

    openButton.addEventListener(
      "click",
      () => {

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
      event => {

        if (
          event.target ===
          modal
        ) {

          closeAthleteModal();

        }

      }
    );

  }


  const saveButton =
    document.getElementById(
      "saveAthleteBtn"
    );


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
        "Athletes insert failed:",
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

      console.error(
        result.error
      );

      alert(
        "ثبت ورزشکار انجام نشد.\n\n" +
        result.error.message
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

    console.error(
      "Save athlete error:",
      error
    );

    alert(
      "خطایی هنگام ثبت ورزشکار رخ داد."
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

  const athletesElement =
    document.getElementById(
      "totalAthletes"
    );

  if (athletesElement) {

    athletesElement.textContent =
      coachPersianNumber(
        athletes.length
      );

  }


  const evaluationsElement =
    document.getElementById(
      "totalEvaluations"
    );

  if (evaluationsElement) {

    evaluationsElement.textContent =
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


  const achievementsElement =
    document.getElementById(
      "totalAchievements"
    );

  if (achievementsElement) {

    achievementsElement.textContent =
      "۰";

  }

}


// ============================================================
// EVALUATION DATA
// ============================================================

async function loadEvaluationPeriods() {

  try {

    let result =
      await supabaseClient
        .from("evaluation_periods")
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (result.error) {

      console.warn(
        "Periods error:",
        result.error
      );

      evaluationPeriods = [];

      return [];

    }


    evaluationPeriods =
      result.data || [];


    return evaluationPeriods;

  } catch (error) {

    console.error(error);

    evaluationPeriods = [];

    return [];

  }

}


async function loadEvaluationCriteria() {

  try {

    const result =
      await supabaseClient
        .from("evaluation_criteria")
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (result.error) {

      console.warn(
        "Criteria error:",
        result.error
      );

      evaluationCriteria = [];

      return [];

    }


    evaluationCriteria =
      result.data || [];


    return evaluationCriteria;

  } catch (error) {

    console.error(error);

    evaluationCriteria = [];

    return [];

  }

}


async function loadEvaluations() {

  try {

    const result =
      await supabaseClient
        .from("evaluations")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (result.error) {

      console.warn(
        "Evaluations error:",
        result.error
      );

      evaluations = [];

      return [];

    }


    evaluations =
      result.data || [];


    return evaluations;

  } catch (error) {

    console.error(error);

    evaluations = [];

    return [];

  }

}


// ============================================================
// EVALUATION SELECTS
// ============================================================

function fillAthleteSelect() {

  const select =
    document.getElementById(
      "evaluationAthleteSelect"
    );

  if (!select) return;


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

  if (!select) return;


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
                period.title ||
                period.name ||
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
    () => {

      const athleteSelect =
        document.getElementById(
          "evaluationAthleteSelect"
        );

      if (athleteSelect) {

        athleteSelect.value =
          String(
            athleteId
          );

      }


      if (
        evaluationPeriods.length === 1
      ) {

        const periodSelect =
          document.getElementById(
            "evaluationPeriodSelect"
          );

        if (periodSelect) {

          periodSelect.value =
            String(
              evaluationPeriods[0].id
            );

        }

      }


      const periodSelect =
        document.getElementById(
          "evaluationPeriodSelect"
        );


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
          "ابتدا یک دوره ارزیابی ایجاد کنید."
        );

      }

    },
    100
  );

}


// ============================================================
// EVALUATION MODAL
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
    document.createElement("style");


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
      background: rgba(0,0,0,.65);
    }

    .evaluation-modal-card {
      width: min(650px,100%);
      max-height: 92vh;
      overflow-y: auto;
      background: #fff;
      color: #111;
      border-radius: 20px;
      padding: 24px;
      position: relative;
      box-sizing: border-box;
      box-shadow: 0 20px 70px rgba(0,0,0,.3);
    }

    .evaluation-close {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 50%;
      background: #eee;
      font-size: 25px;
      cursor: pointer;
    }

    .evaluation-info {
      background: #f0f7f3;
      border-radius: 12px;
      padding: 14px;
      line-height: 2;
      margin: 15px 0;
    }

    .evaluation-item {
      background: #f8faf9;
      border: 1px solid #dfe7e2;
      border-radius: 15px;
      padding: 16px;
      margin-bottom: 12px;
    }

    .evaluation-item-head {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .evaluation-item-score {
      background: #16834b;
      color: #fff;
      border-radius: 9px;
      min-width: 55px;
      padding: 7px;
      text-align: center;
      font-weight: 900;
    }

    .evaluation-range {
      width: 100%;
      accent-color: #16834b;
      cursor: pointer;
    }

    .evaluation-notes {
      width: 100%;
      min-height: 100px;
      margin-top: 8px;
      padding: 12px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 12px;
      font-family: inherit;
      resize: vertical;
    }

    .evaluation-total {
      margin-top: 15px;
      padding: 15px;
      text-align: center;
      background: #edf7f1;
      border-radius: 12px;
      font-weight: bold;
    }

    .evaluation-total strong {
      color: #16834b;
      font-size: 26px;
    }

    .evaluation-save {
      width: 100%;
      min-height: 52px;
      margin-top: 15px;
      border: none;
      border-radius: 12px;
      background: #16834b;
      color: white;
      font-family: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }

  `;


  document.head.appendChild(
    style
  );

}


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
    document.createElement("div");


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
            period.title ||
            period.name ||
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
                          ${coachEscapeHTML(
                            criterion.name ||
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


    ranges.forEach(range => {

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

    });


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
            (sum, item) =>
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
        ?.value.trim() || "";


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
        notes,

      created_at:
        new Date().toISOString()

    };


    /*
      توجه:
      جدول evaluations باید ستون‌های
      athlete_id
      period_id
      total_score
      notes
      created_at
      داشته باشد.
    */

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

      console.error(
        evaluationResult.error
      );

      alert(
        "ثبت ارزیابی انجام نشد:\n\n" +
        evaluationResult
          .error
          .message
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
          scoreResult.error
        );

        alert(
          "خود ارزیابی ثبت شد، اما امتیاز معیارها ثبت نشد."
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

    console.error(
      "Save evaluation error:",
      error
    );

    alert(
      "خطایی هنگام ثبت ارزیابی رخ داد."
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
// EVALUATION LIST
// ============================================================

function renderEvaluationList() {

  const container =
    document.getElementById(
      "evaluationsList"
    );


  if (!container) return;


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
                        period?.title ||
                        period?.name ||
                        "دوره نامشخص"
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


function initializeEvaluationButton() {

  const button =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (!button) return;


  button.addEventListener(
    "click",
    openEvaluationFromSelectors
  );

}


// ============================================================
// START
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | پنل مربی شروع شد"
  );


  initializeNavigation();

  initializeLogout();

  initializeAthleteModal();

  initializeAthleteSearch();

  initializeEvaluationButton();


  await checkCoachSession();


  await loadAthletes();

  fillAthleteFilter();


  await loadEvaluationPeriods();

  await loadEvaluationCriteria();

  await loadEvaluations();


  fillAthleteSelect();

  fillPeriodSelect();

  renderEvaluationList();

  updateDashboardStats();


  openPage(
    "dashboard"
  );


  console.log(
    "پنل مربی آماده است."
  );

}


// ============================================================
// اجرا
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

window.athletes =
  athletes;

window.evaluationPeriods =
  evaluationPeriods;

window.evaluationCriteria =
  evaluationCriteria;

window.evaluations =
  evaluations;

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
