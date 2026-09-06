/* =========================================================
   JUDO TABIAT
   PUBLIC ATHLETE SITE
   app.js

   FINAL LOGIN + SUPABASE
   ========================================================= */

(() => {

  "use strict";


  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";


  const SUPABASE_KEY =
    window.SUPABASE_KEY || "";


  let supabaseClient = null;


  /*
     ایجاد Client
  */

  if (
    window.supabase &&
    typeof window.supabase.createClient ===
      "function" &&
    SUPABASE_KEY
  ) {

    try {

      supabaseClient =
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

    } catch (error) {

      console.error(
        "Supabase initialization error:",
        error
      );

      supabaseClient = null;

    }

  }


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ =
    id =>
      document.getElementById(id);


  const escapeHTML =
    value => {

      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value)
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

    };


  const normalize =
    value =>
      String(
        value ?? ""
      )
        .trim()
        .toLowerCase();


  function getName(
    athlete
  ) {

    return (
      athlete?.name ||
      athlete?.full_name ||
      athlete?.athlete_name ||
      (
        athlete?.first_name ||
        athlete?.last_name
          ? [
              athlete?.first_name,
              athlete?.last_name
            ]
              .filter(Boolean)
              .join(" ")
          : ""
      ) ||
      "بدون نام"
    );

  }


  /* =======================================================
     LOGIN MESSAGE
  ======================================================= */

  function showLoginMessage(
    message,
    type = "error"
  ) {

    const box =
      $("loginMessage");

    if (!box) return;

    box.textContent =
      message;

    box.classList.remove(
      "hidden"
    );

    box.dataset.type =
      type;

  }


  function hideLoginMessage() {

    const box =
      $("loginMessage");

    if (!box) return;

    box.textContent =
      "";

    box.classList.add(
      "hidden"
    );

  }


  /* =======================================================
     ATHLETE EMPTY STATE
  ======================================================= */

  function showEmpty(
    message,
    description = ""
  ) {

    const empty =
      $("emptyState");

    const grid =
      $("athleteGrid");

    if (
      !empty ||
      !grid
    ) {
      return;
    }


    empty.classList.remove(
      "hidden"
    );

    grid.classList.add(
      "hidden"
    );


    const title =
      empty.querySelector(
        "h3"
      );

    const text =
      empty.querySelector(
        "p"
      );


    if (title) {

      title.textContent =
        message;

    }


    if (text) {

      text.textContent =
        description;

    }

  }


  /* =======================================================
     RENDER ATHLETES
  ======================================================= */

  function renderAthletes(
    athletes
  ) {

    const grid =
      $("athleteGrid");

    const empty =
      $("emptyState");

    if (
      !grid ||
      !empty
    ) {
      return;
    }


    const search =
      normalize(
        $("search")?.value
      );


    const filtered =
      athletes.filter(
        athlete => {

          if (!search) {
            return true;
          }


          return [

            getName(
              athlete
            ),

            athlete.weight,

            athlete.belt,

            athlete.category,

            athlete.age_group

          ]
            .filter(Boolean)
            .map(normalize)
            .join(" ")
            .includes(
              search
            );

        }
      );


    if (
      !filtered.length
    ) {

      grid.innerHTML =
        "";

      showEmpty(
        "ورزشکاری پیدا نشد",
        "برای جستجوی شما نتیجه‌ای وجود ندارد."
      );

      return;

    }


    empty.classList.add(
      "hidden"
    );

    grid.classList.remove(
      "hidden"
    );


    grid.innerHTML =
      filtered
        .map(
          athlete => {

            const name =
              getName(
                athlete
              );


            const category =
              athlete.category ||
              athlete.age_group ||
              "—";


            return `

              <article
                class="athlete-card"
              >

                <div
                  class="athlete-avatar"
                >
                  🥋
                </div>


                <div
                  class="athlete-card-body"
                >

                  <span
                    class="eyebrow"
                  >
                    ATHLETE
                  </span>


                  <h3>
                    ${escapeHTML(
                      name
                    )}
                  </h3>


                  <div
                    class="athlete-meta"
                  >

                    <span>
                      ⚖️ وزن:
                      ${escapeHTML(
                        athlete.weight ||
                        "—"
                      )}
                    </span>


                    <span>
                      🥋 کمربند:
                      ${escapeHTML(
                        athlete.belt ||
                        "—"
                      )}
                    </span>


                    <span>
                      👥 رده:
                      ${escapeHTML(
                        category
                      )}
                    </span>

                  </div>


                  ${
                    athlete.description
                      ? `

                        <p
                          class="athlete-description"
                        >
                          ${escapeHTML(
                            athlete.description
                          )}
                        </p>

                      `
                      : ""
                  }

                </div>

              </article>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     FILTERS
  ======================================================= */

  function populateFilters(
    athletes
  ) {

    const filter =
      $("filter");

    if (!filter) {
      return;
    }


    const currentValue =
      filter.value ||
      "all";


    const values =
      [
        ...new Set(
          athletes
            .map(
              athlete =>
                athlete.category ||
                athlete.age_group
            )
            .filter(Boolean)
        )
      ];


    filter.innerHTML = `

      <option value="all">
        همه رده‌ها
      </option>

      ${values
        .map(
          value => `

            <option
              value="${escapeHTML(
                value
              )}"
            >
              ${escapeHTML(
                value
              )}
            </option>

          `
        )
        .join("")}

    `;


    if (
      values.includes(
        currentValue
      )
    ) {

      filter.value =
        currentValue;

    }

  }


  /* =======================================================
     FILTER ATHLETES
  ======================================================= */

  let cachedAthletes = [];


  function applyFilters() {

    const search =
      normalize(
        $("search")?.value
      );


    const filterValue =
      $("filter")?.value ||
      "all";


    let list =
      [
        ...cachedAthletes
      ];


    /*
       رده
    */

    if (
      filterValue !==
      "all"
    ) {

      list =
        list.filter(
          athlete =>
            String(
              athlete.category ||
              athlete.age_group ||
              ""
            ) ===
            filterValue
        );

    }


    /*
       جستجو
    */

    if (search) {

      list =
        list.filter(
          athlete => {

            const text =
              [

                getName(
                  athlete
                ),

                athlete.weight,

                athlete.belt,

                athlete.category,

                athlete.age_group

              ]
                .filter(Boolean)
                .map(normalize)
                .join(" ");


            return text.includes(
              search
            );

          }
        );

    }


    renderAthletes(
      list
    );

  }


  /* =======================================================
     LOAD ATHLETES
  ======================================================= */

  async function loadAthletes() {

    /*
       اگر Supabase متصل نیست
    */

    if (
      !supabaseClient
    ) {

      console.warn(
        "Supabase client/key is not available."
      );


      cachedAthletes = [

        {
          id:
            "mohammad-ahmadi-fallback",

          name:
            "محمد احمدی"

        }

      ];


      populateFilters(
        cachedAthletes
      );

      renderAthletes(
        cachedAthletes
      );

      return;

    }


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

        throw result.error;

      }


      cachedAthletes =
        Array.isArray(
          result.data
        )
          ? result.data
          : [];


      /*
         اگر محمد احمدی هنوز در دیتابیس نبود،
         کارت موقت نمایش داده شود.
      */

      const hasMohammad =
        cachedAthletes.some(
          athlete =>
            normalize(
              getName(
                athlete
              )
            )
              .includes(
                "محمد احمدی"
              )
        );


      if (
        !hasMohammad
      ) {

        cachedAthletes.unshift({

          id:
            "mohammad-ahmadi-fallback",

          name:
            "محمد احمدی"

        });

      }


      populateFilters(
        cachedAthletes
      );


      applyFilters();


    } catch (error) {

      console.error(
        "Failed to load athletes:",
        error
      );


      cachedAthletes = [

        {
          id:
            "mohammad-ahmadi-fallback",

          name:
            "محمد احمدی"

        }

      ];


      populateFilters(
        cachedAthletes
      );

      renderAthletes(
        cachedAthletes
      );

    }

  }


  /* =======================================================
     LOGIN MODAL
  ======================================================= */

  const modal =
    $("loginModal");


  function openLoginModal() {

    if (!modal) {
      return;
    }


    modal.classList.remove(
      "hidden"
    );


    hideLoginMessage();


    setTimeout(
      () => {

        $("username")
          ?.focus();

      },
      100
    );

  }


  function closeLoginModal() {

    if (!modal) {
      return;
    }


    modal.classList.add(
      "hidden"
    );

    hideLoginMessage();

  }


  /* =======================================================
     LOGIN
  ======================================================= */

  async function loginUser() {

    hideLoginMessage();


    /*
       بررسی اتصال Supabase
    */

    if (
      !supabaseClient
    ) {

      showLoginMessage(
        "اتصال به Supabase برقرار نیست. کلید اتصال را بررسی کنید."
      );

      return;

    }


    const email =
      (
        $("username")
          ?.value ||
        ""
      ).trim();


    const password =
      $("password")
        ?.value ||
      "";


    /*
       اعتبارسنجی ایمیل
    */

    if (!email) {

      showLoginMessage(
        "ایمیل را وارد کنید."
      );

      $("username")
        ?.focus();

      return;

    }


    /*
       اعتبارسنجی رمز
    */

    if (!password) {

      showLoginMessage(
        "رمز عبور را وارد کنید."
      );

      $("password")
        ?.focus();

      return;

    }


    const button =
      $("loginSubmitBtn");


    /*
       Loading
    */

    if (button) {

      button.disabled =
        true;

      button.dataset.oldText =
        button.textContent;

      button.textContent =
        "در حال ورود...";

    }


    try {

      /*
         Supabase Auth
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


      /*
         Error
      */

      if (error) {

        console.error(
          "Supabase Login Error:",
          error
        );


        let message =
          "ورود انجام نشد.";


        if (
          error.message
            ?.toLowerCase()
            .includes(
              "invalid login credentials"
            )
        ) {

          message =
            "ایمیل یا رمز عبور اشتباه است.";

        }

        else if (
          error.message
            ?.toLowerCase()
            .includes(
              "email not confirmed"
            )
        ) {

          message =
            "ایمیل حساب کاربری هنوز تأیید نشده است.";

        }

        else if (
          error.message
            ?.toLowerCase()
            .includes(
              "rate limit"
            )
        ) {

          message =
            "تعداد تلاش‌های ورود زیاد است. کمی بعد دوباره امتحان کنید.";

        }

        else if (
          error.message
        ) {

          message =
            error.message;

        }


        showLoginMessage(
          message
        );

        return;

      }


      /*
         بررسی Session
      */

      if (
        !data ||
        !data.session
      ) {

        showLoginMessage(
          "ورود انجام نشد؛ نشست کاربر ایجاد نشد."
        );

        return;

      }


      /*
         ورود موفق
      */

      showLoginMessage(
        "ورود موفق بود. در حال انتقال...",
        "success"
      );


      /*
         کمی تأخیر برای نمایش پیام
      */

      setTimeout(
        () => {

          window.location.href =
            "coach.html";

        },
        250
      );


    } catch (error) {

      console.error(
        "Unexpected Login Error:",
        error
      );


      showLoginMessage(
        "خطای غیرمنتظره‌ای هنگام ورود رخ داد."
      );


    } finally {

      if (button) {

        button.disabled =
          false;

        button.textContent =
          button.dataset.oldText ||
          "ورود به سامانه";

      }

    }

  }


  /* =======================================================
     CHECK EXISTING SESSION
  ======================================================= */

  async function checkExistingSession() {

    if (
      !supabaseClient
    ) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .getSession();


      if (
        error
      ) {

        console.warn(
          "Session check:",
          error
        );

        return;

      }


      /*
         فعلاً کاربر را خودکار به coach.html
         نمی‌فرستیم؛ صفحه عمومی باید قابل مشاهده باشد.
      */

      if (
        data?.session
      ) {

        console.log(
          "Existing Supabase session detected."
        );

      }

    } catch (error) {

      console.warn(
        "Existing session check failed:",
        error
      );

    }

  }


  /* =======================================================
     LOGIN EVENTS
  ======================================================= */

  function setupLogin() {

    /*
       دکمه اصلی ورود
    */

    $("loginBtn")
      ?.addEventListener(
        "click",
        openLoginModal
      );


    /*
       ورود مربی از Empty State
    */

    $("coachLogin")
      ?.addEventListener(
        "click",
        openLoginModal
      );


    /*
       بستن
    */

    $("closeModal")
      ?.addEventListener(
        "click",
        closeLoginModal
      );


    /*
       کلیک بیرون Modal
    */

    modal
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            modal
          ) {

            closeLoginModal();

          }

        }
      );


    /*
       دکمه ورود
    */

    $("loginSubmitBtn")
      ?.addEventListener(
        "click",
        loginUser
      );


    /*
       Enter در ایمیل
    */

    $("username")
      ?.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            loginUser();

          }

        }
      );


    /*
       Enter در رمز
    */

    $("password")
      ?.addEventListener(
        "keydown",
        event => {

          if (
            event.key ===
            "Enter"
          ) {

            event.preventDefault();

            loginUser();

          }

        }
      );


    /*
       Escape
    */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          closeLoginModal();

        }

      }
    );

  }


  /* =======================================================
     SEARCH
  ======================================================= */

  function setupSearch() {

    $("search")
      ?.addEventListener(
        "input",
        applyFilters
      );


    $("filter")
      ?.addEventListener(
        "change",
        applyFilters
      );

  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  async function initialize() {

    /*
       اول Eventها
    */

    setupLogin();

    setupSearch();


    /*
       بررسی Session
    */

    await checkExistingSession();


    /*
       دریافت ورزشکاران
    */

    await loadAthletes();

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
      initialize
    );

  } else {

    initialize();

  }


  /* =======================================================
     GLOBAL API
  ======================================================= */

  window.JudoTabiatPublic = {

    refresh:
      loadAthletes,

    login:
      loginUser,

    openLogin:
      openLoginModal,

    closeLogin:
      closeLoginModal,

    getSupabase:
      () =>
        supabaseClient

  };


  /* =======================================================
     END
  ======================================================= */

})();
