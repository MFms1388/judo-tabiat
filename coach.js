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
// GLOBAL DATA
// ======================================

let athletes = [];
let evaluationPeriods = [];
let evaluationCriteria = [];


// ======================================
// AUTH
// ======================================

async function checkCoachAccess() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
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

  if (email !== "coach.judotabiat@gmail.com") {

    await supabaseClient.auth.signOut();

    alert(
      "شما اجازه ورود به پنل مربی را ندارید."
    );

    redirectToLogin();

    return false;
  }

  const coachEmail =
    document.getElementById("coachEmail");

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
  window.location.href = "index.html";
}


// ======================================
// ELEMENTS
// ======================================

const sidebar =
  document.getElementById("coachSidebar");

const menuBtn =
  document.getElementById("menuBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const navItems =
  document.querySelectorAll(".nav-item");

const coachPages =
  document.querySelectorAll(".coach-page");


// ======================================
// MOBILE MENU
// ======================================

if (menuBtn) {

  menuBtn.addEventListener("click", () => {

    if (!sidebar) return;

    sidebar.classList.toggle("open");

  });

}


// ======================================
// PAGE NAVIGATION
// ======================================

function openPage(pageName) {

  coachPages.forEach(page => {
    page.classList.remove("active");
  });

  navItems.forEach(item => {
    item.classList.remove("active");
  });

  const targetPage =
    document.getElementById(
      `page-${pageName}`
    );

  const targetNav =
    document.querySelector(
      `.nav-item[data-page="${pageName}"]`
    );

  if (targetPage) {
    targetPage.classList.add("active");
  }

  if (targetNav) {
    targetNav.classList.add("active");
  }

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  if (pageName === "evaluations") {
    loadEvaluationData();
  }

}


// ======================================
// NAVIGATION EVENTS
// ======================================

navItems.forEach(item => {

  item.addEventListener("click", () => {

    const page =
      item.dataset.page;

    openPage(page);

  });

});


// ======================================
// QUICK ACTIONS
// ======================================

const quickCards =
  document.querySelectorAll("[data-go]");

quickCards.forEach(card => {

  card.addEventListener("click", () => {

    const page =
      card.dataset.go;

    openPage(page);

  });

});


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
// LOAD ATHLETES
// ======================================

async function loadAthletes() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("athletes")
      .select(`
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
      `)
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

  populateEvaluationAthletes();

}


// ======================================
// DASHBOARD STATS
// ======================================

async function updateDashboardStats() {

  const totalAthletes =
    document.getElementById(
      "totalAthletes"
    );

  if (totalAthletes) {

    totalAthletes.textContent =
      toPersianNumber(
        athletes.length
      );

  }


  const totalEvaluations =
    document.getElementById(
      "totalEvaluations"
    );


  if (totalEvaluations) {

    const {
      count,
      error
    } =
      await supabaseClient
        .from("evaluations")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );

    if (!error) {

      totalEvaluations.textContent =
        toPersianNumber(
          count || 0
        );

    }

  }


  const todayAttendance =
    document.getElementById(
      "todayAttendance"
    );

  if (todayAttendance) {
    todayAttendance.textContent =
      "۰";
  }


  const totalAchievements =
    document.getElementById(
      "totalAchievements"
    );

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

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  if (!list || list.length === 0) {

    grid.innerHTML = `

      <div class="empty-panel">

        <div>🥋</div>

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


  list.forEach(athlete => {

    const card =
      document.createElement("div");

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
      athlete.weight !== undefined &&
      athlete.weight !== ""
        ? `${athlete.weight} کیلوگرم`
        : "وزن ثبت نشده";


    const score =
      athlete.total_score !== null &&
      athlete.total_score !== undefined
        ? athlete.total_score
        : 0;


    let photoHTML = `
      <div class="athlete-placeholder">
        🥋
      </div>
    `;


    if (athlete.photo_url) {

      photoHTML = `
        <img
          src="${escapeHTML(
            athlete.photo_url
          )}"
          alt="${escapeHTML(name)}"
          class="athlete-photo"
        >
      `;

    }


    card.innerHTML = `

      <div class="coach-athlete-icon">
        ${photoHTML}
      </div>

      <div class="coach-athlete-info">

        <h3>
          ${escapeHTML(name)}
        </h3>

        <p>
          ${escapeHTML(category)}
        </p>

        <div class="coach-athlete-meta">

          <span class="athlete-weight">
            ⚖️ ${escapeHTML(weight)}
          </span>

          <span class="athlete-score">
            امتیاز:
            ${escapeHTML(
              toPersianNumber(score)
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


    grid.appendChild(card);

  });

}


// ======================================
// ATHLETE ERROR
// ======================================

function showAthleteError(message = "") {

  const grid =
    document.getElementById(
      "coachAthleteGrid"
    );

  if (!grid) return;

  grid.innerHTML = `

    <div class="empty-panel">

      <div>⚠️</div>

      <h2>
        خطا در دریافت ورزشکاران
      </h2>

      <p>
        دریافت اطلاعات ورزشکاران انجام نشد.
      </p>

      ${
        message
          ? `
            <small
              style="
                display:block;
                margin-top:10px;
                direction:ltr;
                word-break:break-word;
              "
            >
              ${escapeHTML(message)}
            </small>
          `
          : ""
      }

    </div>

  `;

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
          athleteCategory === category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  renderCoachAthletes(result);

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

function createCoachCategoryFilter(list) {

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


  categories.forEach(category => {

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

  });

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


  if (!firstName || !lastName) {

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


  if (!/^\d{10}$/.test(nationalId)) {

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

          bio:
            bio || null,

          photo_url:
            photoUrl || null,

          total_score:
            0

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

    console.error(error);

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
// CLEAR ATHLETE FORM
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


  fields.forEach(id => {

    const input =
      document.getElementById(id);

    if (input) {
      input.value = "";
    }

  });

}


// ======================================
// EVALUATION ELEMENTS
// ======================================

const evaluationAthleteSelect =
  document.getElementById(
    "evaluationAthleteSelect"
  );

const evaluationPeriodSelect =
  document.getElementById(
    "evaluationPeriodSelect"
  );

const newEvaluationBtn =
  document.getElementById(
    "newEvaluationBtn"
  );

const evaluationsList =
  document.getElementById(
    "evaluationsList"
  );


// ======================================
// LOAD ALL EVALUATION DATA
// ======================================

async function loadEvaluationData() {

  await Promise.all([
    loadEvaluationPeriods(),
    loadEvaluationCriteria()
  ]);

  populateEvaluationAthletes();

  await loadEvaluations();

}


// ======================================
// LOAD PERIODS
// ======================================

async function loadEvaluationPeriods() {

  if (!evaluationPeriodSelect) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_periods")
      .select(`
        id,
        title,
        start_date,
        end_date,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Evaluation periods error:",
      error
    );

    evaluationPeriodSelect.innerHTML = `

      <option value="">
        خطا در دریافت دوره‌ها
      </option>

    `;

    return;
  }


  evaluationPeriods =
    data || [];


  evaluationPeriodSelect.innerHTML = `

    <option value="">
      انتخاب دوره ارزیابی
    </option>

  `;


  evaluationPeriods.forEach(period => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      period.id;

    option.textContent =
      period.title;

    evaluationPeriodSelect.appendChild(
      option
    );

  });


  console.log(
    "Evaluation periods:",
    evaluationPeriods
  );

}


// ======================================
// LOAD CRITERIA
// ======================================

async function loadEvaluationCriteria() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_criteria")
      .select(`
        id,
        name,
        description,
        active,
        created_at
      `)
      .eq(
        "active",
        true
      )
      .order(
        "created_at",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(
      "Evaluation criteria error:",
      error
    );

    evaluationCriteria = [];

    return;
  }


  evaluationCriteria =
    data || [];


  console.log(
    "Evaluation criteria:",
    evaluationCriteria
  );

}


// ======================================
// POPULATE ATHLETE SELECT
// ======================================

function populateEvaluationAthletes() {

  if (!evaluationAthleteSelect) {
    return;
  }


  evaluationAthleteSelect.innerHTML = `

    <option value="">
      انتخاب ورزشکار
    </option>

  `;


  if (!athletes || athletes.length === 0) {

    const option =
      document.createElement(
        "option"
      );

    option.value = "";

    option.textContent =
      "هیچ ورزشکاری ثبت نشده";

    option.disabled =
      true;

    evaluationAthleteSelect.appendChild(
      option
    );

    return;
  }


  athletes.forEach(athlete => {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      athlete.id;


    const name =
      [
        athlete.first_name,
        athlete.last_name
      ]
        .filter(Boolean)
        .join(" ") ||
      "بدون نام";


    option.textContent =
      name;


    evaluationAthleteSelect.appendChild(
      option
    );

  });

}


// ======================================
// NEW EVALUATION
// ======================================

if (newEvaluationBtn) {

  newEvaluationBtn.addEventListener(
    "click",
    openNewEvaluation
  );

}


function openNewEvaluation() {

  const athleteId =
    evaluationAthleteSelect?.value || "";


  const periodId =
    evaluationPeriodSelect?.value || "";


  if (!athleteId) {

    alert(
      "ابتدا یک ورزشکار انتخاب کنید."
    );

    return;
  }


  if (!periodId) {

    alert(
      "ابتدا یک دوره ارزیابی انتخاب کنید."
    );

    return;
  }


  if (
    !evaluationCriteria ||
    evaluationCriteria.length === 0
  ) {

    alert(
      "هیچ معیار فعالی برای ارزیابی وجود ندارد."
    );

    return;
  }


  const athlete =
    athletes.find(
      item =>
        item.id === athleteId
    );


  const period =
    evaluationPeriods.find(
      item =>
        item.id === periodId
    );


  showEvaluationForm(
    athlete,
    period
  );

}


// ======================================
// SHOW EVALUATION FORM
// ======================================

function showEvaluationForm(
  athlete,
  period
) {

  const athleteName =
    [
      athlete?.first_name,
      athlete?.last_name
    ]
      .filter(Boolean)
      .join(" ") ||
    "بدون نام";


  const existingForm =
    document.getElementById(
      "newEvaluationPanel"
    );


  if (existingForm) {
    existingForm.remove();
  }


  const panel =
    document.createElement("div");


  panel.id =
    "newEvaluationPanel";


  panel.className =
    "evaluation-card";


  let criteriaHTML = "";


  evaluationCriteria.forEach(
    (criterion, index) => {

      criteriaHTML += `

        <div
          style="
            margin-bottom:18px;
            padding:15px;
            border:1px solid #eee;
            border-radius:14px;
            background:#fafafa;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              margin-bottom:8px;
            "
          >

            <strong>
              ${escapeHTML(
                criterion.name
              )}
            </strong>

            <span
              id="scoreValue_${index}"
              style="font-weight:bold"
            >
              ۰
            </span>

          </div>


          ${
            criterion.description
              ? `
                <small
                  style="
                    display:block;
                    color:#777;
                    margin-bottom:10px;
                  "
                >
                  ${escapeHTML(
                    criterion.description
                  )}
                </small>
              `
              : ""
          }


          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value="0"
            data-criterion-id="${criterion.id}"
            class="evaluation-score-input"
            data-index="${index}"
            style="width:100%"
          >

          <div
            style="
              display:flex;
              justify-content:space-between;
              color:#888;
              font-size:11px;
              margin-top:4px;
            "
          >

            <span>۰</span>
            <span>۵</span>
            <span>۱۰</span>

          </div>

        </div>

      `;

    }
  );


  panel.innerHTML = `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:15px;
        margin-bottom:20px;
      "
    >

      <div>

        <span class="eyebrow">
          NEW EVALUATION
        </span>

        <h2 style="margin:5px 0">
          ارزیابی جدید
        </h2>

        <p style="margin:0;color:#777">
          ورزشکار:
          <strong>
            ${escapeHTML(athleteName)}
          </strong>
          <br>
          دوره:
          <strong>
            ${escapeHTML(
              period?.title || ""
            )}
          </strong>
        </p>

      </div>

    </div>


    <div>

      ${criteriaHTML}

    </div>


    <label
      style="
        display:block;
        margin-top:10px;
      "
    >

      توضیحات مربی

      <textarea
        id="evaluationNotes"
        rows="4"
        placeholder="توضیحات درباره عملکرد ورزشکار..."
        style="
          width:100%;
          margin-top:7px;
          padding:12px;
          border:1px solid #ddd;
          border-radius:12px;
          font-family:inherit;
          resize:vertical;
        "
      ></textarea>

    </label>


    <div
      style="
        display:flex;
        gap:10px;
        margin-top:18px;
      "
    >

      <button
        class="primary"
        id="saveEvaluationBtn"
        type="button"
      >
        ثبت ارزیابی
      </button>

      <button
        class="secondary"
        id="cancelEvaluationBtn"
        type="button"
      >
        انصراف
      </button>

    </div>

  `;


  evaluationsList.prepend(
    panel
  );


  const inputs =
    panel.querySelectorAll(
      ".evaluation-score-input"
    );


  inputs.forEach(input => {

    input.addEventListener(
      "input",
      () => {

        const index =
          input.dataset.index;

        const value =
          Number(input.value);


        const output =
          document.getElementById(
            `scoreValue_${index}`
          );


        if (output) {

          output.textContent =
            toPersianNumber(
              value
            );

        }

      }
    );

  });


  const saveBtn =
    document.getElementById(
      "saveEvaluationBtn"
    );


  const cancelBtn =
    document.getElementById(
      "cancelEvaluationBtn"
    );


  if (cancelBtn) {

    cancelBtn.addEventListener(
      "click",
      () => {
        panel.remove();
      }
    );

  }


  if (saveBtn) {

    saveBtn.addEventListener(
      "click",
      async () => {

        await saveEvaluation(
          athleteId,
          periodId,
          panel
        );

      }
    );

  }


  panel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ======================================
// SAVE EVALUATION
// ======================================

async function saveEvaluation(
  athleteId,
  periodId,
  panel
) {

  const saveBtn =
    document.getElementById(
      "saveEvaluationBtn"
    );


  if (saveBtn) {

    saveBtn.disabled =
      true;

    saveBtn.textContent =
      "در حال ثبت...";

  }


  try {

    const inputs =
      panel.querySelectorAll(
        ".evaluation-score-input"
      );


    let totalScore =
      0;


    const scoreRows = [];


    inputs.forEach(input => {

      const criterionId =
        input.dataset.criterionId;


      const score =
        Number(input.value);


      totalScore +=
        score;


      scoreRows.push({
        criterion_id:
          criterionId,

        score:
          score
      });

    });


    const average =
      scoreRows.length > 0
        ? totalScore /
          scoreRows.length
        : 0;


    const notes =
      document.getElementById(
        "evaluationNotes"
      )?.value.trim() || null;


    const {
      data: userData,
      error: userError
    } =
      await supabaseClient.auth.getUser();


    if (userError) {
      throw userError;
    }


    const coachId =
      userData?.user?.id || null;


    // -------------------------------
    // CREATE EVALUATION
    // -------------------------------

    const {
      data: evaluation,
      error: evaluationError
    } =
      await supabaseClient
        .from("evaluations")
        .insert({

          athlete_id:
            athleteId,

          period_id:
            periodId,

          coach_id:
            coachId,

          total_score:
            average,

          notes:
            notes

        })
        .select()
        .single();


    if (evaluationError) {

      throw evaluationError;

    }


    // -------------------------------
    // CREATE SCORE ROWS
    // -------------------------------

    const rows =
      scoreRows.map(row => ({

        evaluation_id:
          evaluation.id,

        criterion_id:
          row.criterion_id,

        score:
          row.score

      }));


    const {
      error: scoresError
    } =
      await supabaseClient
        .from("evaluation_scores")
        .insert(rows);


    if (scoresError) {

      // اگر امتیازها ثبت نشدند،
      // ارزیابی اصلی را هم حذف می‌کنیم.

      await supabaseClient
        .from("evaluations")
        .delete()
        .eq(
          "id",
          evaluation.id
        );

      throw scoresError;

    }


    // -------------------------------
    // UPDATE ATHLETE TOTAL SCORE
    // -------------------------------

    await supabaseClient
      .from("athletes")
      .update({
        total_score:
          average
      })
      .eq(
        "id",
        athleteId
      );


    alert(
      "ارزیابی با موفقیت ثبت شد."
    );


    panel.remove();


    await loadAthletes();

    await loadEvaluations();

    updateDashboardStats();


  } catch (error) {

    console.error(
      "Save evaluation error:",
      error
    );


    alert(
      "ثبت ارزیابی انجام نشد.\n\n" +
      (
        error?.message ||
        "خطای نامشخص"
      )
    );


  } finally {

    if (saveBtn) {

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "ثبت ارزیابی";

    }

  }

}


// ======================================
// LOAD EVALUATIONS
// ======================================

async function loadEvaluations() {

  if (!evaluationsList) {
    return;
  }


  const athleteId =
    evaluationAthleteSelect?.value || "";


  const periodId =
    evaluationPeriodSelect?.value || "";


  let query =
    supabaseClient
      .from("evaluations")
      .select(`
        id,
        athlete_id,
        period_id,
        coach_id,
        total_score,
        notes,
        evaluated_at
      `)
      .order(
        "evaluated_at",
        {
          ascending: false
        }
      );


  if (athleteId) {

    query =
      query.eq(
        "athlete_id",
        athleteId
      );

  }


  if (periodId) {

    query =
      query.eq(
        "period_id",
        periodId
      );

  }


  const {
    data,
    error
  } =
    await query;


  if (error) {

    console.error(
      "Load evaluations error:",
      error
    );

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          ⚠️
        </div>

        <h2>
          خطا در دریافت ارزیابی‌ها
        </h2>

        <p>
          ${escapeHTML(
            error.message
          )}
        </p>

      </div>

    `;

    return;
  }


  if (!data || data.length === 0) {

    evaluationsList.innerHTML = `

      <div class="evaluation-empty">

        <div class="evaluation-empty-icon">
          📊
        </div>

        <h2>
          هنوز ارزیابی‌ای ثبت نشده است
        </h2>

        <p>
          برای شروع، یک ورزشکار و دوره ارزیابی انتخاب کنید.
        </p>

      </div>

    `;

    return;

  }


  evaluationsList.innerHTML = "";


  for (const evaluation of data) {

    await renderEvaluationCard(
      evaluation
    );

  }

}


// ======================================
// RENDER EVALUATION CARD
// ======================================

async function renderEvaluationCard(
  evaluation
) {

  const athlete =
    athletes.find(
      item =>
        item.id ===
        evaluation.athlete_id
    );


  const period =
    evaluationPeriods.find(
      item =>
        item.id ===
        evaluation.period_id
    );


  let scoreRows = [];


  const {
    data,
    error
  } =
    await supabaseClient
      .from("evaluation_scores")
      .select(`
        id,
        criterion_id,
        score
      `)
      .eq(
        "evaluation_id",
        evaluation.id
      );


  if (!error) {

    scoreRows =
      data || [];

  }


  const athleteName =
    [
      athlete?.first_name,
      athlete?.last_name
    ]
      .filter(Boolean)
      .join(" ") ||
    "بدون نام";


  const card =
    document.createElement("div");


  card.className =
    "evaluation-card";


  let criteriaHTML = "";


  scoreRows.forEach(row => {

    const criterion =
      evaluationCriteria.find(
        item =>
          item.id ===
          row.criterion_id
      );


    if (!criterion) {
      return;
    }


    const score =
      Number(row.score) || 0;


    const width =
      Math.max(
        0,
        Math.min(
          100,
          score * 10
        )
      );


    criteriaHTML += `

      <div class="criteria-preview-row">

        <div class="criteria-preview-name">
          ${escapeHTML(
            criterion.name
          )}
        </div>

        <div class="criteria-preview-bar">

          <div
            class="criteria-preview-fill"
            style="width:${width}%"
          ></div>

        </div>

        <div class="criteria-preview-score">

          ${escapeHTML(
            toPersianNumber(score)
          )}

        </div>

      </div>

    `;

  });


  card.innerHTML = `

    <div class="evaluation-card-header">

      <div class="evaluation-athlete">

        <div class="evaluation-avatar">

          ${
            athlete?.photo_url
              ? `
                <img
                  src="${escapeHTML(
                    athlete.photo_url
                  )}"
                  alt="${escapeHTML(
                    athleteName
                  )}"
                >
              `
              : "🥋"
          }

        </div>


        <div>

          <h3>
            ${escapeHTML(
              athleteName
            )}
          </h3>

          <p>
            ${
              escapeHTML(
                period?.title ||
                "دوره نامشخص"
              )
            }
          </p>

        </div>

      </div>


      <div class="evaluation-score">

        <span>
          میانگین
        </span>

        <strong>
          ${escapeHTML(
            toPersianNumber(
              Number(
                evaluation.total_score || 0
              ).toFixed(1)
            )
          )}
        </strong>

      </div>

    </div>


    <div class="criteria-preview">

      ${
        criteriaHTML ||
        `
          <p style="color:#777">
            جزئیات معیارها موجود نیست.
          </p>
        `
      }

    </div>


    ${
      evaluation.notes
        ? `
          <div
            style="
              margin-top:18px;
              padding:12px;
              background:#f8f8f8;
              border-radius:12px;
              color:#555;
            "
          >
            <strong>
              توضیحات مربی:
            </strong>

            ${escapeHTML(
              evaluation.notes
            )}
          </div>
        `
        : ""
    }

  `;


  evaluationsList.appendChild(
    card
  );

}


// ======================================
// EVALUATION FILTER EVENTS
// ======================================

if (evaluationAthleteSelect) {

  evaluationAthleteSelect.addEventListener(
    "change",
    () => {

      loadEvaluations();

    }
  );

}


if (evaluationPeriodSelect) {

  evaluationPeriodSelect.addEventListener(
    "change",
    () => {

      loadEvaluations();

    }
  );

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
// PERSIAN NUMBERS
// ======================================

function toPersianNumber(value) {

  return String(value)
    .replace(
      /\d/g,
      digit =>
        "۰۱۲۳۴۵۶۷۸۹"[digit]
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


  // برای اینکه با باز شدن صفحه
  // ارزیابی‌ها هم آماده باشند

  await loadEvaluationData();

}


startCoachApp();
