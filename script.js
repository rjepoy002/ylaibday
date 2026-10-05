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
  "2026-11-07T15:00:00+08:00";


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


// =========================================
// MESSAGES FOR YLAI
// =========================================

const PUBLIC_MESSAGES_URL =
  "https://liajjeatukvkjzolorrq.supabase.co/functions/v1/public-messages";


function createMessageCard(name, message) {

  const card = document.createElement("article");
  card.className = "message-card";

  const quote = document.createElement("span");
  quote.className = "message-quote";
  quote.setAttribute("aria-hidden", "true");
  quote.textContent = "\u201c";

  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = message;

  const author = document.createElement("p");
  author.className = "message-author";
  author.textContent = `\u2014 ${name}`;

  card.append(quote, text, author);

  return card;
}


async function loadMessages() {

  const track = document.getElementById("messagesTrack");
  const status = document.getElementById("messagesStatus");

  if (!track || !status) return;

  let requestTimeout;

  try {

    const controller = new AbortController();
    requestTimeout = setTimeout(
      () => controller.abort(),
      10000
    );

    const response = await fetch(
      PUBLIC_MESSAGES_URL,
      { signal: controller.signal }
    );

    if (!response.ok) throw new Error("Unable to load messages.");

    const payload = await response.json();

    const messages = Array.isArray(payload.messages)
      ? payload.messages.filter((item) => {
          return item && typeof item.name === "string" &&
            typeof item.message === "string" &&
            item.name.trim().length > 0 && item.message.trim().length > 0;
        })
      : [];

    if (messages.length === 0) {
      status.textContent = "Sweet wishes for Ylai will appear here.";
      return;
    }

    const cards = messages.map((item) => {
      return createMessageCard(item.name.trim(), item.message.trim());
    });

    track.replaceChildren(...cards);

    if (cards.length > 1) {
      cards.forEach((card) => {
        const duplicate = card.cloneNode(true);
        duplicate.setAttribute("aria-hidden", "true");
        track.append(duplicate);
      });

      track.classList.add("is-looping");
    }

    status.hidden = true;

  } catch (error) {

    console.warn("Messages for Ylai could not be loaded.", error);
    status.textContent = "Sweet wishes for Ylai will appear here.";
  } finally {
    clearTimeout(requestTimeout);
  }
}


loadMessages();


// =========================================
// EVENT VENUE MAP MODAL
// =========================================
const EVENT_VENUES = {

  "sta-monica": {

    event: "01 \u00b7 Christening",

    title:
      "Sta. Monica Parish Church",

    time:
      "1:00 PM",

    map:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2337.79351055793!2d118.7366596118965!3d9.79275178326818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b5631689ab4bad%3A0x4983ab4318ecbe37!2sSta.%20Monica%20Parish%20Puerto%20Princesa%20City%20Palawan!5e0!3m2!1sen!2sph!4v1791209709120!5m2!1sen!2sph",

    directions:
      "https://maps.app.goo.gl/YaAaXwhUGDSPSpwu7"

  },


  "yvonne": {

    event: "02 \u00b7 Birthday Celebration",

    title:
      "Yvonne's Nest",

    time:
      "4:00 PM onwards",

    map:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7863.002698988839!2d118.74886352208864!3d9.808192004634641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33b56315e0353253%3A0x9cd62596e1aad8b0!2sYvonne's%20Nest!5e0!3m2!1sen!2sph!4v1791208076033!5m2!1sen!2sph",

    directions:
      "https://maps.app.goo.gl/e69RGNgW2rYBnP5x5"

  }

};

const venueModal = document.getElementById("venueMapModal");
const venueModalEvent = document.getElementById("venueModalEvent");
const venueModalTitle = document.getElementById("venueModalTitle");
const venueModalTime = document.getElementById("venueModalTime");
const venueModalLocation = document.getElementById("venueModalLocation");
const venueModalIframe = document.getElementById("venueModalIframe");
const venueModalDirections = document.getElementById("venueModalDirections");
let venueModalTrigger = null;
let venueMapClearTimeout;
let venueBackgroundElements = [];

function openVenueModal(venueKey, trigger = document.activeElement) {
  const venue = EVENT_VENUES[venueKey];
  if (!venue || !venueModal) return;

  clearTimeout(venueMapClearTimeout);
  if (!venueModal.classList.contains("is-open")) {
    venueModalTrigger = trigger;
    venueBackgroundElements = Array.from(document.body.children)
      .filter((element) => element !== venueModal)
      .map((element) => ({ element, inert: element.inert }));
    venueBackgroundElements.forEach(({ element }) => {
      element.inert = true;
    });
  }

  venueModalEvent.textContent = venue.event;
  venueModalTitle.textContent = venue.title;
  venueModalTime.textContent = venue.time;
  venueModalLocation.textContent = venue.title;
  venueModalIframe.title = venue.title + " location";
  venueModalIframe.src = venue.map;
  venueModalDirections.href = venue.directions;
  venueModal.classList.add("is-open");
  venueModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("venue-modal-open");
  // Wait for the hidden-to-visible transition before moving focus.
  setTimeout(() => {
    if (venueModal.classList.contains("is-open")) {
      venueModal.querySelector(".venue-modal-close").focus({ preventScroll: true });
    }
  }, 350);
}

function closeVenueModal() {
  if (!venueModal || !venueModal.classList.contains("is-open")) return;

  venueBackgroundElements.forEach(({ element, inert }) => {
    element.inert = inert;
  });
  venueBackgroundElements = [];
  document.body.classList.remove("venue-modal-open");
  if (venueModalTrigger && venueModalTrigger.isConnected) {
    venueModalTrigger.focus({ preventScroll: true });
  }
  venueModal.classList.remove("is-open");
  venueModal.setAttribute("aria-hidden", "true");

  venueMapClearTimeout = setTimeout(() => {
    if (!venueModal.classList.contains("is-open")) {
      venueModalIframe.removeAttribute("src");
    }
  }, 300);
}

document.querySelectorAll(".venue-link").forEach((button) => {
  button.addEventListener("click", () => {
    openVenueModal(button.dataset.venue, button);
  });
});

if (venueModal) {
  venueModal.querySelectorAll("[data-close-venue-modal]").forEach((element) => {
    element.addEventListener("click", closeVenueModal);
  });

  // Capture Escape before the existing photo and RSVP handlers.
  document.addEventListener("keydown", (event) => {
    if (!venueModal.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeVenueModal();
      return;
    }
    if (event.key === "Tab") {
      const first = venueModal.querySelector(".venue-modal-close");
      const last = venueModalDirections;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, true);
}
