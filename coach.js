/* =========================================================
   JUDO TABIAT - COACH PANEL
   coach.js
   نسخه اصلاح‌شده اتصال مستقیم به Supabase
========================================================= */

(() => {

  "use strict";

  /* =======================================================
     SUPABASE CONFIG
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


  /* =======================================================
     GLOBAL VARIABLES
  ======================================================= */

  let supabaseClient = null;

  window.supabaseClient = null;


  /* =======================================================
     LOAD SUPABASE LIBRARY
  ======================================================= */

  function loadSupabaseLibrary() {

    return new Promise((resolve, reject) => {

      // اگر قبلاً لود شده
      if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
      ) {

        resolve();

        return;
      }


      // اگر اسکریپت قبلاً در حال لود شدن است
      const oldScript =
        document.querySelector(
          'script[data-supabase-library="true"]'
        );

      if (oldScript) {

        oldScript.addEventListener(
          "load",
          () => resolve(),
          { once: true }
        );

        oldScript.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "کتابخانه Supabase بارگذاری نشد."
              )
            ),
          { once: true }
        );

        return;
      }


      // ساخت اسکریپت Supabase
      const script =
        document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

      script.async = false;

      script.dataset.supabaseLibrary =
        "true";


      script.onload = () => {

        if (
          window.supabase &&
          typeof window.supabase.createClient === "function"
        ) {

          resolve();

        } else {

          reject(
            new Error(
              "کتابخانه Supabase لود شد اما createClient پیدا نشد."
            )
          );

        }

      };


      script.onerror = () => {

        reject(
          new Error(
            "اتصال به CDN کتابخانه Supabase برقرار نشد."
          )
        );

      };


      document.head.appendChild(script);

    });

  }


  /* =======================================================
     CREATE SUPABASE CLIENT
  ======================================================= */

  async function initializeSupabase() {

    try {

      console.log(
        "🔄 در حال آماده‌سازی Supabase..."
      );


      await loadSupabaseLibrary();


      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );


      window.supabaseClient =
        supabaseClient;


      console.log(
        "✅ Supabase Client ساخته شد."
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


  /* =======================================================
     REAL CONNECTION TEST
     این تست دیگر به جدول Athletes وابسته نیست.
  ======================================================= */

  async function testSupabaseConnection() {

    try {

      const response =
        await fetch(
          SUPABASE_URL + "/rest/v1/",
          {
            method: "GET",

            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization":
                "Bearer " + SUPABASE_KEY
            }
          }
        );


      console.log(
        "Supabase REST Status:",
        response.status
      );


      /*
       * هر پاسخ معتبر از سرور Supabase
       * یعنی سرور قابل دسترسی است.
       */

      if (
        response.ok ||
        response.status === 401 ||
        response.status === 403
      ) {

        console.log(
          "✅ ارتباط با سرور Supabase برقرار است."
        );

        return true;

      }


      const text =
        await response.text();


      console.error(
        "❌ Supabase REST Error:",
        text
      );


      return false;

    } catch (error) {

      console.error(
        "❌ خطای واقعی ارتباط با Supabase:",
        error
      );

      return false;

    }

  }


  /* =======================================================
     CHECK AUTH SESSION
  ======================================================= */

  async function checkCoachSession() {

    if (!supabaseClient) {

      console.error(
        "❌ Supabase Client آماده نیست."
      );

      return null;

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
          "❌ خطای دریافت Session:",
          error
        );

        return null;

      }


      if (
        data &&
        data.session &&
        data.session.user
      ) {

        console.log(
          "✅ مربی وارد شده است:",
          data.session.user.email
        );


        return data.session;

      }


      console.warn(
        "⚠️ هیچ Session فعالی وجود ندارد."
      );


      return null;

    } catch (error) {

      console.error(
        "❌ خطا در بررسی Session:",
        error
      );

      return null;

    }

  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  async function coachLogout() {

    try {

      if (supabaseClient) {

        await supabaseClient
          .auth
          .signOut();

      }

    } catch (error) {

      console.error(
        "خطا در خروج:",
        error
      );

    }


    localStorage.removeItem(
      "judoLoggedIn"
    );


    window.location.href =
      "index.html";

  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {

    const navItems =
      document.querySelectorAll(
        ".nav-item"
      );

    const pages =
      document.querySelectorAll(
        ".coach-page"
      );


    navItems.forEach(
      function (item) {

        item.addEventListener(
          "click",
          function () {

            const pageName =
              item.dataset.page;


            navItems.forEach(
              function (nav) {

                nav.classList.remove(
                  "active"
                );

              }
            );


            item.classList.add(
              "active"
            );


            pages.forEach(
              function (page) {

                page.classList.remove(
                  "active"
                );

              }
            );


            const targetPage =
              document.getElementById(
                "page-" + pageName
              );


            if (targetPage) {

              targetPage.classList.add(
                "active"
              );

            }

          }
        );

      }
    );

  }


  /* =======================================================
     EVENTS TABS
  ======================================================= */

  function setupEventsTabs() {

    const tabs =
      document.querySelectorAll(
        ".events-tab"
      );


    const announcementPanel =
      document.getElementById(
        "eventsPanelAnnouncements"
      );


    const competitionPanel =
      document.getElementById(
        "eventsPanelCompetitions"
      );


    tabs.forEach(
      function (tab) {

        tab.addEventListener(
          "click",
          function () {

            const target =
              tab.dataset.eventsTab;


            tabs.forEach(
              function (t) {

                t.classList.remove(
                  "active"
                );

              }
            );


            tab.classList.add(
              "active"
            );


            if (announcementPanel) {

              announcementPanel.classList.remove(
                "active"
              );

            }


            if (competitionPanel) {

              competitionPanel.classList.remove(
                "active"
              );

            }


            if (
              target === "announcements" &&
              announcementPanel
            ) {

              announcementPanel.classList.add(
                "active"
              );

            }


            if (
              target === "competitions" &&
              competitionPanel
            ) {

              competitionPanel.classList.add(
                "active"
              );

            }

          }
        );

      }
    );

  }


  /* =======================================================
     MODAL HELPER
  ======================================================= */

  function setupModal(
    modalId,
    openButtonId,
    closeButtonId,
    cancelButtonId
  ) {

    const modal =
      document.getElementById(
        modalId
      );


    const openButton =
      document.getElementById(
        openButtonId
      );


    const closeButton =
      document.getElementById(
        closeButtonId
      );


    const cancelButton =
      document.getElementById(
        cancelButtonId
      );


    if (!modal) return;


    function openModal() {

      modal.classList.remove(
        "hidden"
      );

      modal.style.display =
        "flex";

    }


    function closeModal() {

      modal.classList.add(
        "hidden"
      );

      modal.style.display =
        "none";

    }


    if (openButton) {

      openButton.addEventListener(
        "click",
        openModal
      );

    }


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        closeModal
      );

    }


    if (cancelButton) {

      cancelButton.addEventListener(
        "click",
        closeModal
      );

    }


    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === modal
        ) {

          closeModal();

        }

      }
    );

  }


  /* =======================================================
     MODALS
  ======================================================= */

  function setupModals() {

    setupModal(
      "announcementModal",
      "addAnnouncementBtn",
      "closeAnnouncementModal",
      "cancelAnnouncementBtn"
    );


    setupModal(
      "competitionModal",
      "addCompetitionBtn",
      "closeCompetitionModal",
      "cancelCompetitionBtn"
    );

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  async function loadDashboard() {

    if (!supabaseClient) {

      console.warn(
        "Supabase هنوز آماده نیست."
      );

      return;

    }


    /*
     * فعلاً فقط مقادیر موجود در HTML را
     * صفر نگه می‌داریم.
     *
     * بعد از اینکه اتصال قطعی شد،
     * آمار واقعی را از جداول می‌خوانیم.
     */

    const ids = [
      "dashboardAthletes",
      "dashboardEvaluations",
      "dashboardAttendance",
      "dashboardAchievements",
      "goldAchievements",
      "silverAchievements",
      "bronzeAchievements",
      "totalAnnouncements",
      "activeAnnouncements",
      "upcomingAnnouncements",
      "totalCompetitions",
      "upcomingCompetitions",
      "completedCompetitions"
    ];


    ids.forEach(
      function (id) {

        const element =
          document.getElementById(id);


        if (
          element &&
          (
            element.textContent === "۰" ||
            element.textContent === "0"
          )
        ) {

          element.textContent =
            "۰";

        }

      }
    );

  }


  /* =======================================================
     GLOBAL FUNCTIONS
  ======================================================= */

  window.testSupabaseConnection =
    testSupabaseConnection;

  window.initializeSupabase =
    initializeSupabase;

  window.coachLogout =
    coachLogout;


  /* =======================================================
     START
  ======================================================= */

  async function startCoachPanel() {

    console.log(
      "🚀 پنل مربی طبیعت جودو شروع شد."
    );


    /*
     * مرحله ۱:
     * ساخت مستقل Supabase Client
     */

    const initialized =
      await initializeSupabase();


    if (!initialized) {

      console.error(
        "❌ Supabase Client ساخته نشد."
      );

      alert(
        "کتابخانه Supabase بارگذاری نشد.\n\n" +
        "لطفاً اینترنت و دسترسی سایت را بررسی کنید."
      );

      return;

    }


    /*
     * مرحله ۲:
     * تست واقعی ارتباط با سرور
     */

    const connected =
      await testSupabaseConnection();


    if (!connected) {

      console.error(
        "❌ ارتباط با سرور Supabase برقرار نیست."
      );

      alert(
        "ارتباط با Supabase برقرار نیست."
      );

      return;

    }


    /*
     * مرحله ۳:
     * بررسی Session
     *
     * این قسمت دیگر اتصال را با Session
     * اشتباه نمی‌گیرد.
     */

    const session =
      await checkCoachSession();


    if (session) {

      console.log(
        "👤 کاربر فعلی:",
        session.user
      );

    } else {

      console.warn(
        "⚠️ Session فعال پیدا نشد."
      );

    }


    /*
     * مرحله ۴:
     * راه‌اندازی رابط
     */

    setupNavigation();

    setupEventsTabs();

    setupModals();

    await loadDashboard();


    console.log(
      "✅ پنل مربی با موفقیت آماده شد."
    );

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
      startCoachPanel
    );

  } else {

    startCoachPanel();

  }

})();
