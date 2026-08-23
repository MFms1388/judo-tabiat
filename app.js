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

  if (!username || !password) return;


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


  loginSubmit.disabled = true;

  loginSubmit.textContent =
    "در حال ورود...";


  const {
    data,
    error
  } =
    await supabaseClient.auth.signInWithPassword({

      email: email,

      password: pass

    });


  loginSubmit.disabled = false;

  loginSubmit.textContent =
    "ورود";


  if (error) {

    console.error(error);

    alert(
      "ایمیل یا رمز عبور اشتباه است."
    );

    return;

  }


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

  const {
    data,
    error
  } =
    await supabaseClient
      .from("athletes")
      .select("*")
      .order(
        "created_at",
        {
          ascending:false
        }
      );


  if (error) {

    console.error(
      "Supabase error:",
      error
    );

    showEmptyState(
      "خطا در دریافت اطلاعات ورزشکاران"
    );

    return;

  }


  athletes =
    data || [];


  createCategoryFilter(
    athletes
  );


  renderAthletes(
    athletes
  );

}


// ======================================
// RENDER ATHLETES
// ======================================

function renderAthletes(list) {

  if (!grid) return;


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


      const belt =
        athlete.belt ||
        "کمربند ثبت نشده";


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
              ${belt}
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
