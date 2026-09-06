/* =========================================================
   JUDO TABIAT - PUBLIC WEBSITE
   app.js
   PUBLIC ATHLETES
========================================================= */

(() => {

  "use strict";


  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  /*
     کلید عمومی Supabase را اینجا قرار بده.
     اگر قبلاً در پروژه‌ات window.SUPABASE_KEY
     تعریف شده باشد، همان استفاده می‌شود.
  */

  const SUPABASE_KEY =
    window.SUPABASE_KEY || "";


  let supabaseClient = null;


  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
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


  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function getAthleteName(athlete) {

    if (!athlete) {
      return "ورزشکار";
    }

    return (
      athlete.name ||
      athlete.full_name ||
      athlete.fullName ||
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ") ||
      "ورزشکار"
    );

  }


  /* =======================================================
     FALLBACK ATHLETE
     محمد احمدی
  ======================================================= */

  function getFallbackAthlete() {

    return {

      id:
        "mohammad-ahmadi",

      name:
        "محمد احمدی",

      full_name:
        "محمد احمدی",

      belt:
        "جودو",

      category:
        "ورزشکار",

      age_group:
        "",

      weight:
        "",

      photo:
        "",

      is_demo:
        true

    };

  }


  /* =======================================================
     LOAD ATHLETES
  ======================================================= */

  async function loadAthletes() {

    const container =
      $("athletesGrid");


    if (!container) {

      console.error(
        "athletesGrid در index.html پیدا نشد."
      );

      return;

    }


    let athletes = [];


    /* -------------------------------------------------------
       دریافت اطلاعات واقعی از Supabase
    ------------------------------------------------------- */

    if (supabaseClient) {

      try {

        const result =
          await supabaseClient
            .from("athletes")
            .select("*");


        if (result.error) {

          console.warn(
            "Supabase athletes:",
            result.error
          );

        } else {

          athletes =
            Array.isArray(
              result.data
            )
              ? result.data
              : [];

        }

      }

      catch (error) {

        console.error(
          "Athletes request failed:",
          error
        );

      }

    }


    /* -------------------------------------------------------
       اطمینان از وجود محمد احمدی
    ------------------------------------------------------- */

    const mohammadExists =
      athletes.some(
        athlete =>
          getAthleteName(
            athlete
          )
            .trim()
            .replace(
              /\s+/g,
              " "
            ) ===
          "محمد احمدی"
      );


    if (!mohammadExists) {

      athletes.unshift(
        getFallbackAthlete()
      );

    }


    renderAthletes(
      athletes
    );


    setupAthleteSearch(
      athletes
    );

  }


  /* =======================================================
     RENDER ATHLETES
  ======================================================= */

  function renderAthletes(
    athletes
  ) {

    const container =
      $("athletesGrid");


    if (!container) {
      return;
    }


    if (!athletes.length) {

      container.innerHTML = `

        <div class="public-empty">

          <div>
            🥋
          </div>

          <h3>
            هنوز ورزشکاری ثبت نشده است
          </h3>

          <p>
            ورزشکاران باشگاه در این بخش نمایش داده می‌شوند.
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      athletes
        .map(
          athlete => {

            const name =
              getAthleteName(
                athlete
              );


            const photo =
              athlete.photo ||
              athlete.avatar_url ||
              athlete.image_url ||
              "";


            return `

              <article
                class="athlete-card"
                data-athlete-id="${escapeHTML(
                  athlete.id
                )}"
              >

                <div class="athlete-card-image">

                  ${
                    photo

                      ? `

                        <img
                          src="${escapeHTML(
                            photo
                          )}"
                          alt="${escapeHTML(
                            name
                          )}"
                          loading="lazy"
                        >

                      `

                      : `

                        <div
                          class="athlete-placeholder"
                        >
                          🥋
                        </div>

                      `
                  }

                </div>


                <div
                  class="athlete-card-content"
                >

                  <span
                    class="athlete-card-label"
                  >
                    JUDO TABIAT
                  </span>


                  <h3>
                    ${escapeHTML(
                      name
                    )}
                  </h3>


                  ${
                    athlete.belt

                      ? `

                        <div
                          class="athlete-info"
                        >
                          🥋
                          کمربند:
                          ${escapeHTML(
                            athlete.belt
                          )}
                        </div>

                      `

                      : ""
                  }


                  ${
                    athlete.weight

                      ? `

                        <div
                          class="athlete-info"
                        >
                          ⚖️
                          وزن:
                          ${escapeHTML(
                            athlete.weight
                          )}
                        </div>

                      `

                      : ""
                  }


                  ${
                    athlete.age_group

                      ? `

                        <div
                          class="athlete-info"
                        >
                          👤
                          رده:
                          ${escapeHTML(
                            athlete.age_group
                          )}
                        </div>

                      `

                      : ""
                  }


                  <button
                    type="button"
                    class="athlete-view-btn"
                    data-profile-id="${escapeHTML(
                      athlete.id
                    )}"
                  >
                    مشاهده پروفایل
                  </button>

                </div>

              </article>

            `;

          }
        )
        .join("");


    bindAthleteButtons(
      athletes
    );

  }


  /* =======================================================
     SEARCH
  ======================================================= */

  function setupAthleteSearch(
    athletes
  ) {

    const search =
      $("athleteSearch");


    if (!search) {
      return;
    }


    if (
      search.dataset
        .initialized ===
      "true"
    ) {
      return;
    }


    search.dataset
      .initialized =
      "true";


    search.addEventListener(
      "input",
      () => {

        const value =
          search.value
            .trim()
            .toLowerCase();


        if (!value) {

          renderAthletes(
            athletes
          );

          return;

        }


        const filtered =
          athletes.filter(
            athlete => {

              const text =
                [
                  getAthleteName(
                    athlete
                  ),

                  athlete.belt,

                  athlete.category,

                  athlete.age_group,

                  athlete.weight

                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();


              return text.includes(
                value
              );

            }
          );


        renderAthletes(
          filtered
        );

      }
    );

  }


  /* =======================================================
     PROFILE BUTTONS
  ======================================================= */

  function bindAthleteButtons(
    athletes
  ) {

    document
      .querySelectorAll(
        "[data-profile-id]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset
                  .profileId;


              const athlete =
                athletes.find(
                  item =>
                    String(
                      item.id
                    ) ===
                    String(id)
                );


              if (!athlete) {
                return;
              }


              showAthleteProfile(
                athlete
              );

            }
          );

        }
      );

  }


  /* =======================================================
     PROFILE
  ======================================================= */

  function showAthleteProfile(
    athlete
  ) {

    const name =
      getAthleteName(
        athlete
      );


    /*
       فعلاً برای اطمینان از عملکرد،
       پروفایل را به شکل پیام نشان می‌دهیم.
       مرحله بعد می‌توانیم صفحه کامل پروفایل
       محمد احمدی را وصل کنیم.
    */

    alert(
      "پروفایل ورزشکار\n\n" +
      name
    );

  }


  /* =======================================================
     LOGIN
  ======================================================= */

  function setupLogin() {

    const loginBtn =
      $("loginBtn");

    const loginModal =
      $("loginModal");

    const closeModal =
      $("closeModal");


    if (
      loginBtn &&
      loginModal
    ) {

      loginBtn.addEventListener(
        "click",
        () => {

          loginModal.classList.remove(
            "hidden"
          );

        }
      );

    }


    if (
      closeModal &&
      loginModal
    ) {

      closeModal.addEventListener(
        "click",
        () => {

          loginModal.classList.add(
            "hidden"
          );

        }
      );

    }


    if (loginModal) {

      loginModal.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            loginModal
          ) {

            loginModal.classList.add(
              "hidden"
            );

          }

        }
      );

    }

  }


  /* =======================================================
     INIT
  ======================================================= */

  async function init() {

    setupLogin();

    await loadAthletes();

  }


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
     GLOBAL API
  ======================================================= */

  window.JudoTabiatPublic = {

    refresh:
      loadAthletes

  };


})();
