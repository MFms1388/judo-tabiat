// ============================================================
// طبیعت جودو | COACH.JS
// پنل مدیریت مربی
// نسخه اصلاح شده و مقاوم
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


if (
  !window.supabaseClient &&
  window.supabase &&
  typeof window.supabase.createClient === "function"
) {
  window.supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
}


const supabaseClient =
  window.supabaseClient;


// ============================================================
// STATE
// ============================================================

let coachAthletes = [];

let attendanceData = {};

let attendanceDateValue = "";

let attendanceInitialized = false;

let coachInitialized = false;

let currentEvaluationPeriod = null;

let evaluationPeriods = [];


// ============================================================
// TABLE NAMES
// ============================================================

/*
 * جدول اصلی ورزشکاران در پروژه قبلی:
 * Athletes
 *
 * برای سازگاری، اگر Athletes پیدا نشد،
 * athletes هم امتحان می‌شود.
 */

const ATHLETE_TABLES = [
  "Athletes",
  "athletes"
];

const ATTENDANCE_TABLE = "attendance";

const PERIOD_TABLE = "evaluation_periods";

const EVALUATION_TABLE = "evaluations";


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


function athleteName(athlete) {

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


// ============================================================
// DATE
// ============================================================

function getTodayDate() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatCoachDate(date) {

  if (!date) {
    return "—";
  }

  try {

    return new Date(
      date + "T00:00:00"
    ).toLocaleDateString(
      "fa-IR"
    );

  } catch {

    return date;

  }

}


// ============================================================
// ATTENDANCE STATUS
// ============================================================

const ATTENDANCE_STATUSES = {

  present: {
    text: "حاضر",
    icon: "🟢"
  },

  late: {
    text: "تأخیر",
    icon: "🟡"
  },

  absent: {
    text: "غایب",
    icon: "🔴"
  },

  excused: {
    text: "غیبت موجه",
    icon: "🔵"
  }

};


function normalizeCoachAttendanceStatus(status) {

  const value =
    String(status || "")
      .trim()
      .toLowerCase();


  if (
    value === "present" ||
    value === "حاضر" ||
    value === "حضور" ||
    value === "p"
  ) {
    return "present";
  }


  if (
    value === "late" ||
    value === "تأخیر" ||
    value === "تاخیر" ||
    value === "l"
  ) {
    return "late";
  }


  if (
    value === "absent" ||
    value === "غایب" ||
    value === "غیبت" ||
    value === "a"
  ) {
    return "absent";
  }


  if (
    value === "excused" ||
    value === "موجه" ||
    value === "غیبت موجه" ||
    value === "e"
  ) {
    return "excused";
  }


  return "";

}


// ============================================================
// SAFE TABLE SELECT
// ============================================================

async function selectAthletesFromDatabase() {

  if (!supabaseClient) {

    throw new Error(
      "Supabase client ساخته نشده است."
    );

  }


  let lastError = null;


  for (
    const tableName of ATHLETE_TABLES
  ) {

    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from(tableName)
          .select("*")
          .order(
            "first_name",
            {
              ascending: true
            }
          );


      if (!error) {

        return {
          data: data || [],
          table: tableName
        };

      }


      lastError =
        error;

      console.warn(
        `⚠️ جدول ${tableName} قابل خواندن نیست:`,
        error.message
      );

    } catch (error) {

      lastError =
        error;

    }

  }


  throw (
    lastError ||
    new Error(
      "جدول ورزشکاران پیدا نشد."
    )
  );

}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadCoachAthletes() {

  try {

    const result =
      await selectAthletesFromDatabase();


    coachAthletes =
      result.data || [];


    /*
     * حذف ورزشکارهای خراب یا بدون id
     */

    coachAthletes =
      coachAthletes.filter(
        athlete =>
          athlete &&
          athlete.id
      );


    console.log(
      "🥋 Coach athletes loaded:",
      coachAthletes
    );


    console.log(
      "📋 Athlete table:",
      result.table
    );


    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();

    renderAthletes();


    return coachAthletes;


  } catch (error) {

    console.error(
      "❌ Load athletes error:",
      error
    );


    /*
     * اگر دیتابیس خطا داد، آرایه قبلی
     * را بی‌دلیل پاک نمی‌کنیم.
     */

    if (!Array.isArray(coachAthletes)) {
      coachAthletes = [];
    }


    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();

    renderAthletes();


    return coachAthletes;

  }

}


window.loadCoachAthletes =
  loadCoachAthletes;


// ============================================================
// DASHBOARD ATHLETE COUNT
// ============================================================

function updateDashboardAthleteCount() {

  const element =
    document.getElementById(
      "totalAthletes"
    );


  if (!element) {
    return;
  }


  element.textContent =
    coachPersianNumber(
      coachAthletes.length
    );

}


// ============================================================
// AGE GROUP FILTER
// ============================================================

function populateAgeGroupFilter() {

  const select =
    document.getElementById(
      "coachFilter"
    );


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  const groups =
    [
      ...new Set(
        coachAthletes
          .map(
            athlete =>
              athlete.age_group
          )
          .filter(Boolean)
      )
    ];


  select.innerHTML = `
    <option value="all">
      همه رده‌ها
    </option>
  `;


  groups.forEach(
    group => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        group;


      option.textContent =
        group;


      select.appendChild(
        option
      );

    }
  );


  if (
    groups.includes(
      currentValue
    )
  ) {

    select.value =
      currentValue;

  }

}


// ============================================================
// RENDER ATHLETES
// ============================================================

function renderAthletes() {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!grid) {
    return;
  }


  const search =
    (
      document.getElementById(
        "coachSearch"
      )?.value || ""
    )
      .trim()
      .toLowerCase();


  const filter =
    document.getElementById(
      "coachFilter"
    )?.value || "all";


  const filtered =
    coachAthletes.filter(
      athlete => {

        const name =
          athleteName(
            athlete
          ).toLowerCase();


        const nationalId =
          String(
            athlete.national_id || ""
          )
            .trim()
            .toLowerCase();


        const matchesSearch =
          !search ||
          name.includes(search) ||
          nationalId.includes(search);


        const matchesGroup =
          filter === "all" ||
          String(
            athlete.age_group || ""
          ) === String(filter);


        return (
          matchesSearch &&
          matchesGroup
        );

      }
    );


  if (!filtered.length) {

    grid.innerHTML = `

      <div class="empty-panel">

        <div>
          👥
        </div>

        <h2>
          ورزشکاری پیدا نشد
        </h2>

        <p>
          موردی مطابق جستجو یا فیلتر پیدا نشد.
        </p>

      </div>

    `;

    return;
  }


  grid.innerHTML =
    filtered
      .map(
        athlete => {

          const name =
            athleteName(
              athlete
            );


          const photo =
            athlete.photo_url || "";


          return `

            <div
              class="athlete-card"
              data-athlete-id="${coachEscapeHTML(
                athlete.id
              )}"
            >

              <div class="athlete-card-photo">

                ${
                  photo
                    ? `
                      <img
                        src="${coachEscapeHTML(photo)}"
                        alt="${coachEscapeHTML(name)}"
                        onerror="
                          this.style.display='none';
                          this.parentElement.innerHTML='🥋';
                        "
                      >
                    `
                    : "🥋"
                }

              </div>


              <div class="athlete-card-info">

                <h3>
                  ${coachEscapeHTML(name)}
                </h3>


                <p>
                  رده:
                  ${coachEscapeHTML(
                    athlete.age_group ||
                    "ثبت نشده"
                  )}
                </p>


                <p>
                  وزن:
                  ${
                    athlete.weight !== null &&
                    athlete.weight !== undefined &&
                    athlete.weight !== ""
                      ? coachEscapeHTML(
                          athlete.weight
                        ) + " کیلوگرم"
                      : "ثبت نشده"
                  }
                </p>

              </div>


              <button
                type="button"
                class="primary coach-athlete-profile-btn"
                data-athlete-profile="${coachEscapeHTML(
                  athlete.id
                )}"
              >
                مشاهده پروفایل
              </button>

            </div>

          `;

        }
      )
      .join("");


}


// ============================================================
// ATHLETE PROFILE NAVIGATION
// ============================================================

function openAthleteProfile(athleteId) {

  if (!athleteId) {
    return;
  }


  window.location.href =
    "athlete.html?id=" +
    encodeURIComponent(
      athleteId
    );

}


window.openAthleteProfile =
  openAthleteProfile;


// ============================================================
// ATHLETE SELECT
// ============================================================

function populateAthleteSelect() {

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
  `;


  coachAthletes.forEach(
    athlete => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        athlete.id;


      option.textContent =
        athleteName(
          athlete
        );


      select.appendChild(
        option
      );

    }
  );


  if (
    coachAthletes.some(
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
// EVALUATION PERIODS
// ============================================================

function getPeriodName(period) {

  if (!period) {
    return "بدون نام";
  }


  return (
    period.name ||
    period.title ||
    period.period_name ||
    period.label ||
    "دوره ارزیابی"
  );

}


function getPeriodStartDate(period) {

  return (
    period?.start_date ||
    period?.from_date ||
    period?.date_from ||
    null
  );

}


function getPeriodEndDate(period) {

  return (
    period?.end_date ||
    period?.to_date ||
    period?.date_to ||
    null
  );

}


function formatPeriodLabel(period) {

  const name =
    getPeriodName(
      period
    );


  const start =
    getPeriodStartDate(
      period
    );


  const end =
    getPeriodEndDate(
      period
    );


  if (
    start &&
    end
  ) {

    return (
      name +
      " | " +
      formatCoachDate(start) +
      " تا " +
      formatCoachDate(end)
    );

  }


  if (start) {

    return (
      name +
      " | " +
      formatCoachDate(start)
    );

  }


  return name;

}


// ============================================================
// LOAD PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  if (!supabaseClient) {
    return [];
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from(PERIOD_TABLE)
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "❌ Load evaluation periods:",
        error
      );

      return [];

    }


    evaluationPeriods =
      data || [];


    console.log(
      "📅 Evaluation periods:",
      evaluationPeriods
    );


    renderEvaluationPeriods();


    return evaluationPeriods;


  } catch (error) {

    console.error(
      "❌ Evaluation periods error:",
      error
    );

    return [];

  }

}


window.loadEvaluationPeriods =
  loadEvaluationPeriods;


// ============================================================
// RENDER PERIODS
// ============================================================

function renderEvaluationPeriods() {

  /*
   * این تابع چند id احتمالی را پشتیبانی می‌کند
   * تا با HTML قبلی پروژه سازگار باشد.
   */

  const selectors = [
    "evaluationPeriodSelect",
    "periodSelect",
    "evaluationPeriod",
    "coachPeriodSelect"
  ];


  let select = null;


  for (
    const id of selectors
  ) {

    const element =
      document.getElementById(id);


    if (
      element &&
      element.tagName === "SELECT"
    ) {

      select =
        element;

      break;

    }

  }


  if (!select) {
    return;
  }


  const currentValue =
    select.value;


  select.innerHTML = `
    <option value="">
      انتخاب دوره
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
        formatPeriodLabel(
          period
        );


      select.appendChild(
        option
      );

    }
  );


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


  const currentPeriod =
    evaluationPeriods.find(
      period =>
        String(period.id) ===
        String(select.value)
    );


  if (currentPeriod) {

    currentEvaluationPeriod =
      currentPeriod;

  }

}


// ============================================================
// SELECT PERIOD
// ============================================================

function selectEvaluationPeriod(periodId) {

  if (!periodId) {

    currentEvaluationPeriod =
      null;

    return null;

  }


  const period =
    evaluationPeriods.find(
      item =>
        String(item.id) ===
        String(periodId)
    );


  currentEvaluationPeriod =
    period || null;


  return currentEvaluationPeriod;

}


window.selectEvaluationPeriod =
  selectEvaluationPeriod;


// ============================================================
// ATTENDANCE INITIALIZE
// ============================================================

async function initializeAttendancePage() {

  console.log(
    "🟢 Initializing attendance page..."
  );


  if (!attendanceInitialized) {

    attendanceInitialized =
      true;


    await loadCoachAthletes();

  }


  const dateInput =
    document.getElementById(
      "attendanceDate"
    );


  if (!dateInput) {

    console.error(
      "❌ attendanceDate پیدا نشد."
    );

    return;

  }


  if (!dateInput.value) {

    dateInput.value =
      getTodayDate();

  }


  attendanceDateValue =
    dateInput.value;


  updateAttendanceDateText(
    attendanceDateValue
  );


  await loadAttendanceForDate(
    attendanceDateValue
  );


  console.log(
    "✅ Attendance page ready."
  );

}


window.initializeAttendancePage =
  initializeAttendancePage;


// ============================================================
// ATTENDANCE DATE TEXT
// ============================================================

function updateAttendanceDateText(date) {

  const element =
    document.getElementById(
      "attendanceSelectedDateText"
    );


  if (!element) {
    return;
  }


  element.textContent =
    formatCoachDate(date);

}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendanceForDate(date) {

  if (!date) {
    return;
  }


  attendanceDateValue =
    date;


  updateAttendanceDateText(
    date
  );


  const list =
    document.getElementById(
      "attendanceList"
    );


  const errorBox =
    document.getElementById(
      "attendanceError"
    );


  if (errorBox) {

    errorBox.style.display =
      "none";

    errorBox.textContent =
      "";

  }


  if (list) {

    list.innerHTML = `

      <div class="attendance-loading">

        ⏳ در حال دریافت اطلاعات حضور و غیاب...

      </div>

    `;

  }


  try {

    if (!coachAthletes.length) {

      await loadCoachAthletes();

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from(ATTENDANCE_TABLE)
        .select("*")
        .eq(
          "attendance_date",
          date
        );


    if (error) {
      throw error;
    }


    attendanceData = {};


    (data || []).forEach(
      record => {

        if (!record.athlete_id) {
          return;
        }


        attendanceData[
          String(
            record.athlete_id
          )
        ] = {

          id:
            record.id,

          athlete_id:
            record.athlete_id,

          attendance_date:
            record.attendance_date,

          status:
            normalizeCoachAttendanceStatus(
              record.status
            ),

          notes:
            record.notes || ""

        };

      }
    );


    renderAttendanceList();

    updateAttendanceSummary();


  } catch (error) {

    console.error(
      "❌ Load attendance error:",
      error
    );


    if (errorBox) {

      errorBox.style.display =
        "block";


      errorBox.textContent =
        "خطا در دریافت حضور و غیاب: " +
        (
          error.message ||
          "خطای نامشخص"
        );

    }


    if (list) {

      list.innerHTML = `

        <div class="attendance-empty">

          <div class="attendance-empty-icon">
            ⚠️
          </div>

          <h3>
            دریافت اطلاعات ناموفق بود
          </h3>

          <p>
            ${coachEscapeHTML(
              error.message ||
              "خطای نامشخص"
            )}
          </p>

        </div>

      `;

    }

  }

}


window.loadAttendanceForDate =
  loadAttendanceForDate;


// ============================================================
// GET ATHLETE ATTENDANCE
// ============================================================

function getAthleteAttendance(
  athleteId
) {

  const key =
    String(
      athleteId
    );


  const record =
    attendanceData[key];


  if (record) {
    return record;
  }


  return {

    id: null,

    athlete_id:
      athleteId,

    attendance_date:
      attendanceDateValue,

    status:
      "",

    notes:
      ""

  };

}


// ============================================================
// RENDER ATTENDANCE LIST
// ============================================================

function renderAttendanceList() {

  const list =
    document.getElementById(
      "attendanceList"
    );


  if (!list) {
    return;
  }


  const search =
    (
      document.getElementById(
        "attendanceSearch"
      )?.value || ""
    )
      .trim()
      .toLowerCase();


  const filter =
    document.getElementById(
      "attendanceFilter"
    )?.value || "all";


  const filtered =
    coachAthletes.filter(
      athlete => {

        const name =
          athleteName(
            athlete
          ).toLowerCase();


        const nationalId =
          String(
            athlete.national_id || ""
          ).toLowerCase();


        const record =
          getAthleteAttendance(
            athlete.id
          );


        const status =
          record.status || "";


        const matchesSearch =
          !search ||
          name.includes(search) ||
          nationalId.includes(search);


        const matchesFilter =
          filter === "all" ||
          status === filter;


        return (
          matchesSearch &&
          matchesFilter
        );

      }
    );


  if (!filtered.length) {

    list.innerHTML = `

      <div class="attendance-empty">

        <div class="attendance-empty-icon">
          👥
        </div>

        <h3>
          ورزشکاری برای نمایش وجود ندارد
        </h3>

        <p>
          جستجو یا فیلتر را تغییر دهید.
        </p>

      </div>

    `;


    updateAttendanceSummary();

    return;

  }


  list.innerHTML =
    filtered
      .map(
        athlete => {

          const record =
            getAthleteAttendance(
              athlete.id
            );


          const name =
            athleteName(
              athlete
            );


          const photo =
            athlete.photo_url ||
            "";


          const statuses =
            Object.entries(
              ATTENDANCE_STATUSES
            )
              .map(
                ([key, info]) => {

                  const active =
                    record.status === key
                      ? "active"
                      : "";


                  return `

                    <button
                      type="button"
                      class="
                        attendance-status-btn
                        ${active}
                      "
                      data-athlete-id="${coachEscapeHTML(
                        athlete.id
                      )}"
                      data-status="${key}"
                    >

                      ${info.icon}
                      ${info.text}

                    </button>

                  `;

                }
              )
              .join("");


          return `

            <div
              class="attendance-row"
              data-athlete-row="${coachEscapeHTML(
                athlete.id
              )}"
            >

              <div class="attendance-athlete">

                <div class="attendance-avatar">

                  ${
                    photo
                      ? `
                        <img
                          src="${coachEscapeHTML(photo)}"
                          alt="${coachEscapeHTML(name)}"
                          onerror="
                            this.style.display='none';
                            this.parentElement.innerHTML='🥋';
                          "
                        >
                      `
                      : "🥋"
                  }

                </div>


                <div class="attendance-athlete-info">

                  <strong>
                    ${coachEscapeHTML(name)}
                  </strong>


                  <span>

                    ${
                      athlete.age_group
                        ? coachEscapeHTML(
                            athlete.age_group
                          )
                        : "رده ثبت نشده"
                    }


                    ${
                      athlete.weight !== null &&
                      athlete.weight !== undefined &&
                      athlete.weight !== ""
                        ? " | " +
                          coachEscapeHTML(
                            athlete.weight
                          ) +
                          " کیلو"
                        : ""
                    }

                  </span>

                </div>

              </div>


              <div
                class="attendance-status-group"
              >

                ${statuses}

              </div>


              <textarea
                class="attendance-note"
                data-athlete-note="${coachEscapeHTML(
                  athlete.id
                )}"
                placeholder="توضیحات این جلسه..."
                rows="2"
              >${coachEscapeHTML(
                record.notes
              )}</textarea>


            </div>

          `;

        }
      )
      .join("");


  updateSelectedCount();

}


// ============================================================
// ATTENDANCE SUMMARY
// ============================================================

function updateAttendanceSummary() {

  const total =
    coachAthletes.length;


  let present = 0;

  let late = 0;

  let absent = 0;


  coachAthletes.forEach(
    athlete => {

      const record =
        getAthleteAttendance(
          athlete.id
        );


      if (
        record.status ===
        "present"
      ) {
        present++;
      }


      if (
        record.status ===
        "late"
      ) {
        late++;
      }


      if (
        record.status ===
        "absent"
      ) {
        absent++;
      }

    }
  );


  const totalElement =
    document.getElementById(
      "attendanceTotalAthletes"
    );


  const presentElement =
    document.getElementById(
      "attendancePresentCount"
    );


  const lateElement =
    document.getElementById(
      "attendanceLateCount"
    );


  const absentElement =
    document.getElementById(
      "attendanceAbsentCount"
    );


  if (totalElement) {

    totalElement.textContent =
      coachPersianNumber(
        total
      );

  }


  if (presentElement) {

    presentElement.textContent =
      coachPersianNumber(
        present
      );

  }


  if (lateElement) {

    lateElement.textContent =
      coachPersianNumber(
        late
      );

  }


  if (absentElement) {

    absentElement.textContent =
      coachPersianNumber(
        absent
      );

  }


  updateSelectedCount();

}


// ============================================================
// SELECTED COUNT
// ============================================================

function updateSelectedCount() {

  const element =
    document.getElementById(
      "attendanceSelectedCount"
    );


  if (!element) {
    return;
  }


  let count = 0;


  coachAthletes.forEach(
    athlete => {

      const record =
        getAthleteAttendance(
          athlete.id
        );


      if (record.status) {
        count++;
      }

    }
  );


  element.textContent =
    coachPersianNumber(
      count
    );

}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

async function saveAttendance() {

  const button =
    document.getElementById(
      "saveAttendanceBtn"
    );


  if (!attendanceDateValue) {

    alert(
      "ابتدا تاریخ جلسه را انتخاب کنید."
    );

    return;

  }


  if (!coachAthletes.length) {

    alert(
      "هیچ ورزشکاری برای ثبت حضور و غیاب وجود ندارد."
    );

    return;

  }


  const selected =
    coachAthletes.filter(
      athlete => {

        const record =
          getAthleteAttendance(
            athlete.id
          );


        return Boolean(
          record.status
        );

      }
    );


  if (!selected.length) {

    alert(
      "حداقل وضعیت یک ورزشکار را انتخاب کنید."
    );

    return;

  }


  const originalText =
    button?.textContent || "";


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "⏳ در حال ذخیره...";

  }


  try {

    for (
      const athlete of selected
    ) {

      const record =
        getAthleteAttendance(
          athlete.id
        );


      const {
        data: existing,
        error: findError
      } =
        await supabaseClient
          .from(ATTENDANCE_TABLE)
          .select("id")
          .eq(
            "athlete_id",
            athlete.id
          )
          .eq(
            "attendance_date",
            attendanceDateValue
          )
          .maybeSingle();


      if (findError) {
        throw findError;
      }


      const payload = {

        athlete_id:
          athlete.id,

        attendance_date:
          attendanceDateValue,

        status:
          normalizeCoachAttendanceStatus(
            record.status
          ),

        notes:
          record.notes || null

      };


      let savedData = null;


      if (existing?.id) {

        const {
          data,
          error
        } =
          await supabaseClient
            .from(ATTENDANCE_TABLE)
            .update({

              status:
                payload.status,

              notes:
                payload.notes

            })
            .eq(
              "id",
              existing.id
            )
            .select("*")
            .single();


        if (error) {
          throw error;
        }


        savedData =
          data;

      } else {

        const {
          data,
          error
        } =
          await supabaseClient
            .from(ATTENDANCE_TABLE)
            .insert(
              payload
            )
            .select("*")
            .single();


        if (error) {
          throw error;
        }


        savedData =
          data;

      }


      if (savedData) {

        attendanceData[
          String(
            athlete.id
          )
        ] = {

          id:
            savedData.id,

          athlete_id:
            savedData.athlete_id,

          attendance_date:
            savedData.attendance_date,

          status:
            normalizeCoachAttendanceStatus(
              savedData.status
            ),

          notes:
            savedData.notes || ""

        };

      }

    }


    alert(
      "✅ حضور و غیاب با موفقیت ذخیره شد."
    );


    await loadAttendanceForDate(
      attendanceDateValue
    );


  } catch (error) {

    console.error(
      "❌ Save attendance error:",
      error
    );


    alert(
      "❌ ذخیره حضور و غیاب انجام نشد.\n\n" +
      (
        error.message ||
        "خطای نامشخص"
      )
    );


  } finally {

    if (button) {

      button.disabled =
        false;


      button.textContent =
        originalText ||
        "💾 ذخیره حضور و غیاب";

    }

  }

}


window.saveAttendance =
  saveAttendance;


// ============================================================
// ATTENDANCE SEARCH
// ============================================================

function initializeAttendanceSearch() {

  const search =
    document.getElementById(
      "attendanceSearch"
    );


  const filter =
    document.getElementById(
      "attendanceFilter"
    );


  if (
    search &&
    !search.dataset.bound
  ) {

    search.dataset.bound =
      "true";


    search.addEventListener(
      "input",
      renderAttendanceList
    );

  }


  if (
    filter &&
    !filter.dataset.bound
  ) {

    filter.dataset.bound =
      "true";


    filter.addEventListener(
      "change",
      renderAttendanceList
    );

  }

}


// ============================================================
// ATTENDANCE DATE
// ============================================================

function initializeAttendanceDateInput() {

  const dateInput =
    document.getElementById(
      "attendanceDate"
    );


  if (
    !dateInput ||
    dateInput.dataset.bound
  ) {

    return;

  }


  dateInput.dataset.bound =
    "true";


  dateInput.addEventListener(
    "change",
    async function () {

      if (!this.value) {
        return;
      }


      attendanceDateValue =
        this.value;


      updateAttendanceDateText(
        this.value
      );


      await loadAttendanceForDate(
        this.value
      );

    }
  );

}


// ============================================================
// EVALUATION
// ============================================================

async function prepareEvaluationPage() {

  try {

    await loadCoachAthletes();

  } catch (error) {

    console.error(
      error
    );

  }


  try {

    await loadEvaluationPeriods();

  } catch (error) {

    console.error(
      error
    );

  }


  console.log(
    "📝 Evaluation page prepared."
  );

}


window.prepareEvaluationPage =
  prepareEvaluationPage;


// ============================================================
// OPEN EVALUATION PAGE
// ============================================================

function openEvaluationPage() {

  console.log(
    "📝 New evaluation button clicked."
  );


  /*
   * حالت SPA
   */

  const evaluationPage =
    document.getElementById(
      "page-evaluation"
    );


  if (evaluationPage) {

    document
      .querySelectorAll(
        ".coach-page"
      )
      .forEach(
        page => {

          page.classList.remove(
            "active"
          );

        }
      );


    evaluationPage.classList.add(
      "active"
    );


    prepareEvaluationPage();


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    return;

  }


  /*
   * حالت صفحه مستقل
   */

  if (
    window.location.pathname
      .toLowerCase()
      .includes(
        "evaluation.html"
      )
  ) {

    prepareEvaluationPage();

    return;

  }


  window.location.href =
    "evaluation.html";

}


window.openEvaluationPage =
  openEvaluationPage;


// ============================================================
// DASHBOARD STATS
// ============================================================

async function loadDashboardStats() {

  /*
   * تعداد ارزیابی‌ها
   */

  try {

    const {
      count,
      error
    } =
      await supabaseClient
        .from(EVALUATION_TABLE)
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (!error) {

      const element =
        document.getElementById(
          "totalEvaluations"
        );


      if (element) {

        element.textContent =
          coachPersianNumber(
            count || 0
          );

      }

    }

  } catch (error) {

    console.error(
      "Dashboard evaluation stats error:",
      error
    );

  }


  /*
   * حضور امروز
   */

  try {

    const today =
      getTodayDate();


    const {
      data,
      error
    } =
      await supabaseClient
        .from(ATTENDANCE_TABLE)
        .select("status")
        .eq(
          "attendance_date",
          today
        );


    if (!error) {

      const present =
        (data || [])
          .filter(
            record =>
              normalizeCoachAttendanceStatus(
                record.status
              ) === "present"
          )
          .length;


      const element =
        document.getElementById(
          "todayAttendance"
        );


      if (element) {

        element.textContent =
          coachPersianNumber(
            present
          );

      }

    }

  } catch (error) {

    console.error(
      "Dashboard attendance stats error:",
      error
    );

  }


  /*
   * مقام‌ها
   */

  const achievementElement =
    document.getElementById(
      "totalAchievements"
    );


  if (achievementElement) {

    /*
     * فعلاً تا زمانی که جدول مسابقات/مدال‌ها
     * متصل شود.
     */

    achievementElement.textContent =
      "۰";

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

    console.error(
      "❌ athleteModal پیدا نشد."
    );

    return;

  }


  modal.classList.remove(
    "hidden"
  );


  /*
   * اگر modal با display کنترل شده باشد
   */

  modal.style.display =
    "";


  const firstName =
    document.getElementById(
      "athleteFirstName"
    );


  if (firstName) {

    setTimeout(
      () =>
        firstName.focus(),
      50
    );

  }

}


window.openAthleteModal =
  openAthleteModal;


// ============================================================
// CLOSE ATHLETE MODAL
// ============================================================

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


window.closeAthleteModal =
  closeAthleteModal;


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


  const originalText =
    button?.textContent || "";


  if (button) {

    button.disabled =
      true;


    button.textContent =
      "⏳ در حال ثبت...";

  }


  try {

    /*
     * جدول درست را پیدا می‌کنیم.
     */

    let inserted = false;

    let lastError = null;


    const payload = {

      first_name:
        firstName,

      last_name:
        lastName,

      age_group:
        ageGroup || null,

      weight:
        weight !== ""
          ? Number(weight)
          : null,

      national_id:
        nationalId || null,

      bio:
        bio || null,

      photo_url:
        photoUrl || null

    };


    for (
      const tableName of ATHLETE_TABLES
    ) {

      try {

        const {
          data,
          error
        } =
          await supabaseClient
            .from(tableName)
            .insert(
              payload
            )
            .select("*")
            .single();


        if (!error) {

          console.log(
            "✅ Athlete created:",
            data
          );


          inserted =
            true;


          break;

        }


        lastError =
          error;


      } catch (error) {

        lastError =
          error;

      }

    }


    if (!inserted) {

      throw (
        lastError ||
        new Error(
          "ورزشکار ثبت نشد."
        )
      );

    }


    alert(
      "✅ ورزشکار با موفقیت ثبت شد."
    );


    closeAthleteModal();


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
            document.getElementById(
              id
            );


          if (element) {

            element.value =
              "";

          }

        }
      );


    await loadCoachAthletes();


    if (
      document
        .getElementById(
          "page-attendance"
        )
        ?.classList.contains(
          "active"
        )
    ) {

      await loadAttendanceForDate(
        attendanceDateValue ||
        getTodayDate()
      );

    }


  } catch (error) {

    console.error(
      "❌ Save athlete error:",
      error
    );


    alert(
      "❌ ثبت ورزشکار انجام نشد.\n\n" +
      (
        error.message ||
        "خطای نامشخص"
      )
    );


  } finally {

    if (button) {

      button.disabled =
        false;


      button.textContent =
        originalText ||
        "ثبت ورزشکار";

    }

  }

}


window.saveAthlete =
  saveAthlete;


// ============================================================
// EVENT DELEGATION
// ============================================================

function initializeCoachEventDelegation() {

  if (
    document.body.dataset.coachEventsBound ===
    "true"
  ) {

    return;

  }


  document.body.dataset.coachEventsBound =
    "true";


  document.addEventListener(
    "click",
    function (event) {

      /*
       * افزودن ورزشکار
       */

      const addAthleteButton =
        event.target.closest(
          "#addAthleteBtn"
        );


      if (addAthleteButton) {

        event.preventDefault();

        event.stopPropagation();

        openAthleteModal();

        return;

      }


      /*
       * بستن modal
       */

      const closeAthleteButton =
        event.target.closest(
          "#closeAthleteModal"
        );


      if (closeAthleteButton) {

        event.preventDefault();

        closeAthleteModal();

        return;

      }


      /*
       * ذخیره ورزشکار
       */

      const saveAthleteButton =
        event.target.closest(
          "#saveAthleteBtn"
        );


      if (saveAthleteButton) {

        event.preventDefault();

        saveAthlete();

        return;

      }


      /*
       * ارزیابی جدید
       */

      const newEvaluationButton =
        event.target.closest(
          "#newEvaluationBtn"
        );


      if (newEvaluationButton) {

        event.preventDefault();

        event.stopPropagation();

        openEvaluationPage();

        return;

      }


      /*
       * پروفایل ورزشکار
       */

      const profileButton =
        event.target.closest(
          "[data-athlete-profile]"
        );


      if (profileButton) {

        event.preventDefault();


        openAthleteProfile(
          profileButton.dataset
            .athleteProfile
        );


        return;

      }


      /*
       * وضعیت حضور و غیاب
       */

      const attendanceButton =
        event.target.closest(
          ".attendance-status-btn"
        );


      if (attendanceButton) {

        event.preventDefault();


        const athleteId =
          attendanceButton.dataset
            .athleteId;


        const status =
          attendanceButton.dataset
            .status;


        if (
          athleteId &&
          status
        ) {

          setAttendanceStatus(
            athleteId,
            status,
            attendanceButton
          );

        }


        return;

      }

    }
  );

}


// ============================================================
// SET ATTENDANCE STATUS
// ============================================================

function setAttendanceStatus(
  athleteId,
  status,
  button
) {

  if (!athleteId || !status) {
    return;
  }


  const key =
    String(
      athleteId
    );


  if (!attendanceData[key]) {

    attendanceData[key] =
      getAthleteAttendance(
        athleteId
      );

  }


  attendanceData[key].status =
    normalizeCoachAttendanceStatus(
      status
    );


  const row =
    button?.closest(
      ".attendance-row"
    );


  if (row) {

    row
      .querySelectorAll(
        ".attendance-status-btn"
      )
      .forEach(
        btn =>
          btn.classList.remove(
            "active"
          )
      );


    button.classList.add(
      "active"
    );

  }


  updateAttendanceSummary();

  updateSelectedCount();

}


window.setAttendanceStatus =
  setAttendanceStatus;


// ============================================================
// ATTENDANCE NOTE EVENT
// ============================================================

function initializeAttendanceNoteDelegation() {

  if (
    document.body.dataset.coachNotesBound ===
    "true"
  ) {

    return;

  }


  document.body.dataset.coachNotesBound =
    "true";


  document.addEventListener(
    "input",
    function (event) {

      const textarea =
        event.target.closest(
          ".attendance-note"
        );


      if (!textarea) {
        return;
      }


      const athleteId =
        textarea.dataset
          .athleteNote;


      if (!athleteId) {
        return;
      }


      const key =
        String(
          athleteId
        );


      if (!attendanceData[key]) {

        attendanceData[key] =
          getAthleteAttendance(
            athleteId
          );

      }


      attendanceData[key].notes =
        textarea.value;

    }
  );

}


// ============================================================
// MAIN BUTTONS
// ============================================================

function initializeCoachButtons() {

  /*
   * Event delegation جایگزین listenerهای
   * شکننده قبلی شده است.
   */

  initializeCoachEventDelegation();

  initializeAttendanceNoteDelegation();


  /*
   * Search ورزشکاران
   */

  const coachSearch =
    document.getElementById(
      "coachSearch"
    );


  if (
    coachSearch &&
    !coachSearch.dataset.bound
  ) {

    coachSearch.dataset.bound =
      "true";


    coachSearch.addEventListener(
      "input",
      renderAthletes
    );

  }


  /*
   * Filter ورزشکاران
   */

  const coachFilter =
    document.getElementById(
      "coachFilter"
    );


  if (
    coachFilter &&
    !coachFilter.dataset.bound
  ) {

    coachFilter.dataset.bound =
      "true";


    coachFilter.addEventListener(
      "change",
      renderAthletes
    );

  }


  initializeAttendanceSearch();

  initializeAttendanceDateInput();

}


// ============================================================
// PERIOD SELECT EVENT
// ============================================================

function initializePeriodSelect() {

  const selectors = [
    "evaluationPeriodSelect",
    "periodSelect",
    "evaluationPeriod",
    "coachPeriodSelect"
  ];


  selectors.forEach(
    id => {

      const select =
        document.getElementById(
          id
        );


      if (
        !select ||
        select.dataset.bound
      ) {

        return;

      }


      select.dataset.bound =
        "true";


      select.addEventListener(
        "change",
        function () {

          selectEvaluationPeriod(
            this.value
          );

        }
      );

    }
  );

}


// ============================================================
// CLOSE MODAL WITH ESC
// ============================================================

function initializeEscapeHandler() {

  if (
    document.body.dataset
      .coachEscapeBound ===
    "true"
  ) {

    return;

  }


  document.body.dataset
    .coachEscapeBound =
    "true";


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key !==
        "Escape"
      ) {

        return;

      }


      closeAthleteModal();

    }
  );

}


// ============================================================
// INITIALIZE COACH
// ============================================================

async function initializeCoach() {

  if (coachInitialized) {

    console.log(
      "ℹ️ Coach already initialized."
    );

    return;

  }


  coachInitialized =
    true;


  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );


  /*
   * اول Eventها را فعال می‌کنیم.
   *
   * این خیلی مهم است:
   * حتی اگر Supabase خطا بدهد،
   * دکمه‌ها همچنان باید کار کنند.
   */

  initializeCoachButtons();

  initializePeriodSelect();

  initializeEscapeHandler();


  /*
   * ورزشکاران
   */

  try {

    await loadCoachAthletes();

  } catch (error) {

    console.error(
      "Coach athlete initialization error:",
      error
    );

  }


  /*
   * دوره‌ها
   */

  try {

    await loadEvaluationPeriods();

  } catch (error) {

    console.error(
      "Coach periods initialization error:",
      error
    );

  }


  /*
   * داشبورد
   */

  try {

    await loadDashboardStats();

  } catch (error) {

    console.error(
      "Coach dashboard initialization error:",
      error
    );

  }


  /*
   * ایمیل مربی
   */

  try {

    if (
      supabaseClient &&
      supabaseClient.auth
    ) {

      const {
        data
      } =
        await supabaseClient
          .auth
          .getUser();


      const emailElement =
        document.getElementById(
          "coachEmail"
        );


      if (
        emailElement &&
        data?.user?.email
      ) {

        emailElement.textContent =
          data.user.email;

      }

    }

  } catch (error) {

    console.error(
      "Get coach user error:",
      error
    );

  }


  /*
   * حضور و غیاب
   */

  const attendancePage =
    document.getElementById(
      "page-attendance"
    );


  if (
    attendancePage &&
    attendancePage.classList.contains(
      "active"
    )
  ) {

    try {

      await initializeAttendancePage();

    } catch (error) {

      console.error(
        "Attendance initialization error:",
        error
      );

    }

  }


  /*
   * ارزیابی
   */

  const evaluationPage =
    document.getElementById(
      "page-evaluation"
    );


  if (
    evaluationPage &&
    evaluationPage.classList.contains(
      "active"
    )
  ) {

    try {

      await prepareEvaluationPage();

    } catch (error) {

      console.error(
        "Evaluation initialization error:",
        error
      );

    }

  }


  console.log(
    "✅ Coach panel ready."
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
    initializeCoach,
    {
      once: true
    }
  );

} else {

  initializeCoach();

}


// ============================================================
// GLOBAL EXPORTS
// ============================================================

window.initializeCoach =
  initializeCoach;

window.renderAthletes =
  renderAthletes;

window.renderAttendanceList =
  renderAttendanceList;

window.updateAttendanceSummary =
  updateAttendanceSummary;

window.updateSelectedCount =
  updateSelectedCount;

window.loadDashboardStats =
  loadDashboardStats;

window.openAthleteModal =
  openAthleteModal;

window.closeAthleteModal =
  closeAthleteModal;

window.saveAthlete =
  saveAthlete;

window.openEvaluationPage =
  openEvaluationPage;

window.prepareEvaluationPage =
  prepareEvaluationPage;

window.loadEvaluationPeriods =
  loadEvaluationPeriods;

window.renderEvaluationPeriods =
  renderEvaluationPeriods;
