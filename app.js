// ======================================
// JUDO TABIAT
// app.js
// نسخه کامل و اصلاح‌شده
// ======================================

"use strict";


// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


// ======================================
// CREATE SUPABASE CLIENT
// ======================================

let supabaseClient = null;

try {

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {

    throw new Error(
      "کتابخانه Supabase بارگذاری نشده است."
    );

  }


  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  // بسیار مهم:
  // coach.js از این متغیر استفاده می‌کند
  window.supabaseClient =
    supabaseClient;


  console.log(
    "✅ Supabase Client ساخته شد."
  );


} catch (error) {

  console.error(
    "❌ خطا در ساخت Supabase Client:",
    error
  );

}


// ======================================
// TEST SUPABASE CONNECTION
// ======================================

async function testSupabaseConnection() {

  if (!window.supabaseClient) {

    console.error(
      "❌ Supabase Client وجود ندارد."
    );

    return false;

  }


  try {

    const {
      data,
      error
    } =
      await window.supabaseClient
        .from("athletes")
        .select("id")
        .limit(1);


    if (error) {

      console.error(
        "❌ خطای Supabase:",
        error
      );

      return false;

    }


    console.log(
      "✅ اتصال به Supabase برقرار است."
    );


    return true;


  } catch (error) {

    console.error(
      "❌ خطای اتصال به Supabase:",
      error
    );


    return false;

  }

}


// ======================================
// LOGIN MODAL
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "🚀 App شروع شد."
    );


    // ==================================
    // ELEMENTS
    // ==================================

    const loginBtn =
      document.getElementById(
        "loginBtn"
      );


    const loginModal =
      document.getElementById(
        "loginModal"
      );


    const closeModal =
      document.getElementById(
        "closeModal"
      );


    const loginSubmit =
      document.getElementById(
        "loginSubmit"
      );


    const usernameInput =
      document.getElementById(
        "username"
      );


    const passwordInput =
      document.getElementById(
        "password"
      );


    // ==================================
    // OPEN LOGIN
    // ==================================

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


          loginModal.style.display =
            "flex";


          if (usernameInput) {

            usernameInput.focus();

          }

        }
      );

    }


    // ==================================
    // CLOSE LOGIN
    // ==================================

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


          loginModal.style.display =
            "none";

        }
      );

    }


    // ==================================
    // CLOSE BY CLICK OUTSIDE
    // ==================================

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


            loginModal.style.display =
              "none";

          }

        }
      );

    }


    // ==================================
    // LOGIN
    // ==================================

    if (loginSubmit) {

      loginSubmit.addEventListener(
        "click",
        async function () {

          const username =
            usernameInput?.value.trim();


          const password =
            passwordInput?.value;


          // ------------------------------
          // CHECK USERNAME
          // ------------------------------

          if (!username) {

            alert(
              "لطفاً نام کاربری را وارد کنید."
            );


            usernameInput?.focus();


            return;

          }


          // ------------------------------
          // CHECK PASSWORD
          // ------------------------------

          if (!password) {

            alert(
              "لطفاً رمز عبور را وارد کنید."
            );


            passwordInput?.focus();


            return;

          }


          // ------------------------------
          // CHECK SUPABASE
          // ------------------------------

          if (!window.supabaseClient) {

            alert(
              "اتصال به Supabase برقرار نیست."
            );


            console.error(
              "❌ window.supabaseClient وجود ندارد."
            );


            return;

          }


          // ------------------------------
          // BUTTON LOADING
          // ------------------------------

          const oldText =
            loginSubmit.innerHTML;


          loginSubmit.disabled =
            true;


          loginSubmit.innerHTML =
            "⏳ در حال ورود...";


          try {

            console.log(
              "🔐 تلاش برای ورود:",
              username
            );


            // ==================================
            // SUPABASE AUTH
            // ==================================

            const {
              data,
              error
            } =
              await window.supabaseClient
                .auth
                .signInWithPassword({

                  email:
                    username,

                  password:
                    password

                });


            // ==================================
            // LOGIN ERROR
            // ==================================

            if (error) {

              console.error(
                "❌ Login Error:",
                error
              );


              alert(
                "ورود ناموفق بود.\n\n" +
                (
                  error.message ||
                  "خطای نامشخص"
                )
              );


              return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            if (
              data &&
              data.session
            ) {

              console.log(
                "✅ ورود موفق بود.",
                data.user
              );


              // ذخیره وضعیت ورود
              localStorage.setItem(
                "judoLoggedIn",
                "true"
              );


              // ذخیره زمان ورود
              localStorage.setItem(
                "judoLoginTime",
                String(Date.now())
              );


              // انتقال به پنل مربی
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
              (
                error.message ||
                error
              )
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


    // ==================================
    // ENTER KEY
    // ==================================

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


    // ==================================
    // TEST CONNECTION
    // ==================================

    testSupabaseConnection();

  }
);


// ======================================
// GLOBAL
// ======================================

window.testSupabaseConnection =
  testSupabaseConnection;


console.log(
  "✅ app.js آماده است."
);
