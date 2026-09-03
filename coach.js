/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   FINAL - COMPLETE & FIXED
   + ATHLETE RANKING
   + ACHIEVEMENTS
   + EVALUATIONS
   + ATTENDANCE
   + EVENTS
   + ANNOUNCEMENTS
   + COMPETITIONS
   2026.09
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    window.SUPABASE_KEY || "";

  let supabaseClient = null;

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
    SUPABASE_KEY
  ) {
    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
  }

  /* =======================================================
     STATE
  ======================================================= */

  const state = {
    athletes: [],
    evaluations: [],
    evaluationPeriods: [],
    evaluationCriteria: [],
    evaluationScores: [],

    achievements: [],
    attendance: [],

    announcements: [],
    competitions: [],

    tests: [],
    progressHistory: [],

    settings: {},

    editingAthleteId: null,
    editingEvaluationId: null,
    editingAchievementId: null,
    editingAnnouncementId: null,
    editingCompetitionId: null
  };

  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = id =>
    document.getElementById(id);

  const $$ = selector =>
    document.querySelectorAll(selector);

  function faNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "۰";
    }

    return String(value)
      .replace(/0/g, "۰")
      .replace(/1/g, "۱")
      .replace(/2/g, "۲")
      .replace(/3/g, "۳")
      .replace(/4/g, "۴")
      .replace(/5/g, "۵")
      .replace(/6/g, "۶")
      .replace(/7/g, "۷")
      .replace(/8/g, "۸")
      .replace(/9/g, "۹");
  }

  function today() {
    const d = new Date();

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function escapeHTML(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setText(id, value) {
    const el = $(id);

    if (el) {
      el.textContent =
        value ?? "";
    }
  }

  function setValue(id, value) {
    const el = $(id);

    if (el) {
      el.value =
        value ?? "";
    }
  }

  function getValue(id) {
    return (
      $(id)?.value ??
      ""
    );
  }

  function getAthleteName(athlete) {
    if (!athlete) {
      return "بدون نام";
    }

    return (
      athlete.name ||
      athlete.full_name ||
      athlete.athlete_name ||
      "بدون نام"
    );
  }

  function getAthlete(id) {
    return state.athletes.find(
      athlete =>
        String(athlete.id) ===
        String(id)
    );
  }

  function isPresent(item) {
    return (
      item?.present === true ||
      item?.status === "present" ||
      item?.status === "حاضر"
    );
  }

  function showMessage(
    message,
    type = "success"
  ) {
    let box =
      $("coachMessage");

    if (!box) {
      box =
        document.createElement("div");

      box.id =
        "coachMessage";

      Object.assign(
        box.style,
        {
          position: "fixed",
          left: "20px",
          bottom: "20px",
          zIndex: "999999",
          padding: "13px 18px",
          borderRadius: "12px",
          fontSize: "13px",
          fontWeight: "700",
          boxShadow:
            "0 10px 30px rgba(0,0,0,.15)"
        }
      );

      document.body.appendChild(box);
    }

    box.textContent =
      message;

    box.style.background =
      type === "error"
        ? "#fef2f2"
        : "#ecfdf3";

    box.style.color =
      type === "error"
        ? "#dc2626"
        : "#027a48";

    clearTimeout(
      box._timer
    );

    box._timer =
      setTimeout(() => {
        box.remove();
      }, 3000);
  }

  async function queryTable(
    table,
    options = {}
  ) {
    if (!supabaseClient) {
      return {
        data: [],
        error:
          new Error(
            "Supabase connection is not available."
          )
      };
    }

    let query =
      supabaseClient
        .from(table)
        .select(
          options.select || "*"
        );

    if (options.order) {
      query =
        query.order(
          options.order.column,
          {
            ascending:
              options.order
                .ascending ?? false
          }
        );
    }

    if (options.limit) {
      query =
        query.limit(
          options.limit
        );
    }

    return await query;
  }

  function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";
  }

  function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove(
      "hidden"
    );

    modal.style.display =
      "flex";
  }

  function closeAllModals() {
    [
      "athleteModal",
      "evaluationModal",
      "attendanceModal",
      "achievementModal",
      "announcementModal",
      "competitionModal"
    ].forEach(closeModal);
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {
    $$(".nav-item").forEach(
      item => {
        item.addEventListener(
          "click",
          () => {
            const pageName =
              item.dataset.page;

            $$(".nav-item").forEach(
              nav =>
                nav.classList.remove(
                  "active"
                )
            );

            item.classList.add(
              "active"
            );

            $$(".coach-page").forEach(
              page =>
                page.classList.remove(
                  "active"
                )
            );

            const page =
              $(
                `page-${pageName}`
              );

            if (page) {
              page.classList.add(
                "active"
              );
            }

            if (
              pageName ===
              "ranking"
            ) {
              renderRanking();
            }
          }
        );
      }
    );
  }

  /* =======================================================
     EVENT TABS
  ======================================================= */

  function setupEventTabs() {
    $$(".events-tab").forEach(
      tab => {
        tab.addEventListener(
          "click",
          () => {
            $$(".events-tab").forEach(
              t =>
                t.classList.remove(
                  "active"
                )
            );

            tab.classList.add(
              "active"
            );

            $(
              "#eventsPanelAnnouncements"
            )?.classList.remove(
              "active"
            );

            $(
              "#eventsPanelCompetitions"
            )?.classList.remove(
              "active"
            );

            if (
              tab.dataset.eventsTab ===
              "announcements"
            ) {
              $(
                "#eventsPanelAnnouncements"
              )?.classList.add(
                "active"
              );
            }

            if (
              tab.dataset.eventsTab ===
              "competitions"
            ) {
              $(
                "#eventsPanelCompetitions"
              )?.classList.add(
                "active"
              );
            }
          }
        );
      }
    );
  }

  /* =======================================================
     MODALS
  ======================================================= */

  function setupModals() {
    const openers = {
      addAthleteBtn:
        "athleteModal",

      addEvaluationBtn:
        "evaluationModal",

      addAttendanceBtn:
        "attendanceModal",

      addAchievementBtn:
        "achievementModal",

      addAnnouncementBtn:
        "announcementModal",

      addCompetitionBtn:
        "competitionModal"
    };

    Object.entries(openers)
      .forEach(
        ([buttonId, modalId]) => {

          $(buttonId)
            ?.addEventListener(
              "click",
              () => {

                if (
                  modalId ===
                  "athleteModal"
                ) {
                  resetAthleteForm();
                }

                if (
                  modalId ===
                  "evaluationModal"
                ) {
                  resetEvaluationForm();
                }

                if (
                  modalId ===
                  "attendanceModal"
                ) {
                  resetAttendanceForm();
                }

                if (
                  modalId ===
                  "achievementModal"
                ) {
                  resetAchievementForm();
                }

                if (
                  modalId ===
                  "announcementModal"
                ) {
                  resetAnnouncementForm();
                }

                if (
                  modalId ===
                  "competitionModal"
                ) {
                  resetCompetitionForm();
                }

                openModal(
                  modalId
                );
              }
            );
        }
      );

    const closers = [
      [
        "closeAthleteModal",
        "athleteModal"
      ],
      [
        "cancelAthleteBtn",
        "athleteModal"
      ],
      [
        "closeEvaluationModal",
        "evaluationModal"
      ],
      [
        "cancelEvaluationBtn",
        "evaluationModal"
      ],
      [
        "closeAttendanceModal",
        "attendanceModal"
      ],
      [
        "cancelAttendanceBtn",
        "attendanceModal"
      ],
      [
        "closeAchievementModal",
        "achievementModal"
      ],
      [
        "cancelAchievementBtn",
        "achievementModal"
      ],
      [
        "closeAnnouncementModal",
        "announcementModal"
      ],
      [
        "cancelAnnouncementBtn",
        "announcementModal"
      ],
      [
        "closeCompetitionModal",
        "competitionModal"
      ],
      [
        "cancelCompetitionBtn",
        "competitionModal"
      ]
    ];

    closers.forEach(
      ([buttonId, modalId]) => {
        $(buttonId)
          ?.addEventListener(
            "click",
            () =>
              closeModal(
                modalId
              )
          );
      }
    );

    [
      "athleteModal",
      "evaluationModal",
      "attendanceModal",
      "achievementModal",
      "announcementModal",
      "competitionModal"
    ].forEach(id => {

      $(id)?.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            $(id)
          ) {
            closeModal(id);
          }

        }
      );

    });
  }

  /* =======================================================
     ATHLETES
  ======================================================= */

  async function loadAthletes() {
    if (!supabaseClient) {
      state.athletes = [];

      renderAthletes();

      return;
    }

    const result =
      await queryTable(
        "athletes",
        {
          order: {
            column:
              "created_at",
            ascending:
              false
          }
        }
      );

    if (result.error) {
      console.error(
        "Athletes:",
        result.error
      );

      state.athletes = [];

      renderAthletes();

      return;
    }

    state.athletes =
      result.data || [];

    renderAthletes();

    fillAthleteSelects();

    updateDashboard();

    renderRanking();
  }

  function renderAthletes() {
    const container =
      $("athletesList");

    if (!container) return;

    const search =
      getValue(
        "athleteSearch"
      )
        .trim()
        .toLowerCase();

    let list =
      [...state.athletes];

    if (search) {
      list =
        list.filter(
          athlete => {

            const text = [
              getAthleteName(
                athlete
              ),
              athlete.weight,
              athlete.belt,
              athlete.category,
              athlete.age_group,
              athlete.national_id
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return text.includes(
              search
            );
          }
        );
    }

    if (!list.length) {
      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            👥
          </div>

          <h2>
            ورزشکاری پیدا نشد
          </h2>

          <p>
            هنوز ورزشکاری در سیستم ثبت نشده است.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div class="simple-grid">

        ${list.map(
          athlete => `
            <div class="simple-box">

              <h3>
                👤
                ${escapeHTML(
                  getAthleteName(
                    athlete
                  )
                )}
              </h3>

              <p>
                وزن:
                ${escapeHTML(
                  athlete.weight ??
                  "-"
                )}
              </p>

              <p>
                کمربند:
                ${escapeHTML(
                  athlete.belt ??
                  "-"
                )}
              </p>

              <p>
                رده:
                ${escapeHTML(
                  athlete.category ??
                  athlete.age_group ??
                  "-"
                )}
              </p>

              <div class="event-actions">

                <button
                  type="button"
                  data-edit-athlete="${escapeHTML(
                    athlete.id
                  )}"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  data-delete-athlete="${escapeHTML(
                    athlete.id
                  )}"
                >
                  🗑️
                </button>

              </div>

            </div>
          `
        ).join("")}

      </div>
    `;

    bindAthleteActions();
  }

  function fillAthleteSelects() {
    const ids = [
      "achievementAthlete",
      "evaluationAthlete",
      "attendanceAthlete"
    ];

    ids.forEach(id => {

      const select = $(id);

      if (!select) return;

      select.innerHTML = `
        <option value="">
          انتخاب ورزشکار
        </option>

        ${state.athletes
          .map(
            athlete => `
              <option
                value="${escapeHTML(
                  athlete.id
                )}"
              >
                ${escapeHTML(
                  getAthleteName(
                    athlete
                  )
                )}
              </option>
            `
          )
          .join("")}
      `;

    });
  }

  function setupAthleteSearch() {
    $("athleteSearch")
      ?.addEventListener(
        "input",
        renderAthletes
      );
  }

  function resetAthleteForm() {
    [
      "athleteName",
      "athleteFullName",
      "athleteWeight",
      "athleteBelt",
      "athleteCategory",
      "athleteAgeGroup",
      "athleteBirthDate",
      "athletePhone",
      "athleteNationalId",
      "athleteDescription"
    ].forEach(id => {
      setValue(id, "");
    });

    state.editingAthleteId =
      null;

    setText(
      "saveAthleteBtn",
      "👤 ثبت ورزشکار"
    );
  }

  function bindAthleteActions() {
    $$("[data-edit-athlete]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editAthlete(
              button.dataset
                .editAthlete
            )
        );

      });

    $$("[data-delete-athlete]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteAthlete(
              button.dataset
                .deleteAthlete
            )
        );

      });
  }

  function editAthlete(id) {
    const athlete =
      getAthlete(id);

    if (!athlete) return;

    state.editingAthleteId =
      id;

    setValue(
      "athleteName",
      athlete.name
    );

    setValue(
      "athleteFullName",
      athlete.full_name
    );

    setValue(
      "athleteWeight",
      athlete.weight
    );

    setValue(
      "athleteBelt",
      athlete.belt
    );

    setValue(
      "athleteCategory",
      athlete.category
    );

    setValue(
      "athleteAgeGroup",
      athlete.age_group
    );

    setValue(
      "athleteBirthDate",
      athlete.birth_date
    );

    setValue(
      "athletePhone",
      athlete.phone
    );

    setValue(
      "athleteNationalId",
      athlete.national_id
    );

    setValue(
      "athleteDescription",
      athlete.description
    );

    setText(
      "saveAthleteBtn",
      "💾 ذخیره تغییرات"
    );

    openModal(
      "athleteModal"
    );
  }

  async function saveAthlete() {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const name =
      getValue(
        "athleteName"
      ).trim();

    if (!name) {
      showMessage(
        "نام ورزشکار را وارد کنید.",
        "error"
      );
      return;
    }

    const payload = {
      name,

      full_name:
        getValue(
          "athleteFullName"
        ).trim() || null,

      weight:
        getValue(
          "athleteWeight"
        ).trim() || null,

      belt:
        getValue(
          "athleteBelt"
        ).trim() || null,

      category:
        getValue(
          "athleteCategory"
        ).trim() || null,

      age_group:
        getValue(
          "athleteAgeGroup"
        ).trim() || null,

      birth_date:
        getValue(
          "athleteBirthDate"
        ) || null,

      phone:
        getValue(
          "athletePhone"
        ).trim() || null,

      national_id:
        getValue(
          "athleteNationalId"
        ).trim() || null,

      description:
        getValue(
          "athleteDescription"
        ).trim() || null
    };

    let result;

    if (
      state.editingAthleteId
    ) {

      result =
        await supabaseClient
          .from("athletes")
          .update(payload)
          .eq(
            "id",
            state.editingAthleteId
          );

    } else {

      result =
        await supabaseClient
          .from("athletes")
          .insert(payload);

    }

    if (result.error) {
      console.error(
        "Athlete save:",
        result.error
      );

      showMessage(
        "ذخیره ورزشکار انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      state.editingAthleteId
        ? "اطلاعات ورزشکار ویرایش شد."
        : "ورزشکار ثبت شد."
    );

    closeModal(
      "athleteModal"
    );

    resetAthleteForm();

    await loadAthletes();
  }

  async function deleteAthlete(id) {
    if (
      !confirm(
        "آیا از حذف این ورزشکار مطمئن هستید؟"
      )
    ) {
      return;
    }

    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const result =
      await supabaseClient
        .from("athletes")
        .delete()
        .eq(
          "id",
          id
        );

    if (result.error) {
      console.error(
        "Athlete delete:",
        result.error
      );

      showMessage(
        "حذف ورزشکار انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      "ورزشکار حذف شد."
    );

    await loadAthletes();

    await Promise.all([
      loadEvaluations(),
      loadAchievements(),
      loadAttendance()
    ]);
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  function updateDashboard() {
    setText(
      "dashboardAthletes",
      faNumber(
        state.athletes.length
      )
    );

    setText(
      "dashboardEvaluations",
      faNumber(
        state.evaluations.length
      )
    );

    setText(
      "dashboardAchievements",
      faNumber(
        state.achievements.length
      )
    );

    const todayRecords =
      state.attendance.filter(
        item =>
          (
            item.date ||
            item.attendance_date
          ) === today()
      );

    const present =
      todayRecords.filter(
        isPresent
      ).length;

    setText(
      "dashboardAttendance",
      faNumber(
        present
      )
    );
  }

  /* =======================================================
     EVALUATION PERIODS
  ======================================================= */

  async function loadEvaluationPeriods() {
    const result =
      await queryTable(
        "evaluation_periods",
        {
          order: {
            column:
              "created_at",
            ascending:
              false
          }
        }
      );

    state.evaluationPeriods =
      result.error
        ? []
        : result.data || [];

    renderEvaluationPeriods();
  }

  function renderEvaluationPeriods() {
    const select =
      $("evaluationPeriod");

    if (!select) return;

    select.innerHTML = `
      <option value="">
        انتخاب دوره
      </option>

      ${state.evaluationPeriods
        .map(
          period => `
            <option
              value="${escapeHTML(
                period.id
              )}"
            >
              ${escapeHTML(
                period.name ||
                period.title ||
                period.period_name ||
                "دوره"
              )}
            </option>
          `
        )
        .join("")}
    `;
  }

  /* =======================================================
     EVALUATION CRITERIA
  ======================================================= */

  async function loadEvaluationCriteria() {
    const result =
      await queryTable(
        "evaluation_criteria",
        {
          order: {
            column:
              "created_at",
            ascending:
              true
          }
        }
      );

    state.evaluationCriteria =
      result.error
        ? []
        : result.data || [];

    renderEvaluationCriteria();

    renderEvaluationScoreInputs();
  }

  function renderEvaluationCriteria() {
    const container =
      $("evaluationCriteriaList");

    if (!container) return;

    if (
      !state.evaluationCriteria.length
    ) {
      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📋
          </div>

          <h2>
            معیاری ثبت نشده است
          </h2>

          <p>
            هنوز معیار ارزیابی تعریف نشده است.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML =
      state.evaluationCriteria
        .map(
          criterion => `
            <div class="simple-box">

              <h3>
                📋
                ${escapeHTML(
                  criterion.name ||
                  criterion.title ||
                  "معیار"
                )}
              </h3>

              <p>
                امتیازدهی از ۰ تا ۱۰
              </p>

            </div>
          `
        )
        .join("");
  }

  /* =======================================================
     EVALUATION SCORES
  ======================================================= */

  async function loadEvaluationScores() {
    const result =
      await queryTable(
        "evaluation_scores",
        {
          order: {
            column:
              "created_at",
            ascending:
              false
          }
        }
      );

    state.evaluationScores =
      result.error
        ? []
        : result.data || [];

    renderRanking();
  }

  function renderEvaluationScoreInputs() {
    const container =
      $("evaluationScoresList");

    if (!container) return;

    if (
      !state.evaluationCriteria.length
    ) {
      container.innerHTML = `
        <div class="evaluation-empty">
          هنوز معیاری برای ارزیابی تعریف نشده است.
        </div>
      `;

      return;
    }

    container.innerHTML =
      state.evaluationCriteria
        .map(
          criterion => `
            <div class="evaluation-score-row">

              <label>
                ${escapeHTML(
                  criterion.name ||
                  criterion.title ||
                  "معیار"
                )}
              </label>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                class="evaluation-score-input"
                data-criterion-id="${escapeHTML(
                  criterion.id
                )}"
                value="0"
              />

            </div>
          `
        )
        .join("");
  }

  /* =======================================================
     EVALUATIONS
  ======================================================= */

  async function loadEvaluations() {
    const result =
      await queryTable(
        "evaluations",
        {
          order: {
            column:
              "created_at",
            ascending:
              false
          }
        }
      );

    if (result.error) {
      console.error(
        "Evaluations:",
        result.error
      );

      state.evaluations = [];
    } else {
      state.evaluations =
        result.data || [];
    }

    renderEvaluations();

    updateDashboard();

    renderRanking();
  }

  function renderEvaluations() {
    const container =
      $("evaluationsList");

    if (!container) return;

    if (
      !state.evaluations.length
    ) {
      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📊
          </div>

          <h2>
            ارزیابی‌ای ثبت نشده است
          </h2>

          <p>
            برای شروع، یک ارزیابی جدید ایجاد کنید.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML =
      state.evaluations
        .map(item => {

          const athlete =
            getAthlete(
              item.athlete_id
            );

          const period =
            state.evaluationPeriods
              .find(
                p =>
                  String(p.id) ===
                  String(
                    item.period_id
                  )
              );

          return `
            <div class="simple-box">

              <h3>
                📊
                ${escapeHTML(
                  getAthleteName(
                    athlete
                  )
                )}
              </h3>

              <p>
                دوره:
                ${escapeHTML(
                  period?.name ||
                  item.period_name ||
                  "-"
                )}
              </p>

              <p>
                امتیاز:
                ${escapeHTML(
                  item.total_score ??
                  item.score ??
                  "-"
                )}
                از ۱۰
              </p>

              <p>
                تاریخ:
                ${escapeHTML(
                  item.date ||
                  item.created_at ||
                  "-"
                )}
              </p>

              <div class="event-actions">

                <button
                  type="button"
                  data-delete-evaluation="${escapeHTML(
                    item.id
                  )}"
                >
                  🗑️
                </button>

              </div>

            </div>
          `;
        })
        .join("");

    $$("[data-delete-evaluation]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteEvaluation(
              button.dataset
                .deleteEvaluation
            )
        );

      });
  }

  function resetEvaluationForm() {
    setValue(
      "evaluationAthlete",
      ""
    );

    setValue(
      "evaluationPeriod",
      ""
    );

    setValue(
      "evaluationDate",
      today()
    );

    state.editingEvaluationId =
      null;

    setText(
      "saveEvaluationBtn",
      "📊 ثبت ارزیابی"
    );

    renderEvaluationScoreInputs();
  }

  async function saveEvaluation() {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const athleteId =
      getValue(
        "evaluationAthlete"
      );

    if (!athleteId) {
      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );
      return;
    }

    const inputs =
      $$(
        ".evaluation-score-input"
      );

    const scores = [];

    inputs.forEach(input => {

      let value =
        Number(
          input.value
        );

      if (
        Number.isNaN(value)
      ) {
        value = 0;
      }

      value =
        Math.max(
          0,
          Math.min(
            10,
            value
          )
        );

      scores.push({
        criterion_id:
          input.dataset
            .criterionId,

        score:
          value
      });

    });

    if (!scores.length) {
      showMessage(
        "معیارهای ارزیابی وجود ندارد.",
        "error"
      );
      return;
    }

    const total =
      scores.reduce(
        (sum, item) =>
          sum +
          Number(
            item.score
          ),
        0
      );

    const average =
      total /
      scores.length;

    const evaluationPayload = {
      athlete_id:
        athleteId,

      period_id:
        getValue(
          "evaluationPeriod"
        ) || null,

      date:
        getValue(
          "evaluationDate"
        ) ||
        today(),

      total_score:
        Number(
          average.toFixed(2)
        ),

      score:
        Number(
          average.toFixed(2)
        )
    };

    let evaluationResult;

    if (
      state.editingEvaluationId
    ) {

      evaluationResult =
        await supabaseClient
          .from("evaluations")
          .update(
            evaluationPayload
          )
          .eq(
            "id",
            state.editingEvaluationId
          );

    } else {

      evaluationResult =
        await supabaseClient
          .from("evaluations")
          .insert(
            evaluationPayload
          )
          .select()
          .single();

    }

    if (
      evaluationResult.error
    ) {
      console.error(
        "Evaluation:",
        evaluationResult.error
      );

      showMessage(
        "ثبت ارزیابی انجام نشد.",
        "error"
      );

      return;
    }

    const evaluationId =
      state.editingEvaluationId ||
      evaluationResult.data?.id;

    /*
      اگر ارزیابی جدید است،
      جزئیات معیارها نیز ذخیره می‌شوند.
    */

    if (
      evaluationId &&
      scores.length &&
      !state.editingEvaluationId
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
          "Evaluation scores:",
          scoreResult.error
        );
      }
    }

    showMessage(
      state.editingEvaluationId
        ? "ارزیابی ویرایش شد."
        : "ارزیابی ثبت شد."
    );

    closeModal(
      "evaluationModal"
    );

    resetEvaluationForm();

    await Promise.all([
      loadEvaluations(),
      loadEvaluationScores()
    ]);
  }

  async function deleteEvaluation(id) {
    if (
      !confirm(
        "آیا از حذف این ارزیابی مطمئن هستید؟"
      )
    ) {
      return;
    }

    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    /*
      اول جزئیات ارزیابی حذف می‌شوند
      تا اگر FK وجود دارد خطا کمتر شود.
    */

    await supabaseClient
      .from(
        "evaluation_scores"
      )
      .delete()
      .eq(
        "evaluation_id",
        id
      );

    const result =
      await supabaseClient
        .from("evaluations")
        .delete()
        .eq(
          "id",
          id
        );

    if (result.error) {
      console.error(
        "Evaluation delete:",
        result.error
      );

      showMessage(
        "حذف ارزیابی انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      "ارزیابی حذف شد."
    );

    await Promise.all([
      loadEvaluations(),
      loadEvaluationScores()
    ]);
  }

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  async function loadAttendance() {
    const result =
      await queryTable(
        "attendance",
        {
          order: {
            column:
              "date",
            ascending:
              false
          }
        }
      );

    if (result.error) {
      console.error(
        "Attendance:",
        result.error
      );

      state.attendance = [];
    } else {
      state.attendance =
        result.data || [];
    }

    renderAttendance();

    updateAttendanceStats();

    updateDashboard();

    renderRanking();
  }

  function updateAttendanceStats() {
    const records =
      state.attendance.filter(
        item =>
          (
            item.date ||
            item.attendance_date
          ) === today()
      );

    const present =
      records.filter(
        isPresent
      ).length;

    const absent =
      records.length -
      present;

    setText(
      "attendancePresentCount",
      faNumber(present)
    );

    setText(
      "attendanceAbsentCount",
      faNumber(absent)
    );

    setText(
      "attendanceTotalCount",
      faNumber(
        records.length
      )
    );
  }

  function renderAttendance() {
    const container =
      $("attendanceList");

    if (!container) return;

    if (
      !state.attendance.length
    ) {
      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🗓️
          </div>

          <h2>
            حضور و غیابی ثبت نشده است
          </h2>

        </div>
      `;

      return;
    }

    container.innerHTML =
      state.attendance
        .slice(0, 100)
        .map(item => {

          const athlete =
            getAthlete(
              item.athlete_id
            );

          const present =
            isPresent(item);

          return `
            <div class="simple-box">

              <h3>
                👤
                ${escapeHTML(
                  getAthleteName(
                    athlete
                  )
                )}
              </h3>

              <p>
                تاریخ:
                ${escapeHTML(
                  item.date ||
                  item.attendance_date ||
                  "-"
                )}
              </p>

              <p>
                وضعیت:
                ${
                  present
                    ? "✅ حاضر"
                    : "❌ غایب"
                }
              </p>

            </div>
          `;
        })
        .join("");
  }

  function resetAttendanceForm() {
    setValue(
      "attendanceAthlete",
      ""
    );

    setValue(
      "attendanceDate",
      today()
    );

    setValue(
      "attendanceStatus",
      "present"
    );

    setValue(
      "attendanceDescription",
      ""
    );
  }

  async function saveAttendance() {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const athleteId =
      getValue(
        "attendanceAthlete"
      );

    if (!athleteId) {
      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );
      return;
    }

    const status =
      getValue(
        "attendanceStatus"
      ) ||
      "present";

    const payload = {
      athlete_id:
        athleteId,

      date:
        getValue(
          "attendanceDate"
        ) ||
        today(),

      status,

      present:
        status ===
        "present",

      description:
        getValue(
          "attendanceDescription"
        ).trim() ||
        null
    };

    const result =
      await supabaseClient
        .from("attendance")
        .insert(payload);

    if (result.error) {
      console.error(
        "Attendance:",
        result.error
      );

      showMessage(
        "ثبت حضور و غیاب انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      "حضور و غیاب ثبت شد."
    );

    closeModal(
      "attendanceModal"
    );

    resetAttendanceForm();

    await loadAttendance();
  }

  /* =======================================================
     ACHIEVEMENTS
  ======================================================= */

  async function loadAchievements() {
    const result =
      await queryTable(
        "achievements",
        {
          order: {
            column:
              "created_at",
            ascending:
              false
          }
        }
      );

    if (result.error) {
      console.error(
        "Achievements:",
        result.error
      );

      state.achievements = [];
    } else {
      state.achievements =
        result.data || [];
    }

    renderAchievements();

    updateAchievementStats();

    updateDashboard();

    renderRanking();
  }

  function medalType(item) {
    const value =
      String(
        item?.medal ??
        item?.medal_type ??
        item?.position ??
        item?.rank ??
        ""
      )
        .trim()
        .toLowerCase();

    if (
      value === "gold" ||
      value === "طلا" ||
      value === "طلایی" ||
      value === "1"
    ) {
      return "gold";
    }

    if (
      value === "silver" ||
      value === "نقره" ||
      value === "نقره‌ای" ||
      value === "2"
    ) {
      return "silver";
    }

    if (
      value === "bronze" ||
      value === "برنز" ||
      value === "برنزی" ||
      value === "3"
    ) {
      return "bronze";
    }

    return "other";
  }

  function updateAchievementStats() {
    const gold =
      state.achievements.filter(
        item =>
          medalType(item) ===
          "gold"
      ).length;

    const silver =
      state.achievements.filter(
        item =>
          medalType(item) ===
          "silver"
      ).length;

    const bronze =
      state.achievements.filter(
        item =>
          medalType(item) ===
          "bronze"
      ).length;

    setText(
      "goldAchievements",
      faNumber(gold)
    );

    setText(
      "silverAchievements",
      faNumber(silver)
    );

    setText(
      "bronzeAchievements",
      faNumber(bronze)
    );
  }

  function renderAchievements() {
    const container =
      $("achievementsList");

    if (!container) return;

    if (
      !state.achievements.length
    ) {
      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🏆
          </div>

          <h2>
            افتخاری ثبت نشده است
          </h2>

          <p>
            هنوز مقام یا افتخاری ثبت نشده است.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML =
      state.achievements
        .map(item => {

          const athlete =
            getAthlete(
              item.athlete_id
            );

          return `
            <div class="simple-box">

              <h3>
                🏆
                ${escapeHTML(
                  item.title ||
                  item.competition ||
                  item.name ||
                  "افتخار"
                )}
              </h3>

              <p>
                ورزشکار:
                ${escapeHTML(
                  getAthleteName(
                    athlete
                  )
                )}
              </p>

              <p>
                مقام:
                ${escapeHTML(
                  item.position ||
                  item.rank ||
                  item.medal ||
                  "-"
                )}
              </p>

              <p>
                مدال:
                ${escapeHTML(
                  item.medal ||
                  "-"
                )}
              </p>

              <p>
                تاریخ:
                ${escapeHTML(
                  item.date ||
                  "-"
                )}
              </p>

              <div class="event-actions">

                <button
                  type="button"
                  data-edit-achievement="${escapeHTML(
                    item.id
                  )}"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  data-delete-achievement="${escapeHTML(
                    item.id
                  )}"
                >
                  🗑️
                </button>

              </div>

            </div>
          `;
        })
        .join("");

    bindAchievementActions();
  }

  function resetAchievementForm() {
    [
      "achievementAthlete",
      "achievementTitle",
      "achievementCompetition",
      "achievementDate",
      "achievementPosition",
      "achievementDescription"
    ].forEach(id => {
      setValue(id, "");
    });

    setValue(
      "achievementMedal",
      "gold"
    );

    setValue(
      "achievementDate",
      today()
    );

    state.editingAchievementId =
      null;

    setText(
      "saveAchievementBtn",
      "🏆 ثبت افتخار"
    );
  }

  function bindAchievementActions() {
    $$("[data-delete-achievement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteAchievement(
              button.dataset
                .deleteAchievement
            )
        );

      });

    $$("[data-edit-achievement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editAchievement(
              button.dataset
                .editAchievement
            )
        );

      });
  }

  function editAchievement(id) {
    const item =
      state.achievements.find(
        x =>
          String(x.id) ===
          String(id)
      );

    if (!item) return;

    state.editingAchievementId =
      id;

    setValue(
      "achievementAthlete",
      item.athlete_id
    );

    setValue(
      "achievementTitle",
      item.title || ""
    );

    setValue(
      "achievementCompetition",
      item.competition || ""
    );

    setValue(
      "achievementDate",
      item.date || ""
    );

    setValue(
      "achievementPosition",
      item.position ||
      item.rank ||
      ""
    );

    setValue(
      "achievementMedal",
      item.medal ||
      item.medal_type ||
      "gold"
    );

    setValue(
      "achievementDescription",
      item.description ||
      ""
    );

    setText(
      "saveAchievementBtn",
      "💾 ذخیره تغییرات"
    );

    openModal(
      "achievementModal"
    );
  }

  async function saveAchievement() {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const athleteId =
      getValue(
        "achievementAthlete"
      );

    const title =
      getValue(
        "achievementTitle"
      ).trim();

    if (!athleteId) {
      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );
      return;
    }

    if (!title) {
      showMessage(
        "عنوان افتخار را وارد کنید.",
        "error"
      );
      return;
    }

    const payload = {
      athlete_id:
        athleteId,

      title,

      competition:
        getValue(
          "achievementCompetition"
        ).trim() ||
        null,

      date:
        getValue(
          "achievementDate"
        ) ||
        null,

      position:
        getValue(
          "achievementPosition"
        ).trim() ||
        null,

      medal:
        getValue(
          "achievementMedal"
        ) ||
        "gold",

      description:
        getValue(
          "achievementDescription"
        ).trim() ||
        null
    };

    let result;

    if (
      state.editingAchievementId
    ) {

      result =
        await supabaseClient
          .from("achievements")
          .update(payload)
          .eq(
            "id",
            state.editingAchievementId
          );

    } else {

      result =
        await supabaseClient
          .from("achievements")
          .insert(payload);

    }

    if (result.error) {
      console.error(
        "Achievement:",
        result.error
      );

      showMessage(
        "ذخیره افتخار انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      state.editingAchievementId
        ? "افتخار ویرایش شد."
        : "افتخار ثبت شد."
    );

    closeModal(
      "achievementModal"
    );

    resetAchievementForm();

    await loadAchievements();
  }

  async function deleteAchievement(id) {
    if (
      !confirm(
        "آیا از حذف این افتخار مطمئن هستید؟"
      )
    ) {
      return;
    }

    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const result =
      await supabaseClient
        .from("achievements")
        .delete()
        .eq(
          "id",
          id
        );

    if (result.error) {
      console.error(
        "Achievement delete:",
        result.error
      );

      showMessage(
        "حذف افتخار انجام نشد.",
        "error"
      );

      return;
    }

    showMessage(
      "افتخار حذف شد."
    );

    await loadAchievements();
  }

  /* =======================================================
     ATHLETE RANKING
     
     100 امتیاز:
     ارزیابی       = ۵۰
     افتخارات      = ۳۰
     حضور و غیاب   = ۲۰
  ======================================================= */

  function calculateAthleteRanking() {

    const ranking =
      state.athletes.map(
        athlete => {

          const athleteId =
            String(
              athlete.id
            );

          /* -----------------------------------------------
             EVALUATIONS — 50
          ------------------------------------------------ */

          const athleteEvaluations =
            state.evaluations.filter(
              item =>
                String(
                  item.athlete_id
                ) ===
                athleteId
            );

          let evaluationAverage = 0;

          if (
            athleteEvaluations.length
          ) {

            const total =
              athleteEvaluations.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.total_score ??
                    item.score ??
                    0
                  ),
                0
              );

            evaluationAverage =
              total /
              athleteEvaluations.length;
          }

          const evaluationPoints =
            Math.min(
              50,
              Math.max(
                0,
                evaluationAverage * 5
              )
            );

          /* -----------------------------------------------
             ACHIEVEMENTS — 30
          ------------------------------------------------ */

          const athleteAchievements =
            state.achievements.filter(
              item =>
                String(
                  item.athlete_id
                ) ===
                athleteId
            );

          let achievementPoints = 0;

          athleteAchievements.forEach(
            item => {

              switch (
                medalType(item)
              ) {

                case "gold":
                  achievementPoints +=
                    10;
                  break;

                case "silver":
                  achievementPoints +=
                    7;
                  break;

                case "bronze":
                  achievementPoints +=
                    5;
                  break;

                default:
                  achievementPoints +=
                    2;
                  break;
              }

            }
          );

          achievementPoints =
            Math.min(
              30,
              Math.max(
                0,
                achievementPoints
              )
            );

          /* -----------------------------------------------
             ATTENDANCE — 20
          ------------------------------------------------ */

          const athleteAttendance =
            state.attendance.filter(
              item =>
                String(
                  item.athlete_id
                ) ===
                athleteId
            );

          let attendancePoints = 0;

          if (
            athleteAttendance.length
          ) {

            const presentCount =
              athleteAttendance.filter(
                isPresent
              ).length;

            const attendanceRate =
              presentCount /
              athleteAttendance.length;

            attendancePoints =
              Math.min(
                20,
                Math.max(
                  0,
                  attendanceRate * 20
                )
              );
          }

          /* -----------------------------------------------
             FINAL
          ------------------------------------------------ */

          const totalScore =
            evaluationPoints +
            achievementPoints +
            attendancePoints;

          return {

            athlete,

            evaluationAverage:

              Number(
                evaluationAverage
                  .toFixed(2)
              ),

            evaluationPoints:

              Number(
                evaluationPoints
                  .toFixed(2)
              ),

            achievementPoints:

              Number(
                achievementPoints
                  .toFixed(2)
              ),

            attendancePoints:

              Number(
                attendancePoints
                  .toFixed(2)
              ),

            totalScore:

              Number(
                totalScore
                  .toFixed(2)
              )
          };

        }
      );

    /* -----------------------------------------------
       SORT
    ------------------------------------------------ */

    ranking.sort(
      (a, b) => {

        if (
          b.totalScore !==
          a.totalScore
        ) {
          return (
            b.totalScore -
            a.totalScore
          );
        }

        if (
          b.evaluationPoints !==
          a.evaluationPoints
        ) {
          return (
            b.evaluationPoints -
            a.evaluationPoints
          );
        }

        if (
          b.achievementPoints !==
          a.achievementPoints
        ) {
          return (
            b.achievementPoints -
            a.achievementPoints
          );
        }

        return (
          b.attendancePoints -
          a.attendancePoints
        );
      }
    );

    /* -----------------------------------------------
       ASSIGN RANK
    ------------------------------------------------ */

    return ranking.map(
      (item, index) => ({
        ...item,
        rank:
          index + 1
      })
    );
  }

  /* =======================================================
     RANKING RENDER
  ======================================================= */

  function renderRanking() {

    const container =
      $("rankingList");

    if (!container) {
      return;
    }

    const ranking =
      calculateAthleteRanking();

    if (!ranking.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🏆
          </div>

          <h2>
            هنوز ورزشکاری وجود ندارد
          </h2>

          <p>
            بعد از ثبت ورزشکار، رتبه‌بندی اینجا نمایش داده می‌شود.
          </p>

        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div class="simple-grid ranking-grid">

        ${ranking.map(
          item => {

            const athlete =
              item.athlete;

            let rankIcon =
              "🏅";

            if (
              item.rank === 1
            ) {
              rankIcon =
                "🥇";
            } else if (
              item.rank === 2
            ) {
              rankIcon =
                "🥈";
            } else if (
              item.rank === 3
            ) {
              rankIcon =
                "🥉";
            }

            return `
              <div
                class="simple-box ranking-card"
              >

                <div
                  class="ranking-position"
                >
                  ${rankIcon}
                  رتبه
                  ${faNumber(
                    item.rank
                  )}
                </div>

                <h3>
                  👤
                  ${escapeHTML(
                    getAthleteName(
                      athlete
                    )
                  )}
                </h3>

                <div
                  class="ranking-score"
                >
                  ${faNumber(
                    item.totalScore
                  )}
                  <span>
                    / ۱۰۰
                  </span>
                </div>

                <p>
                  📊 ارزیابی:
                  ${faNumber(
                    item.evaluationPoints
                  )}
                  / ۵۰
                </p>

                <p>
                  🏆 افتخارات:
                  ${faNumber(
                    item.achievementPoints
                  )}
                  / ۳۰
                </p>

                <p>
                  📅 حضور:
                  ${faNumber(
                    item.attendancePoints
                  )}
                  / ۲۰
                </p>

                <p>
                  ⭐ میانگین ارزیابی:
                  ${faNumber(
                    item.evaluationAverage
                  )}
                  / ۱۰
                </p>

              </div>
            `;

          }
        ).join("")}

      </div>
    `;
  }

  /* =======================================================
     ادامه در بخش ۲
  ======================================================= */

 /* =======================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   PART 2
   RANKING + TESTS + PROGRESS + INIT
======================================================= */


/* =======================================================
   ATHLETE RANKING
======================================================= */

function calculateAthleteRanking() {

  const ranking =
    state.athletes.map(athlete => {

      const athleteId =
        String(athlete.id);


      /* =================================================
         EVALUATIONS — 50 POINTS
      ================================================= */

      const athleteEvaluations =
        state.evaluations.filter(
          item =>
            String(item.athlete_id) ===
            athleteId
        );

      let evaluationAverage = 0;

      if (
        athleteEvaluations.length
      ) {

        const total =
          athleteEvaluations.reduce(
            (sum, item) =>
              sum +
              Number(
                item.total_score ??
                item.score ??
                0
              ),
            0
          );

        evaluationAverage =
          total /
          athleteEvaluations.length;
      }

      const evaluationPoints =
        Math.min(
          50,
          Math.max(
            0,
            evaluationAverage * 5
          )
        );


      /* =================================================
         ACHIEVEMENTS — 30 POINTS
      ================================================= */

      const athleteAchievements =
        state.achievements.filter(
          item =>
            String(item.athlete_id) ===
            athleteId
        );

      let achievementPoints = 0;

      athleteAchievements.forEach(
        item => {

          const medal =
            medalType(item);

          if (
            medal === "gold"
          ) {
            achievementPoints += 10;
          }

          else if (
            medal === "silver"
          ) {
            achievementPoints += 7;
          }

          else if (
            medal === "bronze"
          ) {
            achievementPoints += 5;
          }

          else {
            achievementPoints += 2;
          }

        }
      );

      achievementPoints =
        Math.min(
          30,
          Math.max(
            0,
            achievementPoints
          )
        );


      /* =================================================
         ATTENDANCE — 20 POINTS
      ================================================= */

      const athleteAttendance =
        state.attendance.filter(
          item =>
            String(item.athlete_id) ===
            athleteId
        );

      let attendancePoints = 0;

      if (
        athleteAttendance.length
      ) {

        const presentCount =
          athleteAttendance.filter(
            item =>
              item.present === true ||
              item.status === "present" ||
              item.status === "حاضر"
          ).length;

        const attendanceRate =
          presentCount /
          athleteAttendance.length;

        attendancePoints =
          Math.min(
            20,
            Math.max(
              0,
              attendanceRate * 20
            )
          );
      }


      /* =================================================
         FINAL SCORE
      ================================================= */

      const totalScore =
        evaluationPoints +
        achievementPoints +
        attendancePoints;


      return {

        athlete,

        evaluationAverage,

        evaluationPoints,

        achievementPoints,

        attendancePoints,

        totalScore

      };

    });


  /* =====================================================
     SORTING
  ===================================================== */

  ranking.sort(
    (a, b) => {

      /* اول امتیاز کل */

      if (
        b.totalScore !==
        a.totalScore
      ) {

        return (
          b.totalScore -
          a.totalScore
        );
      }


      /* در تساوی:
         ارزیابی بهتر */

      if (
        b.evaluationPoints !==
        a.evaluationPoints
      ) {

        return (
          b.evaluationPoints -
          a.evaluationPoints
        );
      }


      /* در تساوی دوباره:
         حضور بهتر */

      if (
        b.attendancePoints !==
        a.attendancePoints
      ) {

        return (
          b.attendancePoints -
          a.attendancePoints
        );
      }


      /* در نهایت:
         افتخارات بیشتر */

      return (
        b.achievementPoints -
        a.achievementPoints
      );

    }
  );


  /* =====================================================
     ASSIGN RANK
  ===================================================== */

  return ranking.map(
    (item, index) => ({

      ...item,

      rank:
        index + 1

    })
  );
}


/* =======================================================
   RANKING RENDER
======================================================= */

function renderRanking() {

  const container =
    $("athleteRankingList");

  if (!container) {
    return;
  }


  const ranking =
    calculateAthleteRanking();


  if (!ranking.length) {

    container.innerHTML = `
      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          🏆
        </div>

        <h2>
          هنوز ورزشکاری ثبت نشده است
        </h2>

        <p>
          برای نمایش رنکینگ، ابتدا ورزشکار اضافه کنید.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    ranking
      .map(item => {

        const athlete =
          item.athlete;

        const name =
          getAthleteName(
            athlete
          );


        let rankIcon =
          "🏅";

        if (
          item.rank === 1
        ) {
          rankIcon = "🥇";
        }

        else if (
          item.rank === 2
        ) {
          rankIcon = "🥈";
        }

        else if (
          item.rank === 3
        ) {
          rankIcon = "🥉";
        }


        return `
          <div
            class="simple-box ranking-card"
          >

            <div
              class="ranking-card-top"
            >

              <div
                class="ranking-position"
              >
                ${rankIcon}
                <strong>
                  ${faNumber(
                    item.rank
                  )}
                </strong>
              </div>


              <div
                class="ranking-athlete"
              >

                <h3>
                  ${escapeHTML(
                    name
                  )}
                </h3>

                <p>
                  امتیاز کل:
                  <strong>
                    ${faNumber(
                      item.totalScore.toFixed(
                        2
                      )
                    )}
                    / ۱۰۰
                  </strong>
                </p>

              </div>

            </div>


            <div
              class="ranking-breakdown"
            >

              <div>
                <span>
                  📊 ارزیابی
                </span>

                <strong>
                  ${faNumber(
                    item.evaluationPoints.toFixed(
                      1
                    )
                  )}
                  / ۵۰
                </strong>
              </div>


              <div>
                <span>
                  🏆 افتخارات
                </span>

                <strong>
                  ${faNumber(
                    item.achievementPoints.toFixed(
                      1
                    )
                  )}
                  / ۳۰
                </strong>
              </div>


              <div>
                <span>
                  📅 حضور
                </span>

                <strong>
                  ${faNumber(
                    item.attendancePoints.toFixed(
                      1
                    )
                  )}
                  / ۲۰
                </strong>
              </div>

            </div>

          </div>
        `;

      })
      .join("");
}


/* =======================================================
   RANKING STATS
======================================================= */

function updateRankingStats() {

  const ranking =
    calculateAthleteRanking();

  const first =
    ranking[0];


  setText(
    "rankingFirstName",
    first
      ? getAthleteName(
          first.athlete
        )
      : "-"
  );


  setText(
    "rankingFirstScore",
    first
      ? faNumber(
          first.totalScore.toFixed(
            1
          )
        )
      : "۰"
  );


  setText(
    "rankingAthletesCount",
    faNumber(
      ranking.length
    )
  );
}


/* =======================================================
   TESTS
======================================================= */

async function loadTests() {

  const result =
    await queryTable(
      "tests",
      {
        order: {
          column:
            "created_at",
          ascending:
            false
        }
      }
    );


  if (result.error) {

    console.error(
      "Tests:",
      result.error
    );

    state.tests = [];

  } else {

    state.tests =
      result.data || [];

  }


  renderTests();
}


/* =======================================================
   RENDER TESTS
======================================================= */

function renderTests() {

  const container =
    $("testsList");

  if (!container) {
    return;
  }


  if (!state.tests.length) {

    container.innerHTML = `
      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          🧪
        </div>

        <h2>
          تستی ثبت نشده است
        </h2>

        <p>
          هنوز رکورد تستی برای ورزشکاران وجود ندارد.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    state.tests
      .map(item => {

        const athlete =
          getAthlete(
            item.athlete_id
          );


        return `
          <div class="simple-box">

            <h3>
              🧪
              ${escapeHTML(
                item.test_name ||
                item.name ||
                "تست ورزشی"
              )}
            </h3>

            <p>
              ورزشکار:
              ${escapeHTML(
                getAthleteName(
                  athlete
                )
              )}
            </p>

            <p>
              نتیجه:
              ${escapeHTML(
                item.result ??
                item.value ??
                "-"
              )}
            </p>

            <p>
              تاریخ:
              ${escapeHTML(
                item.date ||
                item.created_at ||
                "-"
              )}
            </p>

          </div>
        `;

      })
      .join("");
}


/* =======================================================
   PROGRESS HISTORY
======================================================= */

async function loadProgressHistory() {

  const result =
    await queryTable(
      "Progress_history",
      {
        order: {
          column:
            "created_at",
          ascending:
            false
        }
      }
    );


  if (result.error) {

    console.error(
      "Progress history:",
      result.error
    );

    state.progressHistory =
      [];

  } else {

    state.progressHistory =
      result.data || [];

  }


  renderProgressHistory();
}


/* =======================================================
   RENDER PROGRESS HISTORY
======================================================= */

function renderProgressHistory() {

  const container =
    $("progressHistoryList");

  if (!container) {
    return;
  }


  if (
    !state.progressHistory.length
  ) {

    container.innerHTML = `
      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📈
        </div>

        <h2>
          سابقه پیشرفتی ثبت نشده است
        </h2>

        <p>
          هنوز اطلاعاتی برای نمایش وجود ندارد.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    state.progressHistory
      .map(item => {

        const athlete =
          getAthlete(
            item.athlete_id
          );


        return `
          <div class="simple-box">

            <h3>
              📈
              ${escapeHTML(
                getAthleteName(
                  athlete
                )
              )}
            </h3>

            <p>
              شاخص:
              ${escapeHTML(
                item.metric ||
                item.title ||
                item.type ||
                "-"
              )}
            </p>

            <p>
              مقدار:
              ${escapeHTML(
                item.value ??
                item.result ??
                "-"
              )}
            </p>

            <p>
              تاریخ:
              ${escapeHTML(
                item.date ||
                item.created_at ||
                "-"
              )}
            </p>

          </div>
        `;

      })
      .join("");
}


/* =======================================================
   DASHBOARD SUMMARY
======================================================= */

function updateDashboardSummary() {

  updateDashboard();

  updateRankingStats();

}


/* =======================================================
   REFRESH ALL DATA
======================================================= */

async function refreshAllData() {

  if (!supabaseClient) {

    showMessage(
      "اتصال Supabase برقرار نیست.",
      "error"
    );

    return;
  }


  try {

    await Promise.all([

      loadAthletes(),

      loadEvaluations(),

      loadEvaluationPeriods(),

      loadEvaluationCriteria(),

      loadEvaluationScores(),

      loadAttendance(),

      loadAchievements(),

      loadAnnouncements(),

      loadCompetitions(),

      loadTests(),

      loadProgressHistory()

    ]);


    renderEvaluationScoreInputs();

    fillAthleteSelects();

    updateDashboardSummary();

    renderRanking();

  }

  catch (error) {

    console.error(
      "Refresh:",
      error
    );

    showMessage(
      "خطا در دریافت اطلاعات.",
      "error"
    );

  }
}


/* =======================================================
   SEARCH / FILTER EVENTS
======================================================= */

function setupSearchFilters() {

  $("athleteSearch")
    ?.addEventListener(
      "input",
      renderAthletes
    );


  $("announcementSearch")
    ?.addEventListener(
      "input",
      renderAnnouncements
    );


  $("announcementFilter")
    ?.addEventListener(
      "change",
      renderAnnouncements
    );


  $("competitionSearch")
    ?.addEventListener(
      "input",
      renderCompetitions
    );


  $("competitionFilter")
    ?.addEventListener(
      "change",
      renderCompetitions
    );

}


/* =======================================================
   FORM SUBMIT HANDLERS
======================================================= */

function setupFormHandlers() {

  $("saveAthleteBtn")
    ?.addEventListener(
      "click",
      saveAthlete
    );


  $("saveEvaluationBtn")
    ?.addEventListener(
      "click",
      saveEvaluation
    );


  $("saveAttendanceBtn")
    ?.addEventListener(
      "click",
      saveAttendance
    );


  $("saveAchievementBtn")
    ?.addEventListener(
      "click",
      saveAchievement
    );


  $("saveAnnouncementBtn")
    ?.addEventListener(
      "click",
      saveAnnouncement
    );


  $("saveCompetitionBtn")
    ?.addEventListener(
      "click",
      saveCompetition
    );

}


/* =======================================================
   ENTER KEY / FORM SUPPORT
======================================================= */

function setupFormSubmitSupport() {

  const forms =
    document.querySelectorAll(
      ".coach-modal form"
    );


  forms.forEach(form => {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const button =
          form.querySelector(
            'button[type="submit"]'
          );

        if (
          button &&
          !button.disabled
        ) {

          button.click();

        }

      }
    );

  });

}


/* =======================================================
   SAFE SUPABASE CHECK
======================================================= */

function checkSupabaseConnection() {

  if (!window.supabase) {

    showMessage(
      "کتابخانه Supabase در صفحه بارگذاری نشده است.",
      "error"
    );

    return false;
  }


  if (!SUPABASE_KEY) {

    showMessage(
      "کلید Supabase تنظیم نشده است.",
      "error"
    );

    return false;
  }


  if (!supabaseClient) {

    showMessage(
      "اتصال Supabase ساخته نشد.",
      "error"
    );

    return false;
  }


  return true;
}


/* =======================================================
   ACTIVE PAGE
======================================================= */

function activateDefaultPage() {

  const activeNav =
    document.querySelector(
      ".nav-item.active"
    );


  const activePage =
    document.querySelector(
      ".coach-page.active"
    );


  if (
    !activeNav
  ) {

    const firstNav =
      document.querySelector(
        ".nav-item"
      );

    firstNav?.classList.add(
      "active"
    );

  }


  if (
    !activePage
  ) {

    const firstPage =
      document.querySelector(
        ".coach-page"
      );

    firstPage?.classList.add(
      "active"
    );

  }

}


/* =======================================================
   WINDOW GLOBALS
======================================================= */

window.JudoTabiatCoach = {

  state,

  calculateAthleteRanking,

  renderRanking,

  refreshAllData,

  loadAthletes,

  loadEvaluations,

  loadEvaluationPeriods,

  loadEvaluationCriteria,

  loadEvaluationScores,

  loadAttendance,

  loadAchievements,

  loadAnnouncements,

  loadCompetitions,

  loadTests,

  loadProgressHistory

};


/* =======================================================
   INITIALIZATION
======================================================= */

async function initCoachPanel() {

  activateDefaultPage();

  setupNavigation();

  setupEventTabs();

  setupModals();

  setupSearchFilters();

  setupAthleteSearch();

  setupFormHandlers();

  setupFormSubmitSupport();


  resetAthleteForm();

  resetEvaluationForm();

  resetAttendanceForm();

  resetAchievementForm();

  resetAnnouncementForm();

  resetCompetitionForm();


  if (
    !checkSupabaseConnection()
  ) {
    return;
  }


  await refreshAllData();

}


/* =======================================================
   DOM READY
======================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initCoachPanel
  );

}

else {

  initCoachPanel();

}

})();
