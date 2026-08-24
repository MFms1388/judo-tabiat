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
// ATHLETE PAGE STYLE
// این استایل مستقیم توسط coach.js اضافه می‌شود
// ======================================

const athletePageStyle =
  document.createElement("style");

athletePageStyle.textContent = `

  #page-athletes {
    background: #f5f7f6 !important;
    color: #111827 !important;
  }

  #page-athletes * {
    box-sizing: border-box;
  }

  #page-athletes .page-heading h1 {
    color: #111827 !important;
  }

  #page-athletes .page-heading p {
    color: #4b5563 !important;
  }

  #page-athletes .toolbar input,
  #page-athletes .toolbar select {
    background: #ffffff !important;
    color: #111827 !important;
    border: 1px solid #d1d5db !important;
  }

  #page-athletes .toolbar input::placeholder {
    color: #6b7280 !important;
  }

  .coach-athlete-grid {
    width: 100%;
    display: grid;
    grid-template-columns:
      repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
    margin-top: 22px;
  }

  .coach-athlete-card {
    background: #ffffff !important;
    color: #111827 !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 18px !important;
    padding: 18px !important;
    box-shadow:
      0 5px 18px rgba(0, 0, 0, 0.08) !important;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    cursor: pointer;
  }

  .coach-athlete-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 9px 24px rgba(0, 0, 0, 0.12) !important;
  }

  .coach-athlete-icon {
    width: 70px !important;
    height: 70px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 14px !important;
    background: #e8f6f0 !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    font-size: 32px !important;
    color: #087f5b !important;
  }

  .coach-athlete-icon img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .coach-athlete-info h3 {
    margin: 0 0 7px !important;
    color: #111827 !important;
    font-size: 20px !important;
    font-weight: 800 !important;
  }

  .coach-athlete-info p {
    margin: 0 0 15px !important;
    color: #4b5563 !important;
    font-size: 14px !important;
  }

  .coach-athlete-meta {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 9px !important;
    margin-bottom: 15px !important;
  }

  .coach-athlete-meta span {
    display: inline-block !important;
    background: #f3f4f6 !important;
    color: #374151 !important;
    padding: 7px 10px !important;
    border-radius: 9px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
  }

  .coach-athlete-meta span:nth-child(2) {
    background: #e8f6f0 !important;
    color: #087f5b !important;
    font-weight: 800 !important;
  }

  .athlete-view-btn {
    width: 100% !important;
    padding: 11px !important;
    border: none !important;
    border-radius: 11px !important;
    background: #087f5b !important;
    color: #ffffff !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
  }

  .athlete-view-btn:hover {
    background: #066b4d !important;
  }

  #page-athletes .empty-panel {
    background: #ffffff !important;
    color: #111827 !important;
    border: 1px solid #e5e7eb !important;
    box-shadow:
      0 5px 18px rgba(0, 0, 0, 0.06) !important;
  }

  #page-athletes .empty-panel h2 {
    color: #111827 !important;
  }

  #page-athletes .empty-panel p {
    color: #4b5563 !important;
  }

  @media (max-width: 600px) {

    .coach-athlete-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .coach-athlete-card {
      padding: 16px !important;
    }

  }

`;

document.head.appendChild(
  athletePageStyle
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

    console.error(
      "Session error:",
      error
    );

    redirectToLogin();

    return false;
  }

  const session =
    data?.session;

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

function openPage(
  pageName
) {

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
        `
        id,
        profile_id,
        first_name,
        last_name,
        national_id,
        age_group,
        weight,
        photo_url,
        total_score,
        bio,
        created_at,
        updated_at
        `
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

    showAthleteError(
      error.message
    );

    return;

  }


  athletes =
    data || [];


  console.log(
    "Athletes loaded:",
    athletes
  );


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

function renderCoachAthletes(
  list
) {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!grid) {

    console.warn(
      "coachAthleteGrid not found"
    );

    return;

  }


  grid.innerHTML = "";


  if (!list.length) {

    grid.innerHTML = `

      <div
        class="empty-panel"
        style="
          background:#ffffff;
          color:#111827;
          border:1px solid #e5e7eb;
          border-radius:18px;
          padding:30px;
          box-shadow:0 5px 18px rgba(0,0,0,.06);
        "
      >

        <div
          style="
            font-size:36px;
            margin-bottom:12px;
          "
        >
          🥋
        </div>

        <h2
          style="
            color:#111827 !important;
            margin:0 0 8px;
          "
        >
          هنوز ورزشکاری ثبت نشده است
        </h2>

        <p
          style="
            color:#4b5563 !important;
            margin:0;
          "
        >
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
        athlete.total_score !== null &&
        athlete.total_score !== undefined
          ? athlete.total_score
          : "—";


      let photoHTML =
        "🥋";


      if (athlete.photo_url) {

        photoHTML = `

          <img
            src="${escapeHTML(
              athlete.photo_url
            )}"
            alt="${escapeHTML(
              name
            )}"
          >

        `;

      }


      card.innerHTML = `

        <div
          class="coach-athlete-icon"
        >

          ${photoHTML}

        </div>


        <div
          class="coach-athlete-info"
        >

          <h3>
            ${escapeHTML(
              name
            )}
          </h3>

          <p>
            ${escapeHTML(
              category
            )}
          </p>


          <div
            class="coach-athlete-meta"
          >

            <span>
              ⚖️
              ${escapeHTML(
                weight
              )}
            </span>

            <span>
              امتیاز:
              ${escapeHTML(
                score
              )}
            </span>

          </div>

        </div>


        <button
          class="athlete-view-btn"
          type="button"
        >
          مشاهده پروفایل
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

function showAthleteError(
  message = ""
) {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );


  if (!grid) return;


  grid.innerHTML = `

    <div
      class="empty-panel"
      style="
        background:#ffffff;
        color:#111827;
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:30px;
      "
    >

      <div
        style="
          font-size:36px;
          margin-bottom:12px;
        "
      >
        ⚠️
      </div>

      <h2
        style="
          color:#111827 !important;
        "
      >
        خطا در دریافت ورزشکاران
      </h2>

      <p
        style="
          color:#4b5563 !important;
        "
      >
        دریافت اطلاعات ورزشکاران انجام نشد.
      </p>

      ${
        message
          ? `
            <small
              style="
                display:block;
                margin-top:10px;
                color:#374151;
                direction:ltr;
                word-break:break-word;
              "
            >
              ${escapeHTML(
                message
              )}
            </small>
          `
          : ""
      }

    </div>

  `;

}


// ======================================
// HTML ESCAPE
// ======================================

function escapeHTML(
  value
) {

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
          athlete.age_group || "";


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
        ? Number(
            weightValue
          )
        : null;


    if (
      weightValue &&
      Number.isNaN(
        weight
      )
    ) {

      alert(
        "وزن وارد شده صحیح نیست."
      );

      return;

    }


    const {
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
            ageGroup ||
            null,

          weight:
            weight,

          photo_url:
            photoUrl ||
            null,

          bio:
            bio ||
            null

        });


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

        input.value =
          "";

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
