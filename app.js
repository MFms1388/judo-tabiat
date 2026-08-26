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

    throw new Error(
      "کتابخانه Supabase بارگذاری نشده است."
    );

  }

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  // مهم
  window.supabaseClient =
    supabaseClient;

  console.log(
    "✅ Supabase Client ساخته شد."
  );

} catch (error) {

  console.error(
    "❌ خطا در ساخت Supabase Client:",
    error
  );

}


// ======================================
// CONNECTION TEST
// ======================================

async function testSupabaseConnection() {

  if (!window.supabaseClient) {

    console.error(
      "❌ Supabase Client وجود ندارد."
    );

    return false;
  }


  try {

    /*
     * یک درخواست واقعی به API می‌فرستیم.
     * جدول خاصی را استفاده نمی‌کنیم.
     */

    const response =
      await fetch(
        SUPABASE_URL +
        "/rest/v1/",
        {
          method: "GET",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization":
              "Bearer " + SUPABASE_KEY
          }
        }
      );


    console.log(
      "Supabase HTTP Status:",
      response.status
    );


    if (
      response.ok ||
      response.status === 404
    ) {

      console.log(
        "✅ اتصال به Supabase برقرار است."
      );

      return true;

    }


    const text =
      await response.text();

    console.error(
      "❌ Supabase پاسخ خطا داد:",
      text
    );

    return false;


  } catch (error) {

    console.error(
      "❌ اتصال به Supabase برقرار نشد:",
      error
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
