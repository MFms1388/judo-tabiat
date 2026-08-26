// ======================================
// SUPABASE CONNECTION
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";

let supabaseClient = null;


// ======================================
// CONNECT
// ======================================

function connectSupabase() {

  try {

    // بررسی وجود کتابخانه
    if (!window.supabase) {

      console.error(
        "Supabase library not loaded."
      );

      return false;
    }


    // ساخت کلاینت
    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );


    // در دسترس coach.js و بقیه فایل‌ها
    window.supabaseClient =
      supabaseClient;


    console.log(
      "✅ Supabase client created successfully."
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Supabase connection error:",
      error
    );

    return false;
  }
}


// ======================================
// TEST CONNECTION
// ======================================

async function testSupabaseConnection() {

  try {

    if (!supabaseClient) {

      console.error(
        "❌ Supabase client does not exist."
      );

      return false;
    }


    /*
     * فقط Session را بررسی می‌کنیم.
     * این تست به جدول خاصی وابسته نیست.
     */

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "❌ Supabase Auth error:",
        error
      );

      return false;
    }


    console.log(
      "✅ اتصال به Supabase برقرار است.",
      data
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Supabase test failed:",
      error
    );

    return false;
  }
}


// ======================================
// START SUPABASE
// ======================================

const supabaseReady =
  connectSupabase();


if (supabaseReady) {

  testSupabaseConnection();

} else {

  console.error(
    "❌ Supabase آماده نشد."
  );

}


// ======================================
// MAKE AVAILABLE GLOBALLY
// ======================================

window.supabaseClient =
  supabaseClient;
