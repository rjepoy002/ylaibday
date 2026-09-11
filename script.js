// =========================================
// EVENT COUNTDOWN
// =========================================

const EVENT_DATE = "2026-11-07T10:00:00+08:00";


function tick() {

  const distance =
    new Date(EVENT_DATE).getTime() - Date.now();


  const values = distance > 0
    ? [
        Math.floor(distance / 864e5),
        Math.floor((distance / 36e5) % 24),
        Math.floor((distance / 6e4) % 60),
        Math.floor((distance / 1e3) % 60)
      ]
    : [0, 0, 0, 0];


  document
    .querySelectorAll("#countdown strong")
    .forEach((element, index) => {

      element.textContent =
        String(values[index]).padStart(2, "0");

    });

}


tick();

setInterval(tick, 1000);



// =========================================
// PHOTO VIEWER / LIGHTBOX
// =========================================

function openPhoto(image, caption) {

  const viewer =
    document.getElementById("photoViewer");

  const viewerImage =
    document.getElementById("viewerImage");

  const viewerCaption =
    document.getElementById("viewerCaption");


  // Set selected image
  viewerImage.src = image;

  viewerImage.alt = caption;

  viewerCaption.textContent = caption;


  // Show viewer
  viewer.classList.add("active");


  // Prevent page scrolling
  document.body.style.overflow = "hidden";

}



// =========================================
// CLOSE PHOTO VIEWER
// =========================================

function closePhoto(event) {

  // Don't close when clicking inside image/content
  if (
    event &&
    event.target &&
    event.target.closest(".photo-viewer-content")
  ) {
    return;
  }


  const viewer =
    document.getElementById("photoViewer");


  viewer.classList.remove("active");


  // Restore scrolling
  document.body.style.overflow = "";


  // Clear image after closing
  setTimeout(() => {

    if (!viewer.classList.contains("active")) {

      document.getElementById(
        "viewerImage"
      ).src = "";

    }

  }, 250);

}



// =========================================
// CLOSE PHOTO VIEWER WITH ESC
// =========================================

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {

      closePhoto();

    }

  }
);



// =========================================
// RSVP
// =========================================

const rsvpForm =
  document.getElementById("rsvpForm");


rsvpForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    // =========================================
    // GET FORM VALUES
    // =========================================

    const name =
      document
        .getElementById("guestName")
        .value
        .trim();


    const companion =
      Number(
        document
          .getElementById("companion")
          .value
      );


    const attendance =
      document
        .getElementById("attendance")
        .value;


    const message =
      document
        .getElementById("message")
        .value
        .trim();



    // =========================================
    // SAFETY CHECK
    // =========================================

    // Companion must be 0 or 1
    if (companion < 0 || companion > 1) {

      alert(
        "Each Ninong and Ninang may bring only 1 companion."
      );

      return;

    }



    // =========================================
    // CREATE RSVP RECORD
    // =========================================

    const response = {

      name: name,

      companion: companion,

      attendance: attendance,

      message: message,

      date: new Date().toISOString()

    };



    // =========================================
    // GET EXISTING RSVP RECORDS
    // =========================================

    const existingRSVPs =
      JSON.parse(
        localStorage.getItem("ylai_rsvps") || "[]"
      );



    // =========================================
    // ADD NEW RSVP
    // =========================================

    existingRSVPs.push(response);



    // =========================================
    // SAVE RSVP
    // =========================================

    localStorage.setItem(
      "ylai_rsvps",
      JSON.stringify(existingRSVPs)
    );



    // =========================================
    // HIDE FORM
    // =========================================

    rsvpForm.hidden = true;



    // =========================================
    // SHOW SUCCESS MESSAGE
    // =========================================

    document.getElementById(
      "rsvpSuccess"
    ).hidden = false;

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

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.15
    }

  );


revealElements.forEach((element) => {

  revealObserver.observe(element);

});