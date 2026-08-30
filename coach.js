/* =========================================================
   JUDO TABIAT
   COACH PANEL
   coach.js
   VERSION: 2026.08.30
========================================================= */

(() => {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


  /* =======================================================
     GLOBAL
  ======================================================= */

  let client = null;

  window.judoCoach = {
    supabase: null,
    connected: false
  };


  /* =======================================================
     LOG
  ======================================================= */

  function log(...args) {
    console.log("[JUDO COACH]", ...args);
  }


  function error(...args) {
    console.error("[JUDO COACH]", ...args);
  }


  /* =======================================================
     LOAD SUPABASE
  ======================================================= */

  async function loadSupabase() {

    if (
      window.supabase &&
      typeof window.supabase.createClient === "function"
    ) {

      log("Supabase library already loaded.");

      return true;
    }


    return new Promise((resolve) => {

      const script =
        document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js";

      script.onload = () => {

        if (
          window.supabase &&
          typeof window.supabase.createClient === "function"
        ) {

          log("Supabase library loaded.");

          resolve(true);

        } else {

          error(
            "Supabase library loaded but createClient is unavailable."
          );

          resolve(false);

        }

      };


      script.onerror = () => {

        error(
          "Could not load Supabase library."
        );

        resolve(false);

      };


      document.head.appendChild(script);

    });

  }


  /* =======================================================
     CREATE CLIENT
  ======================================================= */

  async function createSupabaseClient() {

    const libraryReady =
      await loadSupabase();


    if (!libraryReady) {

      return false;

    }


    try {

      client =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );


      window.supabaseClient =
        client;


      window.judoCoach.supabase =
        client;


      log(
        "Supabase client created successfully."
      );


      return true;

    } catch (e) {

      error(
        "Supabase client creation failed:",
        e
      );

      return false;

    }

  }


  /* =======================================================
     CONNECTION TEST
  ======================================================= */

  async function testConnection() {

    if (!client) {

      error(
        "Client does not exist."
      );

      return false;

    }


    try {

      const response =
        await fetch(
          SUPABASE_URL + "/rest/v1/",
          {
            method: "GET",
            headers: {
              apikey: SUPABASE_KEY,
              Authorization:
                "Bearer " + SUPABASE_KEY
            }
          }
        );


      log(
        "Supabase HTTP status:",
        response.status
      );


      /*
       * 200 = OK
       * 401/403 = سرور در دسترس است
       * ولی دسترسی API رد شده
       *
       * در هیچ‌کدام نباید نتیجه را
       * «قطع بودن اینترنت» فرض کنیم.
       */

      if (
        response.ok ||
        response.status === 401 ||
        response.status === 403
      ) {

        window.judoCoach.connected =
          true;


        log(
          "Supabase server is reachable."
        );


        return true;

      }


      const text =
        await response.text();


      error(
        "Supabase REST response:",
        text
      );


      return false;

    } catch (e) {

      error(
        "Network error:",
        e
      );


      return false;

    }

  }


  /* =======================================================
     GET SESSION
  ======================================================= */

  async function getSession() {

    if (!client) {

      return null;

    }


    try {

      const result =
        await client.auth.getSession();


      if (result.error) {

        error(
          "Session error:",
          result.error
        );

        return null;

      }


      return result.data?.session || null;

    } catch (e) {

      error(
        "Session exception:",
        e
      );

      return null;

    }

  }


  /* =======================================================
     AUTH STATE
  ======================================================= */

  function listenAuth() {

    if (!client) return;


    client.auth.onAuthStateChange(
      (event, session) => {

        log(
          "Auth event:",
          event
        );


        if (session) {

          log(
            "Logged in:",
            session.user?.email
          );

        }

      }
    );

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


    navItems.forEach((item) => {

      item.addEventListener(
        "click",
        () => {

          const pageName =
            item.dataset.page;


          navItems.forEach((nav) => {

            nav.classList.remove(
              "active"
            );

          });


          item.classList.add(
            "active"
          );


          pages.forEach((page) => {

            page.classList.remove(
              "active"
            );

          });


          const target =
            document.getElementById(
              "page-" + pageName
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

  function setupEventTabs() {

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


    tabs.forEach((tab) => {

      tab.addEventListener(
        "click",
        () => {

          const target =
            tab.dataset.eventsTab;


          tabs.forEach((t) => {

            t.classList.remove(
              "active"
            );

          });


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

    });

  }


  /* =======================================================
     MODAL
  ======================================================= */

  function setupModal(
    modalId,
    openId,
    closeId,
    cancelId
  ) {

    const modal =
      document.getElementById(
        modalId
      );


    const open =
      document.getElementById(
        openId
      );


    const close =
      document.getElementById(
        closeId
      );


    const cancel =
      document.getElementById(
        cancelId
      );


    if (!modal) {

      return;

    }


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


    if (open) {

      open.addEventListener(
        "click",
        openModal
      );

    }


    if (close) {

      close.addEventListener(
        "click",
        closeModal
      );

    }


    if (cancel) {

      cancel.addEventListener(
        "click",
        closeModal
      );

    }


    modal.addEventListener(
      "click",
      (event) => {

        if (
          event.target === modal
        ) {

          closeModal();

        }

      }
    );

  }


  /* =======================================================
     SETUP MODALS
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
     SIMPLE DATABASE TEST
     فقط برای تشخیص واقعی جدول
  ======================================================= */

  async function testAthletesTable() {

    if (!client) {

      return;

    }


    try {

      const result =
        await client
          .from("Athletes")
          .select("id")
          .limit(1);


      if (result.error) {

        error(
          "Athletes table error:",
          result.error
        );


        log(
          "این خطا به معنی قطع بودن Supabase نیست."
        );


        return;

      }


      log(
        "Athletes table is accessible.",
        result.data
      );

    } catch (e) {

      error(
        "Athletes test exception:",
        e
      );

    }

  }


  /* =======================================================
     DASHBOARD
  ======================================================= */

  async function loadDashboard() {

    if (!client) {

      return;

    }


    /*
     * فعلاً از جدول‌ها چیزی اجباری نمی‌خوانیم.
     * چون اول باید اتصال و ساختار پروژه قطعی شود.
     */

    log(
      "Dashboard initialized."
    );

  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {

    try {

      if (client) {

        await client.auth.signOut();

      }

    } catch (e) {

      error(
        "Logout error:",
        e
      );

    }


    localStorage.removeItem(
      "judoLoggedIn"
    );


    window.location.href =
      "index.html";

  }


  /* =======================================================
     GLOBAL LOGOUT
  ======================================================= */

  window.coachLogout =
    logout;


  /* =======================================================
     START
  ======================================================= */

  async function start() {

    log(
      "================================="
    );

    log(
      "JUDO TABIAT COACH PANEL START"
    );

    log(
      "Version: 2026.08.30"
    );

    log(
      "================================="
    );


    /*
     * ساخت Supabase
     */

    const clientReady =
      await createSupabaseClient();


    if (!clientReady) {

      error(
        "Supabase client could not be created."
      );

      /*
       * عمداً هیچ alert قدیمی نشان نمی‌دهیم.
       */

      return;

    }


    /*
     * تست واقعی سرور
     */

    const connected =
      await testConnection();


    if (!connected) {

      error(
        "Supabase server is NOT reachable."
      );

      /*
       * عمداً پیام «اتصال به Supabase برقرار نیست»
       * نشان داده نمی‌شود.
       *
       * خطای واقعی فقط در Console دیده می‌شود.
       */

    } else {

      log(
        "✅ SUPABASE CONNECTION OK"
      );

    }


    /*
     * Session
     */

    const session =
      await getSession();


    if (session) {

      log(
        "Current user:",
        session.user?.email
      );

    } else {

      log(
        "No active authentication session."
      );

    }


    /*
     * Auth listener
     */

    listenAuth();


    /*
     * UI
     */

    setupNavigation();

    setupEventTabs();

    setupModals();


    /*
     * Dashboard
     */

    await loadDashboard();


    /*
     * تست جدول ورزشکاران
     */

    await testAthletesTable();


    log(
      "================================="
    );

    log(
      "COACH PANEL READY"
    );

    log(
      "================================="
    );

  }


  /* =======================================================
     DOM READY
  ======================================================= */

  if (
    document.readyState === "loading"
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
