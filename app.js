/* =========================================================
   JUDO TABIAT - PUBLIC ATHLETES
   app.js
   نمایش ورزشکاران در صفحه اصلی
   نسخه اصلاح شده
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


  function normalizeName(name) {

    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک");

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
        "❌ athletes container not found"
      );

      return;

    }


    let athletes = [];


    /* =====================================================
       دریافت ورزشکاران از SUPABASE
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
            "❌ Supabase athletes error:",
            error
          );

        } else {

          athletes =
            Array.isArray(data)
              ? data
              : [];

        }

      } catch (error) {

        console.error(
          "❌ Athletes request failed:",
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
       اگر محمد در دیتابیس نیست
       رکورد نمایشی ایجاد می‌کنیم
    ===================================================== */

    if (mohammadIndex === -1) {

      athletes.unshift({

        id:
          "mohammad-ahmadi",

        name:
          "محمد احمدی",

        full_name:
          "محمد احمدی",

        first_name:
          "محمد",

        last_name:
          "احمدی",

        belt:
          "",

        category:
          "ورزشکار جودو طبیعت",

        age_group:
          "",

        weight:
          "",

        photo_url:
          "",

        bio:
          "ورزشکار جودو طبیعت",

        is_demo:
          true

      });

    }


    /* =====================================================
       RENDER
    ===================================================== */

    renderAthletes(
      athletes,
      container
    );

  }


  /* =======================================================
     RENDER ATHLETES
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


            const demo =
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
                    ${escapeHTML(
                      name
                    )}
                  </h3>


                  ${
                    athlete.category

                      ? `

                        <div class="athlete-info">
                          🥋
                          ${escapeHTML(
                            athlete.category
                          )}
                        </div>

                      `

                      : ""
                  }


                  ${
                    athlete.weight

                      ? `

                        <div class="athlete-info">
                          ⚖️ وزن:
                          ${escapeHTML(
                            athlete.weight
                          )}
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
                    demo

                      ? `

                        <div
                          style="
                            margin-top:8px;
                            font-size:11px;
                            color:#888;
                          "
                        >
                          پروفایل اولیه
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
     PROFILE BUTTONS
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
     OPEN PROFILE
  ======================================================= */

  function openAthleteProfile(
    athlete
  ) {

    const id =
      athlete.id;


    if (!id) {

      return;

    }


    window.location.href =
      "athlete.html?id=" +
      encodeURIComponent(id);

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
      "✅ ورزشکاران صفحه اصلی آماده شدند."
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
