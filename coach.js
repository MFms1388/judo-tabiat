/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   نسخه اصلاح شده
========================================================= */

(() => {

  "use strict";

  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  let supabaseClient =
    window.supabaseClient || null;


  /* =======================================================
     GLOBAL STATE
  ======================================================= */

  let athletes = [];

  let evaluationPeriods = [];

  let evaluationCriteria = [];

  let evaluations = [];

  let attendanceData = {};

  let attendanceInitialized = false;

  let evaluationInitialized = false;


  /* =======================================================
     HELPERS
  ======================================================= */

  function el(id) {
    return document.getElementById(id);
  }


  function escapeHtml(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function showMessage(message) {
    alert(message);
  }


  function getAthleteName(athlete) {

    if (!athlete) {
      return "بدون نام";
    }

    const first =
      athlete.first_name ||
      athlete.firstname ||
      athlete.name ||
      "";

    const last =
      athlete.last_name ||
      athlete.lastname ||
      "";

    return `${first} ${last}`.trim() || "بدون نام";

  }


  function getAthleteId(athlete) {

    return (
      athlete?.id ||
      athlete?.athlete_id ||
      athlete?.uuid ||
      null
    );

  }


  function getTodayISO() {

    const d = new Date();

    const year =
      d.getFullYear();

    const month =
      String(d.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(d.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;

  }


  function toPersianNumber(value) {

    return String(value)
      .replace(
        /\d/g,
        digit =>
          "۰۱۲۳۴۵۶۷۸۹"[digit]
      );

  }


  /* =======================================================
     SUPABASE CHECK
  ======================================================= */

  function checkSupabase() {

    if (!window.supabaseClient) {

      console.error(
        "supabaseClient وجود ندارد."
      );

      showMessage(
        "اتصال به Supabase برقرار نیست."
      );

      return false;

    }

    supabaseClient =
      window.supabaseClient;

    return true;

  }


  /* =======================================================
     LOAD ATHLETES
     جدول واقعی پروژه: athletes
  ======================================================= */

  async function loadAthletes() {

    if (!checkSupabase()) {
      return [];
    }

    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("athletes")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );


      if (error) {
        throw error;
      }


      athletes =
        data || [];


      console.log(
        "Athletes loaded:",
        athletes
      );


      return athletes;


    } catch (error) {

      console.error(
        "loadAthletes error:",
        error
      );

      athletes = [];


      showMessage(
        "خطا در دریافت ورزشکاران:\n" +
        (error.message || error)
      );


      return [];

    }

  }


  /* =======================================================
     RENDER ATHLETES
  ======================================================= */

  async function renderAthletes() {

    const grid =
      el("coachAthleteGrid");

    if (!grid) {
      return;
    }


    grid.innerHTML = `
      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          ⏳
        </div>

        <h2>
          در حال بارگذاری...
        </h2>

        <p>
          لطفاً کمی صبر کنید.
        </p>

      </div>
    `;


    await loadAthletes();


    updateAthleteStats();

    fillAthleteFilter();

    fillEvaluationAthleteSelect();

    fillAttendanceAthletes();


    if (!athletes.length) {

      grid.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            👥
          </div>

          <h2>
            هنوز ورزشکاری ثبت نشده است
          </h2>

          <p>
            برای شروع روی «افزودن ورزشکار» بزنید.
          </p>

        </div>
      `;

      return;

    }


    renderAthleteGrid();

  }


  /* =======================================================
     RENDER ATHLETE GRID
  ======================================================= */

  function renderAthleteGrid() {

    const grid =
      el("coachAthleteGrid");

    if (!grid) {
      return;
    }


    const search =
      (
        el("coachSearch")?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const filter =
      el("coachFilter")?.value ||
      "all";


    let list =
      [...athletes];


    if (search) {

      list =
        list.filter(
          athlete => {

            const name =
              getAthleteName(athlete)
                .toLowerCase();


            const nationalId =
              String(
                athlete.national_id ||
                athlete.nationalId ||
                ""
              )
                .toLowerCase();


            return (
              name.includes(search) ||
              nationalId.includes(search)
            );

          }
        );

    }


    if (filter !== "all") {

      list =
        list.filter(
          athlete => {

            return (
              String(
                athlete.age_group ||
                athlete.ageGroup ||
                athlete.category ||
                ""
              ) === String(filter)
            );

          }
        );

    }


    if (!list.length) {

      grid.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🔎
          </div>

          <h2>
            ورزشکاری پیدا نشد
          </h2>

          <p>
            عبارت جستجو یا فیلتر را تغییر دهید.
          </p>

        </div>
      `;

      return;

    }


    grid.innerHTML =
      list
        .map(
          athlete => {

            const name =
              getAthleteName(athlete);


            const ageGroup =
              athlete.age_group ||
              athlete.ageGroup ||
              athlete.category ||
              "—";


            const weight =
              athlete.weight ??
              "—";


            const photo =
              athlete.photo_url ||
              athlete.photoUrl ||
              athlete.avatar_url ||
              "";


            return `
              <div
                class="athlete-card"
                data-athlete-id="${escapeHtml(
                  getAthleteId(athlete)
                )}"
              >

                <div class="athlete-avatar">

                  ${
                    photo
                      ?
                    `
                      <img
                        src="${escapeHtml(photo)}"
                        alt="${escapeHtml(name)}"
                      >
                    `
                      :
                    "🥋"
                  }

                </div>


                <div class="athlete-info">

                  <h3>
                    ${escapeHtml(name)}
                  </h3>

                  <p>
                    رده:
                    ${escapeHtml(ageGroup)}
                  </p>

                  <p>
                    وزن:
                    ${escapeHtml(weight)}
                    کیلو
                  </p>

                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     ATHLETE FILTER
  ======================================================= */

  function fillAthleteFilter() {

    const select =
      el("coachFilter");

    if (!select) {
      return;
    }


    const current =
      select.value;


    const groups =
      [
        ...new Set(
          athletes
            .map(
              athlete =>
                athlete.age_group ||
                athlete.ageGroup ||
                athlete.category
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

        const option =
          document.createElement("option");


        option.value =
          group;


        option.textContent =
          group;


        select.appendChild(option);

      }
    );


    if (
      groups.includes(current)
    ) {

      select.value =
        current;

    }

  }


  /* =======================================================
     ATHLETE MODAL
  ======================================================= */

  function openAthleteModal() {

    const modal =
      el("athleteModal");

    if (!modal) {
      return;
    }


    modal.classList.remove("hidden");

    modal.style.display =
      "flex";

  }


  function closeAthleteModal() {

    const modal =
      el("athleteModal");

    if (!modal) {
      return;
    }


    modal.classList.add("hidden");

    modal.style.display =
      "none";

  }


  function clearAthleteForm() {

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

          const input =
            el(id);

          if (input) {
            input.value = "";
          }

        }
      );

  }


  /* =======================================================
     SAVE ATHLETE
     جدول واقعی پروژه: athletes
  ======================================================= */

  async function saveAthlete() {

    if (!checkSupabase()) {
      return;
    }


    const firstName =
      el("athleteFirstName")
        ?.value
        .trim();


    const lastName =
      el("athleteLastName")
        ?.value
        .trim();


    const ageGroup =
      el("athleteAgeGroup")
        ?.value
        .trim();


    const weightValue =
      el("athleteWeight")
        ?.value;


    const nationalId =
      el("athleteNationalId")
        ?.value
        .trim();


    const bio =
      el("athleteBio")
        ?.value
        .trim();


    const photoUrl =
      el("athletePhotoUrl")
        ?.value
        .trim();


    if (!firstName) {

      showMessage(
        "لطفاً نام ورزشکار را وارد کنید."
      );

      return;

    }


    if (!lastName) {

      showMessage(
        "لطفاً نام خانوادگی ورزشکار را وارد کنید."
      );

      return;

    }


    if (
      nationalId &&
      !/^\d{10}$/.test(nationalId)
    ) {

      showMessage(
        "کد ملی باید ۱۰ رقم باشد."
      );

      return;

    }


    const saveButton =
      el("saveAthleteBtn");


    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        "در حال ثبت...";

    }


    try {

      const payload = {

        first_name:
          firstName,

        last_name:
          lastName,

        age_group:
          ageGroup || null,

        weight:
          weightValue
            ? Number(weightValue)
            : null,

        national_id:
          nationalId || null,

        bio:
          bio || null,

        photo_url:
          photoUrl || null

      };


      const {
        data,
        error
      } =
        await supabaseClient
          .from("athletes")
          .insert(payload)
          .select()
          .single();


      if (error) {
        throw error;
      }


      console.log(
        "Athlete created:",
        data
      );


      showMessage(
        "ورزشکار با موفقیت ثبت شد ✅"
      );


      clearAthleteForm();

      closeAthleteModal();


      await renderAthletes();

      await loadDashboardStats();


    } catch (error) {

      console.error(
        "saveAthlete error:",
        error
      );


      showMessage(
        "ثبت ورزشکار انجام نشد.\n\n" +
        (error.message || error)
      );


    } finally {

      if (saveButton) {

        saveButton.disabled =
          false;

        saveButton.textContent =
          "ثبت ورزشکار";

      }

    }

  }


  /* =======================================================
     BIND ATHLETE BUTTONS
  ======================================================= */

  function bindAthleteButtons() {

    const addButton =
      el("addAthleteBtn");


    if (
      addButton &&
      !addButton.dataset.bound
    ) {

      addButton.dataset.bound =
        "true";


      addButton.addEventListener(
        "click",
        () => {

          clearAthleteForm();

          openAthleteModal();

        }
      );

    }


    const closeButton =
      el("closeAthleteModal");


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


    const saveButton =
      el("saveAthleteBtn");


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


    const search =
      el("coachSearch");


    if (
      search &&
      !search.dataset.bound
    ) {

      search.dataset.bound =
        "true";


      search.addEventListener(
        "input",
        renderAthleteGrid
      );

    }


    const filter =
      el("coachFilter");


    if (
      filter &&
      !filter.dataset.bound
    ) {

      filter.dataset.bound =
        "true";


      filter.addEventListener(
        "change",
        renderAthleteGrid
      );

    }

  }


  /* =======================================================
     EVALUATION PERIODS
  ======================================================= */

  async function loadEvaluationPeriods() {

    if (!checkSupabase()) {
      return [];
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("evaluation_periods")
          .select("*")
          .order(
            "start_date",
            {
              ascending: false
            }
          );


      if (error) {
        throw error;
      }


      evaluationPeriods =
        data || [];


      return evaluationPeriods;


    } catch (error) {

      console.error(
        "loadEvaluationPeriods error:",
        error
      );


      evaluationPeriods =
        [];


      return [];

    }

  }


  /* =======================================================
     EVALUATION CRITERIA
  ======================================================= */

  async function loadEvaluationCriteria() {

    if (!checkSupabase()) {
      return [];
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("evaluation_criteria")
          .select("*")
          .order(
            "created_at",
            {
              ascending: true
            }
          );


      if (error) {

        console.warn(
          "Criteria error:",
          error
        );


        evaluationCriteria =
          [];


        return [];

      }


      evaluationCriteria =
        data || [];


      return evaluationCriteria;


    } catch (error) {

      console.error(
        "loadEvaluationCriteria error:",
        error
      );


      evaluationCriteria =
        [];


      return [];

    }

  }


  /* =======================================================
     EVALUATION ATHLETE SELECT
  ======================================================= */

  function fillEvaluationAthleteSelect() {

    const select =
      el("evaluationAthleteSelect");

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


    athletes.forEach(
      athlete => {

        const option =
          document.createElement("option");


        option.value =
          getAthleteId(athlete);


        option.textContent =
          getAthleteName(athlete);


        select.appendChild(option);

      }
    );


    if (current) {
      select.value =
        current;
    }

  }


  /* =======================================================
     EVALUATION PERIOD SELECT
  ======================================================= */

  function fillEvaluationPeriodSelect() {

    const select =
      el("evaluationPeriodSelect");

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


    evaluationPeriods.forEach(
      period => {

        const option =
          document.createElement("option");


        option.value =
          period.id;


        option.textContent =
          period.name ||
          period.title ||
          "دوره ارزیابی";


        select.appendChild(option);

      }
    );


    if (current) {
      select.value =
        current;
    }

  }


  /* =======================================================
     PREPARE EVALUATION PAGE
  ======================================================= */

  async function prepareEvaluationPage() {

    await loadAthletes();

    await loadEvaluationPeriods();

    await loadEvaluationCriteria();


    fillEvaluationAthleteSelect();

    fillEvaluationPeriodSelect();


    await loadEvaluations();


    evaluationInitialized =
      true;

  }


  /* =======================================================
     NEW EVALUATION
  ======================================================= */

  async function startNewEvaluation() {

    const athleteId =
      el("evaluationAthleteSelect")
        ?.value;


    const periodId =
      el("evaluationPeriodSelect")
        ?.value;


    if (!athleteId) {

      showMessage(
        "ابتدا ورزشکار را انتخاب کنید."
      );

      return;

    }


    if (!periodId) {

      showMessage(
        "ابتدا دوره ارزیابی را انتخاب کنید."
      );

      return;

    }


    if (!checkSupabase()) {
      return;
    }


    try {

      const existing =
        await supabaseClient
          .from("evaluations")
          .select("*")
          .eq(
            "athlete_id",
            athleteId
          )
          .eq(
            "period_id",
            periodId
          )
          .maybeSingle();


      if (existing.error) {
        throw existing.error;
      }


      if (existing.data) {

        showMessage(
          "برای این ورزشکار در این دوره قبلاً ارزیابی ثبت شده است."
        );

        return;

      }


      const {
        data,
        error
      } =
        await supabaseClient
          .from("evaluations")
          .insert({

            athlete_id:
              athleteId,

            period_id:
              periodId

          })
          .select()
          .single();


      if (error) {
        throw error;
      }


      console.log(
        "Evaluation created:",
        data
      );


      showMessage(
        "ارزیابی جدید ایجاد شد ✅"
      );


      await loadEvaluations();


    } catch (error) {

      console.error(
        "startNewEvaluation error:",
        error
      );


      showMessage(
        "ایجاد ارزیابی انجام نشد.\n\n" +
        (error.message || error)
      );

    }

  }


  /* =======================================================
     LOAD EVALUATIONS
  ======================================================= */

  async function loadEvaluations() {

    if (!checkSupabase()) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("evaluations")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );


      if (error) {
        throw error;
      }


      evaluations =
        data || [];


      renderEvaluations();

      updateEvaluationStats();


    } catch (error) {

      console.error(
        "loadEvaluations error:",
        error
      );

    }

  }


  /* =======================================================
     RENDER EVALUATIONS
  ======================================================= */

  function renderEvaluations() {

    const container =
      el("evaluationsList");

    if (!container) {
      return;
    }


    if (!evaluations.length) {

      container.innerHTML = `
        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📊
          </div>

          <h2>
            هنوز ارزیابی‌ای ثبت نشده است
          </h2>

          <p>
            برای شروع، یک ورزشکار و دوره ارزیابی انتخاب کنید.
          </p>

        </div>
      `;

      return;

    }


    container.innerHTML =
      evaluations
        .map(
          evaluation => {

            const athlete =
              athletes.find(
                a =>
                  String(getAthleteId(a)) ===
                  String(evaluation.athlete_id)
              );


            const period =
              evaluationPeriods.find(
                p =>
                  String(p.id) ===
                  String(evaluation.period_id)
              );


            const name =
              getAthleteName(athlete);


            return `
              <div class="evaluation-card">

                <div class="evaluation-card-header">

                  <div class="evaluation-athlete">

                    <div class="evaluation-avatar">
                      🥋
                    </div>

                    <div>

                      <h3>
                        ${escapeHtml(name)}
                      </h3>

                      <p>
                        ${
                          escapeHtml(
                            period?.name ||
                            period?.title ||
                            "دوره ارزیابی"
                          )
                        }
                      </p>

                    </div>

                  </div>

                  <div class="evaluation-score">

                    <span>
                      امتیاز
                    </span>

                    <strong>
                      ${evaluation.total_score ?? "—"}
                    </strong>

                  </div>

                </div>

              </div>
            `;

          }
        )
        .join("");

  }


  /* =======================================================
     ATTENDANCE
  ======================================================= */

  async function initializeAttendancePage() {

    await loadAthletes();

    fillAttendanceAthletes();

    updateAttendanceDateText();


    await loadAttendanceForDate(
      el("attendanceDate")?.value ||
      getTodayISO()
    );


    attendanceInitialized =
      true;

  }


  function fillAttendanceAthletes() {

    const total =
      el("attendanceTotalAthletes");


    if (total) {

      total.textContent =
        toPersianNumber(
          athletes.length
        );

    }

  }


  /* =======================================================
     LOAD ATTENDANCE FOR DATE
  ======================================================= */

  async function loadAttendanceForDate(date) {

    if (!date) {
      date = getTodayISO();
    }


    updateAttendanceDateText();


    const list =
      el("attendanceList");


    if (list) {

      list.innerHTML = `
        <div class="attendance-loading">
          در حال بارگذاری حضور و غیاب...
        </div>
      `;

    }


    if (!checkSupabase()) {
      return;
    }


    attendanceData = {};


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("attendance")
          .select("*")
          .eq(
            "date",
            date
          );


      if (error) {
        throw error;
      }


      (data || [])
        .forEach(
          row => {

            attendanceData[
              String(row.athlete_id)
            ] = {

              status:
                row.status ||
                "absent",

              note:
                row.note ||
                ""

            };

          }
        );


      renderAttendanceList();

      updateAttendanceSummary();


    } catch (error) {

      console.error(
        "loadAttendanceForDate error:",
        error
      );


      const errorBox =
        el("attendanceError");


      if (errorBox) {

        errorBox.style.display =
          "block";


        errorBox.textContent =
          "خطا در دریافت حضور و غیاب: " +
          (
            error.message ||
            error
          );

      }


      renderAttendanceList();

    }

  }


  /* =======================================================
     RENDER ATTENDANCE
  ======================================================= */

  function renderAttendanceList() {

    const list =
      el("attendanceList");


    if (!list) {
      return;
    }


    const search =
      (
        el("attendanceSearch")
          ?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const filter =
      el("attendanceFilter")
        ?.value ||
        "all";


    let listAthletes =
      [...athletes];


    if (search) {

      listAthletes =
        listAthletes.filter(
          athlete =>
            getAthleteName(athlete)
              .toLowerCase()
              .includes(search)
        );

    }


    if (filter !== "all") {

      listAthletes =
        listAthletes.filter(
          athlete => {

            const id =
              String(
                getAthleteId(athlete)
              );


            const status =
              attendanceData[id]
                ?.status ||
              "absent";


            return (
              status === filter
            );

          }
        );

    }


    if (!listAthletes.length) {

      list.innerHTML = `
        <div class="attendance-empty">

          <div class="attendance-empty-icon">
            👥
          </div>

          <h3>
            ورزشکاری پیدا نشد
          </h3>

          <p>
            فیلتر یا جستجو را تغییر دهید.
          </p>

        </div>
      `;

      return;

    }


    list.innerHTML =
      listAthletes
        .map(
          athlete => {

            const id =
              String(
                getAthleteId(athlete)
              );


            const current =
              attendanceData[id] || {

                status:
                  "absent",

                note:
                  ""

              };


            const name =
              getAthleteName(athlete);


            const ageGroup =
              athlete.age_group ||
              athlete.ageGroup ||
              athlete.category ||
              "—";


            return `
              <div
                class="attendance-row"
                data-athlete-id="${escapeHtml(id)}"
              >

                <div class="attendance-athlete">

                  <div class="attendance-avatar">
                    🥋
                  </div>

                  <div class="attendance-athlete-info">

                    <strong>
                      ${escapeHtml(name)}
                    </strong>

                    <span>
                      ${escapeHtml(ageGroup)}
                    </span>

                  </div>

                </div>


                <div class="attendance-status-group">

                  ${attendanceButton(
                    id,
                    "present",
                    "حاضر",
                    "🟢",
                    current.status
                  )}

                  ${attendanceButton(
                    id,
                    "late",
                    "تأخیر",
                    "🟡",
                    current.status
                  )}

                  ${attendanceButton(
                    id,
                    "absent",
                    "غایب",
                    "🔴",
                    current.status
                  )}

                  ${attendanceButton(
                    id,
                    "excused",
                    "موجه",
                    "🔵",
                    current.status
                  )}

                </div>


                <textarea
                  class="attendance-note"
                  data-athlete-note="${escapeHtml(id)}"
                  placeholder="توضیحات..."
                >${escapeHtml(current.note)}</textarea>

              </div>
            `;

          }
        )
        .join("");


    bindAttendanceButtons();

    updateAttendanceSummary();

  }


  function attendanceButton(
    athleteId,
    status,
    text,
    icon,
    currentStatus
  ) {

    const active =
      currentStatus === status
        ? "active"
        : "";


    return `
      <button
        type="button"
        class="attendance-status-btn ${active}"
        data-athlete-id="${escapeHtml(athleteId)}"
        data-status="${status}"
      >
        ${icon}
        ${text}
      </button>
    `;

  }


  /* =======================================================
     ATTENDANCE BUTTONS
  ======================================================= */

  function bindAttendanceButtons() {

    document
      .querySelectorAll(
        ".attendance-status-btn"
      )
      .forEach(
        button => {

          if (
            button.dataset.bound
          ) {
            return;
          }


          button.dataset.bound =
            "true";


          button.addEventListener(
            "click",
            function () {

              const athleteId =
                this.dataset.athleteId;


              const status =
                this.dataset.status;


              if (!athleteId) {
                return;
              }


              attendanceData[
                athleteId
              ] = {

                status:
                  status,

                note:
                  attendanceData[
                    athleteId
                  ]?.note || ""

              };


              document
                .querySelectorAll(
                  `.attendance-status-btn[data-athlete-id="${CSS.escape(athleteId)}"]`
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


              updateAttendanceSummary();

            }
          );

        }
      );


    document
      .querySelectorAll(
        ".attendance-note"
      )
      .forEach(
        textarea => {

          if (
            textarea.dataset.bound
          ) {
            return;
          }


          textarea.dataset.bound =
            "true";


          textarea.addEventListener(
            "input",
            function () {

              const id =
                this.dataset.athleteNote;


              if (!id) {
                return;
              }


              if (
                !attendanceData[id]
              ) {

                attendanceData[id] = {

                  status:
                    "absent",

                  note:
                    ""

                };

              }


              attendanceData[id].note =
                this.value;

            }
          );

        }
      );

  }


  /* =======================================================
     SAVE ATTENDANCE
  ======================================================= */

  async function saveAttendance() {

    if (!checkSupabase()) {
      return;
    }


    const date =
      el("attendanceDate")
        ?.value;


    if (!date) {

      showMessage(
        "تاریخ جلسه را انتخاب کنید."
      );

      return;

    }


    if (!athletes.length) {

      showMessage(
        "هیچ ورزشکاری برای ثبت حضور و غیاب وجود ندارد."
      );

      return;

    }


    const button =
      el("saveAttendanceBtn");


    if (button) {

      button.disabled =
        true;

      button.textContent =
        "در حال ذخیره...";

    }


    try {

      document
        .querySelectorAll(
          ".attendance-note"
        )
        .forEach(
          textarea => {

            const id =
              textarea.dataset.athleteNote;


            if (!id) {
              return;
            }


            if (
              !attendanceData[id]
            ) {

              attendanceData[id] = {

                status:
                  "absent",

                note:
                  ""

              };

            }


            attendanceData[id].note =
              textarea.value;

          }
        );


      const rows =
        athletes.map(
          athlete => {

            const athleteId =
              getAthleteId(athlete);


            const record =
              attendanceData[
                String(athleteId)
              ] || {

                status:
                  "absent",

                note:
                  ""

              };


            return {

              athlete_id:
                athleteId,

              date:
                date,

              status:
                record.status,

              note:
                record.note || null

            };

          }
        );


      const {
        error
      } =
        await supabaseClient
          .from("attendance")
          .upsert(
            rows,
            {
              onConflict:
                "athlete_id,date"
            }
          );


      if (error) {
        throw error;
      }


      showMessage(
        "حضور و غیاب با موفقیت ذخیره شد ✅"
      );


      await loadAttendanceForDate(
        date
      );


      await loadDashboardStats();


    } catch (error) {

      console.error(
        "saveAttendance error:",
        error
      );


      showMessage(
        "ذخیره حضور و غیاب انجام نشد.\n\n" +
        (
          error.message ||
          error
        )
      );


    } finally {

      if (button) {

        button.disabled =
          false;

        button.textContent =
          "💾 ذخیره حضور و غیاب";

      }

    }

  }


  /* =======================================================
     ATTENDANCE SUMMARY
  ======================================================= */

  function updateAttendanceSummary() {

    let present =
      0;

    let late =
      0;

    let absent =
      0;


    athletes.forEach(
      athlete => {

        const id =
          String(
            getAthleteId(athlete)
          );


        const status =
          attendanceData[id]
            ?.status ||
          "absent";


        if (status === "present") {

          present++;

        }

        else if (status === "late") {

          late++;

        }

        else {

          absent++;

        }

      }
    );


    if (el("attendanceTotalAthletes")) {

      el(
        "attendanceTotalAthletes"
      ).textContent =
        toPersianNumber(
          athletes.length
        );

    }


    if (el("attendancePresentCount")) {

      el(
        "attendancePresentCount"
      ).textContent =
        toPersianNumber(
          present
        );

    }


    if (el("attendanceLateCount")) {

      el(
        "attendanceLateCount"
      ).textContent =
        toPersianNumber(
          late
        );

    }


    if (el("attendanceAbsentCount")) {

      el(
        "attendanceAbsentCount"
      ).textContent =
        toPersianNumber(
          absent
        );

    }


    const selected =
      Object.keys(
        attendanceData
      ).length;


    if (
      el("attendanceSelectedCount")
    ) {

      el(
        "attendanceSelectedCount"
      ).textContent =
        toPersianNumber(
          selected
        );

    }

  }


  /* =======================================================
     DATE TEXT
  ======================================================= */

  function updateAttendanceDateText() {

    const input =
      el("attendanceDate");


    const output =
      el(
        "attendanceSelectedDateText"
      );


    if (!input || !output) {
      return;
    }


    if (!input.value) {

      output.textContent =
        "—";

      return;

    }


    output.textContent =
      input.value;

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  async function loadDashboardStats() {

    if (!checkSupabase()) {
      return;
    }


    /* ورزشکاران */

    try {

      const {
        count,
        error
      } =
        await supabaseClient
          .from("athletes")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          );


      if (error) {
        throw error;
      }


      if (
        el("totalAthletes")
      ) {

        el("totalAthletes")
          .textContent =
          toPersianNumber(
            count || 0
          );

      }

    } catch (error) {

      console.warn(
        "dashboard athletes:",
        error
      );

    }


    /* ارزیابی‌ها */

    try {

      const {
        count,
        error
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


      if (error) {
        throw error;
      }


      if (
        el("totalEvaluations")
      ) {

        el("totalEvaluations")
          .textContent =
          toPersianNumber(
            count || 0
          );

      }

    } catch (error) {

      console.warn(
        "dashboard evaluations:",
        error
      );

    }


    /* حضور امروز */

    try {

      const {
        count,
        error
      } =
        await supabaseClient
          .from("attendance")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          )
          .eq(
            "date",
            getTodayISO()
          )
          .eq(
            "status",
            "present"
          );


      if (error) {
        throw error;
      }


      if (
        el("todayAttendance")
      ) {

        el("todayAttendance")
          .textContent =
          toPersianNumber(
            count || 0
          );

      }

    } catch (error) {

      console.warn(
        "dashboard attendance:",
        error
      );

    }


    /* مقام‌ها */

    try {

      const {
        count,
        error
      } =
        await supabaseClient
          .from("achievements")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          );


      if (error) {
        throw error;
      }


      if (
        el("totalAchievements")
      ) {

        el("totalAchievements")
          .textContent =
          toPersianNumber(
            count || 0
          );

      }

    } catch (error) {

      if (
        el("totalAchievements")
      ) {

        el("totalAchievements")
          .textContent =
          "۰";

      }

    }

  }


  function updateAthleteStats() {

    if (
      el("totalAthletes")
    ) {

      el("totalAthletes")
        .textContent =
        toPersianNumber(
          athletes.length
        );

    }

  }


  function updateEvaluationStats() {

    if (
      el("totalEvaluations")
    ) {

      el("totalEvaluations")
        .textContent =
        toPersianNumber(
          evaluations.length
        );

    }

  }


  /* =======================================================
     COACH EMAIL
  ======================================================= */

  async function loadCoachUser() {

    if (!checkSupabase()) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .getUser();


      if (error) {
        throw error;
      }


      const email =
        data?.user?.email ||
        "مربی";


      const emailElement =
        el("coachEmail");


      if (emailElement) {

        emailElement.textContent =
          email;

      }

    } catch (error) {

      console.warn(
        "loadCoachUser:",
        error
      );

    }

  }


  /* =======================================================
     GLOBAL FUNCTIONS
  ======================================================= */

  window.renderAthletes =
    renderAthletes;


  window.prepareEvaluationPage =
    prepareEvaluationPage;


  window.initializeAttendancePage =
    initializeAttendancePage;


  window.loadAttendanceForDate =
    loadAttendanceForDate;


  window.renderAttendanceList =
    renderAttendanceList;


  window.saveAttendance =
    saveAttendance;


  window.openAthleteModal =
    openAthleteModal;


  window.closeAthleteModal =
    closeAthleteModal;


  window.saveAthlete =
    saveAthlete;


  window.startNewEvaluation =
    startNewEvaluation;


  /* =======================================================
     DOM READY
  ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    async function () {

      console.log(
        "Judo Tabiat coach.js loaded - FIXED VERSION"
      );


      /* دکمه ورزشکار */

      bindAthleteButtons();


      /* دکمه ارزیابی جدید */

      const newEvaluationBtn =
        el("newEvaluationBtn");


      if (
        newEvaluationBtn &&
        !newEvaluationBtn.dataset.bound
      ) {

        newEvaluationBtn.dataset.bound =
          "true";


        newEvaluationBtn.addEventListener(
          "click",
          startNewEvaluation
        );

      }


      /* بستن Modal با کلیک بیرون */

      const modal =
        el("athleteModal");


      if (modal) {

        modal.addEventListener(
          "click",
          function (event) {

            if (
              event.target === modal
            ) {

              closeAthleteModal();

            }

          }
        );

      }


      /* بارگذاری اولیه */

      await loadCoachUser();

      await loadAthletes();

      updateAthleteStats();

      fillAthleteFilter();

      fillEvaluationAthleteSelect();


      await loadEvaluationPeriods();

      fillEvaluationPeriodSelect();


      await loadEvaluations();

      await loadDashboardStats();


      /* اگر صفحه حضور و غیاب از ابتدا active بود */

      const attendancePage =
        el("page-attendance");


      if (
        attendancePage &&
        attendancePage.classList.contains(
          "active"
        )
      ) {

        await initializeAttendancePage();

      }

    }
  );


})();
