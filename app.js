/* =========================================================
   JUDO TABIAT - PUBLIC HOME
   app.js

   صفحه اصلی:
   فقط ورود به سامانه

   توجه:
   بخش ورزشکاران در این فایل نمایش داده نمی‌شود.
   ========================================================= */

(() => {

  "use strict";


  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  /*
     کلید عمومی پروژه را اگر قبلاً در پروژه
     تعریف کرده‌ای از window.SUPABASE_KEY می‌خوانیم.

     هرگز service_role / secret key را اینجا قرار نده.
  */

  const SUPABASE_KEY =
    window.SUPABASE_KEY || "";


  let supabaseClient = null;


  if (
    window.supabase &&
    typeof window.supabase.createClient ===
      "function" &&
    SUPABASE_KEY
  ) {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

  }


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = id =>
    document.getElementById(id);


  function showModal() {

    const modal =
      $("loginModal");

    if (!modal) {
      return;
    }

    modal.classList.remove(
      "hidden"
    );

  }


  function hideModal() {

    const modal =
      $("loginModal");

    if (!modal) {
      return;
    }

    modal.classList.add(
      "hidden"
    );

  }


  /* =======================================================
     LOGIN
  ======================================================= */

  function setupLogin() {

    const loginBtn =
      $("loginBtn");

    const closeModal =
      $("closeModal");

    const loginSubmit =
      $("loginSubmit");


    /* -----------------------------------------------
       OPEN LOGIN
    ----------------------------------------------- */

    if (loginBtn) {

      loginBtn.addEventListener(
        "click",
        () => {

          showModal();

          const username =
            $("username");

          if (username) {

            setTimeout(
              () => {
                username.focus();
              },
              100
            );

          }

        }
      );

    }


    /* -----------------------------------------------
       CLOSE LOGIN
    ----------------------------------------------- */

    if (closeModal) {

      closeModal.addEventListener(
        "click",
        hideModal
      );

    }


    /* -----------------------------------------------
       CLICK OUTSIDE
    ----------------------------------------------- */

    const modal =
      $("loginModal");

    if (modal) {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {

            hideModal();

          }

        }
      );

    }


    /* -----------------------------------------------
       ESC
    ----------------------------------------------- */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          hideModal();

        }

      }
    );


    /* -----------------------------------------------
       LOGIN SUBMIT
    ----------------------------------------------- */

    if (loginSubmit) {

      loginSubmit.addEventListener(
        "click",
        handleLogin
      );

    }


    /* -----------------------------------------------
       ENTER KEY
    ----------------------------------------------- */

    const password =
      $("password");

    if (password) {

      password.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            handleLogin();

          }

        }
      );

    }

  }


  /* =======================================================
     HANDLE LOGIN
  ======================================================= */

  async function handleLogin() {

    const username =
      (
        $("username")
          ?.value || ""
      ).trim();


    const password =
      (
        $("password")
          ?.value || ""
      ).trim();


    if (!username) {

      alert(
        "لطفاً نام کاربری را وارد کنید."
      );

      $("username")
        ?.focus();

      return;

    }


    if (!password) {

      alert(
        "لطفاً رمز عبور را وارد کنید."
      );

      $("password")
        ?.focus();

      return;

    }


    /*
       -----------------------------------------------------
       فعلاً منطق احراز هویت اصلی سامانه را تغییر نمی‌دهیم.
       این قسمت فقط نقطه ورود است.

       اگر منطق ورود قبلی پروژه شما در فایل دیگری
       قرار داشته باشد، باید همان منطق را اینجا متصل کنیم.
       -----------------------------------------------------
    */


    if (!supabaseClient) {

      alert(
        "اتصال سامانه برقرار نیست. لطفاً کلید عمومی Supabase را بررسی کنید."
      );

      return;

    }


    /*
       -----------------------------------------------------
       در این مرحله اطلاعات ورود را به صورت آزمایشی
       بررسی نمی‌کنیم تا منطق قبلی احراز هویت شما
       خراب نشود.

       این بخش عمداً بدون تغییر مسیر خودکار است.
       -----------------------------------------------------
    */

    console.log(
      "Login requested:",
      username
    );


    /*
       -----------------------------------------------------
       اگر سیستم ورود فعلی شما در app.js قبلی
       منطق خاصی داشته، آن منطق باید اینجا قرار بگیرد.
       -----------------------------------------------------
    */

  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  function init() {

    /*
       مهم:
       هیچ athlete container،
       هیچ search،
       هیچ ranking،
       و هیچ athlete card
       در صفحه اصلی ایجاد نمی‌کنیم.
    */

    setupLogin();

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
      init
    );

  } else {

    init();

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.JudoTabiatApp = {

    openLogin:
      showModal,

    closeLogin:
      hideModal

  };


  /* =======================================================
     END
  ======================================================= */

})();
