// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================
// ELEMENTS
// ======================================

const modal =
  document.getElementById("loginModal");

const loginBtn =
  document.getElementById("loginBtn");

const closeModal =
  document.getElementById("closeModal");

const loginSubmit =
  document.getElementById("loginSubmit");

const username =
  document.getElementById("username");

const password =
  document.getElementById("password");


// ======================================
// LOGIN MODAL
// ======================================

function openLogin() {

  if (!modal) return;

  modal.classList.remove("hidden");

  if (username) {
    username.focus();
  }
}


function closeLogin() {

  if (!modal) return;

  modal.classList.add("hidden");
}


if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    openLogin
  );

}


if (closeModal) {

  closeModal.addEventListener(
    "click",
    closeLogin
  );

}


if (modal) {

  modal.addEventListener(
    "click",
    event => {

      if (event.target === modal) {
        closeLogin();
      }

    }
  );

}


// ======================================
// ENTER KEY
// ======================================

if (username) {

  username.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        loginCoachOrAthlete();
      }

    }
  );

}


if (password) {

  password.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        loginCoachOrAthlete();
      }

    }
  );

}


// ======================================
// LOGIN
// ======================================

async function loginCoachOrAthlete() {

  if (!username || !password || !loginSubmit) {
    return;
  }


  const loginValue =
    username.value.trim();

  const pass =
    password.value;


  if (!loginValue || !pass) {

    alert(
      "نام کاربری و رمز عبور را وارد کنید."
    );

    return;
  }


  loginSubmit.disabled = true;

  loginSubmit.textContent =
    "در حال ورود...";


  try {

    // ==================================
    // COACH LOGIN
    // ==================================

    /*
      مربی با ایمیل Supabase وارد می‌شود.
    */

    if (
      loginValue.toLowerCase() ===
      "coach.judotabiat@gmail.com"
    ) {

      const {
        data,
        error
      } =
        await supabaseClient.auth
          .signInWithPassword({

            email:
              loginValue,

            password:
              pass

          });


      if (error) {

        console.error(
          "Coach login error:",
          error
        );

        alert(
          "ایمیل یا رمز عبور مربی اشتباه است."
        );

        return;
      }


      if (!data.session) {

        alert(
          "ورود انجام نشد. دوباره تلاش کنید."
        );

        return;
      }


      /*
        ورود موفق مربی
      */

      window.location.href =
        "coach.html";

      return;
    }


    // ==================================
    // ATHLETE LOGIN
    // ==================================

    /*
      ورود ورزشکار در مرحله بعد
      به سیستم احراز هویت امن
      Supabase متصل می‌شود.
    */

    alert(
      "ورود ورزشکار هنوز در حال اتصال به سیستم حساب‌های ورزشکاران است."
    );


  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    alert(
      "خطایی هنگام ورود رخ داد. دوباره تلاش کنید."
    );


  } finally {

    loginSubmit.disabled = false;

    loginSubmit.textContent =
      "ورود";

  }

}


// ======================================
// LOGIN BUTTON
// ======================================

if (loginSubmit) {

  loginSubmit.addEventListener(
    "click",
    loginCoachOrAthlete
  );

}


// ======================================
// SESSION CHECK
// ======================================

async function checkExistingSession() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();


    if (error) {

      console.error(
        "Session error:",
        error
      );

      return;
    }


    if (
      data &&
      data.session &&
      data.session.user
    ) {

      const email =
        data.session.user.email
          ?.toLowerCase();


      if (
        email ===
        "coach.judotabiat@gmail.com"
      ) {

        /*
          اگر مربی قبلاً وارد شده،
          دوباره فرم ورود لازم نیست.
        */

        // فعلاً ریدایرکت نمی‌کنیم
        // تا صفحه اصلی قابل مشاهده باشد.
      }

    }

  } catch (error) {

    console.error(
      "Session check error:",
      error
    );

  }

}


// ======================================
// START
// ======================================

checkExistingSession();
