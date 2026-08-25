// ============================================================
// طبیعت جودو | COACH.JS
// پنل مدیریت مربی
// تمرکز اصلی: حضور و غیاب
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


if (!window.supabaseClient) {

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

    return new Date(date)
      .toLocaleDateString("fa-IR");

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
// LOAD ATHLETES
// ============================================================

async function loadCoachAthletes() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .select("*")
        .order(
          "first_name",
          {
            ascending: true
          }
        );

    if (error) {
      throw error;
    }

    coachAthletes =
      data || [];

    console.log(
      "Coach athletes:",
      coachAthletes
    );

    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();

    return coachAthletes;

  } catch (error) {

    console.error(
      "Load athletes error:",
      error
    );

    coachAthletes = [];

    return [];

  }

}


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
// ATHLETE FILTER
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

      select.insertAdjacentHTML(
        "beforeend",
        `
          <option value="${coachEscapeHTML(group)}">
            ${coachEscapeHTML(group)}
          </option>
        `
      );

    }
  );

}


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
          ).toLowerCase();

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

            <div class="athlete-card">

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
                    athlete.weight !== undefined
                      ? coachEscapeHTML(
                          athlete.weight
                        ) + " کیلوگرم"
                      : "ثبت نشده"
                  }
                </p>

              </div>

              <button
                type="button"
                class="primary"
                onclick="
                  window.location.href =
                  'athlete.html?id=${encodeURIComponent(
                    athlete.id
                  )}'
                "
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
// ATHLETE SELECT FOR EVALUATION
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

      select.insertAdjacentHTML(
        "beforeend",
        `
          <option value="${coachEscapeHTML(
            athlete.id
          )}">
            ${coachEscapeHTML(
              athleteName(athlete)
            )}
          </option>
        `
      );

    }
  );

}


// ============================================================
// ATTENDANCE INITIALIZE
// ============================================================

async function initializeAttendancePage() {

  if (!attendanceInitialized) {

    attendanceInitialized = true;

    await loadCoachAthletes();

  }


  const dateInput =
    document.getElementById(
      "attendanceDate"
    );


  if (!dateInput) {
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

}


window.initializeAttendancePage =
  initializeAttendancePage;


// ============================================================
// ATTENDANCE DATE
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
// LOAD ATTENDANCE FOR DATE
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
        در حال دریافت اطلاعات حضور و غیاب...
      </div>

    `;

  }


  try {

    /*
     * اول مطمئن می‌شویم لیست ورزشکاران داریم.
     */

    if (!coachAthletes.length) {

      await loadCoachAthletes();

    }


    /*
     * دریافت رکوردهای همان تاریخ
     */

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


    /*
     * تبدیل رکوردها به map
     *
     * کلید:
     * athlete_id
     */

    attendanceData = {};


    (data || []).forEach(
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


    console.log(
      "Attendance records:",
      attendanceData
    );


    renderAttendanceList();

    updateAttendanceSummary();

  } catch (error) {

    console.error(
      "Load attendance error:",
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
            ${
              coachEscapeHTML(
                error.message ||
                "خطای نامشخص"
              )
            }
          </p>

        </div>

      `;

    }

  }

}


window.loadAttendanceForDate =
  loadAttendanceForDate;


// ============================================================
// DEFAULT ATTENDANCE
// ============================================================

function getAthleteAttendance(
  athleteId
) {

  const record =
    attendanceData[
      String(athleteId)
    ];


  if (record) {
    return record;
  }


  /*
   * اگر هنوز رکوردی ثبت نشده،
   * وضعیت خالی است.
   */

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
                    record.status ===
                    key
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

              <!-- ورزشکار -->

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


              <!-- وضعیت -->

              <div
                class="attendance-status-group"
              >

                ${statuses}

              </div>


              <!-- توضیحات -->

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


  /*
   * اتصال دکمه‌های وضعیت
   */

  list
    .querySelectorAll(
      ".attendance-status-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            const athleteId =
              this.dataset.athleteId;

            const status =
              this.dataset.status;


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
              status;


            /*
             * فعال‌سازی ظاهری
             */

            const row =
              this.closest(
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


              this.classList.add(
                "active"
              );

            }


            updateAttendanceSummary();

            updateSelectedCount();

          }
        );

      }
    );


  /*
   * اتصال توضیحات
   */

  list
    .querySelectorAll(
      ".attendance-note"
    )
    .forEach(
      textarea => {

        textarea.addEventListener(
          "input",
          function () {

            const athleteId =
              this.dataset.athleteNote;


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
              this.value;

          }
        );

      }
    );


  updateSelectedCount();

}


window.renderAttendanceList =
  renderAttendanceList;


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
      coachPersianNumber(total);

  }


  if (presentElement) {

    presentElement.textContent =
      coachPersianNumber(present);

  }


  if (lateElement) {

    lateElement.textContent =
      coachPersianNumber(late);

  }


  if (absentElement) {

    absentElement.textContent =
      coachPersianNumber(absent);

  }


  updateSelectedCount();

}


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
    coachPersianNumber(count);

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
    button
      ? button.textContent
      : "";


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "⏳ در حال ذخیره...";

  }


  try {

    /*
     * برای هر ورزشکار:
     *
     * اگر رکورد قبلی وجود داشته باشد:
     * UPDATE
     *
     * اگر وجود نداشته باشد:
     * INSERT
     *
     * بنابراین به Unique Constraint
     * وابسته نیستیم.
     */


    for (
      const athlete
      of selected
    ) {

      const record =
        getAthleteAttendance(
          athlete.id
        );


      const payload = {

        athlete_id:
          athlete.id,

        attendance_date:
          attendanceDateValue,

        status:
          record.status,

        notes:
          record.notes || null

      };


      /*
       * رکورد موجود
       */

      if (record.id) {

        const {
          error
        } =
          await supabaseClient
            .from("attendance")
            .update(payload)
            .eq(
              "id",
              record.id
            );


        if (error) {
          throw error;
        }

      }


      /*
       * رکورد جدید
       */

      else {

        /*
         * برای جلوگیری از رکورد تکراری،
         * یک بار دیگر بررسی می‌کنیم.
         */

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


        if (existing?.id) {

          const {
            error
          } =
            await supabaseClient
              .from("attendance")
              .update(payload)
              .eq(
                "id",
                existing.id
              );


          if (error) {
            throw error;
          }


          record.id =
            existing.id;

        }

        else {

          const {
            data: inserted,
            error
          } =
            await supabaseClient
              .from("attendance")
              .insert(payload)
              .select("*")
              .single();


          if (error) {
            throw error;
          }


          record.id =
            inserted.id;

        }

      }


      /*
       * نگهداری اطلاعات جدید در حافظه
       */

      attendanceData[
        String(athlete.id)
      ] = {

        id:
          record.id,

        athlete_id:
          athlete.id,

        attendance_date:
          attendanceDateValue,

        status:
          record.status,

        notes:
          record.notes || ""

      };

    }


    alert(
      "✅ حضور و غیاب با موفقیت ذخیره شد."
    );


    /*
     * دوباره از Supabase می‌خوانیم
     * تا مطمئن شویم اطلاعات واقعاً ثبت شده.
     */

    await loadAttendanceForDate(
      attendanceDateValue
    );


  } catch (error) {

    console.error(
      "Save attendance error:",
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
// SEARCH / FILTER ATHLETES
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

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
);


// ============================================================
// EVALUATION PAGE
// فعلاً ساختار اولیه
// ============================================================

async function prepareEvaluationPage() {

  await loadCoachAthletes();

  console.log(
    "Evaluation page prepared."
  );

}


window.prepareEvaluationPage =
  prepareEvaluationPage;


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboardStats() {

  try {

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


  } catch (error) {

    console.error(
      "Dashboard evaluation stats error:",
      error
    );

  }


  try {

    const today =
      getTodayDate();


    const {
      data,
      error
    } =
      await supabaseClient
        .from("attendance")
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
   * فعلاً تعداد مقام‌ها صفر است
   * چون بخش achievements هنوز ساخته نشده.
   */

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
// ADD ATHLETE
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


  try {

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

        });


    if (error) {
      throw error;
    }


    alert(
      "✅ ورزشکار با موفقیت ثبت شد."
    );


    closeAthleteModal();


    /*
     * پاک کردن فرم
     */

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


    await loadCoachAthletes();

    renderAthletes();


  } catch (error) {

    console.error(
      "Save athlete error:",
      error
    );


    alert(
      "❌ ثبت ورزشکار انجام نشد.\n\n" +
      (
        error.message ||
        "خطای نامشخص"
      )
    );

  }

}


// ============================================================
// INITIALIZE COACH
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );


  /*
   * بارگذاری ورزشکاران
   */

  await loadCoachAthletes();


  /*
   * داشبورد
   */

  await loadDashboardStats();


  /*
   * رندر ورزشکاران
   */

  renderAthletes();


  /*
   * دکمه افزودن ورزشکار
   */

  const addButton =
    document.getElementById(
      "addAthleteBtn"
    );


  if (
    addButton &&
    !addButton.dataset.bound
  ) {

    addButton.dataset.bound =
      "true";


    addButton.addEventListener(
      "click",
      openAthleteModal
    );

  }


  /*
   * بستن مودال
   */

  const closeButton =
    document.getElementById(
      "closeAthleteModal"
    );


  if (
    closeButton &&
    !closeButton.dataset.bound
  ) {

    closeButton.dataset.bound =
      "true";


    closeButton.addEventListener(
      "click",
      closeAthleteModal
    );

  }


  /*
   * ذخیره ورزشکار
   */

  const saveButton =
    document.getElementById(
      "saveAthleteBtn"
    );


  if (
    saveButton &&
    !saveButton.dataset.bound
  ) {

    saveButton.dataset.bound =
      "true";


    saveButton.addEventListener(
      "click",
      saveAthlete
    );

  }


  /*
   * نمایش ایمیل مربی
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

    console.error(
      "Get coach user error:",
      error
    );

  }


  /*
   * اگر صفحه حضور و غیاب
   * از ابتدا فعال باشد
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
    initializeCoach
  );

} else {

  initializeCoach();

          }
