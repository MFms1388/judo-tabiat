/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   VERSION: 2026.09.01
   ---------------------------------------------------------
   امکانات:
   - Supabase
   - Dashboard
   - Athlete Management
   - Evaluation
   - 🏆 Athlete Ranking
   - Attendance
   - Achievements
   - Announcements
   - Competitions
   - Records
   - Settings
   - Search / Filter
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     GLOBAL STATE
  ======================================================= */

  const state = {
    athletes: [],
    evaluations: [],
    evaluationScores: [],
    criteria: [],
    attendance: [],
    achievements: [],
    announcements: [],
    competitions: [],
    records: [],

    currentCoach: null,

    editingAnnouncementId: null,
    editingCompetitionId: null,
    editingRecordId: null,
    editingAchievementId: null,

    loaded: false
  };


  /* =======================================================
     SUPABASE
  ======================================================= */

  let supabaseClient = null;


  function getSupabase() {

    if (supabaseClient) {
      return supabaseClient;
    }

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      console.error("Supabase library is not loaded.");
      return null;
    }

    if (
      !window.SUPABASE_URL ||
      !window.SUPABASE_KEY ||
      window.SUPABASE_KEY.includes("کلید")
    ) {
      console.error(
        "SUPABASE_URL یا SUPABASE_KEY تنظیم نشده است."
      );
      return null;
    }

    try {

      supabaseClient =
        window.supabase.createClient(
          window.SUPABASE_URL,
          window.SUPABASE_KEY
        );

      return supabaseClient;

    } catch (error) {

      console.error(
        "Supabase initialization error:",
        error
      );

      return null;
    }
  }


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = (id) =>
    document.getElementById(id);


  function text(value, fallback = "") {

    if (
      value === null ||
      value === undefined
    ) {
      return fallback;
    }

    return String(value);
  }


  function number(value, fallback = 0) {

    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : fallback;
  }


  function escapeHTML(value) {

    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function persianNumber(value) {

    return text(value)
      .replace(/\d/g, d =>
        "۰۱۲۳۴۵۶۷۸۹"[Number(d)]
      );
  }


  function formatNumber(value, decimals = 2) {

    const n = number(value);

    return persianNumber(
      n.toFixed(decimals)
    );
  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    try {

      return new Intl.DateTimeFormat(
        "fa-IR",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      ).format(
        new Date(value)
      );

    } catch {

      return text(value);
    }
  }


  function todayISO() {

    const d = new Date();

    const month =
      String(d.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(d.getDate())
        .padStart(2, "0");

    return `${d.getFullYear()}-${month}-${day}`;
  }


  function getFirst(obj, keys, fallback = "") {

    for (const key of keys) {

      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }

    return fallback;
  }


  function getAthleteId(athlete) {

    return getFirst(
      athlete,
      [
        "id",
        "athlete_id",
        "athleteId",
        "uuid"
      ]
    );
  }


  function getAthleteName(athlete) {

    const direct =
      getFirst(
        athlete,
        [
          "name",
          "full_name",
          "fullName",
          "athlete_name",
          "athleteName"
        ]
      );

    if (direct) {
      return direct;
    }

    const first =
      getFirst(
        athlete,
        [
          "first_name",
          "firstName"
        ]
      );

    const last =
      getFirst(
        athlete,
        [
          "last_name",
          "lastName"
        ]
      );

    return (
      `${first} ${last}`.trim() ||
      "ورزشکار بدون نام"
    );
  }


  function getAchievementMedal(item) {

    const value =
      getFirst(
        item,
        [
          "medal",
          "medal_type",
          "medalType",
          "rank",
          "place",
          "position"
        ]
      );

    const s =
      text(value)
        .toLowerCase();

    if (
      s.includes("gold") ||
      s.includes("طلا") ||
      s === "1" ||
      s === "اول"
    ) {
      return "gold";
    }

    if (
      s.includes("silver") ||
      s.includes("نقره") ||
      s === "2" ||
      s === "دوم"
    ) {
      return "silver";
    }

    if (
      s.includes("bronze") ||
      s.includes("برنز") ||
      s === "3" ||
      s === "سوم"
    ) {
      return "bronze";
    }

    return "other";
  }


  function showMessage(message, type = "success") {

    let box =
      document.getElementById(
        "coachToast"
      );

    if (!box) {

      box =
        document.createElement("div");

      box.id = "coachToast";

      Object.assign(
        box.style,
        {
          position: "fixed",
          left: "20px",
          bottom: "20px",
          zIndex: "99999",
          maxWidth: "360px",
          padding: "13px 17px",
          borderRadius: "12px",
          background: "#111827",
          color: "white",
          fontSize: "13px",
          boxShadow:
            "0 12px 30px rgba(0,0,0,.18)"
        }
      );

      document.body.appendChild(box);
    }

    box.textContent = message;

    box.style.background =
      type === "error"
        ? "#dc2626"
        : "#111827";

    box.style.display = "block";

    clearTimeout(
      box._timer
    );

    box._timer =
      setTimeout(() => {

        box.style.display =
          "none";

      }, 3500);
  }


  /* =======================================================
     DATABASE HELPERS
  ======================================================= */

  async function selectTable(table, columns = "*") {

    const db = getSupabase();

    if (!db) {
      return {
        data: [],
        error: new Error(
          "Supabase آماده نیست."
        )
      };
    }

    try {

      const result =
        await db
          .from(table)
          .select(columns);

      return result;

    } catch (error) {

      return {
        data: [],
        error
      };
    }
  }


  async function insertRow(table, payload) {

    const db = getSupabase();

    if (!db) {
      throw new Error(
        "Supabase آماده نیست."
      );
    }

    const { data, error } =
      await db
        .from(table)
        .insert(payload)
        .select();

    if (error) {
      throw error;
    }

    return data;
  }


  async function updateRow(
    table,
    id,
    payload
  ) {

    const db = getSupabase();

    if (!db) {
      throw new Error(
        "Supabase آماده نیست."
      );
    }

    const { data, error } =
      await db
        .from(table)
        .update(payload)
        .eq("id", id)
        .select();

    if (error) {
      throw error;
    }

    return data;
  }


  async function deleteRow(
    table,
    id
  ) {

    const db = getSupabase();

    if (!db) {
      throw new Error(
        "Supabase آماده نیست."
      );
    }

    const { error } =
      await db
        .from(table)
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }
  }


  /* =======================================================
     LOAD ALL DATA
  ======================================================= */

  async function loadAllData() {

    const db = getSupabase();

    if (!db) {
      setConnectionStatus(false);
      return;
    }

    setConnectionStatus("loading");

    const results =
      await Promise.allSettled([

        selectTable("Athletes"),

        selectTable("evaluations"),

        selectTable("evaluation_scores"),

        selectTable("evaluation_criteria"),

        selectTable("attendance"),

        selectTable("achievements"),

        selectTable("announcements"),

        selectTable("competitions"),

        selectTable("records")

      ]);


    const [
      athletesResult,
      evaluationsResult,
      scoresResult,
      criteriaResult,
      attendanceResult,
      achievementsResult,
      announcementsResult,
      competitionsResult,
      recordsResult
    ] = results;


    state.athletes =
      athletesResult.status === "fulfilled" &&
      !athletesResult.value.error
        ? athletesResult.value.data || []
        : [];


    state.evaluations =
      evaluationsResult.status === "fulfilled" &&
      !evaluationsResult.value.error
        ? evaluationsResult.value.data || []
        : [];


    state.evaluationScores =
      scoresResult.status === "fulfilled" &&
      !scoresResult.value.error
        ? scoresResult.value.data || []
        : [];


    state.criteria =
      criteriaResult.status === "fulfilled" &&
      !criteriaResult.value.error
        ? criteriaResult.value.data || []
        : [];


    state.attendance =
      attendanceResult.status === "fulfilled" &&
      !attendanceResult.value.error
        ? attendanceResult.value.data || []
        : [];


    state.achievements =
      achievementsResult.status === "fulfilled" &&
      !achievementsResult.value.error
        ? achievementsResult.value.data || []
        : [];


    state.announcements =
      announcementsResult.status === "fulfilled" &&
      !announcementsResult.value.error
        ? announcementsResult.value.data || []
        : [];


    state.competitions =
      competitionsResult.status === "fulfilled" &&
      !competitionsResult.value.error
        ? competitionsResult.value.data || []
        : [];


    state.records =
      recordsResult.status === "fulfilled" &&
      !recordsResult.value.error
        ? recordsResult.value.data || []
        : [];


    state.loaded = true;

    setConnectionStatus(
      "success"
    );


    renderEverything();
  }


  /* =======================================================
     CONNECTION STATUS
  ======================================================= */

  function setConnectionStatus(status) {

    const el =
      $("supabaseConnectionStatus");

    if (!el) {
      return;
    }

    el.classList.remove(
      "connection-ok",
      "connection-error"
    );


    if (status === "success") {

      el.textContent =
        "متصل";

      el.classList.add(
        "connection-ok"
      );

      return;
    }


    if (status === false) {

      el.textContent =
        "خطا در اتصال";

      el.classList.add(
        "connection-error"
      );

      return;
    }


    el.textContent =
      "در حال بررسی...";
  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  function renderDashboard() {

    setText(
      "dashboardAthletes",
      persianNumber(
        state.athletes.length
      )
    );


    setText(
      "dashboardEvaluations",
      persianNumber(
        state.evaluations.length
      )
    );


    const today =
      todayISO();


    const attendanceToday =
      state.attendance.filter(
        item => {

          const date =
            getFirst(
              item,
              [
                "date",
                "attendance_date",
                "session_date"
              ]
            );

          return text(date)
            .startsWith(today);
        }
      );


    const presentToday =
      attendanceToday.filter(
        item => {

          const status =
            getFirst(
              item,
              [
                "status",
                "attendance_status"
              ]
            );

          return (
            status === true ||
            status === "present" ||
            status === "حاضر" ||
            status === "1" ||
            status === 1
          );
        }
      );


    setText(
      "dashboardAttendance",
      persianNumber(
        presentToday.length
      )
    );


    setText(
      "dashboardAchievements",
      persianNumber(
        state.achievements.length
      )
    );


    renderRanking();
  }


  function setText(id, value) {

    const el = $(id);

    if (el) {
      el.textContent = value;
    }
  }


  /* =======================================================
     🏆 ATHLETE RANKING
  ======================================================= */

  function calculateRanking() {

    const ranking = [];


    state.athletes.forEach(
      athlete => {

        const athleteId =
          getAthleteId(
            athlete
          );


        if (!athleteId) {
          return;
        }


        const athleteEvaluations =
          state.evaluations.filter(
            evaluation => {

              const id =
                getFirst(
                  evaluation,
                  [
                    "athlete_id",
                    "athleteId",
                    "athlete"
                  ]
                );

              return text(id) ===
                text(athleteId);
            }
          );


        let scores = [];


        athleteEvaluations.forEach(
          evaluation => {

            const evaluationId =
              getFirst(
                evaluation,
                [
                  "id",
                  "evaluation_id"
                ]
              );


            const evaluationScores =
              state.evaluationScores.filter(
                score => {

                  const scoreEvaluationId =
                    getFirst(
                      score,
                      [
                        "evaluation_id",
                        "evaluationId"
                      ]
                    );

                  return (
                    text(scoreEvaluationId) ===
                    text(evaluationId)
                  );
                }
              );


            evaluationScores.forEach(
              score => {

                const value =
                  getFirst(
                    score,
                    [
                      "score",
                      "value",
                      "point",
                      "points"
                    ]
                  );


                const n =
                  Number(value);


                if (
                  Number.isFinite(n)
                ) {
                  scores.push(n);
                }

              }
            );


            /*
              اگر evaluation خودش امتیاز نهایی داشته باشد
              و score جداگانه موجود نباشد.
            */

            if (
              evaluationScores.length === 0
            ) {

              const directScore =
                getFirst(
                  evaluation,
                  [
                    "final_score",
                    "finalScore",
                    "score",
                    "average_score",
                    "average"
                  ]
                );


              const n =
                Number(
                  directScore
                );


              if (
                Number.isFinite(n)
              ) {
                scores.push(n);
              }
            }

          }
        );


        /*
          معیارها بدون ضریب هستند.
          بنابراین میانگین ساده امتیازها محاسبه می‌شود.
        */

        const average =
          scores.length
            ? scores.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) / scores.length
            : 0;


        ranking.push({

          athlete,

          athleteId,

          name:
            getAthleteName(
              athlete
            ),

          score: average,

          scoreCount:
            scores.length

        });

      }
    );


    ranking.sort(
      (a, b) =>
        b.score - a.score
    );


    let lastScore = null;
    let currentRank = 0;


    ranking.forEach(
      (item, index) => {

        if (
          lastScore === null ||
          Math.abs(
            item.score - lastScore
          ) > 0.000001
        ) {

          currentRank =
            index + 1;

          lastScore =
            item.score;
        }


        item.rank =
          currentRank;
      }
    );


    return ranking;
  }


  function renderRanking() {

    const ranking =
      calculateRanking();


    /*
      اگر در coach.html جای مخصوص رنکینگ نداشت،
      خود JS آن را داخل داشبورد ایجاد می‌کند.
    */

    let container =
      $("athleteRanking");


    if (!container) {

      const dashboard =
        $("page-dashboard");

      if (!dashboard) {
        return;
      }


      container =
        document.createElement("div");

      container.id =
        "athleteRanking";

      container.className =
        "content-card";

      container.style.marginTop =
        "20px";


      dashboard.appendChild(
        container
      );
    }


    if (!ranking.length) {

      container.innerHTML = `

        <div class="section-header">
          <div>
            <h2>🏆 رنکینگ ورزشکاران</h2>
            <p>
              رتبه‌بندی بر اساس میانگین امتیاز ارزیابی
            </p>
          </div>
        </div>

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🏆
          </div>

          <h2>
            هنوز رنکینگی وجود ندارد
          </h2>

          <p>
            ابتدا ورزشکار و ارزیابی ثبت کنید.
          </p>

        </div>

      `;

      return;
    }


    const rows =
      ranking.map(
        item => {

          let medal = "";

          if (item.rank === 1) {
            medal = "🥇";
          } else if (
            item.rank === 2
          ) {
            medal = "🥈";
          } else if (
            item.rank === 3
          ) {
            medal = "🥉";
          } else {
            medal =
              persianNumber(
                item.rank
              );
          }


          const score =
            item.scoreCount
              ? formatNumber(
                  item.score,
                  2
                )
              : "بدون ارزیابی";


          return `

            <div
              class="ranking-row"
              style="
                display:flex;
                align-items:center;
                gap:14px;
                padding:14px;
                margin-bottom:8px;
                border-radius:12px;
                background:#f8fafc;
                border:1px solid #eef0f2;
              "
            >

              <div
                style="
                  width:42px;
                  min-width:42px;
                  text-align:center;
                  font-size:20px;
                  font-weight:800;
                "
              >
                ${medal}
              </div>

              <div
                style="
                  flex:1;
                  min-width:0;
                "
              >

                <strong
                  style="
                    display:block;
                    font-size:14px;
                    margin-bottom:4px;
                  "
                >
                  ${escapeHTML(item.name)}
                </strong>

                <span
                  style="
                    color:#667085;
                    font-size:11px;
                  "
                >
                  ${
                    item.scoreCount
                      ? "بر اساس ارزیابی‌ها"
                      : "هنوز ارزیابی نشده"
                  }
                </span>

              </div>

              <div
                style="
                  text-align:center;
                  min-width:80px;
                "
              >

                <strong
                  style="
                    display:block;
                    font-size:17px;
                  "
                >
                  ${score}
                </strong>

                <span
                  style="
                    font-size:10px;
                    color:#667085;
                  "
                >
                  از ۱۰
                </span>

              </div>

            </div>

          `;
        }
      ).join("");


    container.innerHTML = `

      <div class="section-header">

        <div>

          <h2>
            🏆 رنکینگ ورزشکاران
          </h2>

          <p>
            رتبه‌بندی بر اساس میانگین امتیاز ارزیابی‌ها
          </p>

        </div>

      </div>

      <div>

        ${rows}

      </div>

    `;
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
            برای شروع ورزشکار جدید اضافه کنید.
          </p>

        </div>

      `;

      return;
    }


    container.innerHTML = `

      <div class="athletes-grid">

        ${
          state.athletes
            .map(
              athlete => {

                const id =
                  getAthleteId(
                    athlete
                  );

                const name =
                  getAthleteName(
                    athlete
                  );

                const weight =
                  getFirst(
                    athlete,
                    [
                      "weight",
                      "weight_kg"
                    ],
                    "—"
                  );

                const belt =
                  getFirst(
                    athlete,
                    [
                      "belt",
                      "belt_color"
                    ],
                    "—"
                  );

                const category =
                  getFirst(
                    athlete,
                    [
                      "category",
                      "age_group",
                      "ageGroup"
                    ],
                    "—"
                  );


                return `

                  <div
                    class="athlete-card"
                    data-athlete-id="${escapeHTML(id)}"
                  >

                    <h3>
                      ${escapeHTML(name)}
                    </h3>

                    <div class="athlete-meta">

                      <div class="athlete-meta-item">
                        <span>وزن</span>
                        <strong>
                          ${escapeHTML(weight)}
                        </strong>
                      </div>

                      <div class="athlete-meta-item">
                        <span>کمربند</span>
                        <strong>
                          ${escapeHTML(belt)}
                        </strong>
                      </div>

                      <div class="athlete-meta-item">
                        <span>رده</span>
                        <strong>
                          ${escapeHTML(category)}
                        </strong>
                      </div>

                      <div class="athlete-meta-item">
                        <span>وضعیت</span>
                        <strong>
                          فعال
                        </strong>
                      </div>

                    </div>

                  </div>

                `;
              }
            )
            .join("")
        }

      </div>

    `;
  }


  /* =======================================================
     ACHIEVEMENTS
  ======================================================= */

  function renderAchievements() {

    let gold = 0;
    let silver = 0;
    let bronze = 0;


    state.achievements.forEach(
      achievement => {

        const medal =
          getAchievementMedal(
            achievement
          );

        if (medal === "gold") {
          gold++;
        }

        if (medal === "silver") {
          silver++;
        }

        if (medal === "bronze") {
          bronze++;
        }

      }
    );


    setText(
      "goldAchievements",
      persianNumber(gold)
    );

    setText(
      "silverAchievements",
      persianNumber(silver)
    );

    setText(
      "bronzeAchievements",
      persianNumber(bronze)
    );


    const container =
      $("achievementsList");

    if (!container) {
      return;
    }


    if (!state.achievements.length) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🏆
          </div>

          <h2>
            هنوز افتخاری ثبت نشده است
          </h2>

          <p>
            برای ثبت اولین افتخار روی «ثبت افتخار» بزنید.
          </p>

        </div>

      `;

      return;
    }


    container.innerHTML =
      state.achievements
        .map(
          item => {

            const athleteId =
              getFirst(
                item,
                [
                  "athlete_id",
                  "athleteId"
                ]
              );

            const athlete =
              state.athletes.find(
                a =>
                  text(
                    getAthleteId(a)
                  ) ===
                  text(athleteId)
              );


            const athleteName =
              athlete
                ? getAthleteName(
                    athlete
                  )
                : getFirst(
                    item,
                    [
                      "athlete_name",
                      "athleteName"
                    ],
                    "ورزشکار"
                  );


            const medal =
              getAchievementMedal(
                item
              );


            const medalIcon =
              medal === "gold"
                ? "🥇"
                : medal === "silver"
                ? "🥈"
                : medal === "bronze"
                ? "🥉"
                : "🏆";


            const title =
              getFirst(
                item,
                [
                  "title",
                  "competition",
                  "event_name",
                  "eventName"
                ],
                "افتخار"
              );


            return `

              <div
                class="achievement-card"
                style="
                  background:white;
                  border:1px solid #e6e9ed;
                  border-radius:15px;
                  padding:17px;
                  margin-bottom:10px;
                "
              >

                <div
                  style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                  "
                >

                  <div
                    style="
                      font-size:28px;
                    "
                  >
                    ${medalIcon}
                  </div>

                  <div style="flex:1">

                    <strong>
                      ${escapeHTML(
                        athleteName
                      )}
                    </strong>

                    <div
                      style="
                        color:#667085;
                        font-size:12px;
                        margin-top:5px;
                      "
                    >
                      ${escapeHTML(title)}
                    </div>

                  </div>

                </div>

              </div>

            `;
          }
        )
        .join("");
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


    const search =
      text(
        $("announcementSearch")?.value
      ).toLowerCase();


    const filter =
      $("announcementFilter")?.value ||
      "all";


    let list =
      [...state.announcements];


    if (search) {

      list =
        list.filter(
          item =>
            JSON.stringify(item)
              .toLowerCase()
              .includes(search)
        );
    }


    if (filter !== "all") {

      list =
        list.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "type",
                  "announcement_type"
                ]
              )
            ) === filter
        );
    }


    setText(
      "totalAnnouncements",
      persianNumber(
        state.announcements.length
      )
    );


    const active =
      state.announcements.filter(
        item => {

          const status =
            getFirst(
              item,
              [
                "active",
                "is_active",
                "status"
              ],
              true
            );

          return (
            status === true ||
            status === "active" ||
            status === "فعال"
          );
        }
      );


    setText(
      "activeAnnouncements",
      persianNumber(
        active.length
      )
    );


    const today =
      todayISO();


    const upcoming =
      state.announcements.filter(
        item => {

          const date =
            getFirst(
              item,
              [
                "date",
                "announcement_date"
              ]
            );

          return (
            date &&
            text(date) >= today
          );
        }
      );


    setText(
      "upcomingAnnouncements",
      persianNumber(
        upcoming.length
      )
    );


    if (!list.length) {

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
      list.map(
        item => {

          const title =
            getFirst(
              item,
              [
                "title",
                "name"
              ],
              "اطلاعیه"
            );


          const content =
            getFirst(
              item,
              [
                "content",
                "description",
                "body"
              ],
              ""
            );


          const date =
            getFirst(
              item,
              [
                "date",
                "announcement_date"
              ]
            );


          const location =
            getFirst(
              item,
              [
                "location",
                "place"
              ],
              "—"
            );


          return `

            <div class="announcement-card">

              <div class="announcement-card-top">

                <div class="announcement-icon">
                  📢
                </div>

                <div class="announcement-main">

                  <h3>
                    ${escapeHTML(title)}
                  </h3>

                  <span
                    class="announcement-type-badge"
                  >
                    ${escapeHTML(
                      getFirst(
                        item,
                        [
                          "type",
                          "announcement_type"
                        ],
                        "عمومی"
                      )
                    )}
                  </span>

                </div>

              </div>

              <div class="announcement-details">

                <div class="event-detail">
                  <span>📅 تاریخ</span>
                  <strong>
                    ${formatDate(date)}
                  </strong>
                </div>

                <div class="event-detail">
                  <span>📍 محل</span>
                  <strong>
                    ${escapeHTML(location)}
                  </strong>
                </div>

              </div>

              ${
                content
                  ? `
                    <div class="announcement-content">
                      ${escapeHTML(content)}
                    </div>
                  `
                  : ""
              }

            </div>

          `;
        }
      ).join("");
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


    const search =
      text(
        $("competitionSearch")?.value
      ).toLowerCase();


    const filter =
      $("competitionFilter")?.value ||
      "all";


    const today =
      todayISO();


    let list =
      [...state.competitions];


    if (search) {

      list =
        list.filter(
          item =>
            JSON.stringify(item)
              .toLowerCase()
              .includes(search)
        );
    }


    if (
      filter === "upcoming"
    ) {

      list =
        list.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "date",
                  "competition_date"
                ]
              )
            ) >= today
        );
    }


    if (
      filter === "completed"
    ) {

      list =
        list.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "date",
                  "competition_date"
                ]
              )
            ) < today
        );
    }


    if (
      filter === "cancelled"
    ) {

      list =
        list.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "status"
                ]
              )
            ) === "cancelled"
        );
    }


    setText(
      "totalCompetitions",
      persianNumber(
        state.competitions.length
      )
    );


    setText(
      "upcomingCompetitions",
      persianNumber(
        state.competitions.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "date",
                  "competition_date"
                ]
              )
            ) >= today
        ).length
      )
    );


    setText(
      "completedCompetitions",
      persianNumber(
        state.competitions.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "date",
                  "competition_date"
                ]
              )
            ) < today
        ).length
      )
    );


    if (!list.length) {

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
      list.map(
        item => {

          const title =
            getFirst(
              item,
              [
                "title",
                "name"
              ],
              "مسابقه"
            );


          const date =
            getFirst(
              item,
              [
                "date",
                "competition_date"
              ]
            );


          const location =
            getFirst(
              item,
              [
                "location",
                "place"
              ],
              "—"
            );


          const description =
            getFirst(
              item,
              [
                "description",
                "content"
              ],
              ""
            );


          return `

            <div class="competition-card">

              <div class="competition-card-top">

                <div class="competition-icon">
                  📅
                </div>

                <div class="competition-main">

                  <h3>
                    ${escapeHTML(title)}
                  </h3>

                  <span
                    class="competition-status-badge"
                  >
                    ${
                      text(date) >= today
                        ? "⏳ پیش‌رو"
                        : "✅ برگزارشده"
                    }
                  </span>

                </div>

              </div>

              <div class="competition-details">

                <div class="event-detail">
                  <span>📅 تاریخ</span>
                  <strong>
                    ${formatDate(date)}
                  </strong>
                </div>

                <div class="event-detail">
                  <span>📍 محل</span>
                  <strong>
                    ${escapeHTML(location)}
                  </strong>
                </div>

                <div class="event-detail">
                  <span>🏆 وضعیت</span>
                  <strong>
                    ${
                      text(date) >= today
                        ? "پیش‌رو"
                        : "برگزارشده"
                    }
                  </strong>
                </div>

              </div>

              ${
                description
                  ? `
                    <div class="competition-description">
                      ${escapeHTML(description)}
                    </div>
                  `
                  : ""
              }

            </div>

          `;
        }
      ).join("");
  }


  /* =======================================================
     RECORDS
  ======================================================= */

  function renderRecords() {

    setText(
      "recordsAthletesCount",
      persianNumber(
        state.athletes.length
      )
    );


    setText(
      "recordsEvaluationsCount",
      persianNumber(
        state.evaluations.length
      )
    );


    setText(
      "recordsAchievementsCount",
      persianNumber(
        state.achievements.length
      )
    );


    setText(
      "recordsCount",
      persianNumber(
        state.records.length
      )
    );


    const container =
      $("recordsList");

    if (!container) {
      return;
    }


    const search =
      text(
        $("recordSearch")?.value
      ).toLowerCase();


    const filter =
      $("recordTypeFilter")?.value ||
      "all";


    let list =
      [...state.records];


    if (search) {

      list =
        list.filter(
          item =>
            JSON.stringify(item)
              .toLowerCase()
              .includes(search)
        );
    }


    if (filter !== "all") {

      list =
        list.filter(
          item =>
            text(
              getFirst(
                item,
                [
                  "type",
                  "record_type"
                ]
              )
            ) === filter
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
            <th>عنوان</th>
            <th>رکورد</th>
            <th>تاریخ</th>

          </tr>

        </thead>

        <tbody>

          ${
            list.map(
              item => {

                const athleteId =
                  getFirst(
                    item,
                    [
                      "athlete_id",
                      "athleteId"
                    ]
                  );


                const athlete =
                  state.athletes.find(
                    a =>
                      text(
                        getAthleteId(a)
                      ) ===
                      text(athleteId)
                  );


                return `

                  <tr>

                    <td>
                      ${
                        athlete
                          ? escapeHTML(
                              getAthleteName(
                                athlete
                              )
                            )
                          : "—"
                      }
                    </td>

                    <td>
                      <span
                        class="record-type-badge"
                      >
                        ${escapeHTML(
                          getFirst(
                            item,
                            [
                              "type",
                              "record_type"
                            ],
                            "سایر"
                          )
                        )}
                      </span>
                    </td>

                    <td>
                      ${escapeHTML(
                        getFirst(
                          item,
                          [
                            "title",
                            "record_title"
                          ],
                          "—"
                        )
                      )}
                    </td>

                    <td>
                      <strong>
                        ${escapeHTML(
                          getFirst(
                            item,
                            [
                              "value",
                              "record_value"
                            ],
                            "—"
                          )
                        )}
                      </strong>

                      ${
                        getFirst(
                          item,
                          [
                            "unit"
                          ]
                        )
                          ? " " +
                            escapeHTML(
                              getFirst(
                                item,
                                ["unit"]
                              )
                            )
                          : ""
                      }

                    </td>

                    <td>
                      ${formatDate(
                        getFirst(
                          item,
                          [
                            "date",
                            "record_date"
                          ]
                        )
                      )}
                    </td>

                  </tr>

                `;
              }
            ).join("")
          }

        </tbody>

      </table>

    `;
  }


  /* =======================================================
     BEST RECORDS
  ======================================================= */

  function renderBestRecords() {

    const running =
      state.records.filter(
        item =>
          text(
            getFirst(
              item,
              [
                "type",
                "record_type"
              ]
            )
          ) === "running"
      );


    const strength =
      state.records.filter(
        item =>
          text(
            getFirst(
              item,
              [
                "type",
                "record_type"
              ]
            )
          ) === "strength"
      );


    if (running.length) {

      setText(
        "bestRunningRecord",
        `${getFirst(
          running[0],
          ["title"],
          "رکورد"
        )}: ${getFirst(
          running[0],
          ["value", "record_value"],
          "—"
        )} ${getFirst(
          running[0],
          ["unit"],
          ""
        )}`
      );
    }


    if (strength.length) {

      setText(
        "bestStrengthRecord",
        `${getFirst(
          strength[0],
          ["title"],
          "رکورد"
        )}: ${getFirst(
          strength[0],
          ["value", "record_value"],
          "—"
        )} ${getFirst(
          strength[0],
          ["unit"],
          ""
        )}`
      );
    }


    const ranking =
      calculateRanking();


    if (
      ranking.length &&
      ranking[0].scoreCount
    ) {

      setText(
        "bestEvaluationRecord",
        `${ranking[0].name} — ${formatNumber(
          ranking[0].score,
          2
        )} از ۱۰`
      );
    }
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

      ${
        state.athletes
          .map(
            athlete => `

              <option
                value="${escapeHTML(
                  getAthleteId(
                    athlete
                  )
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
          .join("")
      }

    `;
  }


  /* =======================================================
     MODAL HELPERS
  ======================================================= */

  function openModal(id) {

    const modal = $(id);

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

    const modal = $(id);

    if (!modal) {
      return;
    }

    modal.classList.add(
      "hidden"
    );

    modal.style.display =
      "none";
  }


  /* =======================================================
     RECORD MODAL
  ======================================================= */

  function setupRecordModal() {

    const add =
      $("addRecordBtn");

    const close =
      $("closeRecordModal");

    const cancel =
      $("cancelRecordBtn");

    const save =
      $("saveRecordBtn");


    if (add) {

      add.addEventListener(
        "click",
        () => {

          populateRecordAthletes();

          if ($("recordDate")) {
            $("recordDate").value =
              todayISO();
          }

          openModal(
            "recordModal"
          );

        }
      );
    }


    if (close) {

      close.addEventListener(
        "click",
        () =>
          closeModal(
            "recordModal"
          )
      );
    }


    if (cancel) {

      cancel.addEventListener(
        "click",
        () =>
          closeModal(
            "recordModal"
          )
      );
    }


    if (save) {

      save.addEventListener(
        "click",
        saveRecord
      );
    }
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


    if (
      !athleteId ||
      !title ||
      !value
    ) {

      showMessage(
        "ورزشکار، عنوان و مقدار رکورد را وارد کنید.",
        "error"
      );

      return;
    }


    try {

      await insertRow(
        "records",
        {
          athlete_id: athleteId,
          type,
          title,
          value,
          unit,
          date,
          description
        }
      );


      closeModal(
        "recordModal"
      );


      showMessage(
        "رکورد با موفقیت ثبت شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(error);

      showMessage(
        "ثبت رکورد انجام نشد. ساختار جدول records را بررسی کنید.",
        "error"
      );
    }
  }


  /* =======================================================
     ANNOUNCEMENT MODAL
  ======================================================= */

  function setupAnnouncementModal() {

    const save =
      $("saveAnnouncementBtn");


    if (save) {

      save.addEventListener(
        "click",
        saveAnnouncement
      );
    }
  }


  async function saveAnnouncement() {

    const title =
      $("announcementTitle")?.value.trim();


    const type =
      $("announcementType")?.value;


    const date =
      $("announcementDate")?.value;


    const location =
      $("announcementLocation")?.value.trim();


    const startTime =
      $("announcementStartTime")?.value;


    const endTime =
      $("announcementEndTime")?.value;


    const content =
      $("announcementContent")?.value.trim();


    if (!title) {

      showMessage(
        "عنوان اطلاعیه را وارد کنید.",
        "error"
      );

      return;
    }


    try {

      await insertRow(
        "announcements",
        {
          title,
          type,
          date,
          location,
          start_time: startTime,
          end_time: endTime,
          content,
          active: true
        }
      );


      closeModal(
        "announcementModal"
      );


      showMessage(
        "اطلاعیه منتشر شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(error);

      showMessage(
        "ثبت اطلاعیه انجام نشد.",
        "error"
      );
    }
  }


  /* =======================================================
     COMPETITION MODAL
  ======================================================= */

  function setupCompetitionModal() {

    const save =
      $("saveCompetitionBtn");


    if (save) {

      save.addEventListener(
        "click",
        saveCompetition
      );
    }
  }


  async function saveCompetition() {

    const title =
      $("competitionTitle")?.value.trim();


    const date =
      $("competitionDate")?.value;


    const location =
      $("competitionLocation")?.value.trim();


    const startTime =
      $("competitionStartTime")?.value;


    const endTime =
      $("competitionEndTime")?.value;


    const ageGroup =
      $("competitionAgeGroup")?.value.trim();


    const weights =
      $("competitionWeights")?.value.trim();


    const description =
      $("competitionDescription")?.value.trim();


    if (!title || !date) {

      showMessage(
        "نام و تاریخ مسابقه را وارد کنید.",
        "error"
      );

      return;
    }


    try {

      await insertRow(
        "competitions",
        {
          title,
          date,
          location,
          start_time: startTime,
          end_time: endTime,
          age_group: ageGroup,
          weights,
          description,
          status: "upcoming"
        }
      );


      closeModal(
        "competitionModal"
      );


      showMessage(
        "مسابقه ثبت شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(error);

      showMessage(
        "ثبت مسابقه انجام نشد.",
        "error"
      );
    }
  }


  /* =======================================================
     ATHLETE ADD
  ======================================================= */

  function setupAthleteButton() {

    const button =
      $("addAthleteBtn");


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      openAthleteModal
    );
  }


  function openAthleteModal() {

    let modal =
      $("coachAthleteModal");


    if (!modal) {

      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "coachAthleteModal";

      modal.className =
        "modal";

      modal.innerHTML = `

        <div class="modal-content">

          <div class="modal-header">

            <div>

              <h2>
                ➕ افزودن ورزشکار
              </h2>

              <p>
                اطلاعات ورزشکار را وارد کنید.
              </p>

            </div>

            <button
              type="button"
              class="modal-close"
              data-close-athlete-modal
            >
              ✕
            </button>

          </div>

          <div class="form-grid">

            <div class="form-group">

              <label>
                نام و نام خانوادگی
              </label>

              <input
                id="newAthleteName"
                type="text"
                placeholder="نام ورزشکار"
              >

            </div>

            <div class="form-group">

              <label>
                وزن
              </label>

              <input
                id="newAthleteWeight"
                type="text"
                placeholder="مثلاً ۶۶"
              >

            </div>

            <div class="form-group">

              <label>
                کمربند
              </label>

              <input
                id="newAthleteBelt"
                type="text"
                placeholder="مثلاً قهوه‌ای"
              >

            </div>

            <div class="form-group">

              <label>
                رده سنی
              </label>

              <input
                id="newAthleteCategory"
                type="text"
                placeholder="مثلاً نوجوانان"
              >

            </div>

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-btn"
              data-close-athlete-modal
            >
              انصراف
            </button>

            <button
              type="button"
              class="primary-btn"
              id="saveNewAthleteBtn"
            >
              💾 ثبت ورزشکار
            </button>

          </div>

        </div>

      `;

      document.body.appendChild(
        modal
      );


      modal
        .querySelectorAll(
          "[data-close-athlete-modal]"
        )
        .forEach(
          btn =>
            btn.addEventListener(
              "click",
              () =>
                closeModal(
                  "coachAthleteModal"
                )
            )
        );


      $("saveNewAthleteBtn")
        ?.addEventListener(
          "click",
          saveNewAthlete
        );
    }


    openModal(
      "coachAthleteModal"
    );
  }


  async function saveNewAthlete() {

    const name =
      $("newAthleteName")
        ?.value.trim();


    const weight =
      $("newAthleteWeight")
        ?.value.trim();


    const belt =
      $("newAthleteBelt")
        ?.value.trim();


    const category =
      $("newAthleteCategory")
        ?.value.trim();


    if (!name) {

      showMessage(
        "نام ورزشکار را وارد کنید.",
        "error"
      );

      return;
    }


    try {

      await insertRow(
        "Athletes",
        {
          name,
          weight,
          belt,
          category
        }
      );


      closeModal(
        "coachAthleteModal"
      );


      showMessage(
        "ورزشکار با موفقیت اضافه شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(error);

      showMessage(
        "افزودن ورزشکار انجام نشد. ستون‌های جدول Athletes را بررسی کنید.",
        "error"
      );
    }
  }


  /* =======================================================
     EVENTS SEARCH
  ======================================================= */

  function setupSearch() {

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
     ACHIEVEMENT BUTTON
  ======================================================= */

  function setupAchievementButton() {

    const btn =
      $("addAchievementBtn");


    if (!btn) {
      return;
    }


    btn.addEventListener(
      "click",
      openAchievementModal
    );
  }


  function openAchievementModal() {

    let modal =
      $("coachAchievementModal");


    if (!modal) {

      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "coachAchievementModal";

      modal.className =
        "modal";

      modal.innerHTML = `

        <div class="modal-content">

          <div class="modal-header">

            <div>

              <h2>
                🏆 ثبت افتخار
              </h2>

              <p>
                مدال یا مقام ورزشکار را ثبت کنید.
              </p>

            </div>

            <button
              type="button"
              class="modal-close"
              id="closeAchievementDynamic"
            >
              ✕
            </button>

          </div>

          <div class="form-grid">

            <div class="form-group full-width">

              <label>
                ورزشکار
              </label>

              <select
                id="achievementAthlete"
              >
                <option value="">
                  انتخاب ورزشکار
                </option>
              </select>

            </div>

            <div class="form-group">

              <label>
                مدال / مقام
              </label>

              <select
                id="achievementMedal"
              >

                <option value="gold">
                  🥇 طلا
                </option>

                <option value="silver">
                  🥈 نقره
                </option>

                <option value="bronze">
                  🥉 برنز
                </option>

              </select>

            </div>

            <div class="form-group">

              <label>
                عنوان مسابقه
              </label>

              <input
                id="achievementTitle"
                type="text"
                placeholder="مثلاً مسابقات استان تهران"
              >

            </div>

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-btn"
              id="cancelAchievementDynamic"
            >
              انصراف
            </button>

            <button
              type="button"
              class="primary-btn"
              id="saveAchievementDynamic"
            >
              🏆 ثبت افتخار
            </button>

          </div>

        </div>

      `;

      document.body.appendChild(
        modal
      );


      $("closeAchievementDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachAchievementModal"
            )
        );


      $("cancelAchievementDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachAchievementModal"
            )
        );


      $("saveAchievementDynamic")
        ?.addEventListener(
          "click",
          saveAchievement
        );
    }


    const select =
      $("achievementAthlete");


    if (select) {

      select.innerHTML = `

        <option value="">
          انتخاب ورزشکار
        </option>

        ${
          state.athletes
            .map(
              athlete => `

                <option
                  value="${escapeHTML(
                    getAthleteId(
                      athlete
                    )
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
            .join("")
        }

      `;
    }


    openModal(
      "coachAchievementModal"
    );
  }


  async function saveAchievement() {

    const athleteId =
      $("achievementAthlete")
        ?.value;


    const medal =
      $("achievementMedal")
        ?.value;


    const title =
      $("achievementTitle")
        ?.value.trim();


    if (
      !athleteId ||
      !title
    ) {

      showMessage(
        "ورزشکار و عنوان مسابقه را وارد کنید.",
        "error"
      );

      return;
    }


    try {

      await insertRow(
        "achievements",
        {
          athlete_id: athleteId,
          medal,
          title,
          date: todayISO()
        }
      );


      closeModal(
        "coachAchievementModal"
      );


      showMessage(
        "افتخار با موفقیت ثبت شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(error);

      showMessage(
        "ثبت افتخار انجام نشد.",
        "error"
      );
    }
  }


  /* =======================================================
     EVALUATION BUTTON
  ======================================================= */

  function setupEvaluationButton() {

    const btn =
      $("addEvaluationBtn");


    if (!btn) {
      return;
    }


    btn.addEventListener(
      "click",
      openEvaluationModal
    );
  }


  /*
    توجه:
    HTML فعلی برای فرم ارزیابی Modal اختصاصی ندارد.
    بنابراین فرم را با JS ایجاد می‌کنیم.
  */

  function openEvaluationModal() {

    let modal =
      $("coachEvaluationModal");


    if (!modal) {

      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "coachEvaluationModal";

      modal.className =
        "modal";

      modal.innerHTML = `

        <div class="modal-content">

          <div class="modal-header">

            <div>

              <h2>
                📊 ارزیابی جدید
              </h2>

              <p>
                امتیازها از ۰ تا ۱۰ و بدون ضریب هستند.
              </p>

            </div>

            <button
              type="button"
              class="modal-close"
              id="closeEvaluationDynamic"
            >
              ✕
            </button>

          </div>

          <div class="form-group">

            <label>
              ورزشکار
            </label>

            <select
              id="evaluationAthlete"
            >

              <option value="">
                انتخاب ورزشکار
              </option>

            </select>

          </div>

          <div
            id="evaluationCriteriaContainer"
            style="
              display:grid;
              gap:12px;
              margin-top:18px;
            "
          ></div>

          <div class="modal-actions">

            <button
              type="button"
              class="secondary-btn"
              id="cancelEvaluationDynamic"
            >
              انصراف
            </button>

            <button
              type="button"
              class="primary-btn"
              id="saveEvaluationDynamic"
            >
              💾 ثبت ارزیابی
            </button>

          </div>

        </div>

      `;

      document.body.appendChild(
        modal
      );


      $("closeEvaluationDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachEvaluationModal"
            )
        );


      $("cancelEvaluationDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachEvaluationModal"
            )
        );


      $("saveEvaluationDynamic")
        ?.addEventListener(
          "click",
          saveEvaluation
        );
    }


    const athleteSelect =
      $("evaluationAthlete");


    if (athleteSelect) {

      athleteSelect.innerHTML = `

        <option value="">
          انتخاب ورزشکار
        </option>

        ${
          state.athletes
            .map(
              athlete => `

                <option
                  value="${escapeHTML(
                    getAthleteId(
                      athlete
                    )
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
            .join("")
        }

      `;
    }


    const criteriaContainer =
      $("evaluationCriteriaContainer");


    if (criteriaContainer) {

      if (!state.criteria.length) {

        criteriaContainer.innerHTML = `

          <div class="evaluation-empty">

            <div class="evaluation-empty-icon">
              📊
            </div>

            <h2>
              معیاری ثبت نشده است
            </h2>

            <p>
              ابتدا معیارهای ارزیابی را در سیستم ثبت کنید.
            </p>

          </div>

        `;

      } else {

        criteriaContainer.innerHTML =
          state.criteria
            .map(
              criterion => {

                const id =
                  getFirst(
                    criterion,
                    [
                      "id",
                      "criterion_id"
                    ]
                  );


                const name =
                  getFirst(
                    criterion,
                    [
                      "name",
                      "title",
                      "criterion_name"
                    ],
                    "معیار"
                  );


                return `

                  <div
                    style="
                      padding:14px;
                      border:1px solid #e6e9ed;
                      border-radius:12px;
                      background:#f8fafc;
                    "
                  >

                    <label
                      style="
                        display:block;
                        font-weight:700;
                        font-size:12px;
                        margin-bottom:8px;
                      "
                    >
                      ${escapeHTML(name)}
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      class="evaluation-score-input"
                      data-criterion-id="${escapeHTML(id)}"
                      placeholder="۰ تا ۱۰"
                      style="
                        width:100%;
                        height:42px;
                        border:1px solid #dfe3e8;
                        border-radius:10px;
                        padding:0 12px;
                      "
                    >

                  </div>

                `;
              }
            )
            .join("");
      }
    }


    openModal(
      "coachEvaluationModal"
    );
  }


  async function saveEvaluation() {

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


    const inputs =
      document.querySelectorAll(
        ".evaluation-score-input"
      );


    if (!inputs.length) {

      showMessage(
        "معیاری برای ارزیابی وجود ندارد.",
        "error"
      );

      return;
    }


    const scores = [];


    inputs.forEach(
      input => {

        const value =
          Number(
            input.value
          );


        if (
          !Number.isFinite(value) ||
          value < 0 ||
          value > 10
        ) {
          return;
        }


        scores.push({

          criterion_id:
            input.dataset.criterionId,

          score:
            value

        });

      }
    );


    if (
      scores.length !==
      inputs.length
    ) {

      showMessage(
        "برای تمام معیارها امتیاز بین ۰ تا ۱۰ وارد کنید.",
        "error"
      );

      return;
    }


    try {

      /*
        مرحله ۱:
        ایجاد Evaluation
      */

      const evaluationRows =
        await insertRow(
          "evaluations",
          {
            athlete_id:
              athleteId,

            date:
              todayISO()
          }
        );


      const evaluation =
        evaluationRows?.[0];


      if (!evaluation?.id) {

        throw new Error(
          "شناسه ارزیابی دریافت نشد."
        );
      }


      /*
        مرحله ۲:
        ذخیره امتیاز معیارها
      */

      const payload =
        scores.map(
          item => ({
            evaluation_id:
              evaluation.id,

            criterion_id:
              item.criterion_id,

            score:
              item.score
          })
        );


      const db =
        getSupabase();


      const {
        error
      } =
        await db
          .from(
            "evaluation_scores"
          )
          .insert(
            payload
          );


      if (error) {
        throw error;
      }


      closeModal(
        "coachEvaluationModal"
      );


      showMessage(
        "ارزیابی با موفقیت ثبت شد."
      );


      await loadAllData();

    } catch (error) {

      console.error(
        "Evaluation error:",
        error
      );

      showMessage(
        "ثبت ارزیابی انجام نشد. ساختار جدول‌های ارزیابی را بررسی کنید.",
        "error"
      );
    }
  }


  /* =======================================================
     ATTENDANCE
  ======================================================= */

  function setupAttendanceButton() {

    const btn =
      $("addAttendanceBtn");


    if (!btn) {
      return;
    }


    btn.addEventListener(
      "click",
      openAttendanceModal
    );
  }


  function openAttendanceModal() {

    let modal =
      $("coachAttendanceModal");


    if (!modal) {

      modal =
        document.createElement(
          "div"
        );

      modal.id =
        "coachAttendanceModal";

      modal.className =
        "modal";

      modal.innerHTML = `

        <div class="modal-content">

          <div class="modal-header">

            <div>

              <h2>
                🟢 ثبت حضور
              </h2>

              <p>
                حضور ورزشکاران جلسه را ثبت کنید.
              </p>

            </div>

            <button
              class="modal-close"
              id="closeAttendanceDynamic"
            >
              ✕
            </button>

          </div>

          <div class="form-group">

            <label>
              تاریخ جلسه
            </label>

            <input
              type="date"
              id="attendanceDateDynamic"
              value="${todayISO()}"
            >

          </div>

          <div
            id="attendanceAthletesContainer"
            style="
              display:grid;
              gap:10px;
              margin-top:18px;
            "
          ></div>

          <div class="modal-actions">

            <button
              class="secondary-btn"
              id="cancelAttendanceDynamic"
            >
              انصراف
            </button>

            <button
              class="primary-btn"
              id="saveAttendanceDynamic"
            >
              💾 ثبت حضور
            </button>

          </div>

        </div>

      `;

      document.body.appendChild(
        modal
      );


      $("closeAttendanceDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachAttendanceModal"
            )
        );


      $("cancelAttendanceDynamic")
        ?.addEventListener(
          "click",
          () =>
            closeModal(
              "coachAttendanceModal"
            )
        );


      $("saveAttendanceDynamic")
        ?.addEventListener(
          "click",
          saveAttendance
        );
    }


    const container =
      $("attendanceAthletesContainer");


    if (container) {

      container.innerHTML =
        state.athletes
          .map(
            athlete => `

              <label
                style="
                  display:flex;
                  align-items:center;
                  gap:10px;
                  padding:12px;
                  background:#f8fafc;
                  border-radius:11px;
                "
              >

                <input
                  type="checkbox"
                  class="attendance-present"
                  data-athlete-id="${escapeHTML(
                    getAthleteId(
                      athlete
                    )
                  )}"
                >

                <span>
                  ${escapeHTML(
                    getAthleteName(
                      athlete
                    )
                  )}
                </span>

              </label>

            `
          )
          .join("");
    }


    openModal(
      "coachAttendanceModal"
    );
  }


  async function saveAttendance() {

    const date =
      $("attendanceDateDynamic")
        ?.value ||
      todayISO();


    const checked =
      document.querySelectorAll(
        ".attendance-present:checked"
      );


    if (!checked.length) {

      showMessage(
        "حداقل یک ورزشکار را انتخاب کنید.",
        "error"
      );

      return;
    }


    try {

      const rows =
        Array.from(
          checked
        ).map(
          input => ({
            athlete_id:
              input.dataset.athleteId,

            date,

            status:
              "present"
          })
        );


      const db =
        getSupabase();


      const {
        error
      } =
        await db
          .from("attendance
