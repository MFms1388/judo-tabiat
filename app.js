// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd
";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================
// LOGIN MODAL
// ======================================

const modal =
  document.getElementById("loginModal");

const open = () => {
  modal.classList.remove("hidden");
};

const close = () => {
  modal.classList.add("hidden");
};


document
  .getElementById("loginBtn")
  .addEventListener("click", open);


document
  .getElementById("coachLogin")
  .addEventListener("click", open);


document
  .getElementById("closeModal")
  .addEventListener("click", close);


modal.addEventListener("click", e => {

  if (e.target === modal) {
    close();
  }

});


// ======================================
// ELEMENTS
// ======================================

const grid =
  document.getElementById("athleteGrid");

const emptyState =
  document.getElementById("emptyState");

const searchInput =
  document.getElementById("search");

const filterSelect =
  document.getElementById("filter");


// ======================================
// DATA
// ======================================

let athletes = [];


// ======================================
// LOAD ATHLETES FROM SUPABASE
// ======================================

async function loadAthletes() {

  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("athletes")
      .select("*")
      .order("id", {
        ascending: false
      });


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


    athletes = data || [];


    createCategoryFilter(
      athletes
    );


    renderAthletes(
      athletes
    );

  }

  catch (error) {

    console.error(error);

    showEmptyState(
      "اتصال به پایگاه داده برقرار نشد."
    );

  }

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


  emptyState.classList.add(
    "hidden"
  );

  grid.classList.remove(
    "hidden"
  );


  list.forEach(athlete => {

    const card =
      document.createElement("div");


    card.className =
      "athlete-card";


    const name =
      athlete.full_name ||
      athlete.name ||
      "بدون نام";


    const category =
      athlete.age_group ||
      athlete.category ||
      "رده ثبت نشده";


    const weight =
      athlete.weight
        ? `${athlete.weight} کیلوگرم`
        : "وزن ثبت نشده";


    const belt =
      athlete.belt ||
      athlete.belt_level ||
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


    grid.appendChild(card);

  });

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
    emptyState.querySelector("h3");


  if (title) {
    title.textContent = message;
  }


  if (grid) {
    grid.classList.add("hidden");
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
              athlete.age_group ||
              athlete.category
          )
          .filter(Boolean)

      )
    ];


  filterSelect.innerHTML = `

    <option value="all">
      همه رده‌ها
    </option>

  `;


  categories.forEach(category => {

    const option =
      document.createElement("option");


    option.value = category;

    option.textContent = category;


    filterSelect.appendChild(
      option
    );

  });

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
    athletes.filter(athlete => {

      const name =
        (
          athlete.full_name ||
          athlete.name ||
          ""
        ).toLowerCase();


      const athleteCategory =
        athlete.age_group ||
        athlete.category ||
        "";


      const matchesSearch =
        name.includes(search);


      const matchesCategory =
        category === "all" ||
        athleteCategory === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  renderAthletes(result);

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
