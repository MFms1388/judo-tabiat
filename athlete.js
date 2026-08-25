// ============================================================
// طبیعت جودو | ATHLETE.JS
// پروفایل کامل ورزشکار
// ============================================================


// ============================================================
// SUPABASE
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

let currentAthlete = null;

let attendanceRecords = [];

let athleteEvaluations = [];

let evaluationScores = [];

let evaluationPeriods = [];

let evaluationCriteria = [];


// ============================================================
// HELPERS
// ============================================================

function escapeHTML(value) {

  const div =
    document.createElement("div");

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


function formatDate(dateValue) {

  if (!dateValue) {
    return "—";
  }

  try {

    return new Date(dateValue)
      .toLocaleDateString(
        "fa-IR"
      );

  } catch {

    return String(dateValue);

  }

}


function showError(title, error) {

  console.error(
    title,
    error
  );

  const message =
    error?.message ||
    error?.details ||
    error?.hint ||
    "خطای نامشخص";

  const container =
    document.getElementById(
      "profileContainer"
    );

  if (container) {

    container.innerHTML = `

      <div class="error-box">

        <strong>
          ${escapeHTML(title)}
        </strong>

        <p>
          ${escapeHTML(message)}
        </p>

        <button
          type="button"
          onclick="location.reload()"
        >
          تلاش دوباره
        </button>

      </div>

    `;

  }

}


// ============================================================
// GET ATHLETE ID
// ============================================================

function getAthleteIdFromURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("id");

}


// ============================================================
// LOAD ATHLETE
// ============================================================

async function loadAthlete() {

  const athleteId =
    getAthleteIdFromURL();


  if (!athleteId) {

    showError(
      "شناسه ورزشکار پیدا نشد",
      {
        message:
          "آدرس صفحه باید به شکل athlete.html?id=شناسه-ورزشکار باشد."
      }
    );

    return null;

  }


  console.log(
    "Athlete ID:",
    athleteId
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .select("*")
        .eq(
          "id",
          athleteId
        )
        .single();


    if (error) {

      showError(
        "اطلاعات ورزشکار دریافت نشد",
        error
      );

      return null;

    }


    currentAthlete =
      data;


    console.log(
      "Current athlete:",
      currentAthlete
    );


    renderProfile();


    return currentAthlete;

  } catch (error) {

    showError(
      "خطا در دریافت ورزشکار",
      error
    );

    return null;

  }

}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderProfile() {

  const container =
    document.getElementById(
      "profileContainer"
    );


  if (!container) {
    return;
  }


  if (!currentAthlete) {

    container.innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          👤
        </div>

        <h3>
          ورزشکار پیدا نشد
        </h3>

      </div>

    `;

    return;

  }


  const name =
    getAthleteName(
      currentAthlete
    );


  const ageGroup =
    currentAthlete.age_group ||
    "ثبت نشده";


  const weight =
    currentAthlete.weight !== null &&
    currentAthlete.weight !== undefined
      ? `${currentAthlete.weight} کیلوگرم`
      : "ثبت نشده";


  const nationalId =
    currentAthlete.national_id ||
    "ثبت نشده";


  const photo =
    currentAthlete.photo_url ||
    "";


  const bio =
    currentAthlete.bio ||
    "توضیحاتی برای این ورزشکار ثبت نشده است.";


  container.innerHTML = `

    <div class="profile-card">

      <div class="profile-photo">

        ${
          photo
            ? `
              <img
                src="${escapeHTML(photo)}"
                alt="${escapeHTML(name)}"
                onerror="
                  this.style.display='none';
                  this.parentElement.innerHTML='🥋';
                "
              >
            `
            : `
              🥋
            `
        }

      </div>


      <div class="profile-info">

        <h1>
          ${escapeHTML(name)}
        </h1>


        <p class="bio">
          ${escapeHTML(bio)}
        </p>


        <div class="profile-meta">

          <div class="meta-item">
            رده:
            <strong>
              ${escapeHTML(ageGroup)}
            </strong>
          </div>


          <div class="meta-item">
            وزن:
            <strong>
              ${escapeHTML(weight)}
            </strong>
          </div>


          <div class="meta-item">
            کد ملی:
            <strong>
              ${escapeHTML(nationalId)}
            </strong>
          </div>

        </div>

      </div>

    </div>

  `;

}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {

  if (!currentAthlete) {
    return;
  }


  const container =
    document.getElementById(
      "attendanceContainer"
    );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("attendance")
        .select("*")
        .eq(
          "athlete_id",
          currentAthlete.id
        )
        .order(
          "attendance_date",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Attendance error:",
        error
      );


      if (container) {

        container.innerHTML = `

          <div class="empty">

            <div class="empty-icon">
              🟢
            </div>

            <h3>
              اطلاعات حضور و غیاب قابل دریافت نیست
            </h3>

            <p>
              ${escapeHTML(
                error.message ||
                "خطای نامشخص"
              )}
            </p>

          </div>

        `;

      }

      return;

    }


    attendanceRecords =
      data || [];


    console.log(
      "Attendance:",
      attendanceRecords
    );


    renderAttendance();

  } catch (error) {

    console.error(
      "Load attendance error:",
      error
    );

  }

}


// ============================================================
// ATTENDANCE STATUS
// ============================================================

function normalizeAttendanceStatus(
  status
) {

  const value =
    String(
      status || ""
    )
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
    value === "absent" ||
    value === "غایب" ||
    value === "غیبت" ||
    value === "a"
  ) {

    return "absent";

  }


  return "other";

}


function attendanceStatusText(
  status
) {

  const normalized =
    normalizeAttendanceStatus(
      status
    );


  if (
    normalized === "present"
  ) {

    return "حاضر";

  }


  if (
    normalized === "absent"
  ) {

    return "غایب";

  }


  return status || "ثبت نشده";

}


// ============================================================
// RENDER ATTENDANCE
// ============================================================

function renderAttendance() {

  const container =
    document.getElementById(
      "attendanceContainer"
    );


  if (!container) {
    return;
  }


  const total =
    attendanceRecords.length;


  const present =
    attendanceRecords.filter(
      record =>
        normalizeAttendanceStatus(
          record.status
        ) === "present"
    ).length;


  const absent =
    attendanceRecords.filter(
      record =>
        normalizeAttendanceStatus(
          record.status
        ) === "absent"
    ).length;


  const percentage =
    total > 0
      ? (present / total) * 100
      : 0;


  if (!total) {

    container.innerHTML = `

      <div class="attendance-section">

        <div class="attendance-stats">

          <div class="attendance-stat">
            <div class="icon">📅</div>
            <small>کل جلسات</small>
            <strong>۰</strong>
          </div>


          <div class="attendance-stat present">
            <div class="icon">🟢</div>
            <small>حاضر</small>
            <strong>۰</strong>
          </div>


          <div class="attendance-stat absent">
            <div class="icon">🔴</div>
            <small>غایب</small>
            <strong>۰</strong>
          </div>


          <div class="attendance-stat percent">
            <div class="icon">📈</div>
            <small>درصد حضور</small>
            <strong>۰٪</strong>
          </div>

        </div>


        <div class="empty">

          <div class="empty-icon">
            🟢
          </div>

          <h3>
            هنوز سابقه حضور و غیابی ثبت نشده است
          </h3>

          <p>
            به محض ثبت حضور و غیاب، سوابق اینجا نمایش داده می‌شود.
          </p>

        </div>

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div class="attendance-section">

      <div class="attendance-stats">

        <div class="attendance-stat">

          <div class="icon">
            📅
          </div>

          <small>
            کل جلسات
          </small>

          <strong>
            ${persianNumber(total)}
          </strong>

        </div>


        <div class="attendance-stat present">

          <div class="icon">
            🟢
          </div>

          <small>
            حاضر
          </small>

          <strong>
            ${persianNumber(present)}
          </strong>

        </div>


        <div class="attendance-stat absent">

          <div class="icon">
            🔴
          </div>

          <small>
            غایب
          </small>

          <strong>
            ${persianNumber(absent)}
          </strong>

        </div>


        <div class="attendance-stat percent">

          <div class="icon">
            📈
          </div>

          <small>
            درصد حضور
          </small>

          <strong>
            ${persianNumber(
              percentage.toFixed(1)
            )}٪
          </strong>

        </div>

      </div>


      <div class="attendance-table-wrap">

        <table class="attendance-table">

          <thead>

            <tr>

              <th>
                تاریخ
              </th>

              <th>
                وضعیت
              </th>

              <th>
                توضیحات
              </th>

            </tr>

          </thead>


          <tbody>

            ${
              attendanceRecords
                .map(
                  record => {

                    const normalized =
                      normalizeAttendanceStatus(
                        record.status
                      );


                    let statusClass =
                      "status-other";


                    let icon =
                      "⚪";


                    if (
                      normalized ===
                      "present"
                    ) {

                      statusClass =
                        "status-present";

                      icon =
                        "🟢";

                    }


                    if (
                      normalized ===
                      "absent"
                    ) {

                      statusClass =
                        "status-absent";

                      icon =
                        "🔴";

                    }


                    return `

                      <tr>

                        <td>
                          ${escapeHTML(
                            formatDate(
                              record.attendance_date
                            )
                          )}
                        </td>


                        <td>

                          <span
                            class="status-badge ${statusClass}"
                          >
                            ${icon}
                            ${escapeHTML(
                              attendanceStatusText(
                                record.status
                              )
                            )}
                          </span>

                        </td>


                        <td>
                          ${escapeHTML(
                            record.notes ||
                            "—"
                          )}
                        </td>

                      </tr>

                    `;

                  }
                )
                .join("")
            }

          </tbody>

        </table>

      </div>

    </div>

  `;

}


// ============================================================
// LOAD EVALUATION PERIODS
// ============================================================

async function loadEvaluationPeriods() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluation_periods")
        .select("*");


    if (error) {

      console.error(
        "Periods error:",
        error
      );

      return;

    }


    evaluationPeriods =
      data || [];

  } catch (error) {

    console.error(
      "Load periods error:",
      error
    );

  }

}


// ============================================================
// LOAD EVALUATION CRITERIA
// ============================================================

async function loadEvaluationCriteria() {

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
        );


    if (error) {

      console.error(
        "Criteria error:",
        error
      );

      return;

    }


    evaluationCriteria =
      data || [];

  } catch (error) {

    console.error(
      "Load criteria error:",
      error
    );

  }

}


// ============================================================
// LOAD EVALUATIONS
// ============================================================

async function loadAthleteEvaluations() {

  if (!currentAthlete) {
    return;
  }


  const container =
    document.getElementById(
      "evaluationsContainer"
    );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluations")
        .select("*")
        .eq(
          "athlete_id",
          currentAthlete.id
        )
        .order(
          "evaluated_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "Evaluations error:",
        error
      );


      if (container) {

        container.innerHTML = `

          <div class="empty">

            <div class="empty-icon">
              📊
            </div>

            <h3>
              ارزیابی‌ها قابل دریافت نیستند
            </h3>

            <p>
              ${escapeHTML(
                error.message ||
                "خطای نامشخص"
              )}
            </p>

          </div>

        `;

      }

      return;

    }


    athleteEvaluations =
      data || [];


    console.log(
      "Athlete evaluations:",
      athleteEvaluations
    );


    await loadEvaluationScores();


    renderEvaluations();

  } catch (error) {

    console.error(
      "Load evaluations error:",
      error
    );

  }

}


// ============================================================
// LOAD SCORES
// ============================================================

async function loadEvaluationScores() {

  if (!athleteEvaluations.length) {

    evaluationScores = [];

    return;

  }


  const evaluationIds =
    athleteEvaluations.map(
      evaluation =>
        evaluation.id
    );


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("evaluation_scores")
        .select("*")
        .in(
          "evaluation_id",
          evaluationIds
        );


    if (error) {

      console.error(
        "Evaluation scores error:",
        error
      );

      evaluationScores = [];

      return;

    }


    evaluationScores =
      data || [];


    console.log(
      "Evaluation scores:",
      evaluationScores
    );

  } catch (error) {

    console.error(
      "Load scores error:",
      error
    );

    evaluationScores = [];

  }

}


// ============================================================
// FIND PERIOD
// ============================================================

function getPeriodById(
  periodId
) {

  return evaluationPeriods.find(
    period =>
      String(period.id) ===
      String(periodId)
  );

}


// ============================================================
// FIND CRITERION
// ============================================================

function getCriterionById(
  criterionId
) {

  return evaluationCriteria.find(
    criterion =>
      String(criterion.id) ===
      String(criterionId)
  );

}


// ============================================================
// RENDER EVALUATIONS
// ============================================================

function renderEvaluations() {

  const container =
    document.getElementById(
      "evaluationsContainer"
    );


  if (!container) {
    return;
  }


  if (!athleteEvaluations.length) {

    container.innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          📊
        </div>

        <h3>
          هنوز ارزیابی‌ای ثبت نشده است
        </h3>

        <p>
          ارزیابی‌های ورزشکار پس از ثبت در این قسمت نمایش داده می‌شوند.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div class="evaluation-grid">

      ${
        athleteEvaluations
          .map(
            evaluation => {

              const period =
                getPeriodById(
                  evaluation.period_id
                );


              const score =
                Number(
                  evaluation.total_score ||
                  0
                );


              const scores =
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

                  <div
                    class="evaluation-card-header"
                  >

                    <div>

                      <h3>
                        ${escapeHTML(
                          period?.title ||
                          "دوره ارزیابی"
                        )}
                      </h3>


                      <div class="evaluation-date">

                        تاریخ ارزیابی:

                        ${escapeHTML(
                          formatDate(
                            evaluation.evaluated_at
                          )
                        )}

                      </div>

                    </div>


                    <div class="evaluation-score">

                      <small>
                        امتیاز نهایی
                      </small>

                      <strong>
                        ${persianNumber(
                          score.toFixed(2)
                        )}
                      </strong>

                    </div>

                  </div>


                  ${
                    scores.length
                      ? `

                        <div class="criteria-list">

                          ${
                            scores
                              .map(
                                scoreRow => {

                                  const criterion =
                                    getCriterionById(
                                      scoreRow.criterion_id
                                    );


                                  const value =
                                    Number(
                                      scoreRow.score ||
                                      0
                                    );


                                  const percent =
                                    Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        value * 10
                                      )
                                    );


                                  return `

                                    <div
                                      class="criterion-row"
                                    >

                                      <div
                                        class="criterion-name"
                                      >
                                        ${escapeHTML(
                                          criterion?.name ||
                                          "معیار"
                                        )}
                                      </div>


                                      <div
                                        class="criterion-bar"
                                      >

                                        <div
                                          class="criterion-fill"
                                          style="width:${percent}%"
                                        ></div>

                                      </div>


                                      <div
                                        class="criterion-score"
                                      >
                                        ${persianNumber(
                                          value.toFixed(1)
                                        )}
                                      </div>

                                    </div>

                                  `;

                                }
                              )
                              .join("")
                          }

                        </div>

                      `
                      : `
                        <div class="evaluation-notes">
                          جزئیات معیارهای این ارزیابی موجود نیست.
                        </div>
                      `
                  }


                  ${
                    evaluation.notes
                      ? `

                        <div class="evaluation-notes">

                          <strong>
                            توضیحات مربی:
                          </strong>

                          <br>

                          ${escapeHTML(
                            evaluation.notes
                          )}

                        </div>

                      `
                      : ""
                  }

                </div>

              `;

            }
          )
          .join("")
      }

    </div>

  `;

}


// ============================================================
// BACK BUTTON
// ============================================================

function initializeBackButton() {

  const button =
    document.getElementById(
      "backBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      if (
        document.referrer &&
        document.referrer.includes(
          window.location.origin
        )
      ) {

        history.back();

      } else {

        window.location.href =
          "coach.html";

      }

    }
  );

}


// ============================================================
// INITIALIZE
// ============================================================

async function initializeAthletePage() {

  console.log(
    "🥋 طبیعت جودو | Athlete Profile"
  );


  initializeBackButton();


  const athlete =
    await loadAthlete();


  if (!athlete) {
    return;
  }


  // مهم:
  // اطلاعات حضور و غیاب را جداگانه
  // و مستقیم از جدول attendance می‌گیریم.

  await loadAttendance();


  // اطلاعات ارزیابی

  await loadEvaluationPeriods();

  await loadEvaluationCriteria();

  await loadAthleteEvaluations();


  console.log(
    "✅ پروفایل ورزشکار آماده شد."
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
    initializeAthletePage
  );

} else {

  initializeAthletePage();

  }
