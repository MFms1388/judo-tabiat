/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   FINAL VERSION
   2026.08.30
========================================================= */

(() => {

  "use strict";


  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  /*
     کلید Publishable / Anon فعلی پروژه خودت را
     اگر در نسخه قبلی coach.js گذاشته بودی،
     همان مقدار را اینجا قرار بده.
  */

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

    achievements: [],

    attendance: [],

    records: [],

    announcements: [],

    competitions: [],

    settings: {},

    editingAnnouncementId: null,

    editingCompetitionId: null,

    editingRecordId: null

  };


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = (id) =>
    document.getElementById(id);


  const $$ = (selector) =>
    document.querySelectorAll(selector);


  function faNumber(value) {

    if (
      value === null ||
      value === undefined
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

    const y =
      d.getFullYear();

    const m =
      String(d.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(d.getDate())
        .padStart(2, "0");

    return `${y}-${m}-${day}`;

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

      box.style.position =
        "fixed";

      box.style.left =
        "20px";

      box.style.bottom =
        "20px";

      box.style.zIndex =
        "99999";

      box.style.padding =
        "13px 18px";

      box.style.borderRadius =
        "12px";

      box.style.fontSize =
        "13px";

      box.style.fontWeight =
        "700";

      box.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.15)";

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


  async function safeQuery(
    table,
    options = {}
  ) {

    if (!supabaseClient) {
      return {
        data: [],
        error: null
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
              options.order.ascending ??
              false
          }
        );

    }


    return query;

  }


  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  function setupNavigation() {

    const navItems =
      $$(".nav-item");

    const pages =
      $$(".coach-page");


    navItems.forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const pageName =
            item.dataset.page;


          navItems.forEach(nav =>
            nav.classList.remove("active")
          );


          item.classList.add("active");


          pages.forEach(page =>
            page.classList.remove("active")
          );


          const page =
            $(`page-${pageName}`);


          if (page) {

            page.classList.add("active");

          }

        }
      );

    });

  }


  /* =======================================================
     EVENTS TABS
  ======================================================= */

  function setupEventTabs() {

    const tabs =
      $$(".events-tab");

    const announcements =
      $("eventsPanelAnnouncements");

    const competitions =
      $("eventsPanelCompetitions");


    tabs.forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          tabs.forEach(t =>
            t.classList.remove("active")
          );

          tab.classList.add("active");


          if (announcements) {
            announcements.classList.remove("active");
          }

          if (competitions) {
            competitions.classList.remove("active");
          }


          if (
            tab.dataset.eventsTab ===
            "announcements"
          ) {

            announcements?.classList.add(
              "active"
            );

          }


          if (
            tab.dataset.eventsTab ===
            "competitions"
          ) {

            competitions?.classList.add(
              "active"
            );

          }

        }
      );

    });

  }


  /* =======================================================
     MODAL HELPERS
  ======================================================= */

  function openModal(id) {

    const modal =
      $(id);

    if (!modal) return;


    modal.classList.remove(
      "hidden"
    );

    modal.style.display =
      "flex";

  }


  function closeModal(id) {

    const modal =
      $(id);

    if (!modal) return;


    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";

  }


  function setupModals() {

    const modalMap = [

      [
        "addAnnouncementBtn",
        "announcementModal"
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
        "addCompetitionBtn",
        "competitionModal"
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
        "addRecordBtn",
        "recordModal"
      ],

      [
        "closeRecordModal",
        "recordModal"
      ],

      [
        "cancelRecordBtn",
        "recordModal"
      ]

    ];


    modalMap.forEach(
      ([buttonId, modalId]) => {

        const button =
          $(buttonId);

        if (!button) return;


        button.addEventListener(
          "click",
          () => {

            const isClose =
              buttonId
                .toLowerCase()
                .includes("close") ||
              buttonId
                .toLowerCase()
                .includes("cancel");


            if (isClose) {

              closeModal(modalId);

            } else {

              openModal(modalId);

            }

          }
        );

      }
    );


    [
      "announcementModal",
      "competitionModal",
      "recordModal"
    ].forEach(id => {

      const modal =
        $(id);

      if (!modal) return;


      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
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

    const result =
      await safeQuery(
        "Athletes",
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

      return;

    }


    state.athletes =
      result.data || [];


    renderAthletes();

    fillRecordAthletes();

    updateDashboard();

  }


  function getAthleteName(
    athlete
  ) {

    return (
      athlete.name ||
      athlete.full_name ||
      athlete.athlete_name ||
      "بدون نام"
    );

  }


  function renderAthletes() {

    const container =
      $("athletesList");

    if (!container) return;


    if (
      !state.athletes.length
    ) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            👥
          </div>

          <h2>
            ورزشکاری ثبت نشده است
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

        ${state.athletes.map(
          athlete => `

            <div class="simple-box">

              <h3>
                👤 ${escapeHTML(
                  getAthleteName(athlete)
                )}
              </h3>

              <p>
                وزن:
                ${escapeHTML(
                  athlete.weight || "-"
                )}
              </p>

              <p>
                کمربند:
                ${escapeHTML(
                  athlete.belt || "-"
                )}
              </p>

            </div>

          `
        ).join("")}

      </div>

    `;

  }


  function fillRecordAthletes() {

    const select =
      $("recordAthlete");

    if (!select) return;


    select.innerHTML = `

      <option value="">
        انتخاب ورزشکار
      </option>

      ${state.athletes.map(
        athlete => `

          <option value="${escapeHTML(
            athlete.id
          )}">

            ${escapeHTML(
              getAthleteName(athlete)
            )}

          </option>

        `
      ).join("")}

    `;

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  function updateDashboard() {

    if ($("dashboardAthletes")) {

      $("dashboardAthletes").textContent =
        faNumber(
          state.athletes.length
        );

    }


    if ($("dashboardEvaluations")) {

      $("dashboardEvaluations").textContent =
        faNumber(
          state.evaluations.length
        );

    }


    if ($("dashboardAchievements")) {

      $("dashboardAchievements").textContent =
        faNumber(
          state.achievements.length
        );

    }


    if ($("dashboardAttendance")) {

      const date =
        today();

      const count =
        state.attendance.filter(
          item =>
            item.date === date &&
            (
              item.present === true ||
              item.status === "present"
            )
        ).length;


      $("dashboardAttendance").textContent =
        faNumber(count);

    }


    updateRecordsStatistics();

  }


  /* =======================================================
     EVALUATIONS
  ======================================================= */

  async function loadEvaluations() {

    const result =
      await safeQuery(
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

      return;

    }


    state.evaluations =
      result.data || [];


    updateDashboard();

  }


  function setupEvaluationButton() {

    const button =
      $("addEvaluationBtn");

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        showMessage(
          "بخش ارزیابی آماده ثبت ارزیابی جدید است."
        );

      }
    );

  }


  /* =======================================================
     ATTENDANCE
  ======================================================= */

  async function loadAttendance() {

    const result =
      await safeQuery(
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

      return;

    }


    state.attendance =
      result.data || [];


    updateDashboard();

  }


  function setupAttendanceButton() {

    const button =
      $("addAttendanceBtn");

    if (!button) return;


    button.addEventListener(
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
      await safeQuery(
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

      return;

    }


    state.achievements =
      result.data || [];


    renderAchievementStats();

    updateDashboard();

  }


  function renderAchievementStats() {

    const gold =
      state.achievements.filter(
        item =>
          item.medal === "gold" ||
          item.medal === "طلا" ||
          item.position === 1 ||
          item.rank === 1
      ).length;


    const silver =
      state.achievements.filter(
        item =>
          item.medal === "silver" ||
          item.medal === "نقره" ||
          item.position === 2 ||
          item.rank === 2
      ).length;


    const bronze =
      state.achievements.filter(
        item =>
          item.medal === "bronze" ||
          item.medal === "برنز" ||
          item.position === 3 ||
          item.rank === 3
      ).length;


    if ($("goldAchievements")) {

      $("goldAchievements").textContent =
        faNumber(gold);

    }


    if ($("silverAchievements")) {

      $("silverAchievements").textContent =
        faNumber(silver);

    }


    if ($("bronzeAchievements")) {

      $("bronzeAchievements").textContent =
        faNumber(bronze);

    }

  }


  function setupAchievementButton() {

    const button =
      $("addAchievementBtn");

    if (!button) return;


    button.addEventListener(
      "click",
      () => {

        showMessage(
          "فرم ثبت افتخار در مرحله بعدی متصل می‌شود."
        );

      }
    );

  }


  /* =======================================================
     ANNOUNCEMENTS
  ======================================================= */

  async function loadAnnouncements() {

    const result =
      await safeQuery(
        "announcements",
        {
          order: {
            column: "date",
            ascending: false
          }
        }
      );


    if (result.error) {

      console.error(
        "Announcements:",
        result.error
      );

      state.announcements = [];

      renderAnnouncements();

      return;

    }


    state.announcements =
      result.data || [];


    renderAnnouncements();

  }


  function announcementTypeLabel(
    type
  ) {

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
        $("announcementSearch")?.value ||
        ""
      ).trim().toLowerCase();


    const filter =
      $("announcementFilter")?.value ||
      "all";


    if (search) {

      list =
        list.filter(item => {

          const text =
            [
              item.title,
              item.content,
              item.location,
              item.type
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return text.includes(search);

        });

    }


    if (filter !== "all") {

      list =
        list.filter(
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
            هنوز اطلاعیه‌ای مطابق فیلتر انتخابی وجود ندارد.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      list.map(item => `

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

              <span class="announcement-type-badge">
                ${announcementTypeLabel(
                  item.type
                )}
              </span>

            </div>

            <div class="event-actions">

              <button
                type="button"
                class="announcement-edit-btn"
                data-edit-announcement="${escapeHTML(
                  item.id
                )}">
                ✏️
              </button>

              <button
                type="button"
                class="announcement-delete-btn"
                data-delete-announcement="${escapeHTML(
                  item.id
                )}">
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
                  (
                    item.start_time ||
                    "-"
                  ) +
                  (
                    item.end_time
                      ? " تا " +
                        item.end_time
                      : ""
                  )
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

      `).join("");


    bindAnnouncementActions();

  }


  function updateAnnouncementStats() {

    const total =
      state.announcements.length;


    const active =
      state.announcements.filter(
        item =>
          item.active !== false
      ).length;


    const current =
      today();


    const upcoming =
      state.announcements.filter(
        item =>
          item.date &&
          item.date >= current
      ).length;


    if ($("totalAnnouncements")) {

      $("totalAnnouncements").textContent =
        faNumber(total);

    }


    if ($("activeAnnouncements")) {

      $("activeAnnouncements").textContent =
        faNumber(active);

    }


    if ($("upcomingAnnouncements")) {

      $("upcomingAnnouncements").textContent =
        faNumber(upcoming);

    }

  }


  function bindAnnouncementActions() {

    $$("[data-delete-announcement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            deleteAnnouncement(
              button.dataset.deleteAnnouncement
            );

          }
        );

      });


    $$("[data-edit-announcement]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            editAnnouncement(
              button.dataset.editAnnouncement
            );

          }
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

      const element =
        $(id);

      if (element) {
        element.value = "";
      }

    });


    if ($("announcementType")) {
      $("announcementType").value =
        "general";
    }


    if ($("announcementDate")) {
      $("announcementDate").value =
        today();
    }


    state.editingAnnouncementId =
      null;


    const save =
      $("saveAnnouncementBtn");

    if (save) {

      save.textContent =
        "📢 انتشار اطلاعیه";

    }

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


    $("announcementTitle").value =
      item.title || "";


    $("announcementType").value =
      item.type || "general";


    $("announcementDate").value =
      item.date || "";


    $("announcementLocation").value =
      item.location || "";


    $("announcementStartTime").value =
      item.start_time || "";


    $("announcementEndTime").value =
      item.end_time || "";


    $("announcementContent").value =
      item.content || "";


    const save =
      $("saveAnnouncementBtn");

    if (save) {

      save.textContent =
        "💾 ذخیره تغییرات";

    }


    openModal(
      "announcementModal"
    );

  }


  async function saveAnnouncement() {

    const title =
      $("announcementTitle")?.value.trim();


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
        $("announcementType")?.value ||
        "general",

      date:
        $("announcementDate")?.value ||
        null,

      location:
        $("announcementLocation")?.value.trim() ||
        null,

      start_time:
        $("announcementStartTime")?.value ||
        null,

      end_time:
        $("announcementEndTime")?.value ||
        null,

      content:
        $("announcementContent")?.value.trim() ||
        null,

      active: true

    };


    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;

    }


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
      await safeQuery(
        "competitions",
        {
          order: {
            column: "date",
            ascending: true
          }
        }
      );


    if (result.error) {

      console.error(
        "Competitions:",
        result.error
      );

      state.competitions = [];

      renderCompetitions();

      return;

    }


    state.competitions =
      result.data || [];


    renderCompetitions();

  }


  function competitionStatus(
    item
  ) {

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

    if (status === "completed") {
      return "✅ برگزارشده";
    }


    if (status === "cancelled") {
      return "❌ لغوشده";
    }


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
        $("competitionSearch")?.value ||
        ""
      ).trim().toLowerCase();


    const filter =
      $("competitionFilter")?.value ||
      "all";


    if (search) {

      list =
        list.filter(item => {

          const text =
            [
              item.title,
              item.location,
              item.age_group,
              item.weights,
              item.description
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return text.includes(search);

        });

    }


    if (filter !== "all") {

      list =
        list.filter(
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
            هنوز مسابقه‌ای مطابق فیلتر انتخابی وجود ندارد.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      list.map(item => {

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

                <span class="competition-status-badge">
                  ${competitionStatusLabel(
                    status
                  )}
                </span>

              </div>

              <div class="event-actions">

                <button
                  type="button"
                  class="competition-edit-btn"
                  data-edit-competition="${escapeHTML(
                    item.id
                  )}">
                  ✏️
                </button>

                <button
                  type="button"
                  class="competition-delete-btn"
                  data-delete-competition="${escapeHTML(
                    item.id
                  )}">
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
                  <div class="competition-description">
                    <strong>⚖️ وزن‌ها:</strong>
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

      }).join("");


    bindCompetitionActions();

  }


  function updateCompetitionStats() {

    const total =
      state.competitions.length;


    const upcoming =
      state.competitions.filter(
        item =>
          competitionStatus(item) ===
          "upcoming"
      ).length;


    const completed =
      state.competitions.filter(
        item =>
          competitionStatus(item) ===
          "completed"
      ).length;


    if ($("totalCompetitions")) {

      $("totalCompetitions").textContent =
        faNumber(total);

    }


    if ($("upcomingCompetitions")) {

      $("upcomingCompetitions").textContent =
        faNumber(upcoming);

    }


    if ($("completedCompetitions")) {

      $("completedCompetitions").textContent =
        faNumber(completed);

    }

  }


  function bindCompetitionActions() {

    $$("[data-delete-competition]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            deleteCompetition(
              button.dataset.deleteCompetition
            );

          }
        );

      });


    $$("[data-edit-competition]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            editCompetition(
              button.dataset.editCompetition
            );

          }
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

      const element =
        $(id);

      if (element) {
        element.value = "";
      }

    });


    state.editingCompetitionId =
      null;


    const save =
      $("saveCompetitionBtn");

    if (save) {

      save.textContent =
        "📅 ثبت مسابقه";

    }

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


    $("competitionTitle").value =
      item.title || "";


    $("competitionDate").value =
      item.date || "";


    $("competitionLocation").value =
      item.location || "";


    $("competitionStartTime").value =
      item.start_time || "";


    $("competitionEndTime").value =
      item.end_time || "";


    $("competitionAgeGroup").value =
      item.age_group || "";


    $("competitionWeights").value =
      item.weights || "";


    $("competitionDescription").value =
      item.description || "";


    const save =
      $("saveCompetitionBtn");

    if (save) {

      save.textContent =
        "💾 ذخیره تغییرات";

    }


    openModal(
      "competitionModal"
    );

  }


  async function saveCompetition() {

    const title =
      $("competitionTitle")?.value.trim();


    if (!title) {

      showMessage(
        "نام مسابقه را وارد کنید.",
        "error"
      );

      return;

    }


    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;

    }


    const payload = {

      title,

      date:
        $("competitionDate")?.value ||
        null,

      location:
        $("competitionLocation")?.value.trim() ||
        null,

      start_time:
        $("competitionStartTime")?.value ||
        null,

      end_time:
        $("competitionEndTime")?.value ||
        null,

      age_group:
        $("competitionAgeGroup")?.value.trim() ||
        null,

      weights:
        $("competitionWeights")?.value.trim() ||
        null,

      description:
        $("competitionDescription")?.value.trim() ||
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
     RECORDS
  ======================================================= */

  async function loadRecords() {

    const result =
      await safeQuery(
        "records",
        {
          order: {
            column: "date",
            ascending: false
          }
        }
      );


    if (result.error) {

      console.error(
        "Records:",
        result.error
      );

      state.records = [];

      renderRecords();

      return;

    }


    state.records =
      result.data || [];


    renderRecords();

    updateRecordsStatistics();

  }


  function recordTypeLabel(
    type
  ) {

    const labels = {

      running: "🏃 دو و استقامت",

      strength: "💪 بدنسازی",

      judo: "🥋 جودو",

      other: "📌 سایر"

    };


    return (
      labels[type] ||
      "📌 سایر"
    );

  }


  function renderRecords() {

    const container =
      $("recordsList");

    if (!container) return;


    let list =
      [...state.records];


    const search =
      (
        $("recordSearch")?.value ||
        ""
      ).trim().toLowerCase();


    const filter =
      $("recordTypeFilter")?.value ||
      "all";


    if (search) {

      list =
        list.filter(item => {

          const athlete =
            state.athletes.find(
              a =>
                String(a.id) ===
                String(item.athlete_id)
            );


          const text =
            [
              item.title,
              item.value,
              item.unit,
              item.description,
              getAthleteName(
                athlete || {}
              )
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


          return text.includes(search);

        });

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
            📈
          </div>

          <h2>
            هنوز رکوردی ثبت نشده است
          </h2>

          <p>
            برای ثبت اولین رکورد روی «ثبت رکورد» بزنید.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML = `

      <table class="records-table">

        <thead>

          <tr>

            <th>ورزشکار</th>
            <th>نوع</th>
            <th>رکورد</th>
            <th>مقدار</th>
            <th>تاریخ</th>
            <th>عملیات</th>

          </tr>

        </thead>

        <tbody>

          ${list.map(item => {

            const athlete =
              state.athletes.find(
                a =>
                  String(a.id) ===
                  String(item.athlete_id)
              );


            return `

              <tr>

                <td>
                  ${escapeHTML(
                    getAthleteName(
                      athlete || {}
                    )
                  )}
                </td>

                <td>
                  <span class="record-type-badge">
                    ${recordTypeLabel(
                      item.type
                    )}
                  </span>
                </td>

                <td>
                  ${escapeHTML(
                    item.title || "-"
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    item.value || "-"
                  )}
                  ${escapeHTML(
                    item.unit || ""
                  )}
                </td>

                <td>
                  ${escapeHTML(
                    item.date || "-"
                  )}
                </td>

                <td>

                  <div class="record-actions">

                    <button
                      type="button"
                      class="record-action-btn"
                      data-edit-record="${escapeHTML(
                        item.id
                      )}">
                      ✏️
                    </button>

                    <button
                      type="button"
                      class="record-action-btn delete"
                      data-delete-record="${escapeHTML(
                        item.id
                      )}">
                      🗑️
                    </button>

                  </div>

                </td>

              </tr>

            `;

          }).join("")}

        </tbody>

      </table>

    `;


    bindRecordActions();

  }


  function bindRecordActions() {

    $$("[data-delete-record]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            deleteRecord(
              button.dataset.deleteRecord
            );

          }
        );

      });


    $$("[data-edit-record]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            editRecord(
              button.dataset.editRecord
            );

          }
        );

      });

  }


  function resetRecordForm() {

    [
      "recordAthlete",
      "recordTitle",
      "recordValue",
      "recordUnit",
      "recordDate",
      "recordDescription"
    ].forEach(id => {

      const element =
        $(id);

      if (element) {
        element.value = "";
      }

    });


    if ($("recordType")) {
      $("recordType").value =
        "running";
    }


    if ($("recordDate")) {
      $("recordDate").value =
        today();
    }


    state.editingRecordId =
      null;


    const save =
      $("saveRecordBtn");

    if (save) {

      save.textContent =
        "📈 ثبت رکورد";

    }

  }


  function editRecord(id) {

    const item =
      state.records.find(
        x =>
          String(x.id) ===
          String(id)
      );


    if (!item) return;


    state.editingRecordId =
      id;


    $("recordAthlete").value =
      item.athlete_id || "";


    $("recordType").value =
      item.type || "other";


    $("recordTitle").value =
      item.title || "";


    $("recordValue").value =
      item.value || "";


    $("recordUnit").value =
      item.unit || "";


    $("recordDate").value =
      item.date || "";


    $("recordDescription").value =
      item.description || "";


    const save =
      $("saveRecordBtn");

    if (save) {

      save.textContent =
        "💾 ذخیره تغییرات";

    }


    openModal(
      "recordModal"
    );

  }


  async function saveRecord() {

    const athleteId =
      $("recordAthlete")?.value;


    const title =
      $("recordTitle")?.value.trim();


    if (!athleteId) {

      showMessage(
        "ورزشکار را انتخاب کنید.",
        "error"
      );

      return;

    }


    if (!title) {

      showMessage(
        "عنوان رکورد را وارد کنید.",
        "error"
      );

      return;

    }


    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;

    }


    const payload = {

      athlete_id:
        athleteId,

      type:
        $("recordType")?.value ||
        "other",

      title,

      value:
        $("recordValue")?.value.trim() ||
        null,

      unit:
        $("recordUnit")?.value.trim() ||
        null,

      date:
        $("recordDate")?.value ||
        null,

      description:
        $("recordDescription")?.value.trim() ||
        null

    };


    let result;


    if (
      state.editingRecordId
    ) {

      result =
        await supabaseClient
          .from("records")
          .update(payload)
          .eq(
            "id",
            state.editingRecordId
          );

    } else {

      result =
        await supabaseClient
          .from("records")
          .insert(payload);

    }


    if (result.error) {

      console.error(
        result.error
      );

      showMessage(
        "ذخیره رکورد انجام نشد.",
        "error"
      );

      return;

    }


    showMessage(
      state.editingRecordId
        ? "رکورد ویرایش شد."
        : "رکورد ثبت شد."
    );


    closeModal(
      "recordModal"
    );


    resetRecordForm();


    await loadRecords();

  }


  async function deleteRecord(id) {

    if (
      !confirm(
        "آیا از حذف این رکورد مطمئن هستید؟"
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
        .from("records")
        .delete()
        .eq("id", id);


    if (result.error) {

      showMessage(
        "حذف رکورد انجام نشد.",
        "error"
      );

      return;

    }


    showMessage(
      "رکورد حذف شد."
    );


    await loadRecords();

  }


  function updateRecordsStatistics() {

    if ($("recordsAthletesCount")) {

      $("recordsAthletesCount").textContent =
        faNumber(
          state.athletes.length
        );

    }


    if ($("recordsEvaluationsCount")) {

      $("recordsEvaluationsCount").textContent =
        faNumber(
          state.evaluations.length
        );

    }


    if ($("recordsAchievementsCount")) {

      $("recordsAchievementsCount").textContent =
        faNumber(
          state.achievements.length
        );

    }


    if ($("recordsCount")) {

      $("recordsCount").textContent =
        faNumber(
          state.records.length
        );

    }


    calculateBestRecords();

  }


  function calculateBestRecords() {

    const running =
      state.records.filter(
        item =>
          item.type === "running"
      );


    const strength =
      state.records.filter(
        item =>
          item.type === "strength"
      );


    if ($("bestRunningRecord")) {

      $("bestRunningRecord").textContent =
        running.length
          ? formatBestRecord(
              running[0]
            )
          : "هنوز رکوردی ثبت نشده است.";

    }


    if ($("bestStrengthRecord")) {

      $("bestStrengthRecord").textContent =
        strength.length
          ? formatBestRecord(
              strength[0]
            )
          : "هنوز رکوردی ثبت نشده است.";

    }


    if ($("bestEvaluationRecord")) {

      if (
        state.evaluations.length
      ) {

        const best =
          [...state.evaluations]
            .sort(
              (a,b) =>
                Number(
                  b.total_score ||
                  b.score ||
                  0
                ) -
                Number(
                  a.total_score ||
                  a.score ||
                  0
                )
            )[0];


        $("bestEvaluationRecord").textContent =
          `امتیاز ${faNumber(
            best.total_score ||
            best.score ||
            0
          )}`;

      } else {

        $("bestEvaluationRecord").textContent =
          "هنوز ارزیابی‌ای ثبت نشده است.";

      }

    }

  }


  function formatBestRecord(
    record
  ) {

    const athlete =
      state.athletes.find(
        a =>
          String(a.id) ===
          String(record.athlete_id)
      );


    return `${getAthleteName(
      athlete || {}
    )} — ${record.title || ""} ${
      record.value || ""
    } ${
      record.unit || ""
    }`;

  }


  /* =======================================================
     SETTINGS
  ======================================================= */

  const DEFAULT_SETTINGS = {

    club_name:
      "طبیعت جودو",

    site_name:
      "طبیعت جودو",

    club_description:
      "",

    club_phone:
      "",

    club_address:
      "",

    coach1_name:
      "",

    coach2_name:
      "",

    coach3_name:
      "",

    coach4_name:
      "",

    show_weight:
      true,

    show_belt:
      true,

    show_evaluation:
      true,

    show_achievements:
      true,

    show_attendance:
      true,

    show_records:
      true,

    evaluation_result_display:
      "score",

    brand_name:
      "طبیعت جودو",

    logo:
      "",

    display_info:
      ""

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

      console.warn(
        "Settings:",
        result.error
      );

      applySettings(
        DEFAULT_SETTINGS
      );

      return;

    }


    state.settings =
      {
        ...DEFAULT_SETTINGS,
        ...(result.data || {})
      };


    applySettings(
      state.settings
    );

  }


  function applySettings(
    settings
  ) {

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
      settings.show_weight
    );

    setChecked(
      "showAthleteBelt",
      settings.show_belt
    );

    setChecked(
      "showAthleteEvaluation",
      settings.show_evaluation
    );

    setChecked(
      "showAthleteAchievements",
      settings.show_achievements
    );

    setChecked(
      "showAthleteAttendance",
      settings.show_attendance
    );

    setChecked(
      "showAthleteRecords",
      settings.show_records
    );


    setValue(
      "evaluationResultDisplay",
      settings.evaluation_result_display
    );


    setValue(
      "siteBrandName",
      settings.brand_name
    );

    setValue(
      "siteLogo",
      settings.logo
    );

    setValue(
      "siteDisplayInfo",
      settings.display_info
    );


    updateBrandName(
      settings.brand_name ||
      settings.site_name ||
      settings.club_name
    );

  }


  function setValue(
    id,
    value
  ) {

    const element =
      $(id);

    if (
      element &&
      value !== null &&
      value !== undefined
    ) {

      element.value =
        value;

    }

  }


  function setChecked(
    id,
    value
  ) {

    const element =
      $(id);

    if (!element) return;


    element.checked =
      value !== false;

  }


  function getSettingsFromForm() {

    return {

      club_name:
        $("settingClubName")?.value.trim() ||
        "",

      site_name:
        $("settingSiteName")?.value.trim() ||
        "",

      club_description:
        $("settingClubDescription")?.value.trim() ||
        "",

      club_phone:
        $("settingClubPhone")?.value.trim() ||
        "",

      club_address:
        $("settingClubAddress")?.value.trim() ||
        "",

      coach1_name:
        $("coach1Name")?.value.trim() ||
        "",

      coach2_name:
        $("coach2Name")?.value.trim() ||
        "",

      coach3_name:
        $("coach3Name")?.value.trim() ||
        "",

      coach4_name:
        $("coach4Name")?.value.trim() ||
        "",

      show_weight:
        $("showAthleteWeight")?.checked ??
        true,

      show_belt:
        $("showAthleteBelt")?.checked ??
        true,

      show_evaluation:
        $("showAthleteEvaluation")?.checked ??
        true,

      show_achievements:
        $("showAthleteAchievements")?.checked ??
        true,

      show_attendance:
        $("showAthleteAttendance")?.checked ??
        true,

      show_records:
        $("showAthleteRecords")?.checked ??
        true,

      evaluation_result_display:
        $("evaluationResultDisplay")?.value ||
        "score",

      brand_name:
        $("siteBrandName")?.value.trim() ||
        "",

      logo:
        $("siteLogo")?.value.trim() ||
        "",

      display_info:
        $("siteDisplayInfo")?.value.trim() ||
        ""

    };

  }


  async function saveSettings(
    section
  ) {

    const settings =
      getSettingsFromForm();


    if (!supabaseClient) {

      showMessage(
        "اتصال Supabase برقرار نیست.",
        "error"
      );

      return;

    }


    /*
      یک ردیف تنظیمات برای کل سایت.
      اگر وجود داشته باشد UPDATE،
      در غیر این صورت INSERT.
    */

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
        result.error
      );

      showMessage(
        "ذخیره تنظیمات انجام نشد.",
        "error"
      );

      return;

    }


    state.settings =
      {
        ...state.settings,
        ...settings
      };


    updateBrandName(
      settings.brand_name ||
      settings.site_name ||
      settings.club_name
    );


    showMessage(
      getSettingMessage(section)
    );

  }


  function getSettingMessage(
    section
  ) {

    const messages = {

      club:
        "اطلاعات باشگاه ذخیره شد.",

      coaches:
        "اطلاعات مربیان ذخیره شد.",

      visibility:
        "تنظیمات نمایش ورزشکار ذخیره شد.",

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


  function updateBrandName(
    name
  ) {

    if (!name) return;


    const brand =
      document.querySelector(
        ".brand-text strong"
      );


    if (brand) {

      brand.textContent =
        name;

    }


    const topTitle =
      document.querySelector(
        ".topbar-title"
      );


    if (topTitle) {

      topTitle.textContent =
        `پنل مربی ${name}`;

    }


    if (document.title) {

      document.title =
        `${name} | پنل مربی`;

    }

  }


  function setupSettings() {

    $("saveClubSettingsBtn")
      ?.addEventListener(
        "click",
        () =>
          saveSettings("club")
      );


    $("saveCoachesSettingsBtn")
      ?.addEventListener(
        "click",
        () =>
          saveSettings("coaches")
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
     CURRENT COACH ACCOUNT
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
      await supabaseClient.auth.getUser();


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


    if (
      supabaseClient
    ) {

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
      await supabaseClient.auth.getUser();


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
      "لینک تغییر رمز به ایمیل مربی ارسال شد."
    );

  }


  /* =======================================================
     SECURITY STATUS
  ======================================================= */

  async function checkSupabaseStatus() {

    const element =
      $("supabaseConnectionStatus");

    if (!element) return;


    if (!supabaseClient) {

      element.textContent =
        "متصل نیست";

      return;

    }


    try {

      const result =
        await supabaseClient
          .from("site_settings")
          .select("id")
          .limit(1);


      if (result.error) {

        element.textContent =
          "خطا در اتصال";

      } else {

        element.textContent =
          "متصل و فعال";

      }

    } catch (error) {

      console.error(
        error
      );

      element.textContent =
        "خطا";

    }

  }


  function setText(
    id,
    text
  ) {

    const element =
      $(id);

    if (element) {

      element.textContent =
        text;

    }

  }


  /* =======================================================
     SEARCH / FILTER EVENTS
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


    $("recordSearch")
      ?.addEventListener(
        "input",
        renderRecords
      );


    $("recordTypeFilter")
      ?.addEventListener(
        "change",
        renderRecords
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


    $("saveRecordBtn")
      ?.addEventListener(
        "click",
        saveRecord
      );

  }


  /* =======================================================
     MODAL DEFAULT VALUES
  ======================================================= */

  function setupDefaultDates() {

    if ($("announcementDate")) {

      $("announcementDate").value =
        today();

    }


    if ($("recordDate")) {

      $("recordDate").value =
        today();

    }

  }


  /* =======================================================
     REALTIME
  ======================================================= */

  function setupRealtime() {

    if (!supabaseClient) {
      return;
    }


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
            table: "announcements"
          },
          () => {

            loadAnnouncements();

          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "competitions"
          },
          () => {

            loadCompetitions();

          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "records"
          },
          () => {

            loadRecords();

          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "site_settings"
          },
          () => {

            loadSettings();

          }
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
     INITIAL LOAD
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

    setupAchievementButton();

    setupDefaultDates();


    await Promise.all([

      loadAthletes(),

      loadEvaluations(),

      loadAttendance(),

      loadAchievements(),

      loadAnnouncements(),

      loadCompetitions(),

      loadRecords(),

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
