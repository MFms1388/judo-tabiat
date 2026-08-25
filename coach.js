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
