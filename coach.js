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
// AUTH
// ======================================

async function checkCoachAccess() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {

    console.error(error);

    redirectToLogin();

    return false;
  }

  const session = data?.session;

  if (!session) {

    redirectToLogin();

    return false;
  }

  const email =
    session.user?.email?.toLowerCase();

  if (
    email !==
    "coach.judotabiat@gmail.com"
  ) {

    await supabaseClient.auth.signOut();

    alert(
      "شما اجازه ورود به پنل مربی را ندارید."
    );

    redirectToLogin();

    return false;
  }

  const coachEmail =
    document.getElementById(
      "coachEmail"
    );

  if (coachEmail) {

    coachEmail.textContent =
      session.user.email;
  }

  return true;
}


// ======================================
// REDIRECT
// ======================================

function redirectToLogin() {

  window.location.href =
    "index.html";
}


// ======================================
// ELEMENTS
// ======================================

const sidebar =
  document.getElementById(
    "coachSidebar"
  );

const menuBtn =
  document.getElementById(
    "menuBtn"
  );

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );

const coachPages =
  document.querySelectorAll(
    ".coach-page"
  );


// ======================================
// MOBILE MENU
// ======================================

if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      if (!sidebar) return;

      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


// ======================================
// PAGE NAVIGATION
// ======================================

function openPage(pageName) {

  coachPages.forEach(
    page => {

      page.classList.remove(
        "active"
      );

    }
  );


  navItems.forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );


  const targetPage =
    document.getElementById(
      `page-${pageName}`
    );


  const targetNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );


  if (targetPage) {

    targetPage.classList.add(
      "active"
    );

  }


  if (targetNav) {

    targetNav.classList.add(
      "active"
    );

  }


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }

}


// ======================================
// NAVIGATION EVENTS
// ======================================

navItems.forEach(
  item => {

    item.addEventListener(
      "click",
      () => {

        const page =
          item.dataset.page;

        openPage(page);

      }
    );

  }
);


// ======================================
// QUICK ACTIONS
// ======================================

const quickCards =
  document.querySelectorAll(
    "[data-go]"
  );


quickCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        const page =
          card.dataset.go;

        openPage(page);

      }
    );

  }
);


// ======================================
// LOGOUT
// ======================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      const confirmLogout =
        confirm(
          "آیا می‌خواهید از حساب مربی خارج شوید؟"
        );


      if (!confirmLogout) {
        return;
      }


      await supabaseClient.auth.signOut();


      window.location.href =
        "index.html";

    }
  );

}


// ======================================
// ATHLETES
// ======================================

let athletes = [];


// ======================================
// LOAD ATHLETES
// ======================================

async function loadAthletes() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("athletes")
      .select(
        "id, profile_id, first_name, last_name, national_id, age_group, weight, photo_url, total_scor, bio, created_at, updated_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Athletes error:",
      error
    );

    showAthleteError();

    return;

  }


  athletes =
    data || [];


  updateDashboardStats();


  createCoachCategoryFilter(
    athletes
  );


  renderCoachAthletes(
    athletes
  );

}


// ======================================
// DASHBOARD STATS
// ======================================

function updateDashboardStats() {

  const totalAthletes =
    document.getElementById(
      "totalAthletes"
    );


  if (totalAthletes) {

    totalAthletes.textContent =
      athletes.length;

  }


  const totalEvaluations =
    document.getElementById(
      "totalEvaluations"
    );


  const todayAttendance =
    document.getElementById(
      "todayAttendance"
    );


  const totalAchievements =
    document.getElementById(
      "totalAchievements"
    );


  if (totalEvaluations) {

    totalEvaluations.textContent =
      "۰";

  }


  if (todayAttendance) {

    todayAttendance.textContent =
      "۰";

  }


  if (totalAchievements) {

    totalAchievements.textContent =
      "۰";

  }

}


// ======================================
// RENDER ATHLETES
// ======================================

function renderCoachAthletes(list) {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!grid) return;


  grid.innerHTML = "";


  if (!list.length) {

    grid.innerHTML = `

      <div class="empty-panel">

        <div>
          🥋
        </div>

        <h2>
          هنوز ورزشکاری ثبت نشده است
        </h2>

        <p>
          از گزینه «افزودن ورزشکار»
          برای ثبت ورزشکار جدید استفاده کنید.
        </p>

      </div>

    `;

    return;

  }


  list.forEach(
    athlete => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "coach-athlete-card";


      const name =
        [
          athlete.first_name,
          athlete.last_name
        ]
        .filter(Boolean)
        .join(" ") ||
        "بدون نام";


      const category =
        athlete.age_group ||
        "رده ثبت نشده";


      const weight =
        athlete.weight !== null &&
        athlete.weight !== undefined
          ? `${athlete.weight} کیلوگرم`
          : "وزن ثبت نشده";


      const score =
        athlete.total_scor !== null &&
        athlete.total_scor !== undefined
          ? athlete.total_scor
          : "—";


      card.innerHTML = `

        <div class="coach-athlete-icon">

          ${
            athlete.photo_url
              ? `<img
                  src="${escapeHTML(
                    athlete.photo_url
                  )}"
                  alt=""
                >`
              : "🥋"
          }

        </div>


        <div class="coach-athlete-info">

          <h3>
            ${escapeHTML(name)}
          </h3>

          <p>
            ${escapeHTML(category)}
          </p>


          <div class="coach-athlete-meta">

            <span>
              ⚖️
              ${escapeHTML(weight)}
            </span>

            <span>
              امتیاز:
              ${escapeHTML(score)}
            </span>

          </div>

        </div>


        <button
          class="athlete-view-btn"
          type="button"
          data-athlete-id="${escapeHTML(
            athlete.id
          )}"
        >
          مشاهده
        </button>

      `;


      const viewBtn =
        card.querySelector(
          ".athlete-view-btn"
        );


      if (viewBtn) {

        viewBtn.addEventListener(
          "click",
          event => {

            event.stopPropagation();


            window.location.href =
              `athlete.html?id=${encodeURIComponent(
                athlete.id
              )}`;

          }
        );

      }


      card.addEventListener(
        "click",
        () => {

          window.location.href =
            `athlete.html?id=${encodeURIComponent(
              athlete.id
            )}`;

        }
      );


      grid.appendChild(
        card
      );

    }
  );

}


// ======================================
// ERROR
// ======================================

function showAthleteError() {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!grid) return;


  grid.innerHTML = `

    <div class="empty-panel">

      <div>
        ⚠️
      </div>

      <h2>
        خطا در دریافت ورزشکاران
      </h2>

      <p>
        دریافت اطلاعات از سامانه انجام نشد.
        لطفاً اتصال اینترنت و دسترسی دیتابیس را بررسی کنید.
      </p>

    </div>

  `;

}


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(value) {

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

}


// ======================================
// SEARCH
// ======================================

const coachSearch =
  document.getElementById(
    "coachSearch"
  );


const coachFilter =
  document.getElementById(
    "coachFilter"
  );


function filterCoachAthletes() {

  const search =
    coachSearch
      ? coachSearch.value
          .trim()
          .toLowerCase()
      : "";


  const category =
    coachFilter
      ? coachFilter.value
      : "all";


  const result =
    athletes.filter(
      athlete => {

        const name =
          [
            athlete.first_name,
            athlete.last_name
          ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        const nationalId =
          athlete.national_id
            ? String(
                athlete.national_id
              ).toLowerCase()
            : "";


        const athleteCategory =
          athlete.age_group ||
          "";


        const matchesSearch =
          name.includes(search) ||
          nationalId.includes(search);


        const matchesCategory =
          category === "all" ||
          athleteCategory ===
            category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  renderCoachAthletes(
    result
  );

}


if (coachSearch) {

  coachSearch.addEventListener(
    "input",
    filterCoachAthletes
  );

}


if (coachFilter) {

  coachFilter.addEventListener(
    "change",
    filterCoachAthletes
  );

}


// ======================================
// CATEGORY FILTER
// ======================================

function createCoachCategoryFilter(
  list
) {

  if (!coachFilter) return;


  const categories =
    [
      ...new Set(

        list
          .map(
            athlete =>
              athlete.age_group
          )
          .filter(Boolean)

      )
    ];


  coachFilter.innerHTML = `

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


      coachFilter.appendChild(
        option
      );

    }
  );

}


// ======================================
// ADD ATHLETE MODAL
// ======================================

const athleteModal =
  document.getElementById(
    "athleteModal"
  );


const addAthleteBtn =
  document.getElementById(
    "addAthleteBtn"
  );


const closeAthleteModal =
  document.getElementById(
    "closeAthleteModal"
  );


const saveAthleteBtn =
  document.getElementById(
    "saveAthleteBtn"
  );


function openAthleteModal() {

  if (!athleteModal) return;


  athleteModal.classList.remove(
    "hidden"
  );

}


function closeAthleteForm() {

  if (!athleteModal) return;


  athleteModal.classList.add(
    "hidden"
  );

}


if (addAthleteBtn) {

  addAthleteBtn.addEventListener(
    "click",
    openAthleteModal
  );

}


if (closeAthleteModal) {

  closeAthleteModal.addEventListener(
    "click",
    closeAthleteForm
  );

}


if (athleteModal) {

  athleteModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        athleteModal
      ) {

        closeAthleteForm();

      }

    }
  );

}


// ======================================
// SAVE ATHLETE
// ======================================

async function saveAthlete() {

  const firstName =
    document.getElementById(
      "athleteFirstName"
    )?.value.trim();


  const lastName =
    document.getElementById(
      "athleteLastName"
    )?.value.trim();


  const ageGroup =
    document.getElementById(
      "athleteAgeGroup"
    )?.value.trim();


  const weightValue =
    document.getElementById(
      "athleteWeight"
    )?.value.trim();


  const nationalId =
    document.getElementById(
      "athleteNationalId"
    )?.value.trim();


  const bio =
    document.getElementById(
      "athleteBio"
    )?.value.trim();


  const photoUrl =
    document.getElementById(
      "athletePhotoUrl"
    )?.value.trim();


  if (
    !firstName ||
    !lastName
  ) {

    alert(
      "نام و نام خانوادگی را وارد کنید."
    );

    return;

  }


  if (!nationalId) {

    alert(
      "کد ملی ورزشکار را وارد کنید."
    );

    return;

  }


  if (
    !/^\d{10}$/.test(
      nationalId
    )
  ) {

    alert(
      "کد ملی باید ۱۰ رقم باشد."
    );

    return;

  }


  if (!saveAthleteBtn) {
    return;
  }


  saveAthleteBtn.disabled =
    true;


  saveAthleteBtn.textContent =
    "در حال ثبت...";


  try {

    const weight =
      weightValue
        ? Number(weightValue)
        : null;


    if (
      weightValue &&
      Number.isNaN(weight)
    ) {

      alert(
        "وزن وارد شده صحیح نیست."
      );

      return;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("athletes")
        .insert({

          first_name:
            firstName,

          last_name:
            lastName,

          national_id:
            nationalId,

          age_group:
            ageGroup || null,

          weight:
            weight,

          photo_url:
            photoUrl || null,

          bio:
            bio || null

        })
        .select()
        .single();


    if (error) {

      console.error(
        "Save athlete error:",
        error
      );


      alert(
        "ثبت ورزشکار انجام نشد.\n\n" +
        error.message
      );


      return;

    }


    alert(
      "ورزشکار با موفقیت ثبت شد."
    );


    clearAthleteForm();


    closeAthleteForm();


    await loadAthletes();


    openPage(
      "athletes"
    );

  } catch (error) {

    console.error(
      error
    );


    alert(
      "خطایی هنگام ثبت ورزشکار رخ داد."
    );

  } finally {

    saveAthleteBtn.disabled =
      false;


    saveAthleteBtn.textContent =
      "ثبت ورزشکار";

  }

}


if (saveAthleteBtn) {

  saveAthleteBtn.addEventListener(
    "click",
    saveAthlete
  );

}


// ======================================
// CLEAR FORM
// ======================================

function clearAthleteForm() {

  const fields = [

    "athleteFirstName",

    "athleteLastName",

    "athleteAgeGroup",

    "athleteWeight",

    "athleteNationalId",

    "athleteBio",

    "athletePhotoUrl"

  ];


  fields.forEach(
    id => {

      const input =
        document.getElementById(
          id
        );


      if (input) {

        input.value = "";

      }

    }
  );

}


// ======================================
// START
// ======================================

async function startCoachApp() {

  const allowed =
    await checkCoachAccess();


  if (!allowed) {
    return;
  }


  await loadAthletes();

}


startCoachApp();
