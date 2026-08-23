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

const coachLogin =
  document.getElementById("coachLogin");

const closeModal =
  document.getElementById("closeModal");

const loginSubmit =
  document.getElementById("loginSubmit");

const username =
  document.getElementById("username");

const password =
  document.getElementById("password");

const grid =
  document.getElementById("athleteGrid");

const emptyState =
  document.getElementById("emptyState");

const searchInput =
  document.getElementById("search");

const filterSelect =
  document.getElementById("filter");


// ======================================
// LOGIN MODAL
// ======================================

function openLogin() {

  if (!modal) return;

  modal.classList.remove("hidden");

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


if (coachLogin) {

  coachLogin.addEventListener(
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
// COACH LOGIN
// ======================================

async function loginCoach() {

  if (!username || !password) {

    alert(
      "بخش ورود به درستی بارگذاری نشده است."
    );

    return;

  }


  const email =
    username.value.trim();

  const pass =
    password.value;


  if (!email || !pass) {

    alert(
      "ایمیل و رمز عبور را وارد کنید."
    );

    return;

  }


  if (loginSubmit) {

    loginSubmit.disabled = true;

    loginSubmit.textContent =
      "در حال ورود...";

  }


  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword({

      email: email,

      password: pass

    });


  if (loginSubmit) {

    loginSubmit.disabled = false;

    loginSubmit.textContent =
      "ورود";

  }


  if (error) {

    console.error(
      "Login error:",
      error
    );

    alert(
      "ایمیل یا رمز عبور اشتباه است."
    );

    return;

  }


  console.log(
    "Coach logged in:",
    data
  );


  closeLogin();


  window.location.href =
    "coach.html";

}


if (loginSubmit) {

  loginSubmit.addEventListener(
    "click",
    loginCoach
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

  console.log(
    "شروع دریافت ورزشکاران..."
  );


  try {

    const result =
      await supabaseClient
        .from("athletes")
        .select(
          "id, first_name, last_name, age_group, weight, total_score, created_at"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    console.log(
      "Supabase result:",
      result
    );


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      console.error(
        "SUPABASE ERROR:",
        error
      );


      showEmptyState(
        "خطا در دریافت اطلاعات ورزشکاران: " +
        error.message
      );

      return;

    }


    athletes =
      data || [];


    console.log(
      "Athletes:",
      athletes
    );


    createCategoryFilter(
      athletes
    );


    renderAthletes(
      athletes
    );


  } catch (error) {

    console.error(
      "GENERAL ERROR:",
      error
    );


    showEmptyState(
      "خطای اتصال به پایگاه داده: " +
      error.message
    );

  }

}


// ======================================
// RENDER ATHLETES
// ======================================

function renderAthletes(list) {

  if (!grid) {

    console.error(
      "athleteGrid پیدا نشد."
    );

    return;

  }


  grid.innerHTML = "";


  if (!list.length) {

    showEmptyState(
      "ورزشکاری برای نمایش وجود ندارد."
    );

    return;

  }


  if (emptyState) {

    emptyState.classList.add(
      "hidden"
    );

  }


  grid.classList.remove(
    "hidden"
  );


  list.forEach(
    athlete => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "athlete-card";


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
          : "0";


      card.innerHTML = `

        <div class="athlete-card-icon">
          🥋
        </div>

        <div class="athlete-card-content">

          <h3>
            ${name}
          </h3>

          <p>
            ${category} • ${weight}
          </p>

          <div class="athlete-card-footer">

            <span>
              امتیاز ${score}/10
            </span>

            <strong>
              مشاهده پروفایل
            </strong>

          </div>

        </div>

      `;


      card.addEventListener(
        "click",
        () => {

          window.location.href =
            `athlete.html?id=${athlete.id}`;

        }
      );


      grid.appendChild(
        card
      );

    }
  );

}


// ======================================
// EMPTY STATE
// ======================================

function showEmptyState(message) {

  if (!emptyState) return;


  emptyState.classList.remove(
    "hidden"
  );


  const title =
    emptyState.querySelector(
      "h3"
    );


  if (title) {

    title.textContent =
      message;

  }


  if (grid) {

    grid.classList.add(
      "hidden"
    );

  }

}


// ======================================
// CATEGORY FILTER
// ======================================

function createCategoryFilter(list) {

  if (!filterSelect) return;


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


  filterSelect.innerHTML = `

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


      filterSelect.appendChild(
        option
      );

    }
  );

}


// ======================================
// SEARCH + FILTER
// ======================================

function filterAthletes() {

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const category =
    filterSelect
      ? filterSelect.value
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


        const athleteCategory =
          athlete.age_group ||
          "";


        const matchesSearch =
          name.includes(
            search
          );


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


  renderAthletes(
    result
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "input",
    filterAthletes
  );

}


if (filterSelect) {

  filterSelect.addEventListener(
    "change",
    filterAthletes
  );

}


// ======================================
// START
// ======================================

loadAthletes();
