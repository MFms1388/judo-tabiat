/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   FINAL - COMPLETE & FIXED
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
    SUPABASE_URL &&
    SUPABASE_KEY
  ) {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

  }


  /* =======================================================
     DOM HELPERS
  ======================================================= */

  const $ = id =>
    document.getElementById(id);

  const $$ = selector =>
    Array.from(
      document.querySelectorAll(selector)
    );


  function setText(
    id,
    value
  ) {

    const element = $(id);

    if (!element) return;

    element.textContent =
      value ?? "";

  }


  function setValue(
    id,
    value
  ) {

    const element = $(id);

    if (!element) return;

    element.value =
      value ?? "";

  }


  function escapeHTML(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  function faNumber(
    value
  ) {

    return String(
      value ?? ""
    ).replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[
          Number(digit)
        ]
    );

  }


  function today() {

    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;

  }


  /* =======================================================
     STATE
  ======================================================= */

  const state = {

    athletes: [],

    evaluationPeriods: [],

    evaluationCriteria: [],

    evaluationScores: [],

    evaluations: [],

    attendance: [],

    achievements: [],

    announcements: [],

    competitions: [],

    tests: [],

    progressHistory: [],

    settings: {},

    editingAthleteId:
      null,

    editingEvaluationId:
      null,

    editingAchievementId:
      null,

    editingAnnouncementId:
      null,

    editingCompetitionId:
      null

  };


  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(
    message,
    type = "success"
  ) {

    let container =
      $("coachMessage");

    if (!container) {

      container =
        document.createElement(
          "div"
        );

      container.id =
        "coachMessage";

      container.className =
        "coach-message";

      document.body.appendChild(
        container
      );

    }

    container.textContent =
      message;

    container.className =
      `coach-message ${type}`;

    container.classList.add(
      "show"
    );

    clearTimeout(
      showMessage.timer
    );

    showMessage.timer =
      setTimeout(
        () => {

          container.classList.remove(
            "show"
          );

        },
        3500
      );

  }


  /* =======================================================
     MODALS
  ======================================================= */

  function openModal(
    id
  ) {

    const modal =
      $(id);

    if (!modal) return;

    modal.classList.add(
      "active"
    );

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "modal-open"
    );

  }


  function closeModal(
    id
  ) {

    const modal =
      $(id);

    if (!modal) return;

    modal.classList.remove(
      "active"
    );

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    if (
      !$$(
        ".modal.active"
      ).length
    ) {

      document.body.classList.remove(
        "modal-open"
      );

    }

  }


  function closeAllModals() {

    $$(".modal.active")
      .forEach(
        modal => {

          modal.classList.remove(
            "active"
          );

          modal.setAttribute(
            "aria-hidden",
            "true"
          );

        }
      );

    document.body.classList.remove(
      "modal-open"
    );

  }


  function setupModals() {

    $$(".modal")
      .forEach(
        modal => {

          modal.addEventListener(
            "click",
            event => {

              if (
                event.target ===
                modal
              ) {

                closeModal(
                  modal.id
                );

              }

            }
          );

        }
      );

    $$(
      "[data-close-modal]"
    )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const modalId =
                button.dataset
                  .closeModal;

              closeModal(
                modalId
              );

            }
          );

        }
      );

  }


  /* =======================================================
     SUPABASE QUERY HELPER
  ======================================================= */

  async function queryTable(
    table,
    options = {}
  ) {

    if (!supabaseClient) {

      return {
        data: [],
        error:
          new Error(
            "Supabase client is not initialized."
          )
      };

    }

    let query =
      supabaseClient
        .from(table)
        .select(
          options.select ||
          "*"
        );

    if (
      options.eq &&
      typeof options.eq ===
      "object"
    ) {

      Object.entries(
        options.eq
      ).forEach(
        ([column, value]) => {

          query =
            query.eq(
              column,
              value
            );

        }
      );

    }

    if (
      options.order &&
      options.order.column
    ) {

      query =
        query.order(
          options.order.column,
          {
            ascending:
              options.order
                .ascending !==
              false
          }
        );

    }

    if (
      Number.isInteger(
        options.limit
      )
    ) {

      query =
        query.limit(
          options.limit
        );

    }

    return await query;

  }


  /* =======================================================
     ATHLETE HELPERS
  ======================================================= */

  function getAthleteName(
    athlete
  ) {

    if (!athlete) {
      return "بدون نام";
    }

    const fullName =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (fullName) {
      return fullName;
    }

    return (
      athlete.name ||
      athlete.full_name ||
      "بدون نام"
    );

  }


  function getAthleteInitials(
    athlete
  ) {

    const name =
      getAthleteName(
        athlete
      );

    const parts =
      name
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
      return "؟";
    }

    return parts
      .slice(0, 2)
      .map(
        part =>
          part.charAt(0)
      )
      .join("");

  }


  /* =======================================================
     MEDAL HELPERS
  ======================================================= */

  function medalType(
    achievement
  ) {

    if (!achievement) {
      return "other";
    }

    const value =
      String(
        achievement.medal ||
        achievement.medal_type ||
        achievement.medalType ||
        achievement.position ||
        achievement.rank ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      [
        "gold",
        "طلا",
        "اول",
        "1",
        "۱",
        "🥇"
      ].includes(value)
    ) {

      return "gold";

    }

    if (
      [
        "silver",
        "نقره",
        "دوم",
        "2",
        "۲",
        "🥈"
      ].includes(value)
    ) {

      return "silver";

    }

    if (
      [
        "bronze",
        "برنز",
        "سوم",
        "3",
        "۳",
        "🥉"
      ].includes(value)
    ) {

      return "bronze";

    }

    return "other";

  }


  function medalLabel(
    achievement
  ) {

    const medal =
      medalType(
        achievement
      );

    if (
      medal === "gold"
    ) {
      return "🥇 طلا";
    }

    if (
      medal === "silver"
    ) {
      return "🥈 نقره";
    }

    if (
      medal === "bronze"
    ) {
      return "🥉 برنز";
    }

    return "🏅 افتخار";

  }


  /* =======================================================
     ATTENDANCE HELPERS
  ======================================================= */

  function isPresent(
    item
  ) {

    if (!item) {
      return false;
    }

    if (
      item.present === true
    ) {
      return true;
    }

    if (
      item.attended === true
    ) {
      return true;
    }

    if (
      item.is_present === true
    ) {
      return true;
    }

    const status =
      String(
        item.status ||
        ""
      )
        .trim()
        .toLowerCase();

    return [
      "present",
      "حاضر",
      "yes",
      "true",
      "1",
      "حضور"
    ].includes(
      status
    );

  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {

    const navItems =
      $$(
        "[data-page]"
      );

    navItems.forEach(
      item => {

        item.addEventListener(
          "click",
          event => {

            event.preventDefault();

            const page =
              item.dataset.page;

            if (!page) return;

            navItems.forEach(
              nav => {

                nav.classList.remove(
                  "active"
                );

              }
            );

            item.classList.add(
              "active"
            );

            $$(".coach-page")
              .forEach(
                section => {

                  section.classList.remove(
                    "active"
                  );

                }
              );

            const target =
              $(
                `${page}Page`
              ) ||
              $(
                `page-${page}`
              );

            if (target) {

              target.classList.add(
                "active"
              );

            }

            document.body
              .dataset.currentPage =
              page;

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }
        );

      }
    );

  }


  /* =======================================================
     EVENT TABS
  ======================================================= */

  function setupEventTabs() {

    $$(
      "[data-event-tab]"
    )
      .forEach(
        tab => {

          tab.addEventListener(
            "click",
            () => {

              const target =
                tab.dataset
                  .eventTab;

              $$(
                "[data-event-tab]"
              )
                .forEach(
                  item =>
                    item.classList.remove(
                      "active"
                    )
                );

              tab.classList.add(
                "active"
              );

              $$(
                "[data-event-panel]"
              )
                .forEach(
                  panel => {

                    panel.classList.remove(
                      "active"
                    );

                  }
                );

              const panel =
                $$(
                  `[data-event-panel="${target}"]`
                )[0];

              if (panel) {

                panel.classList.add(
                  "active"
                );

              }

            }
          );

        }
      );

  }


  /* =======================================================
     ATHLETES
  ======================================================= */

  async function loadAthletes() {

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

      showMessage(
        "دریافت ورزشکاران انجام نشد.",
        "error"
      );

      return;

    }

    state.athletes =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    fillAthleteSelects();

    updateDashboard();

  }


  function renderAthletes() {

    const container =
      $("athletesList");

    if (!container) {
      return;
    }

    let athletes =
      [
        ...state.athletes
      ];

    const search =
      (
        $("athleteSearch")
          ?.value || ""
      )
        .trim()
        .toLowerCase();

    if (search) {

      athletes =
        athletes.filter(
          athlete => {

            const text =
              [
                getAthleteName(
                  athlete
                ),
                athlete.national_id,
                athlete.weight,
                athlete.age_group,
                athlete.belt,
                athlete.category
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

    if (!athletes.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            👤
          </div>

          <h2>
            ورزشکاری پیدا نشد
          </h2>

          <p>
            هنوز ورزشکاری ثبت نشده یا
            نتیجه‌ای برای جستجو وجود ندارد.
          </p>

        </div>
      `;

      return;

    }

    container.innerHTML =
      athletes
        .map(
          athlete => `

            <div
              class="athlete-card"
              data-athlete-id="${escapeHTML(
                athlete.id
              )}"
            >

              <div class="athlete-avatar">

                ${
                  athlete.avatar_url
                    ? `
                      <img
                        src="${escapeHTML(
                          athlete.avatar_url
                        )}"
                        alt="${escapeHTML(
                          getAthleteName(
                            athlete
                          )
                        )}"
                      >
                    `
                    : `
                      <span>
                        ${escapeHTML(
                          getAthleteInitials(
                            athlete
                          )
                        )}
                      </span>
                    `
                }

              </div>

              <div class="athlete-card-content">

                <h3>
                  ${escapeHTML(
                    getAthleteName(
                      athlete
                    )
                  )}
                </h3>

                <div class="athlete-meta">

                  ${
                    athlete.age_group
                      ? `
                        <span>
                          👥 ${escapeHTML(
                            athlete.age_group
                          )}
                        </span>
                      `
                      : ""
                  }

                  ${
                    athlete.weight !==
                    null &&
                    athlete.weight !==
                    undefined &&
                    athlete.weight !==
                    ""
                      ? `
                        <span>
                          ⚖️ ${escapeHTML(
                            athlete.weight
                          )} کیلو
                        </span>
                      `
                      : ""
                  }

                  ${
                    athlete.belt
                      ? `
                        <span>
                          🥋 ${escapeHTML(
                            athlete.belt
                          )}
                        </span>
                      `
                      : ""
                  }

                </div>

              </div>

              <div class="athlete-card-actions">

                <button
                  type="button"
                  class="btn-icon"
                  data-edit-athlete="${escapeHTML(
                    athlete.id
                  )}"
                  title="ویرایش"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  class="btn-icon danger"
                  data-delete-athlete="${escapeHTML(
                    athlete.id
                  )}"
                  title="حذف"
                >
                  🗑️
                </button>

              </div>

            </div>

          `
        )
        .join("");

    bindAthleteActions();

  }


  function bindAthleteActions() {

    $$(
      "[data-edit-athlete]"
    )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () =>
              editAthlete(
                button.dataset
                  .editAthlete
              )
          );

        }
      );

    $$(
      "[data-delete-athlete]"
    )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () =>
              deleteAthlete(
                button.dataset
                  .deleteAthlete
              )
          );

        }
      );

  }


  function resetAthleteForm() {

    [
      "athleteFirstName",
      "athleteLastName",
      "athleteNationalId",
      "athleteAge",
      "athleteWeight",
      "athleteAgeGroup",
      "athleteBelt",
      "athleteCategory",
      "athletePhone",
      "athleteDescription"
    ]
      .forEach(
        id => {

          const element =
            $(id);

          if (element) {
            element.value = "";
          }

        }
      );

    state.editingAthleteId =
      null;

    setText(
      "saveAthleteBtn",
      "➕ ثبت ورزشکار"
    );

  }


  function editAthlete(
    id
  ) {

    const athlete =
      state.athletes.find(
        item =>
          String(
            item.id
          ) ===
          String(id)
      );

    if (!athlete) {
      return;
    }

    state.editingAthleteId =
      id;

    setValue(
      "athleteFirstName",
      athlete.first_name ||
      ""
    );

    setValue(
      "athleteLastName",
      athlete.last_name ||
      ""
    );

    setValue(
      "athleteNationalId",
      athlete.national_id ||
      ""
    );

    setValue(
      "athleteAge",
      athlete.age ||
      ""
    );

    setValue(
      "athleteWeight",
      athlete.weight ||
      ""
    );

    setValue(
      "athleteAgeGroup",
      athlete.age_group ||
      ""
    );

    setValue(
      "athleteBelt",
      athlete.belt ||
      ""
    );

    setValue(
      "athleteCategory",
      athlete.category ||
      ""
    );

    setValue(
      "athletePhone",
      athlete.phone ||
      ""
    );

    setValue(
      "athleteDescription",
      athlete.description ||
      ""
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

    const firstName =
      (
        $("athleteFirstName")
          ?.value || ""
      ).trim();

    const lastName =
      (
        $("athleteLastName")
          ?.value || ""
      ).trim();

    if (
      !firstName &&
      !lastName
    ) {

      showMessage(
        "نام ورزشکار را وارد کنید.",
        "error"
      );

      return;

    }

    const payload = {

      first_name:
        firstName ||
        null,

      last_name:
        lastName ||
        null,

      national_id:
        (
          $("athleteNationalId")
            ?.value || ""
        ).trim() ||
        null,

      age:
        $("athleteAge")
          ?.value
          ? Number(
              $("athleteAge")
                .value
            )
          : null,

      weight:
        $("athleteWeight")
          ?.value
          ? Number(
              $("athleteWeight")
                .value
            )
          : null,

      age_group:
        (
          $("athleteAgeGroup")
            ?.value || ""
        ).trim() ||
        null,

      belt:
        (
          $("athleteBelt")
            ?.value || ""
        ).trim() ||
        null,

      category:
        (
          $("athleteCategory")
            ?.value || ""
        ).trim() ||
        null,

      phone:
        (
          $("athletePhone")
            ?.value || ""
        ).trim() ||
        null,

      description:
        (
          $("athleteDescription")
            ?.value || ""
        ).trim() ||
        null

    };


    let result;


    if (
      state.editingAthleteId
    ) {

      result =
        await supabaseClient
          .from(
            "athletes"
          )
          .update(
            payload
          )
          .eq(
            "id",
            state.editingAthleteId
          );

    } else {

      result =
        await supabaseClient
          .from(
            "athletes"
          )
          .insert(
            payload
          );

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
        : "ورزشکار با موفقیت ثبت شد."
    );

    closeModal(
      "athleteModal"
    );

    resetAthleteForm();

    await loadAthletes();

    renderAthletes();

    renderRanking();

  }


  async function deleteAthlete(
    id
  ) {

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
        .from(
          "athletes"
        )
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

    renderAthletes();

    renderRanking();

  }


  function setupAthleteSearch() {

    const search =
      $("athleteSearch");

    if (!search) {
      return;
    }

    search.addEventListener(
      "input",
      renderAthletes
    );

  }


  function fillAthleteSelects() {

    const ids = [
      "evaluationAthlete",
      "achievementAthlete",
      "attendanceAthlete"
    ];

    ids.forEach(
      id => {

        const select =
          $(id);

        if (!select) {
          return;
        }

        const current =
          select.value;

        select.innerHTML = `
          <option value="">
            انتخاب ورزشکار
          </option>
        `;

        state.athletes
          .forEach(
            athlete => {

              const option =
                document.createElement(
                  "option"
                );

              option.value =
                athlete.id;

              option.textContent =
                getAthleteName(
                  athlete
                );

              select.appendChild(
                option
              );

            }
          );

        if (
          current &&
          state.athletes.some(
            athlete =>
              String(
                athlete.id
              ) ===
              String(current)
          )
        ) {

          select.value =
            current;

        }

      }
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

    if (result.error) {

      console.warn(
        "Evaluation periods:",
        result.error
      );

      state.evaluationPeriods =
        [];

      return;

    }

    state.evaluationPeriods =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    fillEvaluationPeriodSelect();

    renderEvaluationPeriods();

  }


  function fillEvaluationPeriodSelect() {

    const select =
      $("evaluationPeriod");

    if (!select) {
      return;
    }

    const current =
      select.value;

    select.innerHTML = `
      <option value="">
        انتخاب دوره ارزیابی
      </option>
    `;

    state.evaluationPeriods
      .forEach(
        period => {

          const option =
            document.createElement(
              "option"
            );

          option.value =
            period.id;

          option.textContent =
            period.title ||
            period.name ||
            "دوره ارزیابی";

          select.appendChild(
            option
          );

        }
      );

    if (
      current &&
      state.evaluationPeriods.some(
        period =>
          String(
            period.id
          ) ===
          String(current)
      )
    ) {

      select.value =
        current;

    }

  }


  function renderEvaluationPeriods() {

    const container =
      $("evaluationPeriodsList");

    if (!container) {
      return;
    }

    if (
      !state.evaluationPeriods.length
    ) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📋
          </div>

          <h2>
            دوره‌ای ثبت نشده است
          </h2>

          <p>
            هنوز دوره ارزیابی ایجاد نشده است.
          </p>

        </div>
      `;

      return;

    }

    container.innerHTML =
      state.evaluationPeriods
        .map(
          period => `

            <div
              class="evaluation-period-card"
            >

              <div>

                <h3>
                  ${escapeHTML(
                    period.title ||
                    period.name ||
                    "دوره ارزیابی"
                  )}
                </h3>

                ${
                  period.description
                    ? `
                      <p>
                        ${escapeHTML(
                          period.description
                        )}
                      </p>
                    `
                    : ""
                }

              </div>

              <div class="period-date">

                ${
                  period.start_date
                    ? escapeHTML(
                        period.start_date
                      )
                    : "-"
                }

                ${
                  period.end_date
                    ? `
                      تا
                      ${escapeHTML(
                        period.end_date
                      )}
                    `
                    : ""
                }

              </div>

            </div>

          `
        )
        .join("");

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

    if (result.error) {

      console.warn(
        "Evaluation criteria:",
        result.error
      );

      state.evaluationCriteria =
        [];

      return;

    }

    state.evaluationCriteria =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    renderEvaluationCriteria();

    prepareEvaluationPage();

  }


  function renderEvaluationCriteria() {

    const container =
      $("evaluationCriteriaList");

    if (!container) {
      return;
    }

    if (
      !state.evaluationCriteria.length
    ) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🎯
          </div>

          <h2>
            معیاری ثبت نشده است
          </h2>

          <p>
            هنوز معیار ارزیابی ایجاد نشده است.
          </p>

        </div>
      `;

      return;

    }

    container.innerHTML =
      state.evaluationCriteria
        .map(
          criterion => `

            <div
              class="criterion-card"
            >

              <div class="criterion-number">
                ${faNumber(
                  criterion.order_index ??
                  criterion.position ??
                  ""
                )}
              </div>

              <div class="criterion-content">

                <h3>
                  ${escapeHTML(
                    criterion.title ||
                    criterion.name ||
                    "معیار"
                  )}
                </h3>

                ${
                  criterion.description
                    ? `
                      <p>
                        ${escapeHTML(
                          criterion.description
                        )}
                      </p>
                    `
                    : ""
                }

              </div>

              <div class="criterion-score">
                / ۱۰
              </div>

            </div>

          `
        )
        .join("");

  }


  function prepareEvaluationPage() {

    fillAthleteSelects();

    fillEvaluationPeriodSelect();

    renderEvaluationScoreInputs();

  }


  function renderEvaluationScoreInputs() {

    const container =
      $("evaluationScoreInputs");

    if (!container) {
      return;
    }

    if (
      !state.evaluationCriteria.length
    ) {

      container.innerHTML = `
        <div class="evaluation-empty">
          هنوز معیاری برای ارزیابی ثبت نشده است.
        </div>
      `;

      return;

    }

    container.innerHTML =
      state.evaluationCriteria
        .map(
          criterion => `

            <div
              class="evaluation-score-row"
            >

              <div
                class="evaluation-score-label"
              >

                <strong>
                  ${escapeHTML(
                    criterion.title ||
                    criterion.name ||
                    "معیار"
                  )}
                </strong>

                ${
                  criterion.description
                    ? `
                      <small>
                        ${escapeHTML(
                          criterion.description
                        )}
                      </small>
                    `
                    : ""
                }

              </div>

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
              >

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

      console.warn(
        "Evaluations:",
        result.error
      );

      state.evaluations =
        [];

      return;

    }

    state.evaluations =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    renderEvaluations();

  }


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

    if (result.error) {

      console.warn(
        "Evaluation scores:",
        result.error
      );

      state.evaluationScores =
        [];

      return;

    }

    state.evaluationScores =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

  }


  function renderEvaluations() {

    const container =
      $("evaluationsList");

    if (!container) {
      return;
    }

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
            هنوز ارزیابی برای ورزشکاران ثبت نشده است.
          </p>

        </div>
      `;

      return;

    }

    container.innerHTML =
      state.evaluations
        .map(
          evaluation => {

            const athlete =
              state.athletes.find(
                item =>
                  String(
                    item.id
                  ) ===
                  String(
                    evaluation.athlete_id
                  )
              );

            const athleteName =
              athlete
                ? getAthleteName(
                    athlete
                  )
                : "ورزشکار";

            const score =
              Number(
                evaluation.total_score ??
                evaluation.score ??
                0
              );

            return `

              <div
                class="evaluation-card"
              >

                <div
                  class="evaluation-card-top"
                >

                  <div>

                    <h3>
                      ${escapeHTML(
                        athleteName
                      )}
                    </h3>

                    <span>
                      ${escapeHTML(
                        evaluation.title ||
                        evaluation.name ||
                        "ارزیابی"
                      )}
                    </span>

                  </div>

                  <strong
                    class="evaluation-score"
                  >
                    ${formatSimpleScore(
                      score
                    )}
                    / ۱۰
                  </strong>

                </div>

                <div
                  class="evaluation-card-details"
                >

                  ${
                    evaluation.date
                      ? `
                        <span>
                          📅
                          ${escapeHTML(
                            evaluation.date
                          )}
                        </span>
                      `
                      : ""
                  }

                  ${
                    evaluation.period_id
                      ? `
                        <span>
                          📋 دوره ارزیابی
                        </span>
                      `
                      : ""
                  }

                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  function formatSimpleScore(
    value
  ) {

    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return "۰";
    }

    return faNumber(
      number.toFixed(1)
    );

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

    $$(
      ".evaluation-score-input"
    )
      .forEach(
        input => {
          input.value = "0";
        }
      );

    state.editingEvaluationId =
      null;

    setText(
      "saveEvaluationBtn",
      "📊 ثبت ارزیابی"
    );

  }


  function startNewEvaluation() {

    resetEvaluationForm();

    prepareEvaluationPage();

    openModal(
      "evaluationModal"
    );

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
      $("evaluationAthlete")
        ?.value;

    if (!athleteId) {

      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );

      return;

    }

    const periodId =
      $("evaluationPeriod")
        ?.value ||
      null;

    const date =
      $("evaluationDate")
        ?.value ||
      today();

    const inputs =
      $$(
        ".evaluation-score-input"
      );

    let total =
      0;

    const scoreRows =
      [];

    inputs.forEach(
      input => {

        let score =
          Number(
            input.value
          );

        if (
          !Number.isFinite(score)
        ) {
          score = 0;
        }

        score =
          Math.min(
            10,
            Math.max(
              0,
              score
            )
          );

        total +=
          score;

        scoreRows.push({
          criterion_id:
            input.dataset
              .criterionId,
          score
        });

      }
    );

    const average =
      scoreRows.length
        ? total /
          scoreRows.length
        : 0;

    const payload = {

      athlete_id:
        athleteId,

      period_id:
        periodId,

      date,

      total_score:
        average

    };


    let result;


    if (
      state.editingEvaluationId
    ) {

      result =
        await supabaseClient
          .from(
            "evaluations"
          )
          .update(
            payload
          )
          .eq(
            "id",
            state.editingEvaluationId
          );

    } else {

      result =
        await supabaseClient
          .from(
            "evaluations"
          )
          .insert(
            payload
          );

    }


    if (result.error) {

      console.error(
        "Evaluation save:",
        result.error
      );

      showMessage(
        "ثبت ارزیابی انجام نشد.",
        "error"
      );

      return;

    }


    /*
       ذخیره نمرات معیارها
    */

    if (
      scoreRows.length
    ) {

      if (
        state.editingEvaluationId
      ) {

        await supabaseClient
          .from(
            "evaluation_scores"
          )
          .delete()
          .eq(
            "evaluation_id",
            state.editingEvaluationId
          );

      }


      /*
         برای ارزیابی جدید، ابتدا
         آخرین رکورد را پیدا می‌کنیم.
      */

      let evaluationId =
        state.editingEvaluationId;

      if (!evaluationId) {

        const latest =
          await supabaseClient
            .from(
              "evaluations"
            )
            .select(
              "id"
            )
            .eq(
              "athlete_id",
              athleteId
            )
            .order(
              "created_at",
              {
                ascending:
                  false
              }
            )
            .limit(1);

        if (
          !latest.error &&
          latest.data &&
          latest.data[0]
        ) {

          evaluationId =
            latest.data[0].id;

        }

      }


      if (evaluationId) {

        const rows =
          scoreRows.map(
            row => ({

              evaluation_id:
                evaluationId,

              criterion_id:
                row.criterion_id,

              score:
                row.score

            })
          );

        const scoreResult =
          await supabaseClient
            .from(
              "evaluation_scores"
            )
            .insert(
              rows
            );

        if (
          scoreResult.error
        ) {

          console.warn(
            "Evaluation scores:",
            scoreResult.error
          );

        }

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

    await loadEvaluations();

    await loadEvaluationScores();

    renderRanking();

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

      console.warn(
        "Attendance:",
        result.error
      );

      state.attendance =
        [];

      return;

    }

    state.attendance =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    renderAttendance();

  }


  function resetAttendanceForm() {

    setValue(
      "attendanceDate",
      today()
    );

    setValue(
      "attendanceAthlete",
      ""
    );

  }


  function initializeAttendancePage() {

    fillAthleteSelects();

    loadAttendanceForDate(
      today()
    );

  }


  async function loadAttendanceForDate(
    date
  ) {

    if (!supabaseClient) {
      return;
    }

    const result =
      await queryTable(
        "attendance",
        {
          eq: {
            date
          },
          order: {
            column:
              "created_at",
            ascending:
              true
          }
        }
      );

    if (
      result.error
    ) {

      console.warn(
        "Attendance date:",
        result.error
      );

      return;

    }

    const rows =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];

    const container =
      $("attendanceList");

    if (!container) {
      return;
    }

    if (!rows.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🗓️
          </div>

          <h2>
            حضور و غیابی ثبت نشده است
          </h2>

          <p>
            برای این تاریخ هنوز اطلاعاتی ثبت نشده.
          </p>

        </div>
      `;

      return;

    }

    container.innerHTML =
      rows
        .map(
          row => {

            const athlete =
              state.athletes.find(
                item =>
                  String(
                    item.id
                  ) ===
                  String(
                    row.athlete_id
                  )
              );

            return `

              <div
                class="attendance-card"
              >

                <strong>
                  ${escapeHTML(
                    athlete
                      ? getAthleteName(
                          athlete
                        )
                      : "ورزشکار"
                  )}
                </strong>

                <span>
                  ${
                    isPresent(row)
                      ? "🟢 حاضر"
                      : "🔴 غایب"
                  }
                </span>

              </div>

            `;

          }
        )
        .join("");

  }


  function renderAttendance() {

    const container =
      $("attendanceList");

    if (!container) {
      return;
    }

    if (
      !state.attendance.length
    ) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📅
          </div>

          <h2>
            سابقه حضور خالی است
          </h2>

          <p>
            هنوز حضور و غیابی ثبت نشده است.
          </p>

        </div>
      `;

      return;

    }

    loadAttendanceForDate(
      $("attendanceDate")
        ?.value ||
      today()
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
      $("attendanceAthlete")
        ?.value;

    const date =
      $("attendanceDate")
        ?.value ||
      today();

    if (!athleteId) {

      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );

      return;

    }

    const present =
      $("attendancePresent")
        ? Boolean(
            $("attendancePresent")
              .checked
          )
        : true;

    const payload = {

      athlete_id:
        athleteId,

      date,

      present

    };


    const result =
      await supabaseClient
        .from(
          "attendance"
        )
        .upsert(
          payload,
          {
            onConflict:
              "athlete_id,date"
          }
        );


    if (result.error) {

      console.error(
        "Attendance save:",
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

    await loadAttendance();

    renderRanking();

    loadAttendanceForDate(
      date
    );

       }
   /* =======================================================
     ANNOUNCEMENTS
  ======================================================= */

  async function loadAnnouncements() {

    const result =
      await queryTable(
        "announcements",
        {
          order: {
            column: "date",
            ascending: false
          }
        }
      );

    state.announcements =
      result.error
        ? []
        : Array.isArray(result.data)
          ? result.data
          : [];

    renderAnnouncements();
    updateAnnouncementStats();
  }


  function announcementTypeLabel(type) {

    const labels = {

      general:
        "📢 عمومی",

      training:
        "🥋 تمرین جودو",

      bodybuilding:
        "🏋️ بدنسازی",

      track:
        "🏃 تمرین پیست",

      camp:
        "🚌 اردو",

      meeting:
        "👥 جلسه",

      important:
        "🚨 مهم"

    };

    return (
      labels[type] ||
      "📢 عمومی"
    );
  }


  function renderAnnouncements() {

    const container =
      $("announcementsList");

    if (!container) return;

    let list = [
      ...state.announcements
    ];

    const search =
      (
        $("announcementSearch")
          ?.value || ""
      )
        .trim()
        .toLowerCase();

    const filter =
      $("announcementFilter")
        ?.value || "all";


    if (search) {

      list =
        list.filter(item =>
          [
            item.title,
            item.content,
            item.location,
            item.type
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search)
        );
    }


    if (filter !== "all") {

      list =
        list.filter(
          item =>
            item.type === filter
        );
    }


    if (!list.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📢
          </div>

          <h2>
            اطلاعیه‌ای پیدا نشد
          </h2>

          <p>
            هنوز اطلاعیه‌ای ثبت نشده است.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML =
      list
        .map(item => `

          <div class="announcement-card">

            <div class="announcement-card-top">

              <div class="announcement-icon">
                📢
              </div>

              <div class="announcement-main">

                <h3>
                  ${escapeHTML(
                    item.title ||
                    "اطلاعیه"
                  )}
                </h3>

                <span
                  class="announcement-type-badge"
                >
                  ${announcementTypeLabel(
                    item.type
                  )}
                </span>

              </div>

              <div class="event-actions">

                <button
                  type="button"
                  data-edit-announcement="${escapeHTML(
                    item.id
                  )}"
                >
                  ✏️
                </button>

                <button
                  type="button"
                  data-delete-announcement="${escapeHTML(
                    item.id
                  )}"
                >
                  🗑️
                </button>

              </div>

            </div>


            <div class="announcement-details">

              <div class="event-detail">

                <span>
                  📅 تاریخ
                </span>

                <strong>
                  ${escapeHTML(
                    item.date || "-"
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  📍 محل
                </span>

                <strong>
                  ${escapeHTML(
                    item.location || "-"
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  ⏰ ساعت
                </span>

                <strong>
                  ${escapeHTML(
                    item.start_time || "-"
                  )}
                </strong>

              </div>

            </div>


            ${
              item.content
                ? `
                  <div class="announcement-content">
                    ${escapeHTML(
                      item.content
                    )}
                  </div>
                `
                : ""
            }

          </div>

        `)
        .join("");


    bindAnnouncementActions();
  }


  function updateAnnouncementStats() {

    setText(
      "totalAnnouncements",
      faNumber(
        state.announcements.length
      )
    );


    setText(
      "activeAnnouncements",
      faNumber(
        state.announcements.filter(
          item =>
            item.active !== false
        ).length
      )
    );


    setText(
      "upcomingAnnouncements",
      faNumber(
        state.announcements.filter(
          item =>
            item.date &&
            item.date >= today()
        ).length
      )
    );
  }


  function bindAnnouncementActions() {

    $$("[data-delete-announcement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteAnnouncement(
              button.dataset
                .deleteAnnouncement
            )
        );

      });


    $$("[data-edit-announcement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editAnnouncement(
              button.dataset
                .editAnnouncement
            )
        );

      });
  }


  function resetAnnouncementForm() {

    [
      "announcementTitle",
      "announcementLocation",
      "announcementStartTime",
      "announcementEndTime",
      "announcementContent"
    ].forEach(id => {

      const el = $(id);

      if (el) {
        el.value = "";
      }

    });


    setValue(
      "announcementType",
      "general"
    );


    setValue(
      "announcementDate",
      today()
    );


    state.editingAnnouncementId =
      null;


    setText(
      "saveAnnouncementBtn",
      "📢 انتشار اطلاعیه"
    );
  }


  function editAnnouncement(id) {

    const item =
      state.announcements.find(
        x =>
          String(x.id) ===
          String(id)
      );

    if (!item) return;


    state.editingAnnouncementId =
      id;


    setValue(
      "announcementTitle",
      item.title || ""
    );


    setValue(
      "announcementType",
      item.type || "general"
    );


    setValue(
      "announcementDate",
      item.date || ""
    );


    setValue(
      "announcementLocation",
      item.location || ""
    );


    setValue(
      "announcementStartTime",
      item.start_time || ""
    );


    setValue(
      "announcementEndTime",
      item.end_time || ""
    );


    setValue(
      "announcementContent",
      item.content || ""
    );


    setText(
      "saveAnnouncementBtn",
      "💾 ذخیره تغییرات"
    );


    openModal(
      "announcementModal"
    );
  }


  async function saveAnnouncement() {

    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;
    }


    const title =
      (
        $("announcementTitle")
          ?.value || ""
      ).trim();


    if (!title) {

      showMessage(
        "عنوان اطلاعیه را وارد کنید.",
        "error"
      );

      return;
    }


    const payload = {

      title,

      type:
        $("announcementType")
          ?.value ||
        "general",

      date:
        $("announcementDate")
          ?.value ||
        null,

      location:
        (
          $("announcementLocation")
            ?.value || ""
        ).trim() ||
        null,

      start_time:
        $("announcementStartTime")
          ?.value ||
        null,

      end_time:
        $("announcementEndTime")
          ?.value ||
        null,

      content:
        (
          $("announcementContent")
            ?.value || ""
        ).trim() ||
        null,

      active: true
    };


    let result;


    if (
      state.editingAnnouncementId
    ) {

      result =
        await supabaseClient
          .from("announcements")
          .update(payload)
          .eq(
            "id",
            state.editingAnnouncementId
          );

    } else {

      result =
        await supabaseClient
          .from("announcements")
          .insert(payload);

    }


    if (result.error) {

      console.error(
        "Announcement:",
        result.error
      );

      showMessage(
        "ذخیره اطلاعیه انجام نشد.",
        "error"
      );

      return;
    }


    showMessage(
      state.editingAnnouncementId
        ? "اطلاعیه ویرایش شد."
        : "اطلاعیه ثبت شد."
    );


    closeModal(
      "announcementModal"
    );


    resetAnnouncementForm();


    await loadAnnouncements();
  }


  async function deleteAnnouncement(id) {

    if (
      !confirm(
        "آیا از حذف این اطلاعیه مطمئن هستید؟"
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
        .from("announcements")
        .delete()
        .eq("id", id);


    if (result.error) {

      showMessage(
        "حذف اطلاعیه انجام نشد.",
        "error"
      );

      return;
    }


    showMessage(
      "اطلاعیه حذف شد."
    );


    await loadAnnouncements();
  }



  /* =======================================================
     COMPETITIONS
  ======================================================= */

  async function loadCompetitions() {

    const result =
      await queryTable(
        "competitions",
        {
          order: {
            column: "date",
            ascending: true
          }
        }
      );


    state.competitions =
      result.error
        ? []
        : Array.isArray(result.data)
          ? result.data
          : [];


    renderCompetitions();
    updateCompetitionStats();
    renderRanking();
  }


  function competitionStatus(item) {

    if (
      item.status ===
      "cancelled"
    ) {
      return "cancelled";
    }


    if (
      item.status ===
      "completed"
    ) {
      return "completed";
    }


    if (
      item.date &&
      item.date < today()
    ) {
      return "completed";
    }


    return "upcoming";
  }


  function competitionStatusLabel(status) {

    if (
      status ===
      "completed"
    ) {
      return "✅ برگزارشده";
    }


    if (
      status ===
      "cancelled"
    ) {
      return "❌ لغوشده";
    }


    return "⏳ پیش‌رو";
  }


  function renderCompetitions() {

    const container =
      $("competitionsList");

    if (!container) return;


    let list = [
      ...state.competitions
    ];


    const search =
      (
        $("competitionSearch")
          ?.value || ""
      )
        .trim()
        .toLowerCase();


    const filter =
      $("competitionFilter")
        ?.value || "all";


    if (search) {

      list =
        list.filter(item =>
          [
            item.title,
            item.location,
            item.age_group,
            item.weights,
            item.description
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search)
        );
    }


    if (filter !== "all") {

      list =
        list.filter(
          item =>
            competitionStatus(
              item
            ) === filter
        );
    }


    if (!list.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📅
          </div>

          <h2>
            مسابقه‌ای پیدا نشد
          </h2>

          <p>
            هنوز مسابقه‌ای ثبت نشده است.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML =
      list
        .map(item => {

          const status =
            competitionStatus(
              item
            );


          return `

            <div class="competition-card">

              <div class="competition-card-top">

                <div class="competition-icon">
                  📅
                </div>


                <div class="competition-main">

                  <h3>
                    ${escapeHTML(
                      item.title ||
                      "مسابقه"
                    )}
                  </h3>

                  <span
                    class="competition-status-badge"
                  >
                    ${competitionStatusLabel(
                      status
                    )}
                  </span>

                </div>


                <div class="event-actions">

                  <button
                    type="button"
                    data-edit-competition="${escapeHTML(
                      item.id
                    )}"
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    data-delete-competition="${escapeHTML(
                      item.id
                    )}"
                  >
                    🗑️
                  </button>

                </div>

              </div>


              <div class="competition-details">

                <div class="event-detail">

                  <span>
                    📅 تاریخ
                  </span>

                  <strong>
                    ${escapeHTML(
                      item.date || "-"
                    )}
                  </strong>

                </div>


                <div class="event-detail">

                  <span>
                    📍 محل
                  </span>

                  <strong>
                    ${escapeHTML(
                      item.location || "-"
                    )}
                  </strong>

                </div>


                <div class="event-detail">

                  <span>
                    👥 رده سنی
                  </span>

                  <strong>
                    ${escapeHTML(
                      item.age_group || "-"
                    )}
                  </strong>

                </div>

              </div>


              ${
                item.weights
                  ? `
                    <div class="competition-description">

                      <strong>
                        ⚖️ وزن‌ها:
                      </strong>

                      ${escapeHTML(
                        item.weights
                      )}

                    </div>
                  `
                  : ""
              }


              ${
                item.description
                  ? `
                    <div class="competition-description">
                      ${escapeHTML(
                        item.description
                      )}
                    </div>
                  `
                  : ""
              }

            </div>

          `;
        })
        .join("");


    bindCompetitionActions();
  }


  function updateCompetitionStats() {

    setText(
      "totalCompetitions",
      faNumber(
        state.competitions.length
      )
    );


    setText(
      "upcomingCompetitions",
      faNumber(
        state.competitions.filter(
          item =>
            competitionStatus(item) ===
            "upcoming"
        ).length
      )
    );


    setText(
      "completedCompetitions",
      faNumber(
        state.competitions.filter(
          item =>
            competitionStatus(item) ===
            "completed"
        ).length
      )
    );
  }


  function bindCompetitionActions() {

    $$("[data-delete-competition]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deleteCompetition(
              button.dataset
                .deleteCompetition
            )
        );

      });


    $$("[data-edit-competition]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editCompetition(
              button.dataset
                .editCompetition
            )
        );

      });
  }


  function resetCompetitionForm() {

    [
      "competitionTitle",
      "competitionDate",
      "competitionLocation",
      "competitionStartTime",
      "competitionEndTime",
      "competitionAgeGroup",
      "competitionWeights",
      "competitionDescription"
    ].forEach(id => {

      const el = $(id);

      if (el) {
        el.value = "";
      }

    });


    setValue(
      "competitionDate",
      today()
    );


    state.editingCompetitionId =
      null;


    setText(
      "saveCompetitionBtn",
      "📅 ثبت مسابقه"
    );
  }


  function editCompetition(id) {

    const item =
      state.competitions.find(
        x =>
          String(x.id) ===
          String(id)
      );

    if (!item) return;


    state.editingCompetitionId =
      id;


    setValue(
      "competitionTitle",
      item.title || ""
    );


    setValue(
      "competitionDate",
      item.date || ""
    );


    setValue(
      "competitionLocation",
      item.location || ""
    );


    setValue(
      "competitionStartTime",
      item.start_time || ""
    );


    setValue(
      "competitionEndTime",
      item.end_time || ""
    );


    setValue(
      "competitionAgeGroup",
      item.age_group || ""
    );


    setValue(
      "competitionWeights",
      item.weights || ""
    );


    setValue(
      "competitionDescription",
      item.description || ""
    );


    setText(
      "saveCompetitionBtn",
      "💾 ذخیره تغییرات"
    );


    openModal(
      "competitionModal"
    );
  }


  async function saveCompetition() {

    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;
    }


    const title =
      (
        $("competitionTitle")
          ?.value || ""
      ).trim();


    if (!title) {

      showMessage(
        "عنوان مسابقه را وارد کنید.",
        "error"
      );

      return;
    }


    const payload = {

      title,

      date:
        $("competitionDate")
          ?.value ||
        null,

      location:
        (
          $("competitionLocation")
            ?.value || ""
        ).trim() ||
        null,

      start_time:
        $("competitionStartTime")
          ?.value ||
        null,

      end_time:
        $("competitionEndTime")
          ?.value ||
        null,

      age_group:
        (
          $("competitionAgeGroup")
            ?.value || ""
        ).trim() ||
        null,

      weights:
        (
          $("competitionWeights")
            ?.value || ""
        ).trim() ||
        null,

      description:
        (
          $("competitionDescription")
            ?.value || ""
        ).trim() ||
        null
    };


    let result;


    if (
      state.editingCompetitionId
    ) {

      result =
        await supabaseClient
          .from("competitions")
          .update(payload)
          .eq(
            "id",
            state.editingCompetitionId
          );

    } else {

      result =
        await supabaseClient
          .from("competitions")
          .insert(payload);

    }


    if (result.error) {

      console.error(
        "Competition save:",
        result.error
      );

      showMessage(
        "ذخیره مسابقه انجام نشد.",
        "error"
      );

      return;
    }


    showMessage(
      state.editingCompetitionId
        ? "مسابقه ویرایش شد."
        : "مسابقه ثبت شد."
    );


    closeModal(
      "competitionModal"
    );


    resetCompetitionForm();


    await loadCompetitions();
  }


  async function deleteCompetition(id) {

    if (
      !confirm(
        "آیا از حذف این مسابقه مطمئن هستید؟"
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
        .from("competitions")
        .delete()
        .eq("id", id);


    if (result.error) {

      showMessage(
        "حذف مسابقه انجام نشد.",
        "error"
      );

      return;
    }


    showMessage(
      "مسابقه حذف شد."
    );


    await loadCompetitions();
  }



  /* =======================================================
     RANKING
     100 POINTS
     EVALUATION = 50
     ACHIEVEMENTS = 30
     ATTENDANCE = 20
  ======================================================= */

  function calculateAthleteRanking() {

    const athletes =
      Array.isArray(state.athletes)
        ? state.athletes
        : [];


    const evaluations =
      Array.isArray(state.evaluations)
        ? state.evaluations
        : [];


    const achievements =
      Array.isArray(state.achievements)
        ? state.achievements
        : [];


    const attendance =
      Array.isArray(state.attendance)
        ? state.attendance
        : [];


    const ranking =
      athletes.map(athlete => {

        const athleteId =
          String(athlete.id);


        /* -----------------------------------------------
           EVALUATION / 50
        ----------------------------------------------- */

        const athleteEvaluations =
          evaluations.filter(
            item =>
              String(
                item.athlete_id
              ) === athleteId
          );


        let evaluationAverage = 0;


        if (
          athleteEvaluations.length
        ) {

          const validScores =
            athleteEvaluations
              .map(
                item =>
                  Number(
                    item.total_score ??
                    item.score ??
                    0
                  )
              )
              .filter(
                Number.isFinite
              );


          if (
            validScores.length
          ) {

            const total =
              validScores.reduce(
                (sum, score) =>
                  sum + score,
                0
              );


            evaluationAverage =
              total /
              validScores.length;
          }
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
           ACHIEVEMENTS / 30
        ----------------------------------------------- */

        const athleteAchievements =
          achievements.filter(
            item =>
              String(
                item.athlete_id
              ) === athleteId
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

            } else if (
              medal === "silver"
            ) {

              achievementPoints += 7;

            } else if (
              medal === "bronze"
            ) {

              achievementPoints += 5;

            } else {

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


        /* -----------------------------------------------
           ATTENDANCE / 20
        ----------------------------------------------- */

        const athleteAttendance =
          attendance.filter(
            item =>
              String(
                item.athlete_id
              ) === athleteId
          );


        let attendancePoints = 0;

        let attendanceRate = 0;


        if (
          athleteAttendance.length
        ) {

          const presentCount =
            athleteAttendance.filter(
              isPresent
            ).length;


          attendanceRate =
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
        ----------------------------------------------- */

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

          attendanceRate,

          totalScore

        };

      });


    /* -----------------------------------------------
       SORT
    ----------------------------------------------- */

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
          b.attendancePoints !==
          a.attendancePoints
        ) {

          return (
            b.attendancePoints -
            a.attendancePoints
          );
        }


        return (
          b.achievementPoints -
          a.achievementPoints
        );

      }
    );


    /* -----------------------------------------------
       RANK
    ----------------------------------------------- */

    return ranking.map(
      (item, index) => ({

        ...item,

        rank:
          index + 1

      })
    );
  }


  function rankingMedal(rank) {

    if (rank === 1) {
      return "🥇";
    }

    if (rank === 2) {
      return "🥈";
    }

    if (rank === 3) {
      return "🥉";
    }

    return "🏅";
  }


  function formatRankingScore(value) {

    const number =
      Number(value);


    if (
      !Number.isFinite(number)
    ) {

      return "۰";
    }


    return faNumber(
      number.toFixed(1)
    );
  }


  function renderRanking() {

    const container =
      $("rankingList");


    if (!container) {
      return;
    }


    if (
      !state.athletes.length
    ) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🏅
          </div>

          <h2>
            هنوز رنکینگی محاسبه نشده است
          </h2>

          <p>
            پس از دریافت اطلاعات ورزشکاران،
            جدول رنکینگ نمایش داده می‌شود.
          </p>

        </div>
      `;

      return;
    }


    let ranking =
      calculateAthleteRanking();


    const search =
      (
        $("rankingSearch")
          ?.value || ""
      )
        .trim()
        .toLowerCase();


    if (search) {

      ranking =
        ranking.filter(item => {

          const athlete =
            item.athlete;


          const text =
            [
              getAthleteName(
                athlete
              ),
              athlete.weight,
              athlete.belt,
              athlete.category,
              athlete.age_group
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return text.includes(
            search
          );

        });
    }


    if (!ranking.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🔎
          </div>

          <h2>
            ورزشکاری پیدا نشد
          </h2>

          <p>
            نتیجه‌ای برای جستجوی شما وجود ندارد.
          </p>

        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="ranking-table-wrapper">

        <table class="ranking-table">

          <thead>

            <tr>

              <th>
                رتبه
              </th>

              <th>
                ورزشکار
              </th>

              <th>
                ارزیابی
              </th>

              <th>
                افتخارات
              </th>

              <th>
                حضور
              </th>

              <th>
                امتیاز کلی
              </th>

            </tr>

          </thead>


          <tbody>

            ${
              ranking
                .map(item => {

                  const athlete =
                    item.athlete;


                  return `

                    <tr
                      class="${
                        item.rank <= 3
                          ? "ranking-top"
                          : ""
                      }"
                    >

                      <td>

                        <span
                          class="ranking-position"
                        >

                          ${rankingMedal(
                            item.rank
                          )}

                          ${faNumber(
                            item.rank
                          )}

                        </span>

                      </td>


                      <td>

                        <div
                          class="ranking-athlete"
                        >

                          <strong>
                            ${escapeHTML(
                              getAthleteName(
                                athlete
                              )
                            )}
                          </strong>

                          <small>

                            ${
                              athlete.belt
                                ? `کمربند: ${escapeHTML(
                                    athlete.belt
                                  )}`
                                : ""
                            }

                          </small>

                        </div>

                      </td>


                      <td>

                        <strong>
                          ${formatRankingScore(
                            item.evaluationPoints
                          )}
                        </strong>

                        <small>
                          / ۵۰
                        </small>

                      </td>


                      <td>

                        <strong>
                          ${formatRankingScore(
                            item.achievementPoints
                          )}
                        </strong>

                        <small>
                          / ۳۰
                        </small>

                      </td>


                      <td>

                        <strong>
                          ${formatRankingScore(
                            item.attendancePoints
                          )}
                        </strong>

                        <small>
                          / ۲۰
                        </small>

                      </td>


                      <td>

                        <span
                          class="ranking-score"
                        >

                          ${formatRankingScore(
                            item.totalScore
                          )}

                          <small>
                            / ۱۰۰
                          </small>

                        </span>

                      </td>

                    </tr>

                  `;

                })
                .join("")
            }

          </tbody>

        </table>

      </div>

    `;
  }


  function setupRankingSearch() {

    const search =
      $("rankingSearch");


    if (!search) {
      return;
    }


    search.addEventListener(
      "input",
      renderRanking
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
            column: "created_at",
            ascending: false
          }
        }
      );


    if (result.error) {

      console.warn(
        "Tests:",
        result.error
      );


      state.tests = [];

    } else {

      state.tests =
        Array.isArray(result.data)
          ? result.data
          : [];

    }
  }



  /* =======================================================
     PROGRESS HISTORY
  ======================================================= */

  async function loadProgressHistory() {

    const result =
      await queryTable(
        "progress_history",
        {
          order: {
            column: "created_at",
            ascending: false
          }
        }
      );


    if (result.error) {

      console.warn(
        "Progress history:",
        result.error
      );


      state.progressHistory = [];

    } else {

      state.progressHistory =
        Array.isArray(result.data)
          ? result.data
          : [];

    }
  }



  /* =======================================================
     SETTINGS
  ======================================================= */

  async function loadSettings() {

    const result =
      await queryTable(
        "settings"
      );


    if (result.error) {

      console.warn(
        "Settings table:",
        result.error
      );


      state.settings = {};

      return;
    }


    const rows =
      Array.isArray(result.data)
        ? result.data
        : [];


    state.settings = {};


    rows.forEach(row => {

      if (
        row &&
        row.key !== undefined
      ) {

        state.settings[
          row.key
        ] = row.value;

      }

    });
  }



  /* =======================================================
     SEARCHES / FILTERS
  ======================================================= */

  function setupPageSearches() {

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
     SAVE BUTTONS
  ======================================================= */

  function setupSaveButtons() {

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
     ESC KEY
  ======================================================= */

  function setupEscapeKey() {

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape"
        ) {

          closeAllModals();

        }

      }
    );
  }



  /* =======================================================
     INITIAL DATA LOAD
  ======================================================= */

  async function loadAllCoachData() {

    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست. کلید اتصال را بررسی کنید.",
        "error"
      );


      renderRanking();

      return;
    }


    /*
       ورزشکاران ابتدا بارگذاری می‌شوند.
    */

    await loadAthletes();


    /*
       اطلاعات دیگر مستقل از یکدیگر
       بارگذاری می‌شوند.
    */

    await Promise.allSettled([

      loadEvaluations(),

      loadEvaluationPeriods(),

      loadEvaluationCriteria(),

      loadEvaluationScores(),

      loadAttendance(),

      loadAchievements(),

      loadAnnouncements(),

      loadCompetitions(),

      loadTests(),

      loadProgressHistory(),

      loadSettings()

    ]);


    /*
       رندر نهایی
    */

    renderAthletes();

    renderEvaluations();

    renderAchievements();

    renderAnnouncements();

    renderCompetitions();

    renderAttendance();

    renderEvaluationPeriods();

    renderEvaluationCriteria();

    renderEvaluationScoreInputs();

    renderRanking();

    updateDashboard();
  }



  /* =======================================================
     REFRESH RANKING
  ======================================================= */

  function refreshRanking() {

    renderRanking();

  }



  /* =======================================================
     GLOBAL REFRESH
  ======================================================= */

  async function refreshCoachPanel() {

    await loadAllCoachData();


    showMessage(
      "اطلاعات پنل مربی به‌روزرسانی شد."
    );
  }



  /* =======================================================
     INITIALIZATION
  ======================================================= */

  async function initCoachPanel() {

    if (
      document.body.dataset
        .coachInitialized === "true"
    ) {

      return;
    }


    document.body.dataset
      .coachInitialized =
      "true";


    setupNavigation();

    setupEventTabs();

    setupModals();

    setupAthleteSearch();

    setupRankingSearch();

    setupPageSearches();

    setupSaveButtons();

    setupEscapeKey();


    /*
       فرم‌های اولیه
    */

    resetAthleteForm();

    resetEvaluationForm();

    resetAttendanceForm();

    resetAchievementForm();

    resetAnnouncementForm();

    resetCompetitionForm();


    /*
       بارگذاری
    */

    await loadAllCoachData();


    /*
       رندر قطعی رنکینگ
    */

    renderRanking();
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

  } else {

    initCoachPanel();

  }



  /* =======================================================
     GLOBAL API
  ======================================================= */

  window.JudoTabiatCoach = {

    refresh:
      refreshCoachPanel,

    refreshRanking:
      refreshRanking,

    calculateRanking:
      calculateAthleteRanking,

    getAthletes:
      () =>
        [...state.athletes],

    getAchievements:
      () =>
        [...state.achievements],

    getEvaluations:
      () =>
        [...state.evaluations],

    getAttendance:
      () =>
        [...state.attendance]

  };



  /* =======================================================
     END OF COACH.JS
  ======================================================= */

})();
