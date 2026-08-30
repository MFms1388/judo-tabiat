/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   COMPLETE / UPDATED
   VERSION: 2026.08.30

   سازگار با coach.html فعلی
========================================================= */

(() => {

  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  /*
    کلید Publishable / Anon پروژه را اینجا قرار بده.
    اگر در نسخه قبلی coach.js کلیدت همین‌جا بوده،
    همان کلید را نگه دار.
  */
  const SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";


  /* =======================================================
     SUPABASE
  ======================================================= */

  let supabase = null;

  function initSupabase() {

    try {

      if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
      ) {

        console.error(
          "Supabase JS library is not loaded."
        );

        return false;
      }


      if (
        !SUPABASE_KEY ||
        SUPABASE_KEY ===
        "YOUR_SUPABASE_PUBLISHABLE_KEY"
      ) {

        console.error(
          "Supabase key is not configured."
        );

        return false;
      }


      supabase =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );


      return true;

    } catch (error) {

      console.error(
        "Supabase initialization error:",
        error
      );

      return false;
    }
  }


  /* =======================================================
     STATE
  ======================================================= */

  const state = {

    athletes: [],

    evaluations: [],

    attendance: [],

    achievements: [],

    announcements: [],

    competitions: [],

    records: [],

    loading: false,

    connected: false

  };


  /* =======================================================
     HELPERS
  ======================================================= */

  function $(id) {

    return document.getElementById(id);

  }


  function escapeHTML(value) {

    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  function normalize(value) {

    return String(value ?? "")
      .trim()
      .toLowerCase();

  }


  function number(value) {

    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  }


  function todayISO() {

    return new Date()
      .toISOString()
      .slice(0, 10);

  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    try {

      return new Date(value)
        .toLocaleDateString("fa-IR");

    } catch {

      return value;
    }
  }


  function notify(message) {

    alert(message);

  }


  function setText(id, value) {

    const element = $(id);

    if (element) {

      element.textContent =
        value ?? "۰";

    }
  }


  function getAthleteName(athlete) {

    if (!athlete) {
      return "نامشخص";
    }

    return (
      athlete.name ||
      athlete.full_name ||
      athlete.fullname ||
      athlete.athlete_name ||
      athlete.title ||
      "بدون نام"
    );
  }


  function getAthleteId(athlete) {

    if (!athlete) {
      return null;
    }

    return (
      athlete.id ||
      athlete.athlete_id ||
      athlete.uuid ||
      null
    );
  }


  /* =======================================================
     DATABASE HELPERS
  ======================================================= */

  async function safeSelect(table, columns = "*") {

    if (!supabase) {
      return [];
    }

    try {

      const result =
        await supabase
          .from(table)
          .select(columns);

      if (result.error) {

        console.warn(
          `Table "${table}" could not be loaded:`,
          result.error.message
        );

        return [];

      }

      return result.data || [];

    } catch (error) {

      console.warn(
        `Error reading ${table}:`,
        error
      );

      return [];
    }
  }


  async function safeInsert(table, payload) {

    if (!supabase) {

      throw new Error(
        "اتصال به Supabase برقرار نیست."
      );

    }

    const result =
      await supabase
        .from(table)
        .insert(payload)
        .select();

    if (result.error) {

      throw result.error;

    }

    return result.data || [];

  }


  async function safeDelete(table, id) {

    if (!supabase) {

      throw new Error(
        "اتصال به Supabase برقرار نیست."
      );

    }

    const result =
      await supabase
        .from(table)
        .delete()
        .eq("id", id);

    if (result.error) {

      throw result.error;

    }

    return true;
  }


  /* =======================================================
     LOAD ALL DATA
  ======================================================= */

  async function loadAllData() {

    state.loading = true;

    try {

      const [

        athletes,
        evaluations,
        attendance,
        achievements,
        announcements,
        competitions,
        records

      ] = await Promise.all([

        safeSelect("athletes"),

        safeSelect("evaluations"),

        safeSelect("attendance"),

        safeSelect("achievements"),

        safeSelect("announcements"),

        safeSelect("competitions"),

        safeSelect("records")

      ]);


      state.athletes =
        athletes;

      state.evaluations =
        evaluations;

      state.attendance =
        attendance;

      state.achievements =
        achievements;

      state.announcements =
        announcements;

      state.competitions =
        competitions;

      state.records =
        records;


      state.connected = true;


      renderEverything();


    } catch (error) {

      console.error(
        "Load data error:",
        error
      );

    } finally {

      state.loading = false;

    }

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  function renderDashboard() {

    setText(
      "dashboardAthletes",
      state.athletes.length
    );


    setText(
      "dashboardEvaluations",
      state.evaluations.length
    );


    const today =
      todayISO();


    const todayAttendance =
      state.attendance.filter(item => {

        const date =
          item.date ||
          item.attendance_date ||
          item.session_date ||
          item.created_at;

        return String(date || "")
          .slice(0, 10) === today;

      });


    setText(
      "dashboardAttendance",
      todayAttendance.length
    );


    setText(
      "dashboardAchievements",
      state.achievements.length
    );

  }


  /* =======================================================
     RECORDS STATISTICS
  ======================================================= */

  function renderRecordsStatistics() {

    setText(
      "recordsAthletesCount",
      state.athletes.length
    );


    setText(
      "recordsEvaluationsCount",
      state.evaluations.length
    );


    setText(
      "recordsAchievementsCount",
      state.achievements.length
    );


    setText(
      "recordsCount",
      state.records.length
    );


    renderBestRecords();

  }


  /* =======================================================
     BEST RECORDS
  ======================================================= */

  function renderBestRecords() {

    const running =
      state.records.filter(item => {

        return normalize(
          item.type ||
          item.record_type ||
          item.category
        ) === "running";

      });


    const strength =
      state.records.filter(item => {

        return normalize(
          item.type ||
          item.record_type ||
          item.category
        ) === "strength";

      });


    const bestRunning =
      findBestRecord(running);


    const bestStrength =
      findBestRecord(strength);


    const bestEvaluation =
      findBestEvaluation();


    if (bestRunning) {

      const athlete =
        findAthlete(
          bestRunning.athlete_id ||
          bestRunning.athleteId
        );


      setText(
        "bestRunningRecord",
        `${getAthleteName(athlete)} — ${
          bestRunning.title ||
          bestRunning.record_title ||
          "رکورد دو"
        } : ${
          bestRunning.value ||
          bestRunning.record_value ||
          "—"
        } ${
          bestRunning.unit ||
          ""
        }`
      );

    } else {

      setText(
        "bestRunningRecord",
        "هنوز رکوردی ثبت نشده است."
      );

    }


    if (bestStrength) {

      const athlete =
        findAthlete(
          bestStrength.athlete_id ||
          bestStrength.athleteId
        );


      setText(
        "bestStrengthRecord",
        `${getAthleteName(athlete)} — ${
          bestStrength.title ||
          bestStrength.record_title ||
          "رکورد بدنسازی"
        } : ${
          bestStrength.value ||
          bestStrength.record_value ||
          "—"
        } ${
          bestStrength.unit ||
          ""
        }`
      );

    } else {

      setText(
        "bestStrengthRecord",
        "هنوز رکوردی ثبت نشده است."
      );

    }


    if (bestEvaluation) {

      const athlete =
        findAthlete(
          bestEvaluation.athlete_id ||
          bestEvaluation.athleteId
        );


      const score =
        bestEvaluation.total_score ??
        bestEvaluation.final_score ??
        bestEvaluation.score ??
        bestEvaluation.average_score;


      setText(
        "bestEvaluationRecord",
        `${getAthleteName(athlete)} — امتیاز ${
          score ?? "—"
        }`
      );

    } else {

      setText(
        "bestEvaluationRecord",
        "هنوز ارزیابی‌ای ثبت نشده است."
      );

    }

  }


  function findBestRecord(records) {

    if (!records.length) {
      return null;
    }


    /*
      برای رکوردهایی که مقدار عددی دارند،
      بیشترین مقدار را به عنوان بهترین نتیجه
      در نظر می‌گیریم.

      برای رکورد زمان، بعداً می‌توانیم منطق
      اختصاصی زمان را اضافه کنیم.
    */

    return [...records]
      .sort((a, b) => {

        const av =
          number(
            a.value ??
            a.record_value
          );

        const bv =
          number(
            b.value ??
            b.record_value
          );

        return bv - av;

      })[0];

  }


  function findBestEvaluation() {

    if (!state.evaluations.length) {
      return null;
    }


    return [...state.evaluations]
      .sort((a, b) => {

        const av =
          number(
            a.total_score ??
            a.final_score ??
            a.score ??
            a.average_score
          );


        const bv =
          number(
            b.total_score ??
            b.final_score ??
            b.score ??
            b.average_score
          );


        return bv - av;

      })[0];

  }


  /* =======================================================
     ATHLETES
  ======================================================= */

  function renderAthletes() {

    const container =
      $("athletesList");


    if (!container) {
      return;
    }


    if (!state.athletes.length) {

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


    container.innerHTML =
      state.athletes.map(
        athlete => {

          const name =
            getAthleteName(athlete);

          const weight =
            athlete.weight ??
            athlete.weight_class ??
            "—";

          const belt =
            athlete.belt ??
            athlete.rank ??
            "—";


          return `

            <div class="content-card"
                 style="margin-bottom:12px;">

              <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
              ">

                <div>

                  <strong>
                    ${escapeHTML(name)}
                  </strong>

                  <div style="
                    margin-top:7px;
                    color:#667085;
                    font-size:12px;
                  ">

                    وزن: ${escapeHTML(weight)}
                    |
                    کمربند: ${escapeHTML(belt)}

                  </div>

                </div>

                <button
                  type="button"
                  class="danger-btn"
                  data-delete-athlete="${escapeHTML(
                    getAthleteId(athlete) || ""
                  )}">

                  حذف

                </button>

              </div>

            </div>

          `;

        }
      ).join("");


    container
      .querySelectorAll(
        "[data-delete-athlete]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset.deleteAthlete;

            if (!id) {
              return;
            }


            if (
              !confirm(
                "آیا از حذف این ورزشکار مطمئن هستید؟"
              )
            ) {
              return;
            }


            try {

              await safeDelete(
                "athletes",
                id
              );


              await loadAllData();


            } catch (error) {

              console.error(error);

              notify(
                "حذف ورزشکار انجام نشد."
              );

            }

          }
        );

      });

  }


  /* =======================================================
     ACHIEVEMENTS
  ======================================================= */

  function renderAchievements() {

    const gold =
      state.achievements.filter(
        item =>
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("gold") ||
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("طلا")
      ).length;


    const silver =
      state.achievements.filter(
        item =>
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("silver") ||
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("نقره")
      ).length;


    const bronze =
      state.achievements.filter(
        item =>
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("bronze") ||
          normalize(
            item.medal ||
            item.medal_type ||
            item.place
          ).includes("برنز")
      ).length;


    setText(
      "goldAchievements",
      gold
    );


    setText(
      "silverAchievements",
      silver
    );


    setText(
      "bronzeAchievements",
      bronze
    );

  }


  /* =======================================================
     RECORDS TABLE
  ======================================================= */

  function renderRecords() {

    const container =
      $("recordsList");


    if (!container) {
      return;
    }


    let records =
      [...state.records];


    const search =
      normalize(
        $("recordSearch")?.value
      );


    const type =
      normalize(
        $("recordTypeFilter")?.value
      );


    if (search) {

      records =
        records.filter(item => {

          const athlete =
            findAthlete(
              item.athlete_id ||
              item.athleteId
            );


          const text = [

            getAthleteName(athlete),

            item.title,

            item.record_title,

            item.value,

            item.record_value,

            item.unit,

            item.description

          ].join(" ");


          return normalize(text)
            .includes(search);

        });

    }


    if (
      type &&
      type !== "all"
    ) {

      records =
        records.filter(item => {

          return normalize(
            item.type ||
            item.record_type ||
            item.category
          ) === type;

        });

    }


    if (!records.length) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📈
          </div>

          <h2>
            رکوردی پیدا نشد
          </h2>

          <p>
            هنوز رکوردی با این فیلتر ثبت نشده است.
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

            <th>عنوان</th>

            <th>مقدار</th>

            <th>تاریخ</th>

            <th>عملیات</th>

          </tr>

        </thead>

        <tbody>

          ${records.map(item => {

            const athlete =
              findAthlete(
                item.athlete_id ||
                item.athleteId
              );


            const recordType =
              item.type ||
              item.record_type ||
              item.category ||
              "other";


            const title =
              item.title ||
              item.record_title ||
              "—";


            const value =
              item.value ??
              item.record_value ??
              "—";


            const unit =
              item.unit ||
              "";


            const date =
              item.date ||
              item.record_date ||
              item.created_at;


            return `

              <tr>

                <td>
                  ${escapeHTML(
                    getAthleteName(athlete)
                  )}
                </td>

                <td>

                  <span class="record-type-badge">

                    ${escapeHTML(
                      recordType
                    )}

                  </span>

                </td>

                <td>
                  ${escapeHTML(title)}
                </td>

                <td>
                  ${escapeHTML(value)}
                  ${escapeHTML(unit)}
                </td>

                <td>
                  ${escapeHTML(
                    formatDate(date)
                  )}
                </td>

                <td>

                  <div class="record-actions">

                    <button
                      type="button"
                      class="record-action-btn delete"
                      data-delete-record="${escapeHTML(
                        item.id || ""
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


    container
      .querySelectorAll(
        "[data-delete-record]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset.deleteRecord;

            if (!id) {
              return;
            }


            if (
              !confirm(
                "آیا از حذف این رکورد مطمئن هستید؟"
              )
            ) {
              return;
            }


            try {

              await safeDelete(
                "records",
                id
              );


              await loadAllData();


            } catch (error) {

              console.error(error);

              notify(
                "حذف رکورد انجام نشد."
              );

            }

          }
        );

      });

  }


  /* =======================================================
     RECORD ATHLETE SELECT
  ======================================================= */

  function populateRecordAthletes() {

    const select =
      $("recordAthlete");


    if (!select) {
      return;
    }


    select.innerHTML = `

      <option value="">
        انتخاب ورزشکار
      </option>

      ${state.athletes.map(athlete => {

        const id =
          getAthleteId(athlete);

        return `

          <option value="${escapeHTML(id || "")}">

            ${escapeHTML(
              getAthleteName(athlete)
            )}

          </option>

        `;

      }).join("")}

    `;

  }


  /* =======================================================
     RECORD MODAL
  ======================================================= */

  function openRecordModal() {

    const modal =
      $("recordModal");


    if (!modal) {
      return;
    }


    populateRecordAthletes();


    const date =
      $("recordDate");


    if (
      date &&
      !date.value
    ) {

      date.value =
        todayISO();

    }


    modal.classList.remove(
      "hidden"
    );

    modal.style.display =
      "flex";

  }


  function closeRecordModal() {

    const modal =
      $("recordModal");


    if (!modal) {
      return;
    }


    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";

  }


  async function saveRecord() {

    const athleteId =
      $("recordAthlete")?.value;


    const type =
      $("recordType")?.value;


    const title =
      $("recordTitle")?.value.trim();


    const value =
      $("recordValue")?.value.trim();


    const unit =
      $("recordUnit")?.value.trim();


    const date =
      $("recordDate")?.value;


    const description =
      $("recordDescription")?.value.trim();


    if (!athleteId) {

      notify(
        "لطفاً ورزشکار را انتخاب کنید."
      );

      return;

    }


    if (!title) {

      notify(
        "لطفاً عنوان رکورد را وارد کنید."
      );

      return;

    }


    if (!value) {

      notify(
        "لطفاً مقدار رکورد را وارد کنید."
      );

      return;

    }


    try {

      const payload = {

        athlete_id: athleteId,

        type: type,

        title: title,

        value: value,

        unit: unit || null,

        date: date || todayISO(),

        description:
          description || null

      };


      await safeInsert(
        "records",
        payload
      );


      closeRecordModal();


      clearRecordForm();


      await loadAllData();


      notify(
        "رکورد با موفقیت ثبت شد."
      );


    } catch (error) {

      console.error(
        "Save record error:",
        error
      );


      notify(
        "ثبت رکورد انجام نشد.\n\n" +
        (
          error.message ||
          "خطای نامشخص"
        )
      );

    }

  }


  function clearRecordForm() {

    [
      "recordAthlete",
      "recordTitle",
      "recordValue",
      "recordUnit",
      "recordDescription"

    ].forEach(id => {

      const element =
        $(id);

      if (element) {

        if (
          element.tagName ===
          "SELECT"
        ) {

          element.selectedIndex =
            0;

        } else {

          element.value = "";

        }

      }

    });


    const date =
      $("recordDate");


    if (date) {

      date.value =
        todayISO();

    }

  }


  /* =======================================================
     ANNOUNCEMENTS
  ======================================================= */

  function renderAnnouncements() {

    const container =
      $("announcementsList");


    if (!container) {
      return;
    }


    let items =
      [...state.announcements];


    const search =
      normalize(
        $("announcementSearch")?.value
      );


    const filter =
      normalize(
        $("announcementFilter")?.value
      );


    if (search) {

      items =
        items.filter(item => {

          const text = [

            item.title,

            item.content,

            item.description,

            item.location

          ].join(" ");


          return normalize(text)
            .includes(search);

        });

    }


    if (
      filter &&
      filter !== "all"
    ) {

      items =
        items.filter(item => {

          return normalize(
            item.type ||
            item.announcement_type ||
            "general"
          ) === filter;

        });

    }


    if (!items.length) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📢
          </div>

          <h2>
            اطلاعیه‌ای پیدا نشد
          </h2>

        </div>

      `;

      return;

    }


    container.innerHTML =
      items.map(item => {

        return `

          <div class="announcement-card">

            <div class="announcement-card-top">

              <div class="announcement-icon">
                📢
              </div>

              <div class="announcement-main">

                <h3>
                  ${escapeHTML(
                    item.title ||
                    "بدون عنوان"
                  )}
                </h3>

                <span
                  class="announcement-type-badge">

                  ${escapeHTML(
                    item.type ||
                    item.announcement_type ||
                    "general"
                  )}

                </span>

              </div>

              <div class="event-actions">

                <button
                  type="button"
                  class="announcement-delete-btn"
                  data-delete-announcement="${
                    escapeHTML(item.id || "")
                  }">

                  🗑️

                </button>

              </div>

            </div>


            <div class="announcement-details">

              <div class="event-detail">

                <span>
                  تاریخ
                </span>

                <strong>
                  ${escapeHTML(
                    formatDate(
                      item.date ||
                      item.announcement_date
                    )
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  محل
                </span>

                <strong>
                  ${escapeHTML(
                    item.location || "—"
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  ساعت
                </span>

                <strong>
                  ${escapeHTML(
                    item.start_time ||
                    "—"
                  )}
                </strong>

              </div>

            </div>


            <div class="announcement-content">

              ${escapeHTML(
                item.content ||
                item.description ||
                ""
              )}

            </div>

          </div>

        `;

      }).join("");


    container
      .querySelectorAll(
        "[data-delete-announcement]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset.deleteAnnouncement;

            if (
              !id ||
              !confirm(
                "آیا این اطلاعیه حذف شود؟"
              )
            ) {
              return;
            }


            try {

              await safeDelete(
                "announcements",
                id
              );

              await loadAllData();

            } catch (error) {

              console.error(error);

              notify(
                "حذف اطلاعیه انجام نشد."
              );

            }

          }
        );

      });

  }


  /* =======================================================
     SAVE ANNOUNCEMENT
  ======================================================= */

  async function saveAnnouncement() {

    const title =
      $("announcementTitle")?.value.trim();


    if (!title) {

      notify(
        "عنوان اطلاعیه را وارد کنید."
      );

      return;

    }


    try {

      await safeInsert(
        "announcements",
        {

          title: title,

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
            null

        }
      );


      closeModal(
        "announcementModal"
      );


      clearForm([
        "announcementTitle",
        "announcementLocation",
        "announcementStartTime",
        "announcementEndTime",
        "announcementContent"
      ]);


      await loadAllData();


      notify(
        "اطلاعیه با موفقیت ثبت شد."
      );


    } catch (error) {

      console.error(error);

      notify(
        "ثبت اطلاعیه انجام نشد.\n\n" +
        error.message
      );

    }

  }


  /* =======================================================
     COMPETITIONS
  ======================================================= */

  function renderCompetitions() {

    const container =
      $("competitionsList");


    if (!container) {
      return;
    }


    let items =
      [...state.competitions];


    const search =
      normalize(
        $("competitionSearch")?.value
      );


    const filter =
      normalize(
        $("competitionFilter")?.value
      );


    if (search) {

      items =
        items.filter(item => {

          const text = [

            item.title,

            item.name,

            item.location,

            item.description,

            item.age_group

          ].join(" ");


          return normalize(text)
            .includes(search);

        });

    }


    if (
      filter &&
      filter !== "all"
    ) {

      items =
        items.filter(item => {

          const date =
            item.date ||
            item.competition_date;


          if (filter === "upcoming") {

            return (
              date &&
              date >= todayISO()
            );

          }


          if (filter === "completed") {

            return (
              date &&
              date < todayISO()
            );

          }


          if (filter === "cancelled") {

            return normalize(
              item.status
            ) === "cancelled";

          }


          return true;

        });

    }


    if (!items.length) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            📅
          </div>

          <h2>
            مسابقه‌ای پیدا نشد
          </h2>

        </div>

      `;

      return;

    }


    container.innerHTML =
      items.map(item => {

        const date =
          item.date ||
          item.competition_date;


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
                    item.name ||
                    "مسابقه"
                  )}
                </h3>

                <span
                  class="competition-status-badge">

                  ${escapeHTML(
                    item.status ||
                    "ثبت‌شده"
                  )}

                </span>

              </div>

              <div class="event-actions">

                <button
                  type="button"
                  class="competition-delete-btn"
                  data-delete-competition="${
                    escapeHTML(item.id || "")
                  }">

                  🗑️

                </button>

              </div>

            </div>


            <div class="competition-details">

              <div class="event-detail">

                <span>
                  تاریخ
                </span>

                <strong>
                  ${escapeHTML(
                    formatDate(date)
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  محل
                </span>

                <strong>
                  ${escapeHTML(
                    item.location || "—"
                  )}
                </strong>

              </div>


              <div class="event-detail">

                <span>
                  رده سنی
                </span>

                <strong>
                  ${escapeHTML(
                    item.age_group || "—"
                  )}
                </strong>

              </div>

            </div>


            <div class="competition-description">

              ${escapeHTML(
                item.description || ""
              )}

            </div>

          </div>

        `;

      }).join("");


    container
      .querySelectorAll(
        "[data-delete-competition]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset.deleteCompetition;

            if (
              !id ||
              !confirm(
                "آیا این مسابقه حذف شود؟"
              )
            ) {
              return;
            }


            try {

              await safeDelete(
                "competitions",
                id
              );

              await loadAllData();

            } catch (error) {

              console.error(error);

              notify(
                "حذف مسابقه انجام نشد."
              );

            }

          }
        );

      });

  }


  /* =======================================================
     EVENT STATISTICS
  ======================================================= */

  function renderEventStatistics() {

    setText(
      "totalAnnouncements",
      state.announcements.length
    );


    setText(
      "activeAnnouncements",
      state.announcements.length
    );


    const upcomingAnnouncements =
      state.announcements.filter(item => {

        const date =
          item.date ||
          item.announcement_date;

        return (
          date &&
          date >= todayISO()
        );

      }).length;


    setText(
      "upcomingAnnouncements",
      upcomingAnnouncements
    );


    setText(
      "totalCompetitions",
      state.competitions.length
    );


    const upcomingCompetitions =
      state.competitions.filter(item => {

        const date =
          item.date ||
          item.competition_date;

        return (
          date &&
          date >= todayISO()
        );

      }).length;


    const completedCompetitions =
      state.competitions.filter(item => {

        const date =
          item.date ||
          item.competition_date;

        return (
          date &&
          date < todayISO()
        );

      }).length;


    setText(
      "upcomingCompetitions",
      upcomingCompetitions
    );


    setText(
      "completedCompetitions",
      completedCompetitions
    );

  }


  /* =======================================================
     FIND ATHLETE
  ======================================================= */

  function findAthlete(id) {

    if (!id) {
      return null;
    }


    return state.athletes.find(
      athlete => {

        return String(
          getAthleteId(athlete)
        ) === String(id);

      }
    ) || null;

  }


  /* =======================================================
     GENERIC MODAL
  ======================================================= */

  function openModal(id) {

    const modal =
      $(id);


    if (!modal) {
      return;
    }


    modal.classList.remove(
      "hidden"
    );

    modal.style.display =
      "flex";

  }


  function closeModal(id) {

    const modal =
      $(id);


    if (!modal) {
      return;
    }


    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";

  }


  function clearForm(ids) {

    ids.forEach(id => {

      const element =
        $(id);

      if (element) {
        element.value = "";
      }

    });

  }


  /* =======================================================
     EVENTS
  ======================================================= */

  function bindEvents() {


    /* -----------------------------------------------
       RECORD
    ------------------------------------------------ */

    $("addRecordBtn")
      ?.addEventListener(
        "click",
        openRecordModal
      );


    $("closeRecordModal")
      ?.addEventListener(
        "click",
        closeRecordModal
      );


    $("cancelRecordBtn")
      ?.addEventListener(
        "click",
        closeRecordModal
      );


    $("saveRecordBtn")
      ?.addEventListener(
        "click",
        saveRecord
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


    /* -----------------------------------------------
       ANNOUNCEMENT
    ------------------------------------------------ */

    $("addAnnouncementBtn")
      ?.addEventListener(
        "click",
        () =>
          openModal(
            "announcementModal"
          )
      );


    $("closeAnnouncementModal")
      ?.addEventListener(
        "click",
        () =>
          closeModal(
            "announcementModal"
          )
      );


    $("cancelAnnouncementBtn")
      ?.addEventListener(
        "click",
        () =>
          closeModal(
            "announcementModal"
          )
      );


    $("saveAnnouncementBtn")
      ?.addEventListener(
        "click",
        saveAnnouncement
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


    /* -----------------------------------------------
       COMPETITION
    ------------------------------------------------ */

    $("addCompetitionBtn")
      ?.addEventListener(
        "click",
        () =>
          openModal(
            "competitionModal"
          )
      );


    $("closeCompetitionModal")
      ?.addEventListener(
        "click",
        () =>
          closeModal(
            "competitionModal"
          )
      );


    $("cancelCompetitionBtn")
      ?.addEventListener(
        "click",
        () =>
          closeModal(
            "competitionModal"
          )
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


    /* -----------------------------------------------
       MODAL OUTSIDE CLICK
    ------------------------------------------------ */

    [
      "recordModal",
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
     RENDER EVERYTHING
  ======================================================= */

  function renderEverything() {

    renderDashboard();

    renderAthletes();

    renderAchievements();

    renderRecords();

    renderRecordsStatistics();

    renderAnnouncements();

    renderCompetitions();

    renderEventStatistics();

    populateRecordAthletes();

  }


  /* =======================================================
     NAVIGATION
     این قسمت برای اینکه coach.js خودش هم
     بدون وابستگی به اسکریپت پایین HTML کار کند.
  ======================================================= */

  function bindNavigation() {

    document
      .querySelectorAll(".nav-item")
      .forEach(item => {

        item.addEventListener(
          "click",
          () => {

            const page =
              item.dataset.page;


            document
              .querySelectorAll(".nav-item")
              .forEach(nav =>
                nav.classList.remove(
                  "active"
                )
              );


            item.classList.add(
              "active"
            );


            document
              .querySelectorAll(".coach-page")
              .forEach(section =>
                section.classList.remove(
                  "active"
                )
              );


            const target =
              $(
                "page-" +
                page
              );


            if (target) {

              target.classList.add(
                "active"
              );

            }

          }
        );

      });

  }


  /* =======================================================
     EVENTS TABS
  ======================================================= */

  function bindEventTabs() {

    document
      .querySelectorAll(
        ".events-tab"
      )
      .forEach(tab => {

        tab.addEventListener(
          "click",
          () => {

            const target =
              tab.dataset.eventsTab;


            document
              .querySelectorAll(
                ".events-tab"
              )
              .forEach(t =>
                t.classList.remove(
                  "active"
                )
              );


            tab.classList.add(
              "active"
            );


            const announcementPanel =
              $(
                "eventsPanelAnnouncements"
              );


            const competitionPanel =
              $(
                "eventsPanelCompetitions"
              );


            announcementPanel
              ?.classList.remove(
                "active"
              );


            competitionPanel
              ?.classList.remove(
                "active"
              );


            if (
              target ===
              "announcements"
            ) {

              announcementPanel
                ?.classList.add(
                  "active"
                );

            }


            if (
              target ===
              "competitions"
            ) {

              competitionPanel
                ?.classList.add(
                  "active"
                );

            }

          }
        );

      });

  }


  /* =======================================================
     CONNECTION CHECK
  ======================================================= */

  async function checkConnection() {

    if (!supabase) {

      console.error(
        "Supabase client is not initialized."
      );

      return false;

    }


    try {

      /*
        یک جدول سبک موجود در پروژه را
        برای تست اتصال امتحان می‌کنیم.
      */

      const result =
        await supabase
          .from("athletes")
          .select("id")
          .limit(1);


      if (result.error) {

        console.error(
          "Supabase connection error:",
          result.error
        );

        return false;

      }


      state.connected =
        true;


      return true;

    } catch (error) {

      console.error(
        "Supabase connection error:",
        error
      );

      return false;

    }

  }


  /* =======================================================
     START
  ======================================================= */

  async function start() {

    console.log(
      "🥋 Judo Tabiaat Coach Panel starting..."
    );


    const initialized =
      initSupabase();


    if (!initialized) {

      console.error(
        "Supabase initialization failed."
      );

      return;

    }


    bindNavigation();

    bindEventTabs();

    bindEvents();


    const connected =
      await checkConnection();


    if (!connected) {

      console.error(
        "اتصال به Supabase برقرار نیست."
      );

      return;

    }


    await loadAllData();


    console.log(
      "🥋 Judo Tabiaat Coach Panel ready."
    );

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.JudoTabiatCoach = {

    state,

    supabase,

    reload:
      loadAllData,

    render:
      renderEverything,

    openRecordModal,

    closeRecordModal

  };


  /* =======================================================
     DOM READY
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once: true
      }
    );

  } else {

    start();

  }


})();
