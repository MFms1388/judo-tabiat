// ============================================================
// طبیعت جودو | COACH.JS
// سیستم ارزیابی ورزشکاران
// ============================================================

function coachEscapeHTML(value) {
  const div = document.createElement("div");
  div.textContent =
    value === undefined || value === null ? "" : String(value);
  return div.innerHTML;
}

function coachPersianNumber(value) {
  return String(value).replace(
    /\d/g,
    digit => "۰۱۲۳۴۵۶۷۸۹"[digit]
  );
}

function coachGetAthletes() {
  if (
    typeof athletes !== "undefined" &&
    Array.isArray(athletes)
  ) {
    return athletes;
  }

  if (Array.isArray(window.athletes)) {
    return window.athletes;
  }

  return [];
}

function coachGetPeriods() {
  if (
    typeof evaluationPeriods !== "undefined" &&
    Array.isArray(evaluationPeriods)
  ) {
    return evaluationPeriods;
  }

  if (Array.isArray(window.evaluationPeriods)) {
    return window.evaluationPeriods;
  }

  return [];
}

function coachGetCriteria() {
  if (
    typeof evaluationCriteria !== "undefined" &&
    Array.isArray(evaluationCriteria)
  ) {
    return evaluationCriteria;
  }

  if (Array.isArray(window.evaluationCriteria)) {
    return window.evaluationCriteria;
  }

  return [];
}

function coachGetEvaluations() {
  if (!Array.isArray(window.evaluations)) {
    window.evaluations = [];
  }

  return window.evaluations;
}


// ============================================================
// بارگذاری ارزیابی‌ها
// ============================================================

function loadEvaluations() {
  try {
    const saved = localStorage.getItem("evaluations");

    if (!saved) {
      window.evaluations = [];
      return window.evaluations;
    }

    const parsed = JSON.parse(saved);

    window.evaluations =
      Array.isArray(parsed) ? parsed : [];

  } catch (error) {
    console.error(
      "خطا در بارگذاری ارزیابی‌ها:",
      error
    );

    window.evaluations = [];
  }

  return window.evaluations;
}


// ============================================================
// ذخیره ارزیابی‌ها
// ============================================================

function saveEvaluationsToStorage() {
  try {
    localStorage.setItem(
      "evaluations",
      JSON.stringify(coachGetEvaluations())
    );

    return true;

  } catch (error) {
    console.error(
      "خطا در ذخیره ارزیابی‌ها:",
      error
    );

    return false;
  }
}


// ============================================================
// استایل فرم ارزیابی
// ============================================================

function addEvaluationModalStyle() {

  const oldStyle =
    document.getElementById("evaluation-modal-style");

  if (oldStyle) {
    oldStyle.remove();
  }

  const style = document.createElement("style");

  style.id = "evaluation-modal-style";

  style.textContent = `

    #newEvaluationModal {
      position: fixed !important;
      inset: 0 !important;
      z-index: 99999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(0,0,0,.60) !important;
      padding: 15px !important;
      box-sizing: border-box !important;
    }

    #newEvaluationModal .evaluation-modal-card {
      position: relative !important;
      width: min(620px, 100%) !important;
      max-height: 92vh !important;
      overflow-y: auto !important;
      background: #ffffff !important;
      color: #111111 !important;
      border-radius: 20px !important;
      padding: 22px !important;
      box-sizing: border-box !important;
      box-shadow: 0 20px 60px rgba(0,0,0,.30) !important;
    }

    #newEvaluationModal h2,
    #newEvaluationModal p,
    #newEvaluationModal strong,
    #newEvaluationModal label,
    #newEvaluationModal span {
      color: #111111;
    }

    .evaluation-new-header {
      margin-bottom: 20px !important;
    }

    .evaluation-new-header .eyebrow {
      display: block !important;
      color: #16834b !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      margin-bottom: 5px !important;
    }

    .evaluation-new-header h2 {
      margin: 0 0 12px 0 !important;
      color: #111111 !important;
      font-size: 24px !important;
      font-weight: 800 !important;
    }

    .evaluation-info {
      background: #f1f6f3 !important;
      color: #111111 !important;
      border-radius: 12px !important;
      padding: 13px !important;
      line-height: 2 !important;
    }

    .evaluation-info strong {
      color: #111111 !important;
      font-weight: 800 !important;
    }

    .evaluation-criterion {
      background: #f8faf9 !important;
      border: 1px solid #dfe6e2 !important;
      border-radius: 15px !important;
      padding: 16px !important;
      margin-bottom: 13px !important;
    }

    .evaluation-criterion-top {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 10px !important;
      margin-bottom: 8px !important;
    }

    .evaluation-criterion-name {
      color: #111111 !important;
      font-size: 17px !important;
      font-weight: 800 !important;
    }

    .evaluation-criterion-value {
      min-width: 58px !important;
      height: 38px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: #16834b !important;
      color: #ffffff !important;
      border-radius: 10px !important;
      font-size: 18px !important;
      font-weight: 900 !important;
    }

    .evaluation-criterion-description {
      color: #555555 !important;
      font-size: 13px !important;
      line-height: 1.7 !important;
      margin-bottom: 12px !important;
    }

    .evaluation-range {
      display: block !important;
      width: 100% !important;
      height: 10px !important;
      margin: 15px 0 8px 0 !important;
      padding: 0 !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      background: #cfd8d3 !important;
      border-radius: 10px !important;
      outline: none !important;
      cursor: pointer !important;
    }

    .evaluation-range::-webkit-slider-thumb {
      appearance: none !important;
      -webkit-appearance: none !important;
      width: 30px !important;
      height: 30px !important;
      border-radius: 50% !important;
      background: #16834b !important;
      border: 4px solid #ffffff !important;
      box-shadow: 0 2px 7px rgba(0,0,0,.30) !important;
      cursor: pointer !important;
    }

    .evaluation-range::-moz-range-thumb {
      width: 30px !important;
      height: 30px !important;
      border-radius: 50% !important;
      background: #16834b !important;
      border: 4px solid #ffffff !important;
      box-shadow: 0 2px 7px rgba(0,0,0,.30) !important;
      cursor: pointer !important;
    }

    .evaluation-range-labels {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      margin-top: 6px !important;
      color: #333333 !important;
      font-size: 12px !important;
      font-weight: 700 !important;
    }

    .evaluation-range-labels span {
      color: #333333 !important;
    }

    .evaluation-notes-label {
      display: block !important;
      margin-top: 18px !important;
      color: #111111 !important;
      font-weight: 800 !important;
    }

    #newEvaluationNotes {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      margin-top: 8px !important;
      padding: 12px !important;
      min-height: 100px !important;
      background: #ffffff !important;
      color: #111111 !important;
      border: 1px solid #cfd5d1 !important;
      border-radius: 12px !important;
      font-family: inherit !important;
      font-size: 15px !important;
      outline: none !important;
      resize: vertical !important;
    }

    #newEvaluationNotes::placeholder {
      color: #777777 !important;
    }

    .evaluation-total-box {
      margin-top: 17px !important;
      padding: 16px !important;
      background: #edf7f1 !important;
      border: 1px solid #cde7d8 !important;
      border-radius: 13px !important;
      text-align: center !important;
      color: #222222 !important;
      font-size: 16px !important;
      font-weight: 700 !important;
    }

    #newEvaluationTotal {
      color: #16834b !important;
      font-size: 27px !important;
      font-weight: 900 !important;
      margin: 0 5px !important;
    }

    #saveNewEvaluationBtn {
      width: 100% !important;
      min-height: 52px !important;
      margin-top: 14px !important;
      border: none !important;
      border-radius: 12px !important;
      background: #16834b !important;
      color: #ffffff !important;
      font-family: inherit !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      cursor: pointer !important;
    }

    #saveNewEvaluationBtn:disabled {
      opacity: .6 !important;
      cursor: wait !important;
    }

    #closeNewEvaluationModal {
      position: absolute !important;
      top: 12px !important;
      left: 12px !important;
      width: 36px !important;
      height: 36px !important;
      border: none !important;
      border-radius: 50% !important;
      background: #eeeeee !important;
      color: #222222 !important;
      font-size: 25px !important;
      line-height: 1 !important;
      cursor: pointer !important;
    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// ساخت فرم ارزیابی
// ============================================================

function createEvaluationModal(athleteId, periodId) {

  const oldModal =
    document.getElementById("newEvaluationModal");

  if (oldModal) {
    oldModal.remove();
  }

  const athleteList = coachGetAthletes();
  const periodList = coachGetPeriods();
  const criteriaList = coachGetCriteria();

  const athlete =
    athleteList.find(
      item => String(item.id) === String(athleteId)
    );

  const period =
    periodList.find(
      item => String(item.id) === String(periodId)
    );

  const athleteName =
    athlete
      ? [athlete.first_name, athlete.last_name]
          .filter(Boolean)
          .join(" ")
      : "ورزشکار";

  addEvaluationModalStyle();

  const criteriaHTML =
    criteriaList.length

      ? criteriaList.map(criterion => {

          const criterionId =
            String(criterion.id);

          return `
            <div class="evaluation-criterion">

              <div class="evaluation-criterion-top">

                <div class="evaluation-criterion-name">
                  ${coachEscapeHTML(
                    criterion.name || "معیار بدون نام"
                  )}
                </div>

                <div
                  class="evaluation-criterion-value"
                  id="scoreValue-${coachEscapeHTML(
                    criterionId
                  )}"
                >
                  ۰
                </div>

              </div>

              ${
                criterion.description
                  ? `
                    <div class="evaluation-criterion-description">
                      ${coachEscapeHTML(
                        criterion.description
                      )}
                    </div>
                  `
                  : ""
              }

              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value="0"
                class="evaluation-range"
                data-criterion-id="${coachEscapeHTML(
                  criterionId
                )}"
                data-value-id="scoreValue-${coachEscapeHTML(
                  criterionId
                )}"
              >

              <div class="evaluation-range-labels">
                <span>۰</span>
                <span>۲</span>
                <span>۴</span>
                <span>۶</span>
                <span>۸</span>
                <span>۱۰</span>
              </div>

            </div>
          `;

        }).join("")

      : `
        <div
          style="
            padding:20px;
            text-align:center;
            color:#777;
            background:#f8faf9;
            border-radius:12px;
          "
        >
          هنوز هیچ معیاری ایجاد نشده است.
        </div>
      `;

  const modal =
    document.createElement("div");

  modal.id = "newEvaluationModal";

  modal.innerHTML = `

    <div class="evaluation-modal-card">

      <button
        type="button"
        id="closeNewEvaluationModal"
        aria-label="بستن"
      >
        ×
      </button>

      <div class="evaluation-new-header">

        <span class="eyebrow">
          NEW EVALUATION
        </span>

        <h2>
          ارزیابی جدید
        </h2>

        <div class="evaluation-info">

          ورزشکار:

          <strong>
            ${coachEscapeHTML(athleteName)}
          </strong>

          <br>

          دوره:

          <strong>
            ${
              period
                ? coachEscapeHTML(
                    period.title || "دوره بدون عنوان"
                  )
                : "دوره نامشخص"
            }
          </strong>

        </div>

      </div>

      <div>
        ${criteriaHTML}
      </div>

      <label class="evaluation-notes-label">

        توضیحات مربی

        <textarea
          id="newEvaluationNotes"
          rows="4"
          placeholder="توضیحات مربی درباره عملکرد ورزشکار..."
        ></textarea>

      </label>

      <div class="evaluation-total-box">

        امتیاز نهایی:

        <strong id="newEvaluationTotal">
          ۰
        </strong>

        از ۱۰

      </div>

      <button
        id="saveNewEvaluationBtn"
        type="button"
      >
        ثبت ارزیابی
      </button>

    </div>
  `;

  document.body.appendChild(modal);

  const scoreInputs =
    modal.querySelectorAll(".evaluation-range");

  function updateTotal() {

    let total = 0;

    scoreInputs.forEach(input => {

      let value = Number(input.value);

      if (Number.isNaN(value)) {
        value = 0;
      }

      value =
        Math.max(
          0,
          Math.min(10, value)
        );

      total += value;

      const valueElement =
        modal.querySelector(
          "#" + CSS.escape(input.dataset.valueId)
        );

      if (valueElement) {
        valueElement.textContent =
          coachPersianNumber(
            value.toFixed(1)
          );
      }

    });

    const average =
      scoreInputs.length
        ? total / scoreInputs.length
        : 0;

    const totalElement =
      modal.querySelector("#newEvaluationTotal");

    if (totalElement) {
      totalElement.textContent =
        coachPersianNumber(
          average.toFixed(2)
        );
    }
  }

  scoreInputs.forEach(input => {

    input.addEventListener(
      "input",
      updateTotal
    );

    input.addEventListener(
      "change",
      updateTotal
    );

  });

  updateTotal();

  const closeBtn =
    modal.querySelector("#closeNewEvaluationModal");

  if (closeBtn) {
    closeBtn.addEventListener(
      "click",
      () => modal.remove()
    );
  }

  modal.addEventListener(
    "click",
    event => {

      if (event.target === modal) {
        modal.remove();
      }

    }
  );

  const saveBtn =
    modal.querySelector("#saveNewEvaluationBtn");

  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      async () => {

        await saveNewEvaluation(
          athleteId,
          periodId,
          scoreInputs,
          saveBtn,
          modal
        );

      }
    );

  }
}


// ============================================================
// ثبت ارزیابی
// ============================================================

async function saveNewEvaluation(
  athleteId,
  periodId,
  scoreInputs,
  saveBtn,
  modal
) {

  try {

    saveBtn.disabled = true;
    saveBtn.textContent = "در حال ثبت...";

    const scores = [];

    scoreInputs.forEach(input => {

      let score = Number(input.value);

      if (Number.isNaN(score)) {
        score = 0;
      }

      score =
        Math.max(
          0,
          Math.min(10, score)
        );

      scores.push({
        criterion_id:
          String(input.dataset.criterionId),

        score:
          Number(score.toFixed(1))
      });

    });

    const totalScore =
      scores.length
        ? scores.reduce(
            (sum, item) =>
              sum + Number(item.score),
            0
          ) / scores.length
        : 0;

    const notesElement =
      modal
        ? modal.querySelector("#newEvaluationNotes")
        : null;

    const notes =
      notesElement
        ? notesElement.value.trim()
        : "";

    let evaluationId;

    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {

      evaluationId =
        crypto.randomUUID();

    } else {

      evaluationId =
        "evaluation-" +
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 9);

    }

    const evaluation = {

      id: evaluationId,

      athlete_id: athleteId,

      period_id: periodId,

      scores: scores,

      total_score:
        Number(totalScore.toFixed(2)),

      notes: notes,

      created_at:
        new Date().toISOString()

    };

    const evaluationList =
      coachGetEvaluations();

    evaluationList.push(evaluation);

    const saved =
      saveEvaluationsToStorage();

    if (!saved) {
      throw new Error(
        "ذخیره ارزیابی انجام نشد."
      );
    }

    if (modal) {
      modal.remove();
    }

    refreshEvaluationHistory();

    if (typeof renderDashboard === "function") {

      try {
        renderDashboard();
      } catch (error) {
        console.warn(
          "renderDashboard:",
          error
        );
      }

    }

    alert(
      "ارزیابی با موفقیت ثبت شد."
    );

  } catch (error) {

    console.error(
      "خطا در ثبت ارزیابی:",
      error
    );

    alert(
      "خطا در ثبت ارزیابی."
    );

    if (saveBtn) {

      saveBtn.disabled = false;
      saveBtn.textContent = "ثبت ارزیابی";

    }

  }
}


// ============================================================
// نمایش تاریخچه
// ============================================================

function renderEvaluations() {

  const container =
    document.getElementById(
      "evaluationsContainer"
    );

  if (!container) {
    return;
  }

  const evaluationList =
    loadEvaluations();

  const athleteList =
    coachGetAthletes();

  const periodList =
    coachGetPeriods();

  if (!evaluationList.length) {

    container.innerHTML = `
      <div
        style="
          padding:25px;
          text-align:center;
          color:#777;
        "
      >
        هنوز هیچ ارزیابی‌ای ثبت نشده است.
      </div>
    `;

    return;
  }

  container.innerHTML =
    evaluationList
      .slice()
      .reverse()
      .map(evaluation => {

        const athlete =
          athleteList.find(
            item =>
              String(item.id) ===
              String(evaluation.athlete_id)
          );

        const period =
          periodList.find(
            item =>
              String(item.id) ===
              String(evaluation.period_id)
          );

        const athleteName =
          athlete
            ? [
                athlete.first_name,
                athlete.last_name
              ]
                .filter(Boolean)
                .join(" ")
            : "ورزشکار";

        const periodName =
          period
            ? period.title || "دوره بدون عنوان"
            : "دوره نامشخص";

        const score =
          Number(
            evaluation.total_score || 0
          );

        let dateText = "";

        if (evaluation.created_at) {

          const date =
            new Date(
              evaluation.created_at
            );

          if (!Number.isNaN(date.getTime())) {

            dateText =
              date.toLocaleDateString(
                "fa-IR"
              );

          }
        }

        return `

          <div
            class="evaluation-history-card"
            data-evaluation-id="${coachEscapeHTML(
              evaluation.id
            )}"
          >

            <div>

              <strong>
                ${coachEscapeHTML(
                  athleteName
                )}
              </strong>

              <div>
                ${coachEscapeHTML(
                  periodName
                )}
              </div>

              ${
                dateText
                  ? `
                    <small>
                      ${coachEscapeHTML(
                        dateText
                      )}
                    </small>
                  `
                  : ""
              }

            </div>

            <div class="evaluation-history-score">

              ${coachPersianNumber(
                score.toFixed(2)
              )}

              <small>
                / ۱۰
              </small>

            </div>

          </div>
        `;

      })
      .join("");

  addEvaluationHistoryStyle();
}


// ============================================================
// استایل تاریخچه
// ============================================================

function addEvaluationHistoryStyle() {

  if (
    document.getElementById(
      "evaluation-history-style"
    )
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "evaluation-history-style";

  style.textContent = `

    .evaluation-history-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 16px;
      margin-bottom: 12px;
      background: #ffffff;
      border: 1px solid #e1e7e3;
      border-radius: 14px;
      box-shadow: 0 4px 15px rgba(0,0,0,.06);
    }

    .evaluation-history-card strong {
      display: block;
      color: #111111;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .evaluation-history-card div {
      color: #666666;
      font-size: 13px;
    }

    .evaluation-history-card small {
      display: block;
      margin-top: 4px;
      color: #888888;
      font-size: 11px;
    }

    .evaluation-history-score {
      min-width: 75px;
      padding: 10px;
      text-align: center;
      background: #edf7f1;
      color: #16834b !important;
      border-radius: 10px;
      font-size: 18px;
      font-weight: 900;
    }

    .evaluation-history-score small {
      display: inline;
      margin: 0;
      font-size: 11px;
      color: #16834b !important;
    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// بروزرسانی تاریخچه
// ============================================================

function refreshEvaluationHistory() {

  loadEvaluations();

  renderEvaluations();

}

window.refreshEvaluationHistory =
  refreshEvaluationHistory;


// ============================================================
// ارزیابی ورزشکار
// ============================================================

function openNewEvaluationForAthlete(athleteId) {

  const periodList =
    coachGetPeriods();

  if (!periodList.length) {

    alert(
      "ابتدا حداقل یک دوره ارزیابی ایجاد کنید."
    );

    return;
  }

  const period =
    periodList[
      periodList.length - 1
    ];

  createEvaluationModal(
    athleteId,
    period.id
  );
}


// ============================================================
// دکمه ارزیابی روی کارت ورزشکار
// ============================================================

function addEvaluationButtonToAthleteCard(
  athleteId,
  card
) {

  if (!card) {
    return;
  }

  if (
    card.querySelector(
      ".open-new-evaluation-btn"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.type = "button";

  button.className =
    "open-new-evaluation-btn";

  button.textContent =
    "ارزیابی جدید";

  button.style.cssText = `

    width: 100%;
    min-height: 46px;
    margin-top: 10px;
    border: none;
    border-radius: 10px;
    background: #16834b;
    color: #ffffff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;

  `;

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();
      event.stopPropagation();

      openNewEvaluationForAthlete(
        athleteId
      );

    }
  );

  card.appendChild(button);
}


// ============================================================
// انتخاب ورزشکار و دوره
// ============================================================

function openEvaluationSelector() {

  const oldModal =
    document.getElementById(
      "evaluationSelectorModal"
    );

  if (oldModal) {
    oldModal.remove();
  }

  const athleteList =
    coachGetAthletes();

  const periodList =
    coachGetPeriods();

  if (!athleteList.length) {

    alert(
      "ابتدا حداقل یک ورزشکار اضافه کنید."
    );

    return;
  }

  if (!periodList.length) {

    alert(
      "ابتدا حداقل یک دوره ارزیابی ایجاد کنید."
    );

    return;
  }

  addEvaluationSelectorStyle();

  const athleteOptions =
    athleteList
      .map(athlete => {

        const name =
          [
            athlete.first_name,
            athlete.last_name
          ]
            .filter(Boolean)
            .join(" ");

        return `
          <option value="${coachEscapeHTML(
            athlete.id
          )}">
            ${coachEscapeHTML(
              name || "بدون نام"
            )}
          </option>
        `;

      })
      .join("");

  const periodOptions =
    periodList
      .map(period => {

        return `
          <option value="${coachEscapeHTML(
            period.id
          )}">
            ${coachEscapeHTML(
              period.title ||
              "دوره بدون عنوان"
            )}
          </option>
        `;

      })
      .join("");

  const modal =
    document.createElement("div");

  modal.id =
    "evaluationSelectorModal";

  modal.innerHTML = `

    <div class="evaluation-selector-card">

      <button
        type="button"
        id="closeEvaluationSelector"
      >
        ×
      </button>

      <h2>
        ارزیابی جدید
      </h2>

      <p class="selector-subtitle">
        ورزشکار و دوره موردنظر را انتخاب کنید
        تا فرم ارزیابی باز شود.
      </p>

      <label
        class="selector-label"
        for="evaluationAthleteSelect"
      >
        ورزشکار
      </label>

      <select
        id="evaluationAthleteSelect"
        class="selector-select"
      >

        <option value="">
          انتخاب ورزشکار
        </option>

        ${athleteOptions}

      </select>

      <label
        class="selector-label"
        for="evaluationPeriodSelect"
      >
        دوره ارزیابی
      </label>

      <select
        id="evaluationPeriodSelect"
        class="selector-select"
      >

        <option value="">
          انتخاب دوره
        </option>

        ${periodOptions}

      </select>

      <button
        type="button"
        id="startEvaluationBtn"
      >
        شروع ارزیابی
      </button>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector(
      "#closeEvaluationSelector"
    )
    .addEventListener(
      "click",
      () => modal.remove()
    );

  modal.addEventListener(
    "click",
    event => {

      if (event.target === modal) {
        modal.remove();
      }

    }
  );

  modal
    .querySelector(
      "#startEvaluationBtn"
    )
    .addEventListener(
      "click",
      () => {

        const athleteId =
          modal.querySelector(
            "#evaluationAthleteSelect"
          ).value;

        const periodId =
          modal.querySelector(
            "#evaluationPeriodSelect"
          ).value;

        if (!athleteId) {

          alert(
            "لطفاً ورزشکار را انتخاب کنید."
          );

          return;
        }

        if (!periodId) {

          alert(
            "لطفاً دوره ارزیابی را انتخاب کنید."
          );

          return;
        }

        modal.remove();

        createEvaluationModal(
          athleteId,
          periodId
        );

      }
    );
}


// ============================================================
// استایل انتخاب ورزشکار
// ============================================================

function addEvaluationSelectorStyle() {

  const oldStyle =
    document.getElementById(
      "evaluation-selector-style"
    );

  if (oldStyle) {
    oldStyle.remove();
  }

  const style =
    document.createElement("style");

  style.id =
    "evaluation-selector-style";

  style.textContent = `

    #evaluationSelectorModal {
      position: fixed;
      inset: 0;
      z-index: 99998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;
      background: rgba(0,0,0,.60);
      box-sizing: border-box;
    }

    .evaluation-selector-card {
      width: min(500px,100%);
      max-height: 92vh;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 24px;
      box-sizing: border-box;
      box-shadow: 0 20px 60px rgba(0,0,0,.30);
      position: relative;
    }

    .evaluation-selector-card h2 {
      margin: 0 0 6px 0;
      color: #111111;
      font-size: 23px;
      font-weight: 900;
    }

    .selector-subtitle {
      margin: 0 0 22px 0;
      color: #666666;
      font-size: 13px;
      line-height: 1.7;
    }

    .selector-label {
      display: block;
      margin-top: 15px;
      margin-bottom: 7px;
      color: #111111;
      font-size: 14px;
      font-weight: 800;
    }

    .selector-select {
      width: 100%;
      min-height: 50px;
      padding: 0 13px;
      border: 1px solid #d4ddd8;
      border-radius: 12px;
      background: #ffffff;
      color: #111111;
      font-family: inherit;
      font-size: 15px;
      outline: none;
      box-sizing: border-box;
    }

    .selector-select:focus {
      border-color: #16834b;
      box-shadow:
        0 0 0 3px
        rgba(22,131,75,.10);
    }

    #startEvaluationBtn {
      width: 100%;
      min-height: 52px;
      margin-top: 22px;
      border: none;
      border-radius: 12px;
      background: #16834b;
      color: #ffffff;
      font-family: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }

    #closeEvaluationSelector {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: #eeeeee;
      color: #222222;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }

  `;

  document.head.appendChild(style);
}


// ============================================================
// دکمه شناور
// ============================================================

function createFloatingEvaluationButton() {

  const old =
    document.getElementById(
      "floatingEvaluationBtn"
    );

  if (old) {
    old.remove();
  }

  const button =
    document.createElement("button");

  button.id =
    "floatingEvaluationBtn";

  button.type =
    "button";

  button.textContent =
    "＋ ارزیابی جدید";

  button.style.cssText = `

    position: fixed;
    bottom: 22px;
    right: 20px;
    z-index: 9990;
    min-height: 52px;
    padding: 0 20px;
    border: none;
    border-radius: 15px;
    background: #16834b;
    color: #ffffff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 800;
    box-shadow: 0 8px 25px rgba(0,0,0,.20);
    cursor: pointer;

  `;

  button.addEventListener(
    "click",
    openEvaluationSelector
  );

  document.body.appendChild(button);
}


// ============================================================
// شروع برنامه
// ============================================================

function initializeCoachEvaluation() {

  loadEvaluations();

  addEvaluationHistoryStyle();

  createFloatingEvaluationButton();

  renderEvaluations();

}


// ============================================================
// اجرای اولیه
// ============================================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeCoachEvaluation
  );

} else {

  initializeCoachEvaluation();

}


// ============================================================
// دسترسی فایل‌های دیگر
// ============================================================

window.createEvaluationModal =
  createEvaluationModal;

window.saveNewEvaluation =
  saveNewEvaluation;

window.loadEvaluations =
  loadEvaluations;

window.renderEvaluations =
  renderEvaluations;

window.refreshEvaluationHistory =
  refreshEvaluationHistory;

window.openNewEvaluationForAthlete =
  openNewEvaluationForAthlete;

window.openEvaluationSelector =
  openEvaluationSelector;

window.addEvaluationButtonToAthleteCard =
  addEvaluationButtonToAthleteCard;

window.createFloatingEvaluationButton =
  createFloatingEvaluationButton;
