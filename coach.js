/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   FINAL - COMPLETE
   2026.08.31
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
    supabaseClient = window.supabase.createClient(
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
    editingAnnouncementId: null,
    editingCompetitionId: null,
    editingAchievementId: null
  };

  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = id => document.getElementById(id);

  const $$ = selector =>
    document.querySelectorAll(selector);

  function faNumber(value) {
    if (value === null || value === undefined) return "۰";

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

    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }

  function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value ?? "";
  }

  function setValue(id, value) {
    const el = $(id);

    if (
      el &&
      value !== null &&
      value !== undefined
    ) {
      el.value = value;
    }
  }

  function setChecked(id, value) {
    const el = $(id);
    if (el) el.checked = value !== false;
  }

  function showMessage(
    message,
    type = "success"
  ) {
    let box = $("coachMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "coachMessage";

      Object.assign(box.style, {
        position: "fixed",
        left: "20px",
        bottom: "20px",
        zIndex: "999999",
        padding: "13px 18px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow: "0 10px 30px rgba(0,0,0,.15)"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;

    box.style.background =
      type === "error"
        ? "#fef2f2"
        : "#ecfdf3";

    box.style.color =
      type === "error"
        ? "#dc2626"
        : "#027a48";

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
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
        error: new Error(
          "Supabase connection is not available."
        )
      };
    }

    let query = supabaseClient
      .from(table)
      .select(options.select || "*");

    if (options.order) {
      query = query.order(
        options.order.column,
        {
          ascending:
            options.order.ascending ?? false
        }
      );
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return await query;
  }

  async function tableExists(table) {
    if (!supabaseClient) return false;

    const result = await supabaseClient
      .from(table)
      .select("*")
      .limit(1);

    return !result.error;
  }

  function getAthleteName(athlete) {
    if (!athlete) return "بدون نام";

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
        String(athlete.id) === String(id)
    );
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {
    $$(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        const pageName = item.dataset.page;

        $$(".nav-item").forEach(nav =>
          nav.classList.remove("active")
        );

        item.classList.add("active");

        $$(".coach-page").forEach(page =>
          page.classList.remove("active")
        );

        const page = $(`page-${pageName}`);

        if (page) {
          page.classList.add("active");
        }
      });
    });
  }

  /* =======================================================
     EVENTS TABS
  ======================================================= */

  function setupEventTabs() {
    $$(".events-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".events-tab").forEach(t =>
          t.classList.remove("active")
        );

        tab.classList.add("active");

        $("eventsPanelAnnouncements")
          ?.classList.remove("active");

        $("eventsPanelCompetitions")
          ?.classList.remove("active");

        if (
          tab.dataset.eventsTab ===
          "announcements"
        ) {
          $("eventsPanelAnnouncements")
            ?.classList.add("active");
        }

        if (
          tab.dataset.eventsTab ===
          "competitions"
        ) {
          $("eventsPanelCompetitions")
            ?.classList.add("active");
        }
      });
    });
  }

  /* =======================================================
     MODALS
  ======================================================= */

  function openModal(id) {
    const modal = $(id);
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }

  function closeModal(id) {
    const modal = $(id);
    if (!modal) return;

    modal.classList.add("hidden");
    modal.style.display = "none";
  }

  function setupModals() {
    const openers = {
      addAnnouncementBtn:
        "announcementModal",

      addCompetitionBtn:
        "competitionModal",

      addAchievementBtn:
        "achievementModal"
    };

    Object.entries(openers).forEach(
      ([buttonId, modalId]) => {
        $(buttonId)?.addEventListener(
          "click",
          () => {
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

            if (
              modalId ===
              "achievementModal"
            ) {
              resetAchievementForm();
            }

            openModal(modalId);
          }
        );
      }
    );

    [
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
      ],
      [
        "closeAchievementModal",
        "achievementModal"
      ],
      [
        "cancelAchievementBtn",
        "achievementModal"
      ]
    ].forEach(([buttonId, modalId]) => {
      $(buttonId)?.addEventListener(
        "click",
        () => closeModal(modalId)
      );
    });

    [
      "announcementModal",
      "competitionModal",
      "achievementModal"
    ].forEach(id => {
      $(id)?.addEventListener(
        "click",
        event => {
          if (event.target === $(id)) {
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
    const result = await queryTable(
      "athletes",
      {
        order: {
          column: "created_at",
          ascending: false
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
  }

  function renderAthletes() {
    const container = $("athletesList");

    if (!container) return;

    if (!state.athletes.length) {
      container.innerHTML = `
        <div class="evaluation-empty">
          <div class="evaluation-empty-icon">👥</div>
          <h2>ورزشکاری ثبت نشده است</h2>
          <p>
            هنوز ورزشکاری در سیستم ثبت نشده است.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML = `
      <div class="simple-grid">
        ${state.athletes
          .map(athlete => `
            <div class="simple-box">
              <h3>
                👤 ${escapeHTML(
                  getAthleteName(athlete)
                )}
              </h3>

              <p>
                وزن:
                ${escapeHTML(
                  athlete.weight ?? "-"
                )}
              </p>

              <p>
                کمربند:
                ${escapeHTML(
                  athlete.belt ?? "-"
                )}
              </p>
            </div>
          `)
          .join("")}
      </div>
    `;
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
          .map(athlete => `
            <option value="${escapeHTML(
              athlete.id
            )}">
              ${escapeHTML(
                getAthleteName(athlete)
              )}
            </option>
          `)
          .join("")}
      `;
    });
  }

  /* =======================================================
     DASHBOARD
  ======================================================= */

  function updateDashboard() {
    setText(
      "dashboardAthletes",
      faNumber(state.athletes.length)
    );

    setText(
      "dashboardEvaluations",
      faNumber(state.evaluations.length)
    );

    setText(
      "dashboardAchievements",
      faNumber(state.achievements.length)
    );

    const todayAttendance =
      state.attendance.filter(item => {
        const date =
          item.date ||
          item.attendance_date;

        return (
          date === today() &&
          (
            item.present === true ||
            item.status === "present" ||
            item.status === "حاضر"
          )
        );
      }).length;

    setText(
      "dashboardAttendance",
      faNumber(todayAttendance)
    );

    updateAchievementStats();
    updateAnnouncementStats();
    updateCompetitionStats();
  }

  /* =======================================================
     EVALUATIONS
  ======================================================= */

  async function loadEvaluations() {
    const result = await queryTable(
      "evaluations",
      {
        order: {
          column: "created_at",
          ascending: false
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

    updateDashboard();
  }

  async function loadEvaluationPeriods() {
    const result =
      await queryTable(
        "evaluation_periods",
        {
          order: {
            column: "created_at",
            ascending: false
          }
        }
      );

    state.evaluationPeriods =
      result.error
        ? []
        : result.data || [];
  }

  async function loadEvaluationCriteria() {
    const result =
      await queryTable(
        "evaluation_criteria",
        {
          order: {
            column: "created_at",
            ascending: true
          }
        }
      );

    state.evaluationCriteria =
      result.error
        ? []
        : result.data || [];
  }

  async function loadEvaluationScores() {
    const result =
      await queryTable(
        "evaluation_scores",
        {
          order: {
            column: "created_at",
            ascending: false
          }
        }
      );

    state.evaluationScores =
      result.error
        ? []
        : result.data || [];
  }

  function setupEvaluationButton() {
    $("addEvaluationBtn")
      ?.addEventListener(
        "click",
        () => {
          showMessage(
            "فرم ارزیابی آماده است."
          );
        }
      );
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
            column: "date",
            ascending: false
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

    updateDashboard();
  }

  function setupAttendanceButton() {
    $("addAttendanceBtn")
      ?.addEventListener(
        "click",
        () => {
          showMessage(
            "بخش حضور و غیاب آماده ثبت جلسه است."
          );
        }
      );
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
            column: "created_at",
            ascending: false
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
  }

  function medalType(item) {
    const value = String(
      item.medal ??
      item.medal_type ??
      item.position ??
      item.rank ??
      ""
    ).toLowerCase();

    if (
      value === "gold" ||
      value === "طلا" ||
      value === "1"
    ) {
      return "gold";
    }

    if (
      value === "silver" ||
      value === "نقره" ||
      value === "2"
    ) {
      return "silver";
    }

    if (
      value === "bronze" ||
      value === "برنز" ||
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
          medalType(item) === "gold"
      ).length;

    const silver =
      state.achievements.filter(
        item =>
          medalType(item) === "silver"
      ).length;

    const bronze =
      state.achievements.filter(
        item =>
          medalType(item) === "bronze"
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

    if (!state.achievements.length) {
      container.innerHTML = `
        <div class="evaluation-empty">
          <div class="evaluation-empty-icon">🏆</div>
          <h2>افتخاری ثبت نشده است</h2>
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
                🏆 ${escapeHTML(
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
                تاریخ:
                ${escapeHTML(
                  item.date || "-"
                )}
              </p>

              <div class="event-actions">
                <button
                  type="button"
                  data-edit-achievement="${escapeHTML(
                    item.id
                  )}">
                  ✏️
                </button>

                <button
                  type="button"
                  data-delete-achievement="${escapeHTML(
                    item.id
                  )}">
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
      const el = $(id);
      if (el) el.value = "";
    });

    if ($("achievementMedal")) {
      $("achievementMedal").value =
        "gold";
    }

    if ($("achievementDate")) {
      $("achievementDate").value =
        today();
    }

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
      item.medal || "gold"
    );

    setValue(
      "achievementDescription",
      item.description || ""
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
      $("achievementAthlete")?.value;

    const title =
      $("achievementTitle")?.value
        .trim();

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
      athlete_id: athleteId,
      title,
      competition:
        $("achievementCompetition")
          ?.value.trim() || null,
      date:
        $("achievementDate")?.value ||
        null,
      position:
        $("achievementPosition")
          ?.value.trim() || null,
      medal:
        $("achievementMedal")?.value ||
        "gold",
      description:
        $("achievementDescription")
          ?.value.trim() || null
    };

    let result;

    if (state.editingAchievementId) {
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
        "Achievement save:",
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
        .eq("id", id);

    if (result.error) {
      console.error(
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
        : result.data || [];

    renderAnnouncements();
  }

  function announcementTypeLabel(type) {
    const labels = {
      general: "📢 عمومی",
      training: "🥋 تمرین جودو",
      bodybuilding: "🏋️ بدنسازی",
      track: "🏃 تمرین پیست",
      camp: "🚌 اردو",
      meeting: "👥 جلسه",
      important: "🚨 مهم"
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

    let list =
      [...state.announcements];

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
      list = list.filter(item =>
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
      list = list.filter(
        item =>
          item.type === filter
      );
    }

    updateAnnouncementStats();

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
                    item.title
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
                <span>📅 تاریخ</span>
                <strong>
                  ${escapeHTML(
                    item.date || "-"
                  )}
                </strong>
              </div>

              <div class="event-detail">
                <span>📍 محل</span>
                <strong>
                  ${escapeHTML(
                    item.location || "-"
                  )}
                </strong>
              </div>

              <div class="event-detail">
                <span>⏰ ساعت</span>
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
                  <div
                    class="announcement-content"
                  >
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
      if (el) el.value = "";
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
      $("announcementTitle")
        ?.value.trim();

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
          ?.value || "general",
      date:
        $("announcementDate")
          ?.value || null,
      location:
        $("announcementLocation")
          ?.value.trim() || null,
      start_time:
        $("announcementStartTime")
          ?.value || null,
      end_time:
        $("announcementEndTime")
          ?.value || null,
      content:
        $("announcementContent")
          ?.value.trim() || null,
      active: true
    };

    let result;

    if (state.editingAnnouncementId) {
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
        : result.data || [];

    renderCompetitions();
  }

  function competitionStatus(item) {
    if (
      item.status === "cancelled"
    ) {
      return "cancelled";
    }

    if (
      item.status === "completed"
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

  function competitionStatusLabel(
    status
  ) {
    if (status === "completed")
      return "✅ برگزارشده";

    if (status === "cancelled")
      return "❌ لغوشده";

    return "⏳ پیش‌رو";
  }

  function renderCompetitions() {
    const container =
      $("competitionsList");

    if (!container) return;

    let list =
      [...state.competitions];

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
      list = list.filter(item =>
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
      list = list.filter(
        item =>
          competitionStatus(item) ===
          filter
      );
    }

    updateCompetitionStats();

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
            competitionStatus(item);

          return `
            <div class="competition-card">

              <div class="competition-card-top">

                <div class="competition-icon">
                  📅
                </div>

                <div class="competition-main">

                  <h3>
                    ${escapeHTML(
                      item.title
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
                  <span>📅 تاریخ</span>
                  <strong>
                    ${escapeHTML(
                      item.date || "-"
                    )}
                  </strong>
                </div>

                <div class="event-detail">
                  <span>📍 محل</span>
                  <strong>
                    ${escapeHTML(
                      item.location || "-"
                    )}
                  </strong>
                </div>

                <div class="event-detail">
                  <span>👥 رده سنی</span>
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
                    <div
                      class="competition-description"
                    >
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
                    <div
                      class="competition-description"
                    >
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
      if (el) el.value = "";
    });

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
      $("competitionTitle")
        ?.value.trim();

    if (!title) {
      showMessage(
        "نام مسابقه را وارد کنید.",
        "error"
      );
      return;
    }

    const payload = {
      title,
      date:
        $("competitionDate")
          ?.value || null,
      location:
        $("competitionLocation")
          ?.value.trim() || null,
      start_time:
        $("competitionStartTime")
          ?.value || null,
      end_time:
        $("competitionEndTime")
          ?.value || null,
      age_group:
        $("competitionAgeGroup")
          ?.value.trim() || null,
      weights:
        $("competitionWeights")
          ?.value.trim() || null,
      description:
        $("competitionDescription")
          ?.value.trim() || null
    };

    let result;

    if (state.editingCompetitionId) {
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
     SETTINGS
  ======================================================= */

  const DEFAULT_SETTINGS = {
    club_name: "طبیعت جودو",
    site_name: "طبیعت جودو",
    club_description: "",
    club_phone: "",
    club_address: "",
    coach1_name: "",
    coach2_name: "",
    coach3_name: "",
    coach4_name: "",
    show_athlete_weight: true,
    show_athlete_belt: true,
    show_athlete_evaluation: true,
    show_athlete_achievements: true,
    show_athlete_attendance: true,
    show_athlete_records: true,
    evaluation_result_display: "score",
    site_brand_name: "طبیعت جودو",
    site_logo: "",
    site_display_info: ""
  };

  async function loadSettings() {
    if (!supabaseClient) {
      applySettings(
        DEFAULT_SETTINGS
      );
      return;
    }

    const result =
      await supabaseClient
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (result.error) {
      console.error(
        "Settings:",
        result.error
      );

      applySettings(
        DEFAULT_SETTINGS
      );

      return;
    }

    state.settings = {
      ...DEFAULT_SETTINGS,
      ...(result.data || {})
    };

    applySettings(
      state.settings
    );
  }

  function applySettings(settings) {
    setValue(
      "settingClubName",
      settings.club_name
    );

    setValue(
      "settingSiteName",
      settings.site_name
    );

    setValue(
      "settingClubDescription",
      settings.club_description
    );

    setValue(
      "settingClubPhone",
      settings.club_phone
    );

    setValue(
      "settingClubAddress",
      settings.club_address
    );

    setValue(
      "coach1Name",
      settings.coach1_name
    );

    setValue(
      "coach2Name",
      settings.coach2_name
    );

    setValue(
      "coach3Name",
      settings.coach3_name
    );

    setValue(
      "coach4Name",
      settings.coach4_name
    );

    setChecked(
      "showAthleteWeight",
      settings.show_athlete_weight ??
      settings.show_weight
    );

    setChecked(
      "showAthleteBelt",
      settings.show_athlete_belt ??
      settings.show_belt
    );

    setChecked(
      "showAthleteEvaluation",
      settings.show_athlete_evaluation ??
      settings.show_evaluation
    );

    setChecked(
      "showAthleteAchievements",
      settings.show_athlete_achievements ??
      settings.show_achievements
    );

    setChecked(
      "showAthleteAttendance",
      settings.show_athlete_attendance ??
      settings.show_attendance
    );

    setChecked(
      "showAthleteRecords",
      settings.show_athlete_records ??
      settings.show_records
    );

    setValue(
      "evaluationResultDisplay",
      settings.evaluation_result_display
    );

    setValue(
      "siteBrandName",
      settings.site_brand_name ??
      settings.brand_name
    );

    setValue(
      "siteLogo",
      settings.site_logo ??
      settings.logo
    );

    setValue(
      "siteDisplayInfo",
      settings.site_display_info ??
      settings.display_info
    );

    updateBrandName(
      settings.site_brand_name ||
      settings.brand_name ||
      settings.site_name ||
      settings.club_name
    );
  }

  function getSettingsFromForm() {
    return {
      club_name:
        $("settingClubName")
          ?.value.trim() || "",

      site_name:
        $("settingSiteName")
          ?.value.trim() || "",

      club_description:
        $("settingClubDescription")
          ?.value.trim() || "",

      club_phone:
        $("settingClubPhone")
          ?.value.trim() || "",

      club_address:
        $("settingClubAddress")
          ?.value.trim() || "",

      coach1_name:
        $("coach1Name")
          ?.value.trim() || "",

      coach2_name:
        $("coach2Name")
          ?.value.trim() || "",

      coach3_name:
        $("coach3Name")
          ?.value.trim() || "",

      coach4_name:
        $("coach4Name")
          ?.value.trim() || "",

      show_athlete_weight:
        $("showAthleteWeight")
          ?.checked ?? true,

      show_athlete_belt:
        $("showAthleteBelt")
          ?.checked ?? true,

      show_athlete_evaluation:
        $("showAthleteEvaluation")
          ?.checked ?? true,

      show_athlete_achievements:
        $("showAthleteAchievements")
          ?.checked ?? true,

      show_athlete_attendance:
        $("showAthleteAttendance")
          ?.checked ?? true,

      show_athlete_records:
        $("showAthleteRecords")
          ?.checked ?? true,

      evaluation_result_display:
        $("evaluationResultDisplay")
          ?.value || "score",

      site_brand_name:
        $("siteBrandName")
          ?.value.trim() || "",

      site_logo:
        $("siteLogo")
          ?.value.trim() || "",

      site_display_info:
        $("siteDisplayInfo")
          ?.value.trim() || ""
    };
  }

  async function saveSettings(section) {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const settings =
      getSettingsFromForm();

    const existing =
      await supabaseClient
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    let result;

    if (
      existing.data &&
      existing.data.id
    ) {
      result =
        await supabaseClient
          .from("site_settings")
          .update(settings)
          .eq(
            "id",
            existing.data.id
          );
    } else {
      result =
        await supabaseClient
          .from("site_settings")
          .insert(settings);
    }

    if (result.error) {
      console.error(
        "Settings save:",
        result.error
      );

      showMessage(
        "ذخیره تنظیمات انجام نشد.",
        "error"
      );

      return;
    }

    state.settings = {
      ...state.settings,
      ...settings
    };

    applySettings(
      state.settings
    );

    showMessage(
      getSettingMessage(section)
    );
  }

  function getSettingMessage(section) {
    const messages = {
      club:
        "اطلاعات باشگاه ذخیره شد.",
      coaches:
        "اطلاعات مربیان ذخیره شد.",
      visibility:
        "تنظیمات نمایش ذخیره شد.",
      evaluation:
        "تنظیمات ارزیابی ذخیره شد.",
      appearance:
        "ظاهر سایت ذخیره شد."
    };

    return (
      messages[section] ||
      "تنظیمات ذخیره شد."
    );
  }

  function updateBrandName(name) {
    if (!name) return;

    const brand =
      document.querySelector(
        ".brand-text strong"
      );

    if (brand) {
      brand.textContent = name;
    }

    const title =
      document.querySelector(
        ".topbar-title"
      );

    if (title) {
      title.textContent =
        `پنل مربی ${name}`;
    }

    document.title =
      `${name} | پنل مربی`;
  }

  function setupSettings() {
    $("saveClubSettingsBtn")
      ?.addEventListener(
        "click",
        () => saveSettings("club")
      );

    $("saveCoachesSettingsBtn")
      ?.addEventListener(
        "click",
        () => saveSettings("coaches")
      );

    $("saveAthleteVisibilityBtn")
      ?.addEventListener(
        "click",
        () =>
          saveSettings("visibility")
      );

    $("saveEvaluationSettingsBtn")
      ?.addEventListener(
        "click",
        () =>
          saveSettings("evaluation")
      );

    $("saveAppearanceSettingsBtn")
      ?.addEventListener(
        "click",
        () =>
          saveSettings("appearance")
      );

    $("coachLogoutBtn")
      ?.addEventListener(
        "click",
        logoutCoach
      );

    $("changeCoachPasswordBtn")
      ?.addEventListener(
        "click",
        changeCoachPassword
      );
  }

  /* =======================================================
     COACH ACCOUNT
  ======================================================= */

  async function loadCurrentCoach() {
    if (!supabaseClient) {
      setValue(
        "currentCoachName",
        "مربی"
      );

      setValue(
        "currentCoachEmail",
        "-"
      );

      setText(
        "coachAccountStatus",
        "اتصال برقرار نیست"
      );

      return;
    }

    const result =
      await supabaseClient.auth
        .getUser();

    if (result.error) {
      setText(
        "coachAccountStatus",
        "وارد نشده"
      );
      return;
    }

    const user =
      result.data?.user;

    if (!user) {
      setText(
        "coachAccountStatus",
        "وارد نشده"
      );
      return;
    }

    setValue(
      "currentCoachEmail",
      user.email || "-"
    );

    const metadata =
      user.user_metadata || {};

    setValue(
      "currentCoachName",
      metadata.name ||
      metadata.full_name ||
      metadata.coach_name ||
      "مربی"
    );

    setText(
      "coachAccountStatus",
      "فعال"
    );
  }

  async function logoutCoach() {
    if (
      !confirm(
        "آیا می‌خواهید از حساب مربی خارج شوید؟"
      )
    ) {
      return;
    }

    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    window.location.href =
      "index.html";
  }

  async function changeCoachPassword() {
    if (!supabaseClient) {
      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );
      return;
    }

    const userResult =
      await supabaseClient.auth
        .getUser();

    const email =
      userResult.data?.user?.email;

    if (!email) {
      showMessage(
        "حساب مربی پیدا نشد.",
        "error"
      );
      return;
    }

    const result =
      await supabaseClient.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              window.location.href
          }
        );

    if (result.error) {
      showMessage(
        "ارسال لینک تغییر رمز انجام نشد.",
        "error"
      );
      return;
    }

    showMessage(
      "لینک تغییر رمز ارسال شد."
    );
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  function setupSearchFilters() {
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

    $("saveAchievementBtn")
      ?.addEventListener(
        "click",
        saveAchievement
      );
  }

  /* =======================================================
     DEFAULT VALUES
  ======================================================= */

  function setupDefaultDates() {
    setValue(
      "announcementDate",
      today()
    );

    setValue(
      "competitionDate",
      today()
    );

    setValue(
      "achievementDate",
      today()
    );
  }

  /* =======================================================
     SUPABASE STATUS
  ======================================================= */

  async function checkSupabaseStatus() {
    const element =
      $("supabaseConnectionStatus");

    if (!element) return;

    if (!supabaseClient) {
      element.textContent =
        "کلید Supabase وارد نشده";
      return;
    }

    try {
      const result =
        await supabaseClient
          .from("site_settings")
          .select("id")
          .limit(1);

      element.textContent =
        result.error
          ? "خطا در اتصال"
          : "متصل و فعال";
    } catch (error) {
      console.error(error);

      element.textContent =
        "خطا";
    }
  }

  /* =======================================================
     REALTIME
  ======================================================= */

  function setupRealtime() {
    if (!supabaseClient) return;

    try {
      supabaseClient
        .channel(
          "coach-panel-live"
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "athletes"
          },
          loadAthletes
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "achievements"
          },
          loadAchievements
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "announcements"
          },
          loadAnnouncements
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "competitions"
          },
          loadCompetitions
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "attendance"
          },
          loadAttendance
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "evaluations"
          },
          loadEvaluations
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "site_settings"
          },
          loadSettings
        )

        .subscribe();

    } catch (error) {
      console.warn(
        "Realtime:",
        error
      );
    }
  }

  /* =======================================================
     INITIALIZATION
  ======================================================= */

  async function initialize() {
    setupNavigation();
    setupEventTabs();
    setupModals();
    setupSettings();
    setupSearchFilters();
    setupSaveButtons();
    setupEvaluationButton();
    setupAttendanceButton();
    setupDefaultDates();

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
      loadSettings(),
      loadCurrentCoach(),
      checkSupabaseStatus()
    ]);

    setupRealtime();

    console.log(
      "JUDO TABIAT COACH PANEL READY"
    );
  }

  /* =======================================================
     START
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );
  } else {
    initialize();
  }

})();
