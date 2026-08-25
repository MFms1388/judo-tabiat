// ======================================
// SLIDER VERSION - CREATE EVALUATION MODAL
// ======================================

function createEvaluationModal(athleteId, periodId) {

  // حذف پنجره قبلی
  const oldModal = document.getElementById("newEvaluationModal");

  if (oldModal) {
    oldModal.remove();
  }

  // پیدا کردن ورزشکار
  const athlete = athletes.find(
    item => item.id === athleteId
  );

  // پیدا کردن دوره
  const period = evaluationPeriods.find(
    item => item.id === periodId
  );

  const athleteName = athlete
    ? [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ")
    : "ورزشکار";

  // ======================================
  // CSS
  // ======================================

  const oldStyle = document.getElementById(
    "evaluation-modal-style"
  );

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

      background: rgba(0, 0, 0, 0.60) !important;

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

      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.30) !important;
    }

    #newEvaluationModal h2,
    #newEvaluationModal p,
    #newEvaluationModal strong,
    #newEvaluationModal label,
    #newEvaluationModal span,
    #newEvaluationModal div {
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

    /* ======================================
       کارت هر معیار
       ====================================== */

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

      line-height: 1 !important;
    }

    .evaluation-criterion-description {
      color: #555555 !important;

      font-size: 13px !important;

      line-height: 1.7 !important;

      margin-bottom: 12px !important;
    }

    /* ======================================
       نوار امتیاز ۰ تا ۱۰
       ====================================== */

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

      box-shadow:
        0 2px 7px rgba(0, 0, 0, 0.30) !important;

      cursor: pointer !important;
    }

    .evaluation-range::-moz-range-thumb {
      width: 30px !important;

      height: 30px !important;

      border-radius: 50% !important;

      background: #16834b !important;

      border: 4px solid #ffffff !important;

      box-shadow:
        0 2px 7px rgba(0, 0, 0, 0.30) !important;

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

    /* ======================================
       توضیحات مربی
       ====================================== */

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
    }

    #newEvaluationNotes::placeholder {
      color: #777777 !important;
    }

    /* ======================================
       امتیاز نهایی
       ====================================== */

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

    /* ======================================
       دکمه ثبت
       ====================================== */

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
      opacity: 0.6 !important;

      cursor: wait !important;
    }

    /* ======================================
       دکمه بستن
       ====================================== */

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

  // ======================================
  // ساخت معیارها
  // ======================================

  const criteriaHTML = evaluationCriteria
    .map(criterion => {

      return `

        <div class="evaluation-criterion">

          <div class="evaluation-criterion-top">

            <div class="evaluation-criterion-name">
              ${escapeHTML(criterion.name)}
            </div>

            <div
              class="evaluation-criterion-value"
              id="scoreValue-${criterion.id}"
            >
              ۰
            </div>

          </div>

          ${
            criterion.description
              ? `
                <div class="evaluation-criterion-description">
                  ${escapeHTML(criterion.description)}
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
            data-criterion-id="${escapeHTML(criterion.id)}"
            data-value-id="scoreValue-${criterion.id}"
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
    })
    .join("");

  // ======================================
  // ساخت Modal
  // ======================================

  const modal = document.createElement("div");

  modal.id = "newEvaluationModal";

  modal.innerHTML = `

    <div class="evaluation-modal-card">

      <button
        type="button"
        id="closeNewEvaluationModal"
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
            ${escapeHTML(athleteName)}
          </strong>

          <br>

          دوره:
          <strong>
            ${
              period
                ? escapeHTML(period.title)
                : ""
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

  // ======================================
  // مدیریت نوارهای امتیاز
  // ======================================

  const scoreInputs =
    modal.querySelectorAll(".evaluation-range");

  function updateTotal() {

    let total = 0;

    scoreInputs.forEach(input => {

      let value = Number(input.value);

      if (Number.isNaN(value)) {
        value = 0;
      }

      value = Math.max(
        0,
        Math.min(10, value)
      );

      total += value;

      const valueId =
        input.dataset.valueId;

      const valueElement =
        modal.querySelector(`#${valueId}`);

      if (valueElement) {

        valueElement.textContent =
          toPersianNumber(
            value.toFixed(1)
          );

      }

    });

    const average =
      scoreInputs.length > 0
        ? total / scoreInputs.length
        : 0;

    const totalElement =
      modal.querySelector("#newEvaluationTotal");

    if (totalElement) {

      totalElement.textContent =
        toPersianNumber(
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

  // ======================================
  // بستن پنجره
  // ======================================

  const closeBtn =
    modal.querySelector(
      "#closeNewEvaluationModal"
    );

  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      () => {
        modal.remove();
      }
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

  // ======================================
  // ثبت ارزیابی
  // ======================================

  const saveBtn =
    modal.querySelector(
      "#saveNewEvaluationBtn"
    );

  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      async () => {

        await saveNewEvaluation(
          athleteId,
          periodId,
          scoreInputs,
          saveBtn
        );

      }
    );

  }

}


// ======================================
// SAVE NEW EVALUATION
// ======================================

async function saveNewEvaluation(
  athleteId,
  periodId,
  scoreInputs,
  saveBtn
) {

  try {

    saveBtn.disabled = true;

    saveBtn.textContent =
      "در حال ثبت...";

    const scores = [];

    scoreInputs.forEach(input => {

      scores.push({

        criterion_id:
          input.dataset.criterionId,

        score:
          Number(input.value)

      });

    });

    // ======================================
    // محاسبه امتیاز نهایی
    // ======================================

    const total =
      scores.length > 0
        ? scores.reduce(
            (sum, item) =>
              sum + item.score,
            0
          ) / scores.length
        : 0;

    // ======================================
    // توضیحات مربی
    // ======================================

    const notesElement =
      document.getElementById(
        "newEvaluationNotes"
      );

    const notes =
      notesElement
        ? notesElement.value.trim()
        : "";

    // ======================================
    // ساخت ارزیابی
    // ======================================

    const evaluation = {

      id:
        crypto.randomUUID(),

      athlete_id:
        athleteId,

      period_id:
        periodId,

      scores:
        scores,

      total_score:
        Number(total.toFixed(2)),

      notes:
        notes,

      created_at:
        new Date().toISOString()

    };

    // ======================================
    // ساخت آرایه ارزیابی‌ها
    // ======================================

    if (
      typeof evaluations === "undefined"
    ) {

      window.evaluations = [];

    }

    // جلوگیری از خطا
    if (!Array.isArray(evaluations)) {

      window.evaluations = [];

    }

    // ======================================
    // ذخیره
    // ======================================

    evaluations.push(
      evaluation
    );

    localStorage.setItem(
      "evaluations",
      JSON.stringify(evaluations)
    );

    // ======================================
    // بستن Modal
    // ======================================

    const modal =
      document.getElementById(
        "newEvaluationModal"
      );

    if (modal) {
      modal.remove();
    }

    // ======================================
    // بروزرسانی صفحه
    // ======================================

    if (
      typeof renderEvaluations ===
      "function"
    ) {

      renderEvaluations();

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

    saveBtn.disabled = false;

    saveBtn.textContent =
      "ثبت ارزیابی";

  }

}
// ======================================
// LOAD SAVED EVALUATIONS
// ======================================

function loadEvaluations() {

  try {

    const saved =
      localStorage.getItem("evaluations");

    if (!saved) {
      window.evaluations = [];
      return;
    }

    const parsed =
      JSON.parse(saved);

    if (Array.isArray(parsed)) {
      window.evaluations = parsed;
    } else {
      window.evaluations = [];
    }

  } catch (error) {

    console.error(
      "خطا در بارگذاری ارزیابی‌ها:",
      error
    );

    window.evaluations = [];

  }

}


// ======================================
// INITIALIZE EVALUATIONS
// ======================================

loadEvaluations();
// ======================================
// RENDER EVALUATIONS HISTORY
// ======================================

function renderEvaluations() {

  const container =
    document.getElementById("evaluationsContainer");

  if (!container) return;

  loadEvaluations();

  if (!evaluations.length) {

    container.innerHTML = `
      <div style="
        padding:25px;
        text-align:center;
        color:#777;
      ">
        هنوز هیچ ارزیابی‌ای ثبت نشده است.
      </div>
    `;

    return;
  }

  container.innerHTML = evaluations
    .slice()
    .reverse()
    .map(evaluation => {

      const athlete =
        athletes.find(
          athlete =>
            athlete.id === evaluation.athlete_id
        );

      const period =
        evaluationPeriods.find(
          period =>
            period.id === evaluation.period_id
        );

      const athleteName = athlete
        ? [
            athlete.first_name,
            athlete.last_name
          ]
            .filter(Boolean)
            .join(" ")
        : "ورزشکار";

      const periodName =
        period
          ? period.title
          : "دوره نامشخص";

      const score =
        Number(evaluation.total_score || 0);

      return `
        <div class="evaluation-history-card">

          <div>
            <strong>
              ${escapeHTML(athleteName)}
            </strong>

            <div>
              ${escapeHTML(periodName)}
            </div>
          </div>

          <div class="evaluation-history-score">
            ${toPersianNumber(score.toFixed(2))}
            <small>/ ۱۰</small>
          </div>

        </div>
      `;

    })
    .join("");
}
// ======================================
// EVALUATION HISTORY STYLE
// ======================================

(function addEvaluationHistoryStyle() {

  if (document.getElementById("evaluation-history-style")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "evaluation-history-style";

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

      box-shadow:
        0 4px 15px rgba(0,0,0,0.06);
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
      font-size: 11px;

      color: #16834b !important;
    }

  `;

  document.head.appendChild(style);

})();
// ======================================
// CONNECT EVALUATION HISTORY
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  loadEvaluations();

  if (
    typeof renderEvaluations === "function"
  ) {
    renderEvaluations();
  }

});


// ======================================
// REFRESH AFTER NEW EVALUATION
// ======================================

function refreshEvaluationHistory() {

  loadEvaluations();

  if (
    typeof renderEvaluations === "function"
  ) {
    renderEvaluations();
  }

}


// ======================================
// AUTO REFRESH
// ======================================

window.refreshEvaluationHistory =
  refreshEvaluationHistory;
// ======================================
// CONNECT EVALUATION BUTTON
// ======================================

function openNewEvaluationForAthlete(athleteId) {

  // اگر دوره‌ای وجود ندارد
  if (
    typeof evaluationPeriods === "undefined" ||
    !Array.isArray(evaluationPeriods) ||
    evaluationPeriods.length === 0
  ) {

    alert("ابتدا حداقل یک دوره ارزیابی ایجاد کنید.");

    return;
  }

  // آخرین دوره
  const period =
    evaluationPeriods[
      evaluationPeriods.length - 1
    ];

  // باز کردن Modal ارزیابی
  createEvaluationModal(
    athleteId,
    period.id
  );
}


// ======================================
// اضافه کردن دکمه ارزیابی به کارت ورزشکار
// ======================================

function addEvaluationButtonToAthleteCard(
  athleteId,
  card
) {

  if (!card) {
    return;
  }

  // جلوگیری از ایجاد دکمه تکراری
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


// ======================================
// دکمه ارزیابی شناور
// ======================================

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

  button.type = "button";

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

    box-shadow:
      0 8px 25px rgba(0,0,0,.20);

    cursor: pointer;
  `;

  button.addEventListener(
    "click",
    () => {

      if (
        typeof athletes === "undefined" ||
        !Array.isArray(athletes) ||
        athletes.length === 0
      ) {

        alert(
          "ابتدا یک ورزشکار اضافه کنید."
        );

        return;
      }

      // انتخاب ورزشکار
      const athlete =
        athletes[0];

      openNewEvaluationForAthlete(
        athlete.id
      );

    }
  );

  document.body.appendChild(button);
}


// ======================================
// اجرای دکمه شناور
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    createFloatingEvaluationButton();

  }
);
// ======================================
// SELECT ATHLETE + PERIOD MODAL
// ======================================

function openEvaluationSelector() {

  // حذف پنجره قبلی
  const oldModal =
    document.getElementById(
      "evaluationSelectorModal"
    );

  if (oldModal) {
    oldModal.remove();
  }

  // بررسی ورزشکارها
  if (
    typeof athletes === "undefined" ||
    !Array.isArray(athletes) ||
    athletes.length === 0
  ) {

    alert(
      "ابتدا حداقل یک ورزشکار اضافه کنید."
    );

    return;
  }

  // بررسی دوره‌ها
  if (
    typeof evaluationPeriods === "undefined" ||
    !Array.isArray(evaluationPeriods) ||
    evaluationPeriods.length === 0
  ) {

    alert(
      "ابتدا حداقل یک دوره ارزیابی ایجاد کنید."
    );

    return;
  }

  // ======================================
  // CSS
  // ======================================

  const style =
    document.createElement("style");

  style.id =
    "evaluation-selector-style";

  const oldStyle =
    document.getElementById(
      "evaluation-selector-style"
    );

  if (oldStyle) {
    oldStyle.remove();
  }

  style.textContent = `

    #evaluationSelectorModal {

      position: fixed;
      inset: 0;

      z-index: 99998;

      display: flex;

      align-items: center;
      justify-content: center;

      padding: 15px;

      background:
        rgba(0,0,0,.60);

      box-sizing: border-box;
    }

    .evaluation-selector-card {

      width: min(
        500px,
        100%
      );

      background: #ffffff;

      border-radius: 20px;

      padding: 24px;

      box-sizing: border-box;

      box-shadow:
        0 20px 60px
        rgba(0,0,0,.30);

      position: relative;
    }

    .evaluation-selector-card h2 {

      margin:
        0 0 6px 0;

      color: #111111;

      font-size: 23px;

      font-weight: 900;
    }

    .evaluation-selector-card
    .selector-subtitle {

      margin:
        0 0 22px 0;

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

      padding:
        0 13px;

      border:
        1px solid #d4ddd8;

      border-radius: 12px;

      background: #ffffff;

      color: #111111;

      font-family: inherit;

      font-size: 15px;

      outline: none;
    }

    .selector-select:focus {

      border-color:
        #16834b;

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

  // ======================================
  // لیست ورزشکارها
  // ======================================

  const athleteOptions =
    athletes
      .map(athlete => {

        const name = [
          athlete.first_name,
          athlete.last_name
        ]
          .filter(Boolean)
          .join(" ");

        return `
          <option
            value="${escapeHTML(
              athlete.id
            )}"
          >
            ${escapeHTML(
              name || "بدون نام"
            )}
          </option>
        `;

      })
      .join("");

  // ======================================
  // لیست دوره‌ها
  // ======================================

  const periodOptions =
    evaluationPeriods
      .map(period => {

        return `
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
        `;

      })
      .join("");

  // ======================================
  // ساخت Modal
  // ======================================

  const modal =
    document.createElement("div");

  modal.id =
    "evaluationSelectorModal";

  modal.innerHTML = `

    <div
      class="evaluation-selector-card"
    >

      <button
        type="button"
        id="closeEvaluationSelector"
      >
        ×
      </button>

      <h2>
        ارزیابی جدید
      </h2>

      <p
        class="selector-subtitle"
      >
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

  // ======================================
  // بستن
  // ======================================

  const closeBtn =
    modal.querySelector(
      "#closeEvaluationSelector"
    );

  closeBtn.addEventListener(
    "click",
    () => {

      modal.remove();

    }
  );

  // بستن با کلیک بیرون
  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        modal.remove();

      }

    }
  );

  // ======================================
  // شروع ارزیابی
  // ======================================

  const startBtn =
    modal.querySelector(
      "#startEvaluationBtn"
    );

  startBtn.addEventListener(
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

      // بستن انتخاب‌گر
      modal.remove();

      // باز کردن فرم اصلی ارزیابی
      createEvaluationModal(
        athleteId,
        periodId
      );

    }
  );
}


// ======================================
// تغییر دکمه شناور قبلی
// ======================================

function replaceFloatingEvaluationButton() {

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

    padding:
      0 20px;

    border: none;

    border-radius: 15px;

    background: #16834b;

    color: #ffffff;

    font-family: inherit;

    font-size: 15px;

    font-weight: 800;

    box-shadow:
      0 8px 25px
      rgba(0,0,0,.20);

    cursor: pointer;

  `;

  button.addEventListener(
    "click",
    () => {

      openEvaluationSelector();

    }
  );

  document.body.appendChild(
    button
  );
}


// ======================================
// اجرا
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    replaceFloatingEvaluationButton();

  }
);
