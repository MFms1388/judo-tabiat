/* =========================================================
   JUDO TABIAT
   app.js
   MAIN SITE + COACH LOGIN
   FINAL FIXED
   2026
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";

  let supabaseClient = null;

  /* =======================================================
     CREATE SUPABASE CLIENT
  ======================================================= */

  function initSupabase() {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {

      console.error(
        "Supabase JS library is not loaded."
      );

      return false;
    }

    try {

      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true
            }
          }
        );

      /*
        در اختیار سایر فایل‌ها
      */

      window.supabaseClient =
        supabaseClient;

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
     DOM HELPERS
  ======================================================= */

  const $ = id =>
    document.getElementById(id);

  const $$ = selector =>
    document.querySelectorAll(selector);

  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(
    message,
    type = "error"
  ) {

    let box =
      $("appMessage");

    if (!box) {

      box =
        document.createElement(
          "div"
        );

      box.id =
        "appMessage";

      box.style.position =
        "fixed";

      box.style.top =
        "20px";

      box.style.left =
        "50%";

      box.style.transform =
        "translateX(-50%)";

      box.style.zIndex =
        "999999";

      box.style.padding =
        "14px 20px";

      box.style.borderRadius =
        "14px";

      box.style.fontFamily =
        "inherit";

      box.style.fontWeight =
        "800";

      box.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.15)";

      box.style.maxWidth =
        "90%";

      box.style.textAlign =
        "center";

      document.body.appendChild(
        box
      );
    }

    box.textContent =
      message;

    box.style.background =
      type === "success"
        ? "#e8f7ee"
        : "#fff0f0";

    box.style.color =
      type === "success"
        ? "#16733b"
        : "#b42318";

    box.style.border =
      type === "success"
        ? "1px solid #a7dfbd"
        : "1px solid #f3b5b5";

    box.style.display =
      "block";

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
     PERSIAN NUMBERS
  ======================================================= */

  function faNumber(value) {

    return String(
      value ?? ""
    )
      .replace(/0/g, "۰")
      .replace(/1/g, "۱")
      .replace(/2/g, "۲")
      .replace(/3/g, "۳")
      .replace(/4/g, "۴")
      .replace(/5/g, "۵")
      .replace(/6/g, "۶")
      .replace(/7/g, "۷")
      .replace(/8/g, "۸")
      .replace(/9/g, "۹");
  }

  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  function escapeHTML(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     ATHLETE NAME
  ======================================================= */

  function getAthleteName(
    athlete
  ) {

    if (!athlete) {
      return "ورزشکار";
    }

    const fullName =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (fullName) {
      return fullName;
    }

    return (
      athlete.name ||
      athlete.full_name ||
      "ورزشکار"
    );
  }

  /* =======================================================
     STATE
  ======================================================= */

  const state = {

    athletes: [],

    loadingAthletes:
      false,

    loggedIn:
      false,

    session:
      null

  };

  /* =======================================================
     LOGIN MODAL
  ======================================================= */

  function createLoginModal() {

    if ($("coachLoginModal")) {
      return;
    }

    const modal =
      document.createElement(
        "div"
      );

    modal.id =
      "coachLoginModal";

    modal.innerHTML = `

      <div class="coach-login-overlay">

        <div class="coach-login-box">

          <button
            type="button"
            class="coach-login-close"
            id="closeCoachLogin"
            aria-label="بستن"
          >
            ×
          </button>

          <div class="coach-login-icon">
            🥋
          </div>

          <div class="coach-login-brand">
            جودو طبیعت
          </div>

          <h2>
            ورود مربی
          </h2>

          <p>
            ورود به پنل مدیریت باشگاه
          </p>

          <form
            id="coachLoginForm"
            autocomplete="on"
          >

            <div class="coach-login-field">

              <label
                for="coachEmail"
              >
                ایمیل مربی
              </label>

              <input
                type="email"
                id="coachEmail"
                name="email"
                placeholder="example@email.com"
                autocomplete="username"
                required
              >

            </div>

            <div class="coach-login-field">

              <label
                for="coachPassword"
              >
                رمز عبور
              </label>

              <div class="password-wrap">

                <input
                  type="password"
                  id="coachPassword"
                  name="password"
                  placeholder="رمز عبور"
                  autocomplete="current-password"
                  required
                >

                <button
                  type="button"
                  id="toggleCoachPassword"
                  class="password-toggle"
                >
                  👁️
                </button>

              </div>

            </div>

            <div
              id="coachLoginError"
              class="coach-login-error"
              style="display:none"
            ></div>

            <button
              type="submit"
              id="coachLoginSubmit"
              class="coach-login-submit"
            >
              <span>
                🔐 ورود به سامانه
              </span>
            </button>

          </form>

          <div class="coach-login-footer">
            <span>طبیعت جودو</span>
            <span>•</span>
            <span>سامانه عملکرد ورزشکاران</span>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    bindLoginModal();
  }

  /* =======================================================
     OPEN LOGIN
  ======================================================= */

  function openCoachLogin() {

    createLoginModal();

    const modal =
      $("coachLoginModal");

    if (!modal) {
      return;
    }

    modal.classList.add(
      "active"
    );

    document.body.classList.add(
      "login-open"
    );

    setTimeout(() => {

      $("coachEmail")
        ?.focus();

    }, 100);
  }

  /* =======================================================
     CLOSE LOGIN
  ======================================================= */

  function closeCoachLogin() {

    const modal =
      $("coachLoginModal");

    if (!modal) {
      return;
    }

    modal.classList.remove(
      "active"
    );

    document.body.classList.remove(
      "login-open"
    );
  }

  /* =======================================================
     LOGIN ERROR
  ======================================================= */

  function showLoginError(
    message
  ) {

    const box =
      $("coachLoginError");

    if (!box) {
      return;
    }

    box.textContent =
      message;

    box.style.display =
      "block";
  }

  /* =======================================================
     LOGIN SUBMIT
  ======================================================= */

  async function loginCoach(
    event
  ) {

    event.preventDefault();

    if (!supabaseClient) {

      showLoginError(
        "اتصال به Supabase برقرار نیست."
      );

      return;
    }

    const email =
      (
        $("coachEmail")
          ?.value || ""
      )
        .trim();

    const password =
      $("coachPassword")
        ?.value || "";

    if (!email) {

      showLoginError(
        "ایمیل مربی را وارد کنید."
      );

      return;
    }

    if (!password) {

      showLoginError(
        "رمز عبور را وارد کنید."
      );

      return;
    }

    const button =
      $("coachLoginSubmit");

    const originalHTML =
      button
        ?.innerHTML ||
      "";

    if (button) {

      button.disabled =
        true;

      button.innerHTML =
        "⏳ در حال ورود...";
    }

    const errorBox =
      $("coachLoginError");

    if (errorBox) {
      errorBox.style.display =
        "none";
    }

    try {

      /*
        ورود واقعی با Supabase Auth
      */

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .signInWithPassword({

            email,

            password

          });

      if (error) {

        console.error(
          "Coach login:",
          error
        );

        showLoginError(
          getLoginErrorMessage(
            error
          )
        );

        return;
      }

      if (
        !data ||
        !data.session
      ) {

        showLoginError(
          "ورود انجام نشد. جلسه کاربری دریافت نشد."
        );

        return;
      }

      state.loggedIn =
        true;

      state.session =
        data.session;

      /*
        ذخیره وضعیت کمکی
      */

      localStorage.setItem(
        "judoLoggedIn",
        "true"
      );

      localStorage.setItem(
        "judoLoginTime",
        String(
          Date.now()
        )
      );

      /*
        بستن پنجره
      */

      closeCoachLogin();

      showMessage(
        "ورود با موفقیت انجام شد. در حال انتقال به پنل مربی...",
        "success"
      );

      /*
        انتقال به پنل مربی
      */

      setTimeout(() => {

        window.location.href =
          "coach.html";

      }, 500);

    } catch (error) {

      console.error(
        "Login exception:",
        error
      );

      showLoginError(
        "خطایی هنگام ورود رخ داد. دوباره تلاش کنید."
      );

    } finally {

      if (button) {

        button.disabled =
          false;

        button.innerHTML =
          originalHTML;
      }
    }
  }

  /* =======================================================
     LOGIN ERROR TRANSLATION
  ======================================================= */

  function getLoginErrorMessage(
    error
  ) {

    const message =
      String(
        error?.message ||
        ""
      ).toLowerCase();

    if (
      message.includes(
        "invalid login credentials"
      )
    ) {

      return (
        "ایمیل یا رمز عبور اشتباه است."
      );
    }

    if (
      message.includes(
        "email not confirmed"
      )
    ) {

      return (
        "ایمیل حساب مربی هنوز تأیید نشده است."
      );
    }

    if (
      message.includes(
        "too many requests"
      )
    ) {

      return (
        "تعداد تلاش‌ها زیاد شده است. کمی بعد دوباره امتحان کنید."
      );
    }

    if (
      message.includes(
        "network"
      )
    ) {

      return (
        "اتصال اینترنت را بررسی کنید."
      );
    }

    return (
      error?.message ||
      "ورود انجام نشد."
    );
  }

  /* =======================================================
     BIND LOGIN MODAL
  ======================================================= */

  function bindLoginModal() {

    $("coachLoginForm")
      ?.addEventListener(
        "submit",
        loginCoach
      );

    $("closeCoachLogin")
      ?.addEventListener(
        "click",
        closeCoachLogin
      );

    $("toggleCoachPassword")
      ?.addEventListener(
        "click",
        () => {

          const input =
            $("coachPassword");

          const button =
            $("toggleCoachPassword");

          if (!input) {
            return;
          }

          if (
            input.type ===
            "password"
          ) {

            input.type =
              "text";

            if (button) {
              button.textContent =
                "🙈";
            }

          } else {

            input.type =
              "password";

            if (button) {
              button.textContent =
                "👁️";
            }
          }
        }
      );

    $("coachLoginModal")
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.classList
              .contains(
                "coach-login-overlay"
              )
          ) {

            closeCoachLogin();

          }

        }
      );

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          closeCoachLogin();

        }

      }
    );
  }

  /* =======================================================
     AUTH SESSION
  ======================================================= */

  async function checkAuthSession() {

    if (!supabaseClient) {
      return null;
    }

    try {

      const result =
        await supabaseClient
          .auth
          .getSession();

      if (
        result.error
      ) {

        console.error(
          "Get session:",
          result.error
        );

        return null;
      }

      const session =
        result.data?.session ||
        null;

      state.session =
        session;

      state.loggedIn =
        Boolean(
          session
        );

      return session;

    } catch (error) {

      console.error(
        "Session error:",
        error
      );

      return null;
    }
  }

  /* =======================================================
     AUTH STATE LISTENER
  ======================================================= */

  function setupAuthListener() {

    if (!supabaseClient) {
      return;
    }

    supabaseClient
      .auth
      .onAuthStateChange(
        (
          event,
          session
        ) => {

          state.session =
            session;

          state.loggedIn =
            Boolean(
              session
            );

          if (
            event ===
            "SIGNED_IN"
          ) {

            localStorage.setItem(
              "judoLoggedIn",
              "true"
            );

            localStorage.setItem(
              "judoLoginTime",
              String(
                Date.now()
              )
            );
          }

          if (
            event ===
            "SIGNED_OUT"
          ) {

            localStorage.removeItem(
              "judoLoggedIn"
            );

            localStorage.removeItem(
              "judoLoginTime"
            );
          }

        }
      );
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logoutCoach() {

    if (!supabaseClient) {
      return;
    }

    try {

      await supabaseClient
        .auth
        .signOut();

    } catch (error) {

      console.error(
        "Logout:",
        error
      );
    }

    localStorage.removeItem(
      "judoLoggedIn"
    );

    localStorage.removeItem(
      "judoLoginTime"
    );

    window.location.href =
      "index.html";
  }

  /* =======================================================
     LOAD ATHLETES
  ======================================================= */

  async function loadAthletes() {

    if (!supabaseClient) {

      renderAthletes();

      return;
    }

    state.loadingAthletes =
      true;

    renderAthletesLoading();

    try {

      const result =
        await supabaseClient
          .from(
            "athletes"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false
            }
          );

      if (
        result.error
      ) {

        console.error(
          "Load athletes:",
          result.error
        );

        state.athletes =
          [];

      } else {

        state.athletes =
          Array.isArray(
            result.data
          )
            ? result.data
            : [];
      }

    } catch (error) {

      console.error(
        "Athletes exception:",
        error
      );

      state.athletes =
        [];

    } finally {

      state.loadingAthletes =
        false;

      renderAthletes();
    }
  }

  /* =======================================================
     ATHLETE LOADING UI
  ======================================================= */

  function renderAthletesLoading() {

    const container =
      $("athletesList");

    if (!container) {
      return;
    }

    container.innerHTML = `

      <div class="athletes-loading">

        <div class="loading-spinner">
          ⏳
        </div>

        <p>
          در حال دریافت ورزشکاران...
        </p>

      </div>

    `;
  }

  /* =======================================================
     ATHLETE RENDER
  ======================================================= */

  function renderAthletes() {

    const container =
      $("athletesList");

    const empty =
      $("athletesEmpty");

    if (!container) {
      return;
    }

    /*
      اگر ورزشکار وجود ندارد
    */

    if (
      !state.athletes.length
    ) {

      container.innerHTML = "";

      if (empty) {

        empty.style.display =
          "block";
      }

      updateAthleteCount(
        0
      );

      return;
    }

    /*
      اگر ورزشکار وجود دارد،
      پیام خالی باید مخفی شود.
    */

    if (empty) {

      empty.style.display =
        "none";
    }

    container.innerHTML =
      state.athletes
        .map(
          athlete =>
            createAthleteCard(
              athlete
            )
        )
        .join("");

    updateAthleteCount(
      state.athletes.length
    );

    setupAthleteSearch();
  }

  /* =======================================================
     ATHLETE CARD
  ======================================================= */

  function createAthleteCard(
    athlete
  ) {

    const name =
      getAthleteName(
        athlete
      );

    const ageGroup =
      athlete.age_group ||
      athlete.category ||
      "نامشخص";

    const weight =
      athlete.weight !==
        null &&
      athlete.weight !==
        undefined &&
      athlete.weight !== ""
        ? `${escapeHTML(
            athlete.weight
          )} کیلوگرم`
        : "ثبت نشده";

    const belt =
      athlete.belt ||
      "";

    return `

      <article
        class="athlete-card"
        data-athlete-id="${escapeHTML(
          athlete.id
        )}"
        data-age-group="${escapeHTML(
          ageGroup
        )}"
      >

        <div class="athlete-card-icon">
          🥋
        </div>

        <div class="athlete-card-body">

          <h3>
            ${escapeHTML(
              name
            )}
          </h3>

          <div class="athlete-card-club">
            🥋 جودو طبیعت
          </div>

          <div class="athlete-card-meta">

            <span>
              👤 رده:
              ${escapeHTML(
                ageGroup
              )}
            </span>

            <span>
              ⚖️ وزن:
              ${weight}
            </span>

            ${
              belt
                ? `
                  <span>
                    🎗️ کمربند:
                    ${escapeHTML(
                      belt
                    )}
                  </span>
                `
                : ""
            }

          </div>

          <button
            type="button"
            class="athlete-profile-btn"
            data-view-athlete="${escapeHTML(
              athlete.id
            )}"
          >
            مشاهده پروفایل
          </button>

        </div>

      </article>

    `;
  }

  /* =======================================================
     ATHLETE COUNT
  ======================================================= */

  function updateAthleteCount(
    count
  ) {

    const elements =
      $$("[data-athlete-count]");

    elements.forEach(
      element => {

        element.textContent =
          faNumber(
            count
          );

      }
    );
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  function setupAthleteSearch() {

    const search =
      $("athleteSearch");

    if (!search) {
      return;
    }

    if (
      search.dataset.bound ===
      "true"
    ) {
      return;
    }

    search.dataset.bound =
      "true";

    search.addEventListener(
      "input",
      filterAthletes
    );
  }

  function filterAthletes() {

    const search =
      (
        $("athleteSearch")
          ?.value || ""
      )
        .trim()
        .toLowerCase();

    const category =
      (
        $("athleteCategoryFilter")
          ?.value || ""
      )
        .trim();

    const cards =
      $$("[data-athlete-id]");

    cards.forEach(
      card => {

        const athleteId =
          card.dataset
            .athleteId;

        const athlete =
          state.athletes.find(
            item =>
              String(
                item.id
              ) ===
              String(
                athleteId
              )
          );

        if (!athlete) {
          return;
        }

        const name =
          getAthleteName(
            athlete
          )
            .toLowerCase();

        const ageGroup =
          String(
            athlete.age_group ||
            athlete.category ||
            ""
          );

        const matchesSearch =
          !search ||
          name.includes(
            search
          ) ||
          ageGroup
            .toLowerCase()
            .includes(
              search
            );

        const matchesCategory =
          !category ||
          category === "all" ||
          ageGroup ===
            category;

        card.style.display =
          matchesSearch &&
          matchesCategory
            ? ""
            : "none";
      }
    );
  }

  /* =======================================================
     CATEGORY FILTER
  ======================================================= */

  function setupCategoryFilter() {

    const select =
      $("athleteCategoryFilter");

    if (!select) {
      return;
    }

    if (
      select.dataset.bound ===
      "true"
    ) {
      return;
    }

    select.dataset.bound =
      "true";

    select.addEventListener(
      "change",
      filterAthletes
    );

    const categories =
      [
        ...new Set(
          state.athletes
            .map(
              athlete =>
                athlete.age_group ||
                athlete.category
            )
            .filter(Boolean)
        )
      ];

    const current =
      select.value;

    select.innerHTML = `
      <option value="all">
        همه رده‌ها
      </option>
    `;

    categories.forEach(
      category => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          category;

        option.textContent =
          category;

        select.appendChild(
          option
        );
      }
    );

    if (
      current &&
      [
        ...select.options
      ].some(
        option =>
          option.value ===
          current
      )
    ) {

      select.value =
        current;
    }
  }

  /* =======================================================
     PROFILE BUTTON
  ======================================================= */

  function setupAthleteProfileButtons() {

    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-view-athlete]"
          );

        if (!button) {
          return;
        }

        const athleteId =
          button.dataset
            .viewAthlete;

        openAthleteProfile(
          athleteId
        );
      }
    );
  }

  /* =======================================================
     ATHLETE PROFILE
  ======================================================= */

  function openAthleteProfile(
    athleteId
  ) {

    const athlete =
      state.athletes.find(
        item =>
          String(
            item.id
          ) ===
          String(
            athleteId
          )
      );

    if (!athlete) {

      showMessage(
        "اطلاعات ورزشکار پیدا نشد."
      );

      return;
    }

    /*
      اگر صفحه پروفایل اختصاصی
      ساخته شده باشد.
    */

    const url =
      `athlete.html?id=${encodeURIComponent(
        athlete.id
      )}`;

    window.location.href =
      url;
  }

  /* =======================================================
     COACH LOGIN BUTTONS
  ======================================================= */

  function setupCoachLoginButtons() {

    const buttons =
      $$(
        "#coachLoginBtn, " +
        "[data-coach-login], " +
        ".coach-login-btn"
      );

    buttons.forEach(
      button => {

        if (
          button.dataset
            .loginBound ===
          "true"
        ) {
          return;
        }

        button.dataset
          .loginBound =
          "true";

        button.addEventListener(
          "click",
          event => {

            event.preventDefault();

            openCoachLogin();

          }
        );
      }
    );
  }

  /* =======================================================
     INIT
  ======================================================= */

  async function init() {

    /*
      Supabase
    */

    initSupabase();

    /*
      Modal login
    */

    createLoginModal();

    /*
      Buttons
    */

    setupCoachLoginButtons();

    /*
      Profile buttons
    */

    setupAthleteProfileButtons();

    /*
      Search
    */

    setupAthleteSearch();

    /*
      Session
    */

    await checkAuthSession();

    setupAuthListener();

    /*
      Athletes
    */

    await loadAthletes();

    /*
      Category filter
    */

    setupCategoryFilter();

    filterAthletes();
  }

  /* =======================================================
     GLOBAL API
  ======================================================= */

  window.JudoTabiatApp = {

    openCoachLogin,

    closeCoachLogin,

    loginCoach,

    logoutCoach,

    loadAthletes,

    getAthletes:
      () =>
        [
          ...state.athletes
        ],

    getSession:
      () =>
        state.session,

    isLoggedIn:
      () =>
        state.loggedIn,

    supabase:
      () =>
        supabaseClient
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
      init
    );

  } else {

    init();

  }

})();
