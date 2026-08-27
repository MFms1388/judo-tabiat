// ======================================
// SUPABASE
// ======================================

const SUPABASE_URL =
  "https://bkkdgywdptufjsaepehc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_KBAMUqB0oL8fA0iNIKcv-w_brwIBHpd";


// ======================================
// CREATE CLIENT
// ======================================

let supabaseClient = null;

try {

  if (!window.supabase) {
    throw new Error("کتابخانه Supabase بارگذاری نشده است.");
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  window.supabaseClient = supabaseClient;

  console.log("✅ Supabase Client ساخته شد.");

} catch (error) {

  console.error(
    "❌ خطا در ساخت Supabase Client:",
    error
  );

}


// ======================================
// REAL CONNECTION TEST
// ======================================

async function testSupabaseConnection() {

  if (!window.supabaseClient) {

    console.error("❌ Supabase Client وجود ندارد.");

    return false;
  }

  try {

    // تست با جدول واقعی ورزشکاران
    const { data, error } =
      await window.supabaseClient
        .from("Athletes")
        .select("*")
        .limit(1);

    if (error) {

      console.error(
        "❌ خطای Supabase:",
        error
      );

      alert(
        "اتصال به Supabase برقرار نشد.\n\n" +
        "خطا: " +
        error.message
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
      "❌ خطای اتصال:",
      error
    );

    alert(
      "خطا در اتصال به Supabase:\n" +
      error.message
    );

    return false;
  }
}


// ======================================
// START
// ======================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    testSupabaseConnection();

  }
);


// ======================================
// GLOBAL
// ======================================

window.testSupabaseConnection =
  testSupabaseConnection;
