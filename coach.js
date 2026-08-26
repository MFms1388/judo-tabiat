// ============================================================
// طبیعت جودو | COACH.JS
// نسخه پایدار پنل مربی
// ============================================================


// ============================================================
// SUPABASE CONFIG
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


// ============================================================
// GLOBAL STATE
// ============================================================

let supabaseClient = null;

let coachAthletes = [];

let attendanceData = {};

let attendanceDateValue = "";

let attendanceInitialized = false;

let coachInitialized = false;

let evaluationPeriods = [];


// ============================================================
// SUPABASE INITIALIZATION
// ============================================================

function initializeSupabaseClient() {

  try {

    if (
      window.supabaseClient &&
      typeof window.supabaseClient.from === "function"
    ) {

      supabaseClient =
        window.supabaseClient;

      console.log(
        "✅ Existing Supabase client detected."
      );

      return true;
    }


    if (
      window.supabase &&
      typeof window.supabase.createClient === "function"
    ) {

      window.supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

      supabaseClient =
        window.supabaseClient;

      console.log(
        "✅ Supabase client created."
      );

      return true;
    }


    console.error(
      "❌ Supabase library هنوز بارگذاری نشده است."
    );

    return false;

  } catch (error) {

    console.error(
      "❌ Supabase initialization error:",
      error
    );

    return false;
  }
}


// ============================================================
// WAIT FOR SUPABASE
// ============================================================

async function waitForSupabase(
  maxAttempts = 50
) {

  for (
    let i = 0;
    i < maxAttempts;
    i++
  ) {

    if (
      initializeSupabaseClient()
    ) {

      return supabaseClient;

    }

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          100
        )
    );

  }

  throw new Error(
    "Supabase بعد از انتظار کافی آماده نشد."
  );
}


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

  return String(
    value ?? ""
  ).replace(
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
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function formatCoachDate(date) {

  if (!date) {
    return "—";
  }

  try {

    return new Date(
      `${date}T00:00:00`
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


function normalizeCoachAttendanceStatus(
  status
) {

  const value =
    String(status || "")
      .trim()
      .toLowerCase();


  if (
    [
      "present",
      "حاضر",
      "حضور",
      "p"
    ].includes(value)
  ) {

    return "present";

  }


  if (
    [
      "late",
      "تأخیر",
      "تاخیر",
      "l"
    ].includes(value)
  ) {

    return "late";

  }


  if (
    [
      "absent",
      "غایب",
      "غیبت",
      "a"
    ].includes(value)
  ) {

    return "absent";

  }


  if (
    [
      "excused",
      "موجه",
      "غیبت موجه",
      "e"
    ].includes(value)
  ) {

    return "excused";

  }


  return "";
}


// ============================================================
// LOAD ATHLETES
// ============================================================

async function loadCoachAthletes() {

  console.log(
    "🔵 شروع دریافت ورزشکاران..."
  );

  try {

    await waitForSupabase();


    console.log(
      "🔵 دریافت از جدول public.athletes..."
    );


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
            ascending: true
          }
        );


    console.log(
      "🔵 ATHLETES DATA:",
      data
    );


    console.log(
      "🔵 ATHLETES ERROR:",
      error
    );


    if (error) {
      throw error;
    }


    coachAthletes =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "🥋 تعداد ورزشکار:",
      coachAthletes.length
    );


    console.table(
      coachAthletes
    );


    /*
     * اگر محمد احمدی داخل دیتابیس باشد،
     * اینجا باید حتماً دیده شود.
     */

    const mohammad =
      coachAthletes.find(
        athlete =>
          String(
            athlete.first_name || ""
          ).trim() === "محمد" &&
          String(
            athlete.last_name || ""
          ).trim() === "احمدی"
      );


    if (mohammad) {

      console.log(
        "✅ محمد احمدی پیدا شد:",
        mohammad
      );

    } else {

      console.warn(
        "⚠️ محمد احمدی در نتیجه SELECT پیدا نشد."
      );

    }


    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();

    renderAthletes();

    renderAttendanceList();

    updateAttendanceSummary();


    return coachAthletes;


  } catch (error) {

    console.error(
      "❌ خطای دریافت ورزشکاران:",
      error
    );


    coachAthletes = [];


    const grid =
      document.getElementById(
        "coachAthleteGrid"
      );


    if (grid) {

      grid.innerHTML = `

        <div class="empty-panel">

          <div>
            ⚠️
          </div>

          <h2>
            خطا در دریافت ورزشکاران
          </h2>

          <p>
            ${coachEscapeHTML(
              error?.message ||
              "خطای نامشخص"
            )}
          </p>

        </div>

      `;

    }


    return [];

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

    console.warn(
      "⚠️ coachAthleteGrid پیدا نشد."
    );

    return;

  }


  const search =
    String(
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
                        src="${coachEscapeHTML(
                          photo
                        )}"
                        alt="${coachEscapeHTML(
                          name
                        )}"
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
                    athlete.weight !== undefined

                      ? coachEscapeHTML(
                          athlete.weight
                        ) +
                        " کیلوگرم"

                      : "ثبت نشده"
                  }
                </p>

              </div>


              <button
                type="button"
                class="primary"
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
}


// ============================================================
// PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  console.log(
    "🔵 دریافت دوره‌های ارزیابی..."
  );


  try {

    await waitForSupabase();


    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "evaluation_periods"
        )
        .select("*");


    if (error) {
      throw error;
    }


    evaluationPeriods =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "📅 Evaluation periods:",
      evaluationPeriods
    );


    /*
     * همه selectهایی که احتمالاً
     * مربوط به دوره هستند.
     */

    const selectors = [

      "evaluationPeriodSelect",

      "periodSelect",

      "coachPeriodSelect",

      "attendancePeriodSelect"

    ];


    selectors.forEach(
      id => {

        const select =
          document.getElementById(id);


        if (!select) {
          return;
        }


        const oldValue =
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


            const periodName =
              period.name ||
              period.title ||
              period.period_name ||
              period.month_name ||
              period.month ||
              period.label ||
              "دوره";


            option.textContent =
              periodName;


            select.appendChild(
              option
            );

          }
        );


        if (oldValue) {

          select.value =
            oldValue;

        }

      }
    );


    /*
     * اگر المنتی برای نمایش لیست دوره‌ها وجود داشته باشد.
     */

    const periodContainer =
      document.getElementById(
        "evaluationPeriodsList"
      );


    if (
      periodContainer &&
      evaluationPeriods.length
    ) {

      periodContainer.innerHTML =
        evaluationPeriods
          .map(
            period => {

              const name =
                period.name ||
                period.title ||
                period.period_name ||
                period.month_name ||
                period.month ||
                period.label ||
                "دوره";


              return `

                <div
                  class="period-item"
                  data-period-id="${coachEscapeHTML(
                    period.id
                  )}"
                >

                  ${coachEscapeHTML(
                    name
                  )}

                </div>

              `;

            }
          )
          .join("");

    }


    return evaluationPeriods;


  } catch (error) {

    console.error(
      "❌ Load evaluation periods error:",
      error
    );


    evaluationPeriods = [];


    return [];

  }
}


window.loadEvaluationPeriods =
  loadEvaluationPeriods;


// ============================================================
// ATTENDANCE INITIALIZE
// ============================================================

async function initializeAttendancePage() {

  console.log(
    "🟢 Initializing attendance page..."
  );


  try {

    await waitForSupabase();


    await loadCoachAthletes();


    const dateInput =
      document.getElementById(
        "attendanceDate"
      );


    if (!dateInput) {

      console.warn(
        "⚠️ attendanceDate پیدا نشد."
      );

    } else {

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

    }


    await loadEvaluationPeriods();


    attendanceInitialized =
      true;


    console.log(
      "✅ Attendance page ready."
    );


  } catch (error) {

    console.error(
      "❌ Attendance initialization error:",
      error
    );

  }
}


window.initializeAttendancePage =
  initializeAttendancePage;


// ============================================================
// ATTENDANCE DATE TEXT
// ============================================================

function updateAttendanceDateText(
  date
) {

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

async function loadAttendanceForDate(
  date
) {

  if (!date) {
    return;
  }


  try {

    await waitForSupabase();


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


    if (!coachAthletes.length) {

      await loadCoachAthletes();

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("attendance")
        .select("*")
        .eq(
          "attendance_date",
          date
        );


    if (error) {
      throw error;
    }


    attendanceData = {};


    (
      data || []
    ).forEach(
      record => {

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


    const errorBox =
      document.getElementById(
        "attendanceError"
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
    String(athleteId);


  if (
    attendanceData[key]
  ) {

    return attendanceData[key];

  }


  return {

    id: null,

    athlete_id:
      athleteId,

    attendance_date:
      attendanceDateValue,

    status: "",

    notes: ""

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
    String(
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
          ابتدا ورزشکاران را بررسی کنید.
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
            athlete.photo_url || "";


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
                          src="${coachEscapeHTML(
                            photo
                          )}"
                          alt="${coachEscapeHTML(
                            name
                          )}"
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
                      athlete.weight !== undefined

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
        record.status === "present"
      ) {
        present++;
      }


      if (
        record.status === "late"
      ) {
        late++;
      }


      if (
        record.status === "absent"
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

  try {

    await waitForSupabase();


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


    const button =
      document.getElementById(
        "saveAttendanceBtn"
      );


    const originalText =
      button?.textContent || "";


    if (button) {

      button.disabled =
        true;

      button.textContent =
        "⏳ در حال ذخیره...";

    }


    for (
      const athlete
      of selected
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
          .from("attendance")
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


      if (existing?.id) {

        const {
          data,
          error
        } =
          await supabaseClient
            .from("attendance")
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


        attendanceData[
          String(
            athlete.id
          )
        ] = {

          id:
            data.id,

          athlete_id:
            data.athlete_id,

          attendance_date:
            data.attendance_date,

          status:
            normalizeCoachAttendanceStatus(
              data.status
            ),

          notes:
            data.notes || ""

        };

      } else {

        const {
          data,
          error
        } =
          await supabaseClient
            .from("attendance")
            .insert(
              payload
            )
            .select("*")
            .single();


        if (error) {
          throw error;
        }


        attendanceData[
          String(
            athlete.id
          )
        ] = {

          id:
            data.id,

          athlete_id:
            data.athlete_id,

          attendance_date:
            data.attendance_date,

          status:
            normalizeCoachAttendanceStatus(
              data.status
            ),

          notes:
            data.notes || ""

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
        error?.message ||
        "خطای نامشخص"
      )
    );

  } finally {

    const button =
      document.getElementById(
        "saveAttendanceBtn"
      );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "💾 ذخیره حضور و غیاب";

    }

  }
}


window.saveAttendance =
  saveAttendance;


// ============================================================
// OPEN ATHLETE MODAL
// ============================================================

function openAthleteModal() {

  console.log(
    "🟢 openAthleteModal"
  );


  const modal =
    document.getElementById(
      "athleteModal"
    );


  if (!modal) {

    console.error(
      "❌ athleteModal پیدا نشد."
    );

    alert(
      "پنجره افزودن ورزشکار در HTML پیدا نشد."
    );

    return;
  }


  modal.classList.remove(
    "hidden"
  );

  modal.style.display =
    "";


  modal.setAttribute(
    "aria-hidden",
    "false"
  );
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


  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


window.closeAthleteModal =
  closeAthleteModal;


// ============================================================
// SAVE ATHLETE
// ============================================================

async function saveAthlete() {

  try {

    await waitForSupabase();


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

      button.disabled =
        true;

      button.textContent =
        "⏳ در حال ثبت...";

    }


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


    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .insert(
          payload
        )
        .select("*")
        .single();


    if (error) {
      throw error;
    }


    console.log(
      "✅ Athlete created:",
      data
    );


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
      attendanceDateValue
    ) {

      await loadAttendanceForDate(
        attendanceDateValue
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
        error?.message ||
        "خطای نامشخص"
      )
    );

  } finally {

    const button =
      document.getElementById(
        "saveAthleteBtn"
      );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "ثبت ورزشکار";

    }

  }
}


window.saveAthlete =
  saveAthlete;


// ============================================================
// EVALUATION PAGE
// ============================================================

async function prepareEvaluationPage() {

  console.log(
    "📝 آماده‌سازی صفحه ارزیابی..."
  );


  try {

    await waitForSupabase();

    await loadCoachAthletes();

    await loadEvaluationPeriods();


    console.log(
      "✅ Evaluation page prepared."
    );


  } catch (error) {

    console.error(
      "❌ Evaluation preparation error:",
      error
    );

  }
}


window.prepareEvaluationPage =
  prepareEvaluationPage;


// ============================================================
// OPEN EVALUATION PAGE
// ============================================================

function openEvaluationPage() {

  console.log(
    "📝 New evaluation clicked."
  );


  /*
   * اگر evaluation.html وجود داشته باشد،
   * مستقیم وارد آن می‌شویم.
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

  try {

    await waitForSupabase();


    /*
     * تعداد ارزیابی‌ها
     */

    const {
      count: evaluationCount,
      error: evaluationError
    } =
      await supabaseClient
        .from("evaluations")
        .select(
          "*",
          {
            count: "exact",
            head: true
          }
        );


    if (!evaluationError) {

      const element =
        document.getElementById(
          "totalEvaluations"
        );


      if (element) {

        element.textContent =
          coachPersianNumber(
            evaluationCount || 0
          );

      }

    }


    /*
     * حضور امروز
     */

    const today =
      getTodayDate();


    const {
      data: attendance,
      error: attendanceError
    } =
      await supabaseClient
        .from("attendance")
        .select("status")
        .eq(
          "attendance_date",
          today
        );


    if (!attendanceError) {

      const present =
        (
          attendance || []
        )
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


    /*
     * مقام‌ها
     */

    const achievementElement =
      document.getElementById(
        "totalAchievements"
      );


    if (achievementElement) {

      achievementElement.textContent =
        "۰";

    }


  } catch (error) {

    console.error(
      "❌ Dashboard stats error:",
      error
    );

  }
}


// ============================================================
// EVENT DELEGATION
// این قسمت باعث می‌شود دکمه‌ها حتی اگر listener
// قبلی وصل نشده باشد، همچنان کار کنند.
// ============================================================

function initializeCoachEventDelegation() {

  if (
    document.body.dataset.coachDelegationBound ===
    "true"
  ) {

    return;

  }


  document.body.dataset.coachDelegationBound =
    "true";


  document.body.addEventListener(
    "click",
    function(event) {

      const target =
        event.target.closest(
          "button, [role='button'], a"
        );


      if (!target) {
        return;
      }


      /*
       * مشاهده پروفایل ورزشکار
       */

      const profileButton =
        target.closest(
          "[data-athlete-profile]"
        );


      if (profileButton) {

        event.preventDefault();


        const athleteId =
          profileButton.dataset
            .athleteProfile;


        if (athleteId) {

          window.location.href =
            "athlete.html?id=" +
            encodeURIComponent(
              athleteId
            );

        }


        return;

      }


      /*
       * وضعیت حضور
       */

      const attendanceButton =
        target.closest(
          "[data-athlete-id][data-status]"
        );


      if (
        attendanceButton &&
        attendanceButton.classList.contains(
          "attendance-status-btn"
        )
      ) {

        const athleteId =
          attendanceButton.dataset
            .athleteId;


        const status =
          attendanceButton.dataset
            .status;


        if (
          !athleteId ||
          !status
        ) {
          return;
        }


        if (
          !attendanceData[
            String(athleteId)
          ]
        ) {

          attendanceData[
            String(athleteId)
          ] =
            getAthleteAttendance(
              athleteId
            );

        }


        attendanceData[
          String(athleteId)
        ].status =
          normalizeCoachAttendanceStatus(
            status
          );


        const row =
          attendanceButton.closest(
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


          attendanceButton.classList.add(
            "active"
          );

        }


        updateAttendanceSummary();

        updateSelectedCount();

        return;

      }


      /*
       * افزودن ورزشکار
       */

      if (
        target.id ===
        "addAthleteBtn" ||
        target.dataset.action ===
        "add-athlete" ||
        target.closest(
          "#addAthleteBtn"
        )
      ) {

        event.preventDefault();

        openAthleteModal();

        return;

      }


      /*
       * ارزیابی جدید
       */

      if (
        target.id ===
        "newEvaluationBtn" ||
        target.dataset.action ===
        "new-evaluation" ||
        target.closest(
          "#newEvaluationBtn"
        )
      ) {

        event.preventDefault();

        openEvaluationPage();

        return;

      }


      /*
       * بستن Modal
       */

      if (
        target.id ===
        "closeAthleteModal" ||
        target.dataset.action ===
        "close-athlete-modal"
      ) {

        event.preventDefault();

        closeAthleteModal();

        return;

      }


      /*
       * ذخیره ورزشکار
       */

      if (
        target.id ===
        "saveAthleteBtn" ||
        target.dataset.action ===
        "save-athlete"
      ) {

        event.preventDefault();

        saveAthlete();

        return;

      }


      /*
       * ذخیره حضور و غیاب
       */

      if (
        target.id ===
        "saveAttendanceBtn" ||
        target.dataset.action ===
        "save-attendance"
      ) {

        event.preventDefault();

        saveAttendance();

        return;

      }

    }
  );


  /*
   * تغییرات textarea حضور و غیاب
   */

  document.body.addEventListener(
    "input",
    function(event) {

      const textarea =
        event.target.closest(
          ".attendance-note"
        );


      if (!textarea) {
        return;
      }


      const athleteId =
        textarea.dataset.athleteNote;


      if (!athleteId) {
        return;
      }


      if (
        !attendanceData[
          String(athleteId)
        ]
      ) {

        attendanceData[
          String(athleteId)
        ] =
          getAthleteAttendance(
            athleteId
          );

      }


      attendanceData[
        String(athleteId)
      ].notes =
        textarea.value;

    }
  );

}


// ============================================================
// SEARCH / FILTER
// ============================================================

function initializeCoachSearch() {

  const coachSearch =
    document.getElementById(
      "coachSearch"
    );


  const coachFilter =
    document.getElementById(
      "coachFilter"
    );


  const attendanceSearch =
    document.getElementById(
      "attendanceSearch"
    );


  const attendanceFilter =
    document.getElementById(
      "attendanceFilter"
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


  if (
    attendanceSearch &&
    !attendanceSearch.dataset.bound
  ) {

    attendanceSearch.dataset.bound =
      "true";


    attendanceSearch.addEventListener(
      "input",
      renderAttendanceList
    );

  }


  if (
    attendanceFilter &&
    !attendanceFilter.dataset.bound
  ) {

    attendanceFilter.dataset.bound =
      "true";


    attendanceFilter.addEventListener(
      "change",
      renderAttendanceList
    );

  }

}


// ============================================================
// DATE INPUT
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
    async function() {

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
// MAIN INITIALIZATION
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


  try {

    await waitForSupabase();


    /*
     * اول event delegation
     */

    initializeCoachEventDelegation();


    /*
     * سپس search
     */

    initializeCoachSearch();


    /*
     * ورزشکاران
     */

    await loadCoachAthletes();


    /*
     * دوره‌ها
     */

    await loadEvaluationPeriods();


    /*
     * آمار داشبورد
     */

    await loadDashboardStats();


    /*
     * ایمیل مربی
     */

    try {

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

    } catch (error) {

      console.warn(
        "⚠️ Get coach user error:",
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

      await initializeAttendancePage();

    }


    /*
     * صفحه ارزیابی
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

      await prepareEvaluationPage();

    }


    console.log(
      "✅ Coach panel ready."
    );


  } catch (error) {

    console.error(
      "❌ Coach initialization error:",
      error
    );

    coachInitialized =
      false;

  }

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
