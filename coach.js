/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   نسخه مستقل و اصلاح‌شده
   بدون وابستگی به app.js
========================================================= */

(() => {

  "use strict";


  /* =========================================================
     SUPABASE CONFIG
  ========================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


  /* =========================================================
     SUPABASE CLIENT
  ========================================================= */

  let supabaseClient = null;


  function createSupabaseClient() {

    try {

      // اگر قبلاً ساخته شده
      if (window.supabaseClient) {

        supabaseClient =
          window.supabaseClient;

        console.log(
          "✅ Supabase Client قبلی پیدا شد."
        );

        return true;
      }


      // بررسی کتابخانه Supabase
      if (!window.supabase) {

        console.error(
          "❌ کتابخانه Supabase روی coach.html وجود ندارد."
        );

        return false;
      }


      // ساخت Client
      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );


      // قرار دادن در window
      window.supabaseClient =
        supabaseClient;


      console.log(
        "✅ Supabase Client با موفقیت ساخته شد."
      );


      return true;

    } catch (error) {

      console.error(
        "❌ خطا در ساخت Supabase Client:",
        error
      );

      return false;
    }

  }


  /* =========================================================
     LOAD SUPABASE LIBRARY IF NEEDED
  ========================================================= */

  function loadSupabaseLibrary() {

    return new Promise((resolve) => {

      // اگر کتابخانه از قبل وجود دارد
      if (window.supabase) {

        resolve(true);

        return;
      }


      console.log(
        "⏳ در حال بارگذاری کتابخانه Supabase..."
      );


      const script =
        document.createElement("script");


      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


      script.async = true;


      script.onload = () => {

        console.log(
          "✅ کتابخانه Supabase بارگذاری شد."
        );

        resolve(true);

      };


      script.onerror = () => {

        console.error(
          "❌ بارگذاری کتابخانه Supabase ناموفق بود."
        );

        resolve(false);

      };


      document.head.appendChild(script);

    });

  }


  /* =========================================================
     SUPABASE CONNECTION TEST
  ========================================================= */

  async function checkSupabase() {

    console.log(
      "🔎 در حال بررسی اتصال Supabase..."
    );


    if (!supabaseClient) {

      console.error(
        "❌ Supabase Client ساخته نشده است."
      );

      return false;
    }


    try {

      /*
       * فقط برای تست اتصال.
       * اگر RLS فعال باشد، ممکن است query خطا بدهد.
       * بنابراین خطا را دقیق در Console نمایش می‌دهیم.
       */

      const result =
        await supabaseClient
          .from("Athletes")
          .select("id")
          .limit(1);


      const data =
        result.data;

      const error =
        result.error;


      if (error) {

        console.error(
          "❌ Supabase Query Error:",
          error
        );


        /*
         * این خطا لزوماً به معنی قطع بودن اینترنت
         * یا Supabase نیست.
         */

        showConnectionStatus(
          false,
          "Supabase در دسترس است اما دسترسی به جدول Athletes مشکل دارد."
        );


        return false;
      }


      console.log(
        "✅ اتصال به Supabase موفق است."
      );


      console.log(
        "📦 Athletes:",
        data
      );


      showConnectionStatus(
        true,
        "اتصال به Supabase برقرار است."
      );


      return true;

    } catch (error) {

      console.error(
        "❌ Supabase Connection Exception:",
        error
      );


      showConnectionStatus(
        false,
        "خطا در ارتباط با Supabase."
      );


      return false;
    }

  }


  /* =========================================================
     CONNECTION STATUS
  ========================================================= */

  function showConnectionStatus(
    success,
    message
  ) {

    let box =
      document.getElementById(
        "supabaseStatus"
      );


    if (!box) {

      box =
        document.createElement("div");


      box.id =
        "supabaseStatus";


      box.style.position =
        "fixed";

      box.style.left =
        "15px";

      box.style.bottom =
        "15px";

      box.style.zIndex =
        "99999";

      box.style.padding =
        "10px 15px";

      box.style.borderRadius =
        "10px";

      box.style.fontFamily =
        "Tahoma, Arial, sans-serif";

      box.style.fontSize =
        "12px";

      box.style.fontWeight =
        "700";

      box.style.boxShadow =
        "0 5px 20px rgba(0,0,0,.15)";


      document.body.appendChild(box);

    }


    box.textContent =
      success
        ? "🟢 " + message
        : "🔴 " + message;


    box.style.background =
      success
        ? "#dcfce7"
        : "#fee2e2";


    box.style.color =
      success
        ? "#166534"
        : "#991b1b";


    // بعد از چند ثانیه مخفی شود
    setTimeout(() => {

      if (box) {

        box.style.opacity =
          "0";

        box.style.transition =
          "opacity .4s";

      }

    }, 5000);

  }


  /* =========================================================
     LOAD ATHLETES
  ========================================================= */

  async function loadAthletes() {

    const list =
      document.getElementById(
        "athletesList"
      );


    if (!list) {
      return;
    }


    if (!supabaseClient) {

      list.innerHTML = `
        <div class="evaluation-empty">
          <div class="evaluation-empty-icon">🔴</div>
          <h2>اتصال به Supabase برقرار نیست</h2>
          <p>
            اتصال پایگاه داده برقرار نشد.
          </p>
        </div>
      `;

      return;
    }


    try {

      console.log(
        "⏳ در حال دریافت ورزشکاران..."
      );


      const {
        data,
        error
      } =
        await supabaseClient
          .from("Athletes")
          .select("*")
          .order("created_at", {
            ascending: false
          });


      if (error) {

        console.error(
          "❌ خطا در دریافت ورزشکاران:",
          error
        );


        /*
         * اگر created_at وجود نداشته باشد،
         * یک بار بدون order امتحان می‌کنیم.
         */

        const retry =
          await supabaseClient
            .from("Athletes")
            .select("*");


        if (retry.error) {

          list.innerHTML = `
            <div class="evaluation-empty">

              <div class="evaluation-empty-icon">
                ⚠️
              </div>

              <h2>
                خطا در دریافت ورزشکاران
              </h2>

              <p>
                ${escapeHTML(
                  retry.error.message ||
                  "خطای نامشخص"
                )}
              </p>

            </div>
          `;

          return;
        }


        renderAthletes(
          retry.data || []
        );

        return;
      }


      renderAthletes(
        data || []
      );


    } catch (error) {

      console.error(
        "❌ Exception:",
        error
      );

    }

  }


  /* =========================================================
     RENDER ATHLETES
  ========================================================= */

  function renderAthletes(
    athletes
  ) {

    const list =
      document.getElementById(
        "athletesList"
      );


    if (!list) {
      return;
    }


    if (!athletes.length) {

      list.innerHTML = `
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

      updateDashboard(
        athletes
      );

      return;
    }


    list.innerHTML =
      athletes
        .map(
          athlete =>
            createAthleteCard(
              athlete
            )
        )
        .join("");


    updateDashboard(
      athletes
    );

  }


  /* =========================================================
     ATHLETE CARD
  ========================================================= */

  function createAthleteCard(
    athlete
  ) {

    const name =
      athlete.name ||
      athlete.full_name ||
      athlete.first_name ||
      "بدون نام";


    const category =
      athlete.category ||
      athlete.age_group ||
      athlete.ageGroup ||
      "—";


    const weight =
      athlete.weight ||
      athlete.weight_class ||
      "—";


    const belt =
      athlete.belt ||
      athlete.rank ||
      "—";


    return `

      <div
        class="athlete-card"
        style="
          background:#fff;
          border:1px solid #e6e9ed;
          border-radius:16px;
          padding:18px;
          margin-bottom:12px;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
          "
        >

          <div>

            <h3
              style="
                margin:0 0 8px;
                font-size:16px;
              "
            >
              👤 ${escapeHTML(name)}
            </h3>

            <div
              style="
                color:#667085;
                font-size:12px;
                line-height:2;
              "
            >

              رده سنی:
              <strong>
                ${escapeHTML(category)}
              </strong>

              <br>

              وزن:
              <strong>
                ${escapeHTML(String(weight))}
              </strong>

              <br>

              کمربند:
              <strong>
                ${escapeHTML(belt)}
              </strong>

            </div>

          </div>

        </div>

      </div>

    `;

  }


  /* =========================================================
     DASHBOARD
  ========================================================= */

  async function updateDashboard(
    athletes
  ) {

    const dashboardAthletes =
      document.getElementById(
        "dashboardAthletes"
      );


    if (dashboardAthletes) {

      dashboardAthletes.textContent =
        toPersianNumber(
          athletes.length
        );

    }


    // تعداد ارزیابی‌ها
    try {

      if (supabaseClient) {

        const result =
          await supabaseClient
            .from("evaluations")
            .select("id", {
              count: "exact",
              head: true
            });


        if (
          !result.error &&
          document.getElementById(
            "dashboardEvaluations"
          )
        ) {

          document.getElementById(
            "dashboardEvaluations"
          ).textContent =
            toPersianNumber(
              result.count || 0
            );

        }

      }

    } catch (error) {

      console.warn(
        "⚠️ شمارش ارزیابی‌ها انجام نشد:",
        error
      );

    }


    // افتخارات
    try {

      if (supabaseClient) {

        const result =
          await supabaseClient
            .from("achievements")
            .select("id", {
              count: "exact",
              head: true
            });


        if (
          !result.error &&
          document.getElementById(
            "dashboardAchievements"
          )
        ) {

          document.getElementById(
            "dashboardAchievements"
          ).textContent =
            toPersianNumber(
              result.count || 0
            );

        }

      }

    } catch (error) {

      console.warn(
        "⚠️ شمارش افتخارات انجام نشد:",
        error
      );

    }

  }


  /* =========================================================
     ADD ATHLETE
  ========================================================= */

  function setupAddAthlete() {

    const button =
      document.getElementById(
        "addAthleteBtn"
      );


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        alert(
          "بخش افزودن ورزشکار در مرحله بعد به سیستم اصلی متصل می‌شود."
        );

      }
    );

  }


  /* =========================================================
     ADD EVALUATION
  ========================================================= */

  function setupEvaluation() {

    const button =
      document.getElementById(
        "addEvaluationBtn"
      );


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        alert(
          "بخش ثبت ارزیابی در مرحله بعد فعال می‌شود."
        );

      }
    );

  }


  /* =========================================================
     ATTENDANCE
  ========================================================= */

  function setupAttendance() {

    const button =
      document.getElementById(
        "addAttendanceBtn"
      );


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        alert(
          "بخش حضور و غیاب در مرحله بعد فعال می‌شود."
        );

      }
    );

  }


  /* =========================================================
     ACHIEVEMENTS
  ========================================================= */

  function setupAchievements() {

    const button =
      document.getElementById(
        "addAchievementBtn"
      );


    if (!button) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        alert(
          "بخش ثبت افتخار در مرحله بعد به جدول افتخارات متصل می‌شود."
        );

      }
    );

  }


  /* =========================================================
     ANNOUNCEMENTS
  ========================================================= */

  function setupAnnouncements() {

    const save =
      document.getElementById(
        "saveAnnouncementBtn"
      );


    if (!save) {
      return;
    }


    save.addEventListener(
      "click",
      async function () {

        const title =
          document.getElementById(
            "announcementTitle"
          )?.value.trim();


        const type =
          document.getElementById(
            "announcementType"
          )?.value;


        const date =
          document.getElementById(
            "announcementDate"
          )?.value;


        const location =
          document.getElementById(
            "announcementLocation"
          )?.value.trim();


        const startTime =
          document.getElementById(
            "announcementStartTime"
          )?.value;


        const endTime =
          document.getElementById(
            "announcementEndTime"
          )?.value;


        const content =
          document.getElementById(
            "announcementContent"
          )?.value.trim();


        if (!title) {

          alert(
            "لطفاً عنوان اطلاعیه را وارد کنید."
          );

          return;
        }


        if (!supabaseClient) {

          alert(
            "Supabase آماده نیست."
          );

          return;
        }


        save.disabled =
          true;


        const oldText =
          save.innerHTML;


        save.innerHTML =
          "⏳ در حال ذخیره...";


        try {

          const payload = {

            title:
              title,

            type:
              type,

            date:
              date || null,

            location:
              location || null,

            start_time:
              startTime || null,

            end_time:
              endTime || null,

            content:
              content || null

          };


          const {
            error
          } =
            await supabaseClient
              .from("announcements")
              .insert(payload);


          if (error) {

            console.error(
              "❌ Announcement Error:",
              error
            );


            alert(
              "ذخیره اطلاعیه انجام نشد.\n\n" +
              error.message
            );

            return;
          }


          alert(
            "✅ اطلاعیه با موفقیت ثبت شد."
          );


          closeModalById(
            "announcementModal"
          );


          clearAnnouncementForm();


        } catch (error) {

          console.error(
            error
          );


          alert(
            "خطا هنگام ذخیره اطلاعیه:\n\n" +
            error.message
          );


        } finally {

          save.disabled =
            false;

          save.innerHTML =
            oldText;

        }

      }
    );

  }


  /* =========================================================
     COMPETITIONS
  ========================================================= */

  function setupCompetitions() {

    const save =
      document.getElementById(
        "saveCompetitionBtn"
      );


    if (!save) {
      return;
    }


    save.addEventListener(
      "click",
      async function () {

        const title =
          document.getElementById(
            "competitionTitle"
          )?.value.trim();


        const date =
          document.getElementById(
            "competitionDate"
          )?.value;


        const location =
          document.getElementById(
            "competitionLocation"
          )?.value.trim();


        const startTime =
          document.getElementById(
            "competitionStartTime"
          )?.value;


        const endTime =
          document.getElementById(
            "competitionEndTime"
          )?.value;


        const ageGroup =
          document.getElementById(
            "competitionAgeGroup"
          )?.value.trim();


        const weights =
          document.getElementById(
            "competitionWeights"
          )?.value.trim();


        const description =
          document.getElementById(
            "competitionDescription"
          )?.value.trim();


        if (!title) {

          alert(
            "لطفاً نام مسابقه را وارد کنید."
          );

          return;
        }


        if (!supabaseClient) {

          alert(
            "Supabase آماده نیست."
          );

          return;
        }


        save.disabled =
          true;


        const oldText =
          save.innerHTML;


        save.innerHTML =
          "⏳ در حال ذخیره...";


        try {

          const payload = {

            title:
              title,

            date:
              date || null,

            location:
              location || null,

            start_time:
              startTime || null,

            end_time:
              endTime || null,

            age_group:
              ageGroup || null,

            weights:
              weights || null,

            description:
              description || null

          };


          const {
            error
          } =
            await supabaseClient
              .from("competitions")
              .insert(payload);


          if (error) {

            console.error(
              "❌ Competition Error:",
              error
            );


            alert(
              "ثبت مسابقه انجام نشد.\n\n" +
              error.message
            );

            return;
          }


          alert(
            "✅ مسابقه با موفقیت ثبت شد."
          );


          closeModalById(
            "competitionModal"
          );


          clearCompetitionForm();


        } catch (error) {

          console.error(
            error
          );


          alert(
            "خطا هنگام ثبت مسابقه:\n\n" +
            error.message
          );


        } finally {

          save.disabled =
            false;

          save.innerHTML =
            oldText;

        }

      }
    );

  }


  /* =========================================================
     CLEAR FORMS
  ========================================================= */

  function clearAnnouncementForm() {

    const ids = [

      "announcementTitle",
      "announcementDate",
      "announcementLocation",
      "announcementStartTime",
      "announcementEndTime",
      "announcementContent"

    ];


    ids.forEach(
      id => {

        const element =
          document.getElementById(id);


        if (element) {

          element.value =
            "";

        }

      }
    );

  }


  function clearCompetitionForm() {

    const ids = [

      "competitionTitle",
      "competitionDate",
      "competitionLocation",
      "competitionStartTime",
      "competitionEndTime",
      "competitionAgeGroup",
      "competitionWeights",
      "competitionDescription"

    ];


    ids.forEach(
      id => {

        const element =
          document.getElementById(id);


        if (element) {

          element.value =
            "";

        }

      }
    );

  }


  /* =========================================================
     MODAL HELPERS
  ========================================================= */

  function closeModalById(
    id
  ) {

    const modal =
      document.getElementById(id);


    if (!modal) {
      return;
    }


    modal.classList.add(
      "hidden"
    );


    modal.style.display =
      "none";

  }


  /* =========================================================
     AUTH CHECK
  ========================================================= */

  async function checkAuth() {

    if (!supabaseClient) {

      return false;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .getSession();


      if (error) {

        console.error(
          "❌ Auth Session Error:",
          error
        );

        return false;
      }


      if (
        data &&
        data.session
      ) {

        console.log(
          "✅ جلسه کاربر فعال است."
        );

        return true;
      }


      console.warn(
        "⚠️ جلسه ورود فعال نیست."
      );


      /*
       * فعلاً redirect نمی‌کنیم تا
       * مشکل اتصال را بتوانیم بررسی کنیم.
       */


      return false;

    } catch (error) {

      console.error(
        "❌ Auth Exception:",
        error
      );

      return false;
    }

  }


  /* =========================================================
     UTILS
  ========================================================= */

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


  function toPersianNumber(
    number
  ) {

    return String(
      number ?? 0
    ).replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[
          digit
        ]
    );

  }


  /* =========================================================
     INITIALIZE
  ========================================================= */

  async function initializeCoachPanel() {

    console.log(
      "🚀 Judo Tabia Coach Panel شروع شد."
    );


    /*
     * مرحله ۱:
     * اطمینان از وجود Supabase
     */

    const libraryLoaded =
      await loadSupabaseLibrary();


    if (!libraryLoaded) {

      showConnectionStatus(
        false,
        "کتابخانه Supabase بارگذاری نشد."
      );

      return;
    }


    /*
     * مرحله ۲:
     * ساخت Client
     */

    const clientCreated =
      createSupabaseClient();


    if (!clientCreated) {

      showConnectionStatus(
        false,
        "Supabase Client ساخته نشد."
      );

      return;
    }


    /*
     * مرحله ۳:
     * تست واقعی جدول Athletes
     */

    await checkSupabase();


    /*
     * مرحله ۴:
     * Auth
     */

    await checkAuth();


    /*
     * مرحله ۵:
     * بارگذاری ورزشکاران
     */

    await loadAthletes();


    /*
     * مرحله ۶:
     * فعال کردن امکانات
     */

    setupAddAthlete();

    setupEvaluation();

    setupAttendance();

    setupAchievements();

    setupAnnouncements();

    setupCompetitions();


    console.log(
      "✅ Coach Panel آماده است."
    );

  }


  /* =========================================================
     START
  ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeCoachPanel
    );

  } else {

    initializeCoachPanel();

  }


  /* =========================================================
     GLOBAL
  ========================================================= */

  window.coachSupabase =
    supabaseClient;

  window.checkCoachSupabase =
    checkSupabase;

  window.loadCoachAthletes =
    loadAthletes;


})();
