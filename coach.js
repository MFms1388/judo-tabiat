// ============================================================
// طبیعت جودو | COACH.JS
// پنل مدیریت مربی
// نسخه اصلاح‌شده و هماهنگ با Supabase
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
// NORMALIZE TEXT
// ============================================================

function normalizeCoachText(value) {

  return String(value || "")
    .trim()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
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
// LOAD ATHLETES
// ============================================================

async function loadCoachAthletes() {

  try {

    if (!supabaseClient) {

      throw new Error(
        "Supabase Client ساخته نشده است."
      );

    }


    console.log(
      "🔄 در حال دریافت ورزشکاران از جدول athletes..."
    );


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
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "🥋 تعداد ورزشکاران دریافت‌شده:",
      coachAthletes.length
    );


    /*
     * بررسی مستقیم محمد احمدی
     */

    const mohammadAhmadi =
      coachAthletes.find(
        athlete => {

          const firstName =
            normalizeCoachText(
              athlete.first_name
            );

          const lastName =
            normalizeCoachText(
              athlete.last_name
            );

          return (
            firstName === "محمد" &&
            lastName === "احمدی"
          );

        }
      );


    if (mohammadAhmadi) {

      console.log(
        "✅ محمد احمدی در لیست دریافت شد:",
        mohammadAhmadi
      );

    } else {

      console.warn(
        "⚠️ محمد احمدی از Supabase دریافت نشد."
      );

      console.warn(
        "اگر در Table Editor وجود دارد، RLS جدول athletes را بررسی کنید."
      );

    }


    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();


    return coachAthletes;


  } catch (error) {

    console.error(
      "❌ Load athletes error:",
      error
    );


    coachAthletes = [];

    updateDashboardAthleteCount();

    populateAthleteSelect();

    populateAgeGroupFilter();


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
    select.value || "all";


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
    ]
      .sort(
        (a, b) =>
          String(a).localeCompare(
            String(b),
            "fa"
          )
      );


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
    currentValue !== "all" &&
    groups.includes(currentValue)
  ) {

    select.value =
      currentValue;

  } else {

    select.value =
      "all";

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
    normalizeCoachText(
      document.getElementById(
        "coachSearch"
      )?.value || ""
    );


  const filter =
    document.getElementById(
      "coachFilter"
    )?.value || "all";


  const filtered =
    coachAthletes.filter(
      athlete => {

        const name =
          normalizeCoachText(
            athleteName(
              athlete
            )
          );


        const nationalId =
          normalizeCoachText(
            athlete.national_id || ""
          );


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


  grid
    .querySelectorAll(
      "[data-athlete-profile]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            const athleteId =
              this.dataset.athleteProfile;


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

      }
    );
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

  const record =
    attendanceData[
      String(athleteId)
    ];


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
    normalizeCoachText(
      document.getElementById(
        "attendanceSearch"
      )?.value || ""
    );


  const filter =
    document.getElementById(
      "attendanceFilter"
    )?.value || "all";


  const filtered =
    coachAthletes.filter(
      athlete => {

        const name =
          normalizeCoachText(
            athleteName(
              athlete
            )
          );


        const nationalId =
          normalizeCoachText(
            athlete.national_id || ""
          );


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


            const record =
              attendanceData[
                String(athleteId)
              ];


            record.status =
              normalizeCoachAttendanceStatus(
                status
              );


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
              this.value;

          }
        );

      }
    );


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
      const athlete
      of selected
    ) {

      const record =
        getAthleteAttendance(
          athlete.id
        );


      const row = {

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


      const {
        data: existing,
        error: findError
      } =
        await supabaseClient
          .from("attendance")
          .select("id")
          .eq(
            "athlete_id",
            row.athlete_id
          )
          .eq(
            "attendance_date",
            row.attendance_date
          )
          .limit(1);


      if (findError) {
        throw findError;
      }


      const existingRecord =
        existing?.[0];


      if (existingRecord?.id) {

        const {
          data,
          error
        } =
          await supabaseClient
            .from("attendance")
            .update({

              status:
                row.status,

              notes:
                row.notes

            })
            .eq(
              "id",
              existingRecord.id
            )
            .select("*")
            .single();


        if (error) {
          throw error;
        }


        attendanceData[
          String(
            row.athlete_id
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
              row
            )
            .select("*")
            .single();


        if (error) {
          throw error;
        }


        attendanceData[
          String(
            row.athlete_id
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
// SEARCH / FILTER
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

  await loadCoachAthletes();


  console.log(
    "📝 Evaluation page prepared."
  );
}


window.prepareEvaluationPage =
  prepareEvaluationPage;


// ============================================================
// OPEN EVALUATION
// ============================================================

function openEvaluationPage() {

  console.log(
    "📝 New evaluation button clicked."
  );


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


  if (
    window.location.pathname
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
}


window.openAthleteModal =
  openAthleteModal;


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
     * جلوگیری از ثبت دوباره ورزشکار
     * بر اساس کد ملی
     */

    if (nationalId) {

      const {
        data: existingAthletes,
        error: checkError
      } =
        await supabaseClient
          .from("athletes")
          .select("id, first_name, last_name, national_id")
          .eq(
            "national_id",
            nationalId
          )
          .limit(1);


      if (checkError) {
        throw checkError;
      }


      if (
        existingAthletes &&
        existingAthletes.length
      ) {

        const existing =
          existingAthletes[0];


        alert(
          "⚠️ این ورزشکار قبلاً ثبت شده است.\n\n" +
          athleteName(existing)
        );

        return;
      }

    }


    const {
      data,
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
            weight !== ""
              ? Number(weight)
              : null,

          national_id:
            nationalId || null,

          bio:
            bio || null,

          photo_url:
            photoUrl || null

        })
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
            element.value = "";
          }

        }
      );


    await loadCoachAthletes();


    renderAthletes();


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
// MAIN BUTTONS
// ============================================================

function initializeCoachButtons() {

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
      function (event) {

        event.preventDefault();

        openAthleteModal();

      }
    );

  }


  const evaluationButton =
    document.getElementById(
      "newEvaluationBtn"
    );


  if (
    evaluationButton &&
    !evaluationButton.dataset.bound
  ) {

    evaluationButton.dataset.bound =
      "true";


    evaluationButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        openEvaluationPage();

      }
    );

  }


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
      function (event) {

        event.preventDefault();

        closeAthleteModal();

      }
    );

  }


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
      function (event) {

        event.preventDefault();

        saveAthlete();

      }
    );

  }


  const attendanceSaveButton =
    document.getElementById(
      "saveAttendanceBtn"
    );


  if (
    attendanceSaveButton &&
    !attendanceSaveButton.dataset.bound
  ) {

    attendanceSaveButton.dataset.bound =
      "true";


    attendanceSaveButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        saveAttendance();

      }
    );

  }


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
// INITIALIZE COACH
// ============================================================

async function initializeCoach() {

  console.log(
    "🥋 طبیعت جودو | Coach Panel"
  );


  try {

    await loadCoachAthletes();


    /*
     * بعد از دریافت اطلاعات،
     * حتماً لیست را رندر می‌کنیم.
     */

    renderAthletes();


    await loadDashboardStats();


    initializeCoachButtons();


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


    console.log(
      "✅ Coach panel ready."
    );


  } catch (error) {

    console.error(
      "❌ Coach initialization error:",
      error
    );

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
    initializeCoach
  );

} else {

  initializeCoach();

  }
