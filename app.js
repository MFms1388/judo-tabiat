/* =========================================================
   JUDO TABIAT - PUBLIC ATHLETES
   نمایش ورزشکاران در صفحه اصلی
========================================================= */

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://bkkdgywdptufjsaepehc.supabase.co";

  const SUPABASE_KEY =
    window.SUPABASE_KEY || "";

  let supabaseClient = null;

  /* =======================================================
     SUPABASE
  ======================================================= */

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
     LOAD ATHLETES
  ======================================================= */

  async function loadAthletes() {

    const container =
      $("athletesList") ||
      $("athletesGrid") ||
      $("athleteGrid");

    if (!container) {
      console.warn(
        "Athletes container not found."
      );
      return;
    }

    let athletes = [];

    /* -------------------------------------------------------
       دریافت از Supabase
    ------------------------------------------------------- */

    if (supabaseClient) {

      const result =
        await supabaseClient
          .from("athletes")
          .select("*");

      if (result.error) {

        console.error(
          "Athletes load error:",
          result.error
        );

      } else {

        athletes =
          Array.isArray(result.data)
            ? result.data
            : [];
      }
    }

    /* -------------------------------------------------------
       اگر Supabase هنوز داده را برنگرداند،
       محمد احمدی به عنوان رکورد نمایشی
       در صفحه باقی می‌ماند.
    ------------------------------------------------------- */

    const mohammadExists =
      athletes.some(athlete =>
        getAthleteName(athlete)
          .trim()
          .replace(/\s+/g, " ")
          === "محمد احمدی"
      );

    if (!mohammadExists) {

      athletes.unshift({

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
      });
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

    if (!athletes.length) {

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
        .map(athlete => {

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
                    athlete.id
                  )}"
                >
                  مشاهده پروفایل
                </button>

              </div>

            </article>
          `;
        })
        .join("");

    bindAthleteButtons(
      athletes
    );
  }

  /* =======================================================
     ATHLETE PROFILE
  ======================================================= */

  function bindAthleteButtons(
    athletes
  ) {

    document
      .querySelectorAll(
        "[data-athlete-id]"
      )
      .forEach(element => {

        if (
          !element.classList.contains(
            "athlete-view-btn"
          )
        ) {
          return;
        }

        element.addEventListener(
          "click",
          () => {

            const id =
              element.dataset
                .athleteId;

            const athlete =
              athletes.find(
                item =>
                  String(item.id) ===
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
      });
  }

  function showAthleteProfile(
    athlete
  ) {

    const name =
      getAthleteName(
        athlete
      );

    alert(
      "پروفایل ورزشکار\n\n" +
      name
    );
  }

  /* =======================================================
     INIT
  ======================================================= */

  async function init() {

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

})();
