// =========================================
// SUPABASE
// =========================================

// Your Supabase project URL
const SUPABASE_URL =
  "https://liajjeatukvkjzolorrq.supabase.co";

// Your Supabase Publishable Key
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_VvJ0ElfDbH4jtbP8BbLXiQ_LDHvRUEi";

// Create Supabase client
const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


// =========================================
// SUPABASE CONNECTION TEST
// =========================================
//
// We don't perform a SELECT test here because
// visitors should not be able to read other
// people's RSVP records.
//
// The real connection test is submitting an RSVP.
//

console.log(
  "Supabase client initialized."
);


// =========================================
// EVENT COUNTDOWN
// =========================================

const EVENT_DATE =
  "2026-11-07T10:00:00+08:00";


function tick() {

  const distance =
    new Date(EVENT_DATE).getTime() -
    Date.now();


  const values =
    distance > 0
      ? [

          Math.floor(
            distance / 864e5
          ),

          Math.floor(
            (distance / 36e5) % 24
          ),

          Math.floor(
            (distance / 6e4) % 60
          ),

          Math.floor(
            (distance / 1e3) % 60
          )

        ]

      : [0, 0, 0, 0];


  document
    .querySelectorAll(
      "#countdown strong"
    )
    .forEach(
      (element, index) => {

        element.textContent =
          String(
            values[index]
          ).padStart(2, "0");

      }
    );

}


tick();


setInterval(
  tick,
  1000
);

/* =========================================
   YLAI LOADING / SPLASH SCREEN
========================================= */

(function () {

  const loader =
    document.getElementById("ylaiLoader");


  if (!loader) {
    return;
  }


  function hideLoader() {

    loader.classList.add("is-hidden");

  }


  /*
   * Wait until the page is fully loaded,
   * then keep the Ylai screen visible
   * for a short moment before fading out.
   */

  window.addEventListener(
    "load",
    function () {

      setTimeout(
        hideLoader,
        1500
      );

    }
  );


})();


// =========================================
// PHOTO VIEWER / LIGHTBOX
// =========================================

function openPhoto(
  image,
  caption
) {

  const viewer =
    document.getElementById(
      "photoViewer"
    );


  const viewerImage =
    document.getElementById(
      "viewerImage"
    );


  const viewerCaption =
    document.getElementById(
      "viewerCaption"
    );


  // Set selected image

  viewerImage.src =
    image;


  viewerImage.alt =
    caption;


  viewerCaption.textContent =
    caption;


  // Show viewer

  viewer.classList.add(
    "active"
  );


  // Prevent page scrolling

  document.body.style.overflow =
    "hidden";

}


// =========================================
// CLOSE PHOTO VIEWER
// =========================================

function closePhoto(
  event
) {

  // Don't close when clicking
  // inside the image/content

  if (
    event &&
    event.target &&
    event.target.closest(
      ".photo-viewer-content"
    )
  ) {

    return;

  }


  const viewer =
    document.getElementById(
      "photoViewer"
    );


  viewer.classList.remove(
    "active"
  );


  // Restore scrolling

  document.body.style.overflow =
    "";


  // Clear image after closing

  setTimeout(
    () => {

      if (
        !viewer.classList.contains(
          "active"
        )
      ) {

        document.getElementById(
          "viewerImage"
        ).src = "";

      }

    },
    250
  );

}


// =========================================
// CLOSE PHOTO VIEWER WITH ESC
// =========================================

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape"
    ) {

      // Don't close RSVP modal here.
      // RSVP modal has its own ESC handler.

      const rsvpModal =
        document.getElementById(
          "rsvpModal"
        );

      if (
        rsvpModal &&
        !rsvpModal.hidden
      ) {

        return;

      }

      closePhoto();

    }

  }
);


// =========================================
// RSVP
// =========================================

const rsvpForm =
  document.getElementById(
    "rsvpForm"
  );


// =========================================
// RSVP FORM ELEMENTS
// =========================================

const attendanceSelect =
  document.getElementById(
    "attendance"
  );


const companionSelect =
  document.getElementById(
    "companion"
  );


const companionNote =
  document.getElementById(
    "companionNote"
  );


// =========================================
// UPDATE COMPANION STATE
// =========================================
//
// If the guest is attending:
//   Companion selection is enabled.
//
// If the guest cannot attend:
//   Companion selection is disabled.
//   Companion is automatically set to 0.
//
// This keeps the RSVP logic consistent.
//

function updateCompanionState() {

  // Make sure both elements exist

  if (
    !attendanceSelect ||
    !companionSelect
  ) {

    return;

  }


  // =========================================
  // GUEST IS NOT ATTENDING
  // =========================================

  if (
    attendanceSelect.value ===
    "declined"
  ) {

    // Always force companion to 0
    companionSelect.value = "0";

    // Disable companion selection
    companionSelect.disabled = true;


    // Visually fade the explanatory note
    if (companionNote) {

      companionNote.style.opacity =
        "0.5";

    }

  }


  // =========================================
  // GUEST IS ATTENDING
  // =========================================

  else {

    // Enable companion selection
    companionSelect.disabled = false;


    // Restore explanatory note
    if (companionNote) {

      companionNote.style.opacity =
        "1";

    }

  }

}


// =========================================
// ATTENDANCE CHANGE EVENT
// =========================================

if (
  attendanceSelect
) {

  attendanceSelect.addEventListener(
    "change",
    updateCompanionState
  );

}


// =========================================
// INITIAL COMPANION STATE
// =========================================
//
// Run immediately so the form is always
// in the correct state when the page loads.
//

updateCompanionState();


// =========================================
// RSVP SUBMISSION
// =========================================

if (rsvpForm) {

  rsvpForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      // =========================================
      // GET FORM VALUES
      // =========================================

      const name =
        document
          .getElementById(
            "guestName"
          )
          .value
          .trim();


      // Get attendance first because
      // companion depends on attendance.

      const attendance =
        document
          .getElementById(
            "attendance"
          )
          .value;


      // =========================================
      // GET COMPANION
      // =========================================
      //
      // If attendance is declined,
      // companion is ALWAYS 0.
      //
      // This protects the database even if
      // the browser-side disabled state is
      // somehow bypassed.
      //

      const companion =
        attendance === "declined"
          ? 0
          : Number(
              document
                .getElementById(
                  "companion"
                )
                .value
            );


      const message =
        document
          .getElementById(
            "message"
          )
          .value
          .trim();


      // =========================================
      // BASIC VALIDATION
      // =========================================

      if (!name) {

        alert(
          "Please enter your name."
        );

        return;

      }


      // =========================================
      // ATTENDANCE VALIDATION
      // =========================================

      if (
        attendance !==
          "confirmed" &&
        attendance !==
          "declined"
      ) {

        alert(
          "Please select your attendance."
        );

        return;

      }


      // =========================================
      // COMPANION VALIDATION
      // =========================================
      //
      // Declined guests automatically have
      // companion = 0.
      //
      // Attending guests can only have
      // 0 or 1 companion.
      //

      if (
        attendance === "confirmed" &&
        (
          companion < 0 ||
          companion > 1 ||
          !Number.isInteger(companion)
        )
      ) {

        alert(
          "Each Ninong and Ninang may bring only 1 companion."
        );

        return;

      }


      // =========================================
      // GET SUBMIT BUTTON
      // =========================================

      const submitButton =
        rsvpForm.querySelector(
          'button[type="submit"]'
        );


      // =========================================
      // PREVENT DUPLICATE SUBMISSIONS
      // =========================================

      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Submitting...";

      }


      try {

        // =========================================
        // SAVE RSVP TO SUPABASE
        // =========================================

        const { error } =
          await supabaseClient
            .from("rsvps")
            .insert([
              {

                guest_name:
                  name,

                companion:
                  companion,

                attendance:
                  attendance,

                message:
                  message

              }
            ]);


        // =========================================
        // HANDLE SUPABASE ERROR
        // =========================================

        if (error) {

          console.error(
            "Supabase RSVP error:",
            error
          );


          alert(
            "Sorry, we couldn't submit your RSVP. Please try again."
          );


          return;

        }


        // =========================================
        // SUCCESS
        // =========================================

        console.log(
          "RSVP successfully submitted."
        );


        // Reset form

        rsvpForm.reset();


        // Reset companion state after
        // the form has been reset.

        updateCompanionState();


        // =========================================
        // SHOW CONFIRMATION MODAL
        // =========================================

        openRSVPModal();

      }

      catch (error) {

        // =========================================
        // UNEXPECTED ERROR
        // =========================================

        console.error(
          "Unexpected RSVP error:",
          error
        );


        alert(
          "Sorry, something went wrong while submitting your RSVP. Please try again."
        );

      }

      finally {

        // =========================================
        // RESTORE SUBMIT BUTTON
        // =========================================

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Submit RSVP";

        }

      }

    }
  );

}


// =========================================
// OPEN RSVP CONFIRMATION MODAL
// =========================================

function openRSVPModal() {

  const modal =
    document.getElementById(
      "rsvpModal"
    );


  if (!modal) {

    console.error(
      "RSVP modal not found."
    );

    return;

  }


  // Show modal

  modal.hidden =
    false;


  // Prevent page scrolling

  document.body.style.overflow =
    "hidden";


  // Put focus on Done button

  const doneButton =
    modal.querySelector(
      ".button"
    );


  if (doneButton) {

    setTimeout(
      () => {

        doneButton.focus();

      },
      100
    );

  }

}


// =========================================
// CLOSE RSVP CONFIRMATION MODAL
// =========================================

function closeRSVPModal() {

  const modal =
    document.getElementById(
      "rsvpModal"
    );


  if (!modal) {

    return;

  }


  // Hide modal

  modal.hidden =
    true;


  // Restore scrolling

  document.body.style.overflow =
    "";

}


// =========================================
// CLOSE RSVP MODAL WITH ESC
// =========================================

document.addEventListener(
  "keydown",
  function (event) {

    const modal =
      document.getElementById(
        "rsvpModal"
      );


    if (
      event.key === "Escape" &&
      modal &&
      !modal.hidden
    ) {

      closeRSVPModal();

    }

  }
);


// =========================================
// CLOSE RSVP MODAL WHEN CLICKING BACKDROP
// =========================================

document.addEventListener(
  "click",
  function (event) {

    const modal =
      document.getElementById(
        "rsvpModal"
      );


    if (
      modal &&
      !modal.hidden &&
      event.target === modal
    ) {

      closeRSVPModal();

    }

  }
);


// =========================================
// SCROLL REVEAL
// =========================================

const revealElements =
  document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right"
  );


const revealObserver =
  new IntersectionObserver(
    (entries, observer) => {

      entries.forEach(
        (entry) => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );


            observer.unobserve(
              entry.target
            );

          }

        }
      );

    },
    {
      threshold: 0.15
    }
  );


revealElements.forEach(
  (element) => {

    revealObserver.observe(
      element
    );

  }
);