/* =========================================================
   JUDO TABIAT - PUBLIC ATHLETES
   app.js
   نمایش ورزشکاران در صفحه اصلی
   نسخه پایدار
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


  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    try {

      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

    } catch (error) {

      console.error(
        "Supabase client error:",
        error
      );

    }

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


  function normalizeName(name) {

    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ى/g, "ی")
      .replace(/ك/g, "ک");

  }


  function getAthleteName(athlete) {

    if (!athlete) {
      return "ورزشکار";
    }


    const firstLast = [
      athlete.first_name,
      athlete.last_name
    ]
      .filter(Boolean)
      .join(" ")
      .trim();


    return (
      athlete.name ||
      athlete.full_name ||
      athlete.fullName ||
      firstLast ||
      "ورزشکار"
    );

  }


  /* =======================================================
     DEMO ATHLETE
  ======================================================= */

  function createMohammadDemo() {

    return {

      id:
        "mohammad-ahmadi-demo",

      first_name:
        "محمد",

      last_name:
        "احمدی",

      name:
        "محمد احمدی",

      full_name:
        "محمد احمدی",

      age_group:
        "نوجوانان",

      weight:
        66,

      category:
        "جودوکار",

      belt:
        "",

      photo_url:
        "",

      bio:
        "ورزشکار جودو طبیعت",

      is_demo:
        true

    };

  }


  /* =======================================================
     LOAD ATHLETES
  ======================================================= */

  async function loadAthletes() {

    const container =
      $("athletesList") ||
      $("athletesGrid") ||
      $("athleteGrid");


    if (!container) {

      console.warn(
        "محل نمایش ورزشکاران پیدا نشد."
      );

      return;

    }


    let athletes = [];


    /* =====================================================
       دریافت از SUPABASE
    ===================================================== */

    if (supabaseClient) {

      try {

        const {
          data,
          error
        } =
          await supabaseClient
            .from("athletes")
            .select("*");


        if (error) {

          console.error(
            "خطای دریافت athletes:",
            error
          );

        } else if (Array.isArray(data)) {

          athletes = data;

        }

      } catch (error) {

        console.error(
          "خطای ارتباط با Supabase:",
          error
        );

      }

    }


    /* =====================================================
       پیدا کردن محمد احمدی
    ===================================================== */

    const mohammadIndex =
      athletes.findIndex(
        athlete =>
          normalizeName(
            getAthleteName(athlete)
          ) ===
          "محمد احمدی"
      );


    /* =====================================================
       اگر محمد در دیتابیس وجود ندارد
       نسخه آزمایشی اضافه شود
    ===================================================== */

    if (mohammadIndex === -1) {

      athletes.unshift(
        createMohammadDemo()
      );

    }


    /* =====================================================
       محمد همیشه اول لیست باشد
    ===================================================== */

    const finalMohammadIndex =
      athletes.findIndex(
        athlete =>
          normalizeName(
            getAthleteName(athlete)
          ) ===
          "محمد احمدی"
      );


    if (finalMohammadIndex > 0) {

      const mohammad =
        athletes.splice(
          finalMohammadIndex,
          1
        )[0];

      athletes.unshift(
        mohammad
      );

    }


    renderAthletes(
      athletes,
      container
    );

  }


  /* =======================================================
     RENDER
  ======================================================= */

  function renderAthletes(
    athletes,
    container
  ) {

    if (
      !Array.isArray(athletes) ||
      !athletes.length
    ) {

      container.innerHTML = `

        <div class="evaluation-empty">

          <div class="evaluation-empty-icon">
            🥋
          </div>

          <h2>
            هنوز ورزشکاری ثبت نشده است
          </h2>

          <p>
            ورزشکاران پس از ثبت در سامانه
            اینجا نمایش داده می‌شوند.
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
              athlete.photo_url ||
              athlete.photo ||
              athlete.avatar_url ||
              athlete.image_url ||
              "";


            const athleteId =
              athlete.id;


            const isDemo =
              athlete.is_demo === true;


            return `

              <article
                class="athlete-card"
                data-athlete-id="${escapeHTML(
                  athleteId
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
                          onerror="
                            this.style.display='none';
                            this.parentElement.innerHTML='🥋';
                          "
                        >

                      `

                      : `

                        <div class="athlete-placeholder">
                          🥋
                        </div>

                      `
                  }

                </div>


                <div class="athlete-card-content">

                  <h3>
                    ${escapeHTML(name)}
                  </h3>


                  <div class="athlete-info">
                    🥋 جودو طبیعت
                  </div>


                  ${
                    athlete.age_group

                      ? `

                        <div class="athlete-info">
                          👤 رده:
                          ${escapeHTML(
                            athlete.age_group
                          )}
                        </div>

                      `

                      : ""
                  }


                  ${
                    athlete.weight !== null &&
                    athlete.weight !== undefined &&
                    athlete.weight !== ""

                      ? `

                        <div class="athlete-info">
                          ⚖️ وزن:
                          ${escapeHTML(
                            athlete.weight
                          )}
                          کیلوگرم
                        </div>

                      `

                      : ""
                  }


                  ${
                    athlete.belt

                      ? `

                        <div class="athlete-info">
                          🥋 کمربند:
                          ${escapeHTML(
                            athlete.belt
                          )}
                        </div>

                      `

                      : ""
                  }


                  <button
                    type="button"
                    class="athlete-view-btn"
                    data-athlete-id="${escapeHTML(
                      athleteId
                    )}"
                  >
                    مشاهده پروفایل
                  </button>


                  ${
                    isDemo

                      ? `

                        <div
                          style="
                            margin-top:8px;
                            font-size:11px;
                            color:#888;
                          "
                        >
                          پروفایل آزمایشی
                        </div>

                      `

                      : ""
                  }

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
     BUTTONS
  ======================================================= */

  function bindAthleteButtons(
    athletes
  ) {

    document
      .querySelectorAll(
        ".athlete-view-btn"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const id =
                button.dataset.athleteId;


              const athlete =
                athletes.find(
                  item =>
                    String(item.id) ===
                    String(id)
                );


              if (!athlete) {
                return;
              }


              openAthleteProfile(
                athlete
              );

            }
          );

        }
      );

  }


  /* =======================================================
     OPEN ATHLETE
  ======================================================= */

  function openAthleteProfile(
    athlete
  ) {

    if (!athlete) {
      return;
    }


    /* ---------------------------------------------
       پروفایل آزمایشی
    --------------------------------------------- */

    if (
      athlete.is_demo === true
    ) {

      window.location.href =
        "athlete.html?demo=mohammad";

      return;

    }


    /* ---------------------------------------------
       پروفایل واقعی
    --------------------------------------------- */

    if (!athlete.id) {

      console.error(
        "Athlete ID not found."
      );

      return;

    }


    window.location.href =
      "athlete.html?id=" +
      encodeURIComponent(
        athlete.id
      );

  }


  /* =======================================================
     INIT
  ======================================================= */

  async function init() {

    console.log(
      "🥋 جودو طبیعت | Public Athletes"
    );


    await loadAthletes();


    console.log(
      "✅ صفحه ورزشکاران آماده شد."
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
      init
    );

  } else {

    init();

  }

})();
