"use strict";

/* =========================================================
   JUDO TABIAT - MAIN APP
   نسخه جدید و ایمن‌تر
   ---------------------------------------------------------
   مسئولیت‌ها:
   1. اتصال Supabase
   2. ورود مربی
   3. ورود ورزشکار
   4. انتخاب نقش
   5. حفظ لود و نمایش ورزشکاران
   6. جستجو و فیلتر ورزشکاران
   7. انتقال صحیح به صفحات مربوطه
========================================================= */

(function () {

    /* =====================================================
       CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://bkkdgywdptufjsaepehc.supabase.co";

    /*
      کلید publishable قبلی پروژه خودت را اینجا قرار بده.
      اگر در app.js قبلی همین کلید را داری،
      همان مقدار قبلی را بدون تغییر نگه دار.
    */
    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let supabaseClient = null;

    const state = {
        athletes: [],
        filteredAthletes: [],
        loadingAthletes: false,

        loggedIn: false,
        session: null,

        currentRole: null,
        currentAthlete: null
    };


    /* =====================================================
       SUPABASE INITIALIZATION
    ===================================================== */

    function initSupabase() {

        if (supabaseClient) {
            return supabaseClient;
        }

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function"
        ) {
            console.error(
                "Supabase library was not loaded."
            );

            return null;
        }

        try {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY
                );

            /*
              برای فایل‌های دیگر سایت هم قابل استفاده باشد.
            */
            window.supabaseClient =
                supabaseClient;

            return supabaseClient;

        } catch (error) {

            console.error(
                "Supabase initialization error:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function $(selector) {
        return document.querySelector(selector);
    }

    function $all(selector) {
        return Array.from(
            document.querySelectorAll(selector)
        );
    }


    /* =====================================================
       MESSAGE HELPERS
    ===================================================== */

    function showMessage(
        element,
        message,
        type = "error"
    ) {

        if (!element) {
            return;
        }

        element.textContent = message;

        element.className =
            "login-message " + type;
    }


    function clearMessage(element) {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.className =
            "login-message";
    }


    /* =====================================================
       ROLE MODAL
    ===================================================== */

    function openRoleModal() {

        const modal =
            $("#roleModal");

        if (!modal) {
            return;
        }

        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        showRoleSelection();
    }


    function closeRoleModal() {

        const modal =
            $("#roleModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        showRoleSelection();
    }


    function showRoleSelection() {

        const roleSelection =
            $("#roleSelection");

        const coachSection =
            $("#coachLoginSection");

        const athleteSection =
            $("#athleteLoginSection");

        if (roleSelection) {
            roleSelection.classList.add(
                "active"
            );
        }

        if (coachSection) {
            coachSection.classList.remove(
                "active"
            );
        }

        if (athleteSection) {
            athleteSection.classList.remove(
                "active"
            );
        }

        state.currentRole = null;
    }


    function showCoachLogin() {

        const roleSelection =
            $("#roleSelection");

        const coachSection =
            $("#coachLoginSection");

        const athleteSection =
            $("#athleteLoginSection");

        if (roleSelection) {
            roleSelection.classList.remove(
                "active"
            );
        }

        if (athleteSection) {
            athleteSection.classList.remove(
                "active"
            );
        }

        if (coachSection) {
            coachSection.classList.add(
                "active"
            );
        }

        state.currentRole = "coach";

        clearMessage(
            $("#coachLoginMessage")
        );

        setTimeout(function () {

            const email =
                $("#coachEmail");

            if (email) {
                email.focus();
            }

        }, 100);
    }


    function showAthleteLogin() {

        const roleSelection =
            $("#roleSelection");

        const coachSection =
            $("#coachLoginSection");

        const athleteSection =
            $("#athleteLoginSection");

        if (roleSelection) {
            roleSelection.classList.remove(
                "active"
            );
        }

        if (coachSection) {
            coachSection.classList.remove(
                "active"
            );
        }

        if (athleteSection) {
            athleteSection.classList.add(
                "active"
            );
        }

        state.currentRole = "athlete";

        clearMessage(
            $("#athleteLoginMessage")
        );

        setTimeout(function () {

            const username =
                $("#athleteUsername");

            if (username) {
                username.focus();
            }

        }, 100);
    }


    /* =====================================================
       ROLE EVENTS
    ===================================================== */

    function setupRoleSystem() {

        const systemLoginBtn =
            $("#systemLoginBtn");

        const closeBtn =
            $("#closeRoleModal");

        const coachRoleBtn =
            $("#selectCoachRole");

        const athleteRoleBtn =
            $("#selectAthleteRole");

        if (systemLoginBtn) {

            systemLoginBtn.addEventListener(
                "click",
                openRoleModal
            );
        }

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closeRoleModal
            );
        }

        if (coachRoleBtn) {

            coachRoleBtn.addEventListener(
                "click",
                showCoachLogin
            );
        }

        if (athleteRoleBtn) {

            athleteRoleBtn.addEventListener(
                "click",
                showAthleteLogin
            );
        }


        $all("[data-back-role]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    showRoleSelection
                );

            });


        const modal =
            $("#roleModal");

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {
                        closeRoleModal();
                    }

                }
            );
        }


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    const modal =
                        $("#roleModal");

                    if (
                        modal &&
                        modal.classList.contains(
                            "active"
                        )
                    ) {
                        closeRoleModal();
                    }

                }

            }
        );
    }


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    function setupPasswordToggles() {

        $all(
            "[data-password-toggle]"
        ).forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const inputId =
                        button.getAttribute(
                            "data-password-toggle"
                        );

                    const input =
                        document.getElementById(
                            inputId
                        );

                    if (!input) {
                        return;
                    }

                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                        button.textContent =
                            "🙈";

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "👁️";
                    }

                }
            );

        });
    }


    /* =====================================================
       NORMALIZE NATIONAL ID
    ===================================================== */

    function normalizeDigits(value) {

        if (!value) {
            return "";
        }

        return String(value)
            .replace(/۰/g, "0")
            .replace(/۱/g, "1")
            .replace(/۲/g, "2")
            .replace(/۳/g, "3")
            .replace(/۴/g, "4")
            .replace(/۵/g, "5")
            .replace(/۶/g, "6")
            .replace(/۷/g, "7")
            .replace(/۸/g, "8")
            .replace(/۹/g, "9")
            .replace(/\s/g, "")
            .trim();
    }


    function setupNationalIdInput() {

        const input =
            $("#athleteNationalId");

        if (!input) {
            return;
        }

        input.addEventListener(
            "input",
            function () {

                this.value =
                    normalizeDigits(
                        this.value
                    )
                    .replace(
                        /[^0-9]/g,
                        ""
                    )
                    .slice(0, 10);

            }
        );
    }


    /* =====================================================
       COACH LOGIN
    ===================================================== */

    async function loginCoach(event) {

        event.preventDefault();

        const client =
            initSupabase();

        const emailInput =
            $("#coachEmail");

        const passwordInput =
            $("#coachPassword");

        const submitButton =
            $("#coachLoginSubmit");

        const message =
            $("#coachLoginMessage");

        if (!client) {

            showMessage(
                message,
                "اتصال به سامانه برقرار نشد. لطفاً صفحه را دوباره باز کنید."
            );

            return;
        }

        const email =
            emailInput
                ? emailInput.value.trim()
                : "";

        const password =
            passwordInput
                ? passwordInput.value
                : "";

        clearMessage(message);

        if (!email || !password) {

            showMessage(
                message,
                "ایمیل و رمز عبور را کامل وارد کنید."
            );

            return;
        }


        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "⏳ در حال ورود...";
        }


        try {

            const {
                data,
                error
            } =
                await client.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                console.error(
                    "Coach login error:",
                    error
                );

                showMessage(
                    message,
                    "ایمیل یا رمز عبور صحیح نیست."
                );

                return;
            }


            if (
                !data ||
                !data.session
            ) {

                showMessage(
                    message,
                    "ورود انجام نشد. لطفاً دوباره تلاش کنید."
                );

                return;
            }


            state.loggedIn = true;
            state.session =
                data.session;


            /*
              برای سازگاری با نسخه قبلی سایت.
            */
            localStorage.setItem(
                "judoLoggedIn",
                "true"
            );

            localStorage.setItem(
                "judoLoginTime",
                String(Date.now())
            );


            showMessage(
                message,
                "ورود موفق بود. در حال انتقال...",
                "success"
            );


            setTimeout(function () {

                window.location.href =
                    "coach.html";

            }, 500);


        } catch (error) {

            console.error(
                "Unexpected coach login error:",
                error
            );

            showMessage(
                message,
                "خطایی هنگام ورود رخ داد."
            );

        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "🔐 ورود به پنل مربی";
            }

        }
    }


    /* =====================================================
       ATHLETE FIND
    ===================================================== */

    async function findAthlete(
        username,
        nationalId
    ) {

        const client =
            initSupabase();

        if (!client) {
            throw new Error(
                "Supabase is not initialized."
            );
        }


        /*
          اول username + national_id را با هم امتحان می‌کنیم.
        */

        let query =
            client
                .from("athletes")
                .select("*")
                .eq(
                    "national_id",
                    nationalId
                );


        /*
          اگر ستون username در جدول موجود باشد،
          این فیلتر اعمال می‌شود.
        */

        let result =
            await query;

        if (result.error) {

            console.error(
                "Athlete lookup error:",
                result.error
            );

            throw result.error;
        }


        const athletes =
            result.data || [];


        /*
          username را در سمت کلاینت بررسی می‌کنیم
          تا اگر نام ستون در نسخه فعلی جدول متفاوت بود،
          کل سایت از کار نیفتد.
        */

        const normalizedUsername =
            String(username)
                .trim()
                .toLowerCase();


        const athlete =
            athletes.find(
                function (item) {

                    const possibleUsernames = [

                        item.username,

                        item.user_name,

                        item.userName,

                        item.login_username,

                        item.loginUsername

                    ];

                    return possibleUsernames
                        .some(function (value) {

                            return (
                                value !== null &&
                                value !== undefined &&
                                String(value)
                                    .trim()
                                    .toLowerCase() ===
                                    normalizedUsername
                            );

                        });

                }
            );


        if (!athlete) {

            return null;
        }


        return athlete;
    }


    /* =====================================================
       ATHLETE AUTH EMAIL
    ===================================================== */

    function getAthleteAuthEmail(
        athlete
    ) {

        if (!athlete) {
            return null;
        }


        /*
          بهترین حالت:
          auth_email در جدول athletes ذخیره شود.
        */

        const possibleEmails = [

            athlete.auth_email,

            athlete.authEmail,

            athlete.email,

            athlete.login_email,

            athlete.loginEmail

        ];


        for (
            let i = 0;
            i < possibleEmails.length;
            i++
        ) {

            const email =
                possibleEmails[i];

            if (
                email &&
                String(email).includes("@")
            ) {

                return String(email).trim();
            }
        }


        /*
          اگر auth_email موجود نبود،
          از auth_user_id به‌تنهایی نمی‌توان
          signInWithPassword انجام داد.
        */

        return null;
    }


    /* =====================================================
       ATHLETE LOGIN
    ===================================================== */

    async function loginAthlete(event) {

        event.preventDefault();

        const client =
            initSupabase();

        const usernameInput =
            $("#athleteUsername");

        const nationalIdInput =
            $("#athleteNationalId");

        const passwordInput =
            $("#athletePassword");

        const submitButton =
            $("#athleteLoginSubmit");

        const message =
            $("#athleteLoginMessage");


        if (!client) {

            showMessage(
                message,
                "اتصال به سامانه برقرار نشد. لطفاً صفحه را دوباره باز کنید."
            );

            return;
        }


        const username =
            usernameInput
                ? usernameInput.value.trim()
                : "";


        const nationalId =
            nationalIdInput
                ? normalizeDigits(
                    nationalIdInput.value
                )
                : "";


        const password =
            passwordInput
                ? passwordInput.value
                : "";


        clearMessage(message);


        if (!username) {

            showMessage(
                message,
                "نام کاربری را وارد کنید."
            );

            return;
        }


        if (!nationalId) {

            showMessage(
                message,
                "کد ملی را وارد کنید."
            );

            return;
        }


        if (
            nationalId.length !== 10
        ) {

            showMessage(
                message,
                "کد ملی باید ۱۰ رقم باشد."
            );

            return;
        }


        if (!password) {

            showMessage(
                message,
                "رمز عبور را وارد کنید."
            );

            return;
        }


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.textContent =
                "⏳ در حال بررسی...";
        }


        try {

            /*
              مرحله ۱:
              پیدا کردن ورزشکار
            */

            const athlete =
                await findAthlete(
                    username,
                    nationalId
                );


            if (!athlete) {

                showMessage(
                    message,
                    "نام کاربری یا کد ملی صحیح نیست."
                );

                return;
            }


            /*
              مرحله ۲:
              پیدا کردن ایمیل Auth
            */

            const authEmail =
                getAthleteAuthEmail(
                    athlete
                );


            if (!authEmail) {

                console.error(
                    "Athlete found but no auth email:",
                    athlete
                );

                showMessage(
                    message,
                    "حساب ورود این ورزشکار هنوز در سامانه احراز هویت ثبت نشده است. ابتدا حساب ورزشکار را در Supabase تنظیم کنید."
                );

                return;
            }


            /*
              مرحله ۳:
              ورود واقعی با Supabase Auth
            */

            const {
                data,
                error
            } =
                await client.auth.signInWithPassword({

                    email: authEmail,

                    password: password

                });


            if (error) {

                console.error(
                    "Athlete auth error:",
                    error
                );

                showMessage(
                    message,
                    "رمز عبور صحیح نیست."
                );

                return;
            }


            if (
                !data ||
                !data.session ||
                !data.user
            ) {

                showMessage(
                    message,
                    "ورود انجام نشد. دوباره تلاش کنید."
                );

                return;
            }


            /*
              ذخیره اطلاعات لازم برای پروفایل
            */

            state.loggedIn =
                true;

            state.session =
                data.session;

            state.currentAthlete =
                athlete;


            localStorage.setItem(
                "judoAthleteLoggedIn",
                "true"
            );

            localStorage.setItem(
                "judoAthleteId",
                String(athlete.id)
            );

            localStorage.setItem(
                "judoAthleteLoginTime",
                String(Date.now())
            );


            showMessage(
                message,
                "ورود موفق بود. در حال انتقال به پروفایل...",
                "success"
            );


            /*
              انتقال به پروفایل واقعی همان ورزشکار
            */

            setTimeout(function () {

                window.location.href =
                    "athlete.html?id=" +
                    encodeURIComponent(
                        athlete.id
                    );

            }, 600);


        } catch (error) {

            console.error(
                "Unexpected athlete login error:",
                error
            );

            showMessage(
                message,
                "خطایی هنگام ورود ورزشکار رخ داد."
            );

        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "🥋 ورود به پروفایل";
            }

        }
    }


    /* =====================================================
       FORM EVENTS
    ===================================================== */

    function setupLoginForms() {

        const coachForm =
            $("#coachLoginForm");

        const athleteForm =
            $("#athleteLoginForm");


        if (coachForm) {

            coachForm.addEventListener(
                "submit",
                loginCoach
            );
        }


        if (athleteForm) {

            athleteForm.addEventListener(
                "submit",
                loginAthlete
            );
        }
    }


    /* =====================================================
       AUTH SESSION
    ===================================================== */

    async function checkAuthSession() {

        const client =
            initSupabase();

        if (!client) {
            return;
        }


        try {

            const {
                data,
                error
            } =
                await client.auth.getSession();


            if (error) {

                console.warn(
                    "Session check error:",
                    error
                );

                return;
            }


            if (
                data &&
                data.session
            ) {

                state.loggedIn =
                    true;

                state.session =
                    data.session;

            }

        } catch (error) {

            console.warn(
                "Could not check session:",
                error
            );
        }
    }


    /* =====================================================
       AUTH LISTENER
    ===================================================== */

    function setupAuthListener() {

        const client =
            initSupabase();

        if (!client) {
            return;
        }


        client.auth.onAuthStateChange(
            function (
                event,
                session
            ) {

                state.session =
                    session;

                state.loggedIn =
                    !!session;


                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    state.currentAthlete =
                        null;

                    localStorage.removeItem(
                        "judoLoggedIn"
                    );

                    localStorage.removeItem(
                        "judoAthleteLoggedIn"
                    );

                    localStorage.removeItem(
                        "judoAthleteId"
                    );
                }

            }
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    async function logout() {

        const client =
            initSupabase();

        if (!client) {
            return;
        }

        try {

            await client.auth.signOut();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );
        }


        state.loggedIn =
            false;

        state.session =
            null;

        state.currentAthlete =
            null;


        localStorage.removeItem(
            "judoLoggedIn"
        );

        localStorage.removeItem(
            "judoLoginTime"
        );

        localStorage.removeItem(
            "judoAthleteLoggedIn"
        );

        localStorage.removeItem(
            "judoAthleteId"
        );
    }


    /* =====================================================
       PUBLIC ATHLETES
    ===================================================== */

    async function loadAthletes() {

        const client =
            initSupabase();

        if (!client) {
            return;
        }


        state.loadingAthletes =
            true;


        try {

            const {
                data,
                error
            } =
                await client
                    .from("athletes")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                /*
                  اگر created_at وجود نداشت،
                  دوباره بدون order امتحان می‌کنیم.
                */

                const fallback =
                    await client
                        .from("athletes")
                        .select("*");


                if (fallback.error) {

                    console.error(
                        "Athletes load error:",
                        fallback.error
                    );

                    state.athletes =
                        [];

                    renderAthletes();

                    return;
                }

                state.athletes =
                    fallback.data || [];

            } else {

                state.athletes =
                    data || [];
            }


            state.filteredAthletes =
                [...state.athletes];


            renderAthletes();


        } catch (error) {

            console.error(
                "Unexpected athletes error:",
                error
            );

            state.athletes =
                [];

            state.filteredAthletes =
                [];

            renderAthletes();

        } finally {

            state.loadingAthletes =
                false;
        }
    }


    /* =====================================================
       ATHLETE CARD
    ===================================================== */

    function createAthleteCard(
        athlete
    ) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "athlete-card";


        const firstName =
            athlete.first_name ||
            athlete.firstName ||
            "";


        const lastName =
            athlete.last_name ||
            athlete.lastName ||
            "";


        const fullName =
            (
                firstName +
                " " +
                lastName
            ).trim() ||
            athlete.name ||
            "ورزشکار";


        const ageGroup =
            athlete.age_group ||
            athlete.ageGroup ||
            "";


        const weight =
            athlete.weight ||
            "";


        const photo =
            athlete.photo_url ||
            athlete.photoUrl ||
            "";


        const initials =
            fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(function (part) {
                    return part.charAt(0);
                })
                .join("");


        let photoHTML;


        if (photo) {

            photoHTML = `
                <img
                    src="${escapeHtml(photo)}"
                    alt="${escapeHtml(fullName)}"
                    class="athlete-card-photo"
                    loading="lazy"
                >
            `;

        } else {

            photoHTML = `
                <div class="athlete-card-placeholder">
                    ${escapeHtml(initials || "🥋")}
                </div>
            `;
        }


        card.innerHTML = `

            <div class="athlete-card-image">
                ${photoHTML}
            </div>

            <div class="athlete-card-body">

                <h3 class="athlete-card-name">
                    ${escapeHtml(fullName)}
                </h3>

                ${
                    ageGroup
                        ? `
                            <div class="athlete-card-meta">
                                ${escapeHtml(ageGroup)}
                            </div>
                          `
                        : ""
                }

                ${
                    weight
                        ? `
                            <div class="athlete-card-meta">
                                وزن: ${escapeHtml(weight)}
                            </div>
                          `
                        : ""
                }

            </div>
        `;


        /*
          اگر صفحه پروفایل عمومی برای id وجود دارد،
          کارت را قابل کلیک می‌کنیم.
        */

        if (athlete.id !== undefined) {

            card.style.cursor =
                "pointer";

            card.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "athlete.html?id=" +
                        encodeURIComponent(
                            athlete.id
                        );

                }
            );
        }


        return card;
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

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


    /* =====================================================
       RENDER ATHLETES
    ===================================================== */

    function renderAthletes() {

        const container =
            document.querySelector(
                "#athletesContainer"
            ) ||
            document.querySelector(
                ".athletes-grid"
            ) ||
            document.querySelector(
                ".athletes-list"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (
            state.filteredAthletes.length === 0
        ) {

            const empty =
                document.querySelector(
                    "#athletesEmpty"
                ) ||
                document.querySelector(
                    ".athletes-empty"
                );


            if (empty) {

                empty.style.display =
                    "block";

                container.appendChild(
                    empty
                );

            } else {

                container.innerHTML = `
                    <div class="athletes-empty">
                        <div>🥋</div>
                        <p>ورزشکاری برای نمایش وجود ندارد.</p>
                    </div>
                `;
            }

            return;
        }


        const empty =
            document.querySelector(
                "#athletesEmpty"
            );

        if (empty) {
            empty.style.display =
                "none";
        }


        state.filteredAthletes
            .forEach(function (athlete) {

                container.appendChild(
                    createAthleteCard(
                        athlete
                    )
                );

            });
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function setupAthleteSearch() {

        const searchInput =
            document.querySelector(
                "#athleteSearch"
            ) ||
            document.querySelector(
                ".athlete-search"
            );


        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "input",
            function () {

                filterAthletes(
                    this.value
                );

            }
        );
    }


    function filterAthletes(
        searchTerm = ""
    ) {

        const query =
            String(searchTerm)
                .trim()
                .toLowerCase();


        if (!query) {

            state.filteredAthletes =
                [...state.athletes];

            renderAthletes();

            return;
        }


        state.filteredAthletes =
            state.athletes.filter(
                function (athlete) {

                    const firstName =
                        athlete.first_name ||
                        athlete.firstName ||
                        "";

                    const lastName =
                        athlete.last_name ||
                        athlete.lastName ||
                        "";

                    const name =
                        athlete.name ||
                        "";

                    const nationalId =
                        athlete.national_id ||
                        athlete.nationalId ||
                        "";

                    const ageGroup =
                        athlete.age_group ||
                        athlete.ageGroup ||
                        "";


                    const text = [

                        firstName,
                        lastName,
                        name,
                        nationalId,
                        ageGroup

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        query
                    );
                }
            );


        renderAthletes();
    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    function setupCategoryFilter() {

        const filter =
            document.querySelector(
                "#athleteCategory"
            ) ||
            document.querySelector(
                "#categoryFilter"
            );


        if (!filter) {
            return;
        }


        filter.addEventListener(
            "change",
            function () {

                const value =
                    String(
                        this.value || ""
                    )
                    .trim()
                    .toLowerCase();


                if (!value) {

                    state.filteredAthletes =
                        [...state.athletes];

                    renderAthletes();

                    return;
                }


                state.filteredAthletes =
                    state.athletes.filter(
                        function (athlete) {

                            const ageGroup =
                                String(
                                    athlete.age_group ||
                                    athlete.ageGroup ||
                                    ""
                                )
                                .trim()
                                .toLowerCase();


                            return (
                                ageGroup ===
                                value
                            );
                        }
                    );


                renderAthletes();
            }
        );
    }


    /* =====================================================
       AUTH REDIRECT PROTECTION
    ===================================================== */

    function protectCoachPage() {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentPage !==
            "coach.html"
        ) {
            return;
        }


        /*
          اجازه می‌دهیم coach.html
          خودش هم Auth را بررسی کند.
          اینجا redirect اجباری انجام نمی‌دهیم
          تا نسخه فعلی پنل خراب نشود.
        */
    }


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.JudoTabiat = {

        openRoleModal:
            openRoleModal,

        closeRoleModal:
            closeRoleModal,

        showCoachLogin:
            showCoachLogin,

        showAthleteLogin:
            showAthleteLogin,

        logout:
            logout,

        loadAthletes:
            loadAthletes,

        filterAthletes:
            filterAthletes,

        getState:
            function () {
                return state;
            },

        getSupabase:
            function () {
                return initSupabase();
            }

    };


    /* =====================================================
       INIT
    ===================================================== */

    async function init() {

        /*
          اول Supabase
        */

        initSupabase();


        /*
          بعد UI
        */

        setupRoleSystem();

        setupPasswordToggles();

        setupNationalIdInput();

        setupLoginForms();


        /*
          Auth
        */

        await checkAuthSession();

        setupAuthListener();


        /*
          Public athletes
        */

        setupAthleteSearch();

        setupCategoryFilter();

        loadAthletes();


        /*
          Coach page compatibility
        */

        protectCoachPage();
    }


    /* =====================================================
       START
    ===================================================== */

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
