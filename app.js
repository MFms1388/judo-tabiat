/* =========================================================
   JUDO TABIAT - APP.JS
   SUPABASE + LOGIN
========================================================= */

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

    if (!window.supabase) {

      console.error(
        "❌ window.supabase وجود ندارد."
      );

      return false;
    }


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
      "❌ خطا هنگام ساخت Supabase Client:",
      error
    );

    return false;
  }

}


/* =========================================================
   SUPABASE CONNECTION TEST
========================================================= */

async function testSupabaseConnection() {

  console.log(
    "🔎 در حال بررسی اتصال به Supabase..."
  );


  if (!supabaseClient) {

    console.error(
      "❌ Supabase Client ساخته نشده است."
    );

    return false;
  }


  try {

    /*
      فقط برای تست ارتباط.
      اگر جدول Athletes مشکل داشته باشد،
      خطای جدول را جداگانه نمایش می‌دهیم.
    */

    const result =
      await supabaseClient
        .from("Athletes")
        .select("id")
        .limit(1);


    console.log(
      "📡 نتیجه تست Supabase:",
      result
    );


    if (result.error) {

      console.error(
        "❌ Supabase پاسخ خطا داد:",
        result.error
      );


      /*
        خطاهای احتمالی را واضح‌تر می‌کنیم.
      */

      if (
        result.error.code === "42P01"
      ) {

        console.error(
          "❌ جدول Athletes در دیتابیس پیدا نشد."
        );

      }


      if (
        result.error.code === "PGRST116"
      ) {

        console.error(
          "⚠️ مشکل مربوط به نتیجه یا ساختار جدول است."
        );

      }


      return false;
    }


    console.log(
      "✅ اتصال به Supabase کاملاً برقرار است."
    );


    console.log(
      "📊 داده تست:",
      result.data
    );


    return true;

  } catch (error) {

    console.error(
      "❌ Exception در تست Supabase:",
      error
    );

    return false;

  }

}


/* =========================================================
   LOGIN MODAL
========================================================= */

function setupLogin() {

  const loginBtn =
    document.getElementById("loginBtn");


  const loginModal =
    document.getElementById("loginModal");


  const closeModal =
    document.getElementById("closeModal");


  const loginSubmit =
    document.getElementById("loginSubmit");


  const usernameInput =
    document.getElementById("username");


  const passwordInput =
    document.getElementById("password");


  /* =======================================================
     OPEN MODAL
  ======================================================== */

  if (
    loginBtn &&
    loginModal
  ) {

    loginBtn.addEventListener(
      "click",
      function () {

        loginModal.classList.remove(
          "hidden"
        );


        if (usernameInput) {

          usernameInput.focus();

        }

      }
    );

  }


  /* =======================================================
     CLOSE MODAL
  ======================================================== */

  if (
    closeModal &&
    loginModal
  ) {

    closeModal.addEventListener(
      "click",
      function () {

        loginModal.classList.add(
          "hidden"
        );

      }
    );

  }


  /* =======================================================
     CLOSE OUTSIDE
  ======================================================== */

  if (loginModal) {

    loginModal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === loginModal
        ) {

          loginModal.classList.add(
            "hidden"
          );

        }

      }
    );

  }


  /* =======================================================
     LOGIN
  ======================================================== */

  if (loginSubmit) {

    loginSubmit.addEventListener(
      "click",
      async function () {

        const username =
          usernameInput?.value.trim();


        const password =
          passwordInput?.value;


        /* -----------------------------------------------
           INPUT
        ------------------------------------------------ */

        if (!username) {

          alert(
            "لطفاً نام کاربری را وارد کنید."
          );

          usernameInput?.focus();

          return;

        }


        if (!password) {

          alert(
            "لطفاً رمز عبور را وارد کنید."
          );

          passwordInput?.focus();

          return;

        }


        /* -----------------------------------------------
           SUPABASE
        ------------------------------------------------ */

        if (!supabaseClient) {

          alert(
            "Supabase Client ساخته نشده است."
          );

          console.error(
            "❌ supabaseClient = null"
          );

          return;

        }


        /* -----------------------------------------------
           LOADING
        ------------------------------------------------ */

        const oldText =
          loginSubmit.innerHTML;


        loginSubmit.disabled = true;


        loginSubmit.innerHTML =
          "⏳ در حال ورود...";


        try {

          console.log(
            "🔐 تلاش برای ورود:",
            username
          );


          /* ---------------------------------------------
             AUTH
          ---------------------------------------------- */

          const {
            data,
            error
          } =
            await supabaseClient
              .auth
              .signInWithPassword({

                email: username,

                password: password

              });


          /* ---------------------------------------------
             ERROR
          ---------------------------------------------- */

          if (error) {

            console.error(
              "❌ Login Error:",
              error
            );


            alert(
              "ورود ناموفق بود.\n\n" +
              error.message
            );


            return;

          }


          /* ---------------------------------------------
             SUCCESS
          ---------------------------------------------- */

          if (
            data &&
            data.session
          ) {

            console.log(
              "✅ ورود موفق بود.",
              data.user
            );


            localStorage.setItem(
              "judoLoggedIn",
              "true"
            );


            localStorage.setItem(
              "judoUserId",
              data.user.id
            );


            window.location.href =
              "coach.html";


          } else {

            alert(
              "ورود انجام نشد. دوباره تلاش کنید."
            );

          }


        } catch (error) {

          console.error(
            "❌ Login Exception:",
            error
          );


          alert(
            "خطایی هنگام ورود رخ داد.\n\n" +
            error.message
          );


        } finally {

          loginSubmit.disabled =
            false;


          loginSubmit.innerHTML =
            oldText;

        }

      }
    );

  }


  /* =======================================================
     ENTER
  ======================================================== */

  if (passwordInput) {

    passwordInput.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter"
        ) {

          loginSubmit?.click();

        }

      }
    );

  }

}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    console.log(
      "🚀 Judo Tabiat App شروع شد."
    );


    /* -----------------------------------------------
       CREATE CLIENT
    ------------------------------------------------ */

    const clientCreated =
      createSupabaseClient();


    if (!clientCreated) {

      console.error(
        "❌ ساخت Supabase Client شکست خورد."
      );

      return;

    }


    /* -----------------------------------------------
       LOGIN
    ------------------------------------------------ */

    setupLogin();


    /* -----------------------------------------------
       CONNECTION TEST
    ------------------------------------------------ */

    const connected =
      await testSupabaseConnection();


    if (connected) {

      console.log(
        "🟢 وضعیت Supabase: ONLINE"
      );

    } else {

      console.error(
        "🔴 وضعیت Supabase: ERROR"
      );

    }

  }
);


/* =========================================================
   GLOBAL
========================================================= */

window.testSupabaseConnection =
  testSupabaseConnection;


window.createSupabaseClient =
  createSupabaseClient;
