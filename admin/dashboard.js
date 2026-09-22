/* =========================================
   YLAI ADMIN DASHBOARD
========================================= */

/*
 * =========================================
 * SUPABASE
 * =========================================
 */

const SUPABASE_URL =
  "https://liajjeatukvkjzolorrq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_VvJ0ElfDbH4jtbP8BbLXiQ_LDHvRUEi";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/*
 * =========================================
 * AUTHORIZED ADMIN WALLET
 * =========================================
 */

const ADMIN_WALLET =
  "0xfDc98BcccD4195Dd2a9F0FE86beB9706C0c8C1e5"
    .toLowerCase();


/*
 * =========================================
 * ELEMENTS
 * =========================================
 */

const dashboardScreen =
  document.getElementById(
    "dashboardScreen"
  );

const disconnectButton =
  document.getElementById(
    "disconnectButton"
  );

const walletAddress =
  document.getElementById(
    "walletAddress"
  );

const totalPhotos =
  document.getElementById(
    "totalPhotos"
  );

const approvedPhotos =
  document.getElementById(
    "approvedPhotos"
  );

const galleryStatus =
  document.getElementById(
    "galleryStatus"
  );

const photoGrid =
  document.getElementById(
    "photoGrid"
  );

const emptyState =
  document.getElementById(
    "emptyState"
  );

const photoModal =
  document.getElementById(
    "photoModal"
  );

const modalImage =
  document.getElementById(
    "modalImage"
  );

const modalCaption =
  document.getElementById(
    "modalCaption"
  );

const closePhotoModal =
  document.getElementById(
    "closePhotoModal"
  );


/*
 * =========================================
 * RSVP ELEMENTS
 * =========================================
 */

const rsvpStatus =
  document.getElementById(
    "rsvpStatus"
  );

const rsvpTableBody =
  document.getElementById(
    "rsvpTableBody"
  );

const totalRSVPs =
  document.getElementById(
    "totalRSVPs"
  );

const attendingRSVPs =
  document.getElementById(
    "attendingRSVPs"
  );

const notAttendingRSVPs =
  document.getElementById(
    "notAttendingRSVPs"
  );

const totalCompanions =
  document.getElementById(
    "totalCompanions"
  );


/*
 * =========================================
 * STATE
 * =========================================
 */

let currentWallet = null;

let adminSessionToken = null;

let rsvpAutoRefreshTimer = null;

let galleryAutoRefreshTimer = null;


/*
 * =========================================
 * HELPERS
 * =========================================
 */

function shortAddress(address) {

  if (!address) {
    return "";
  }

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(
      address.length - 4
    )
  );
}


function setGalleryStatus(
  message,
  type = ""
) {

  galleryStatus.textContent =
    message;

  galleryStatus.className =
    "status " + type;
}


/*
 * =========================================
 * SESSION
 * =========================================
 */

function clearAdminSession() {

  sessionStorage.removeItem(
    "ylai_admin_wallet"
  );

  sessionStorage.removeItem(
    "ylai_admin_authenticated"
  );

  sessionStorage.removeItem(
    "ylai_admin_auth_time"
  );

  /*
   * RSVP and Gallery session token is
   * intentionally kept only in memory.
   */

  adminSessionToken = null;


  if (rsvpAutoRefreshTimer) {

    clearInterval(
      rsvpAutoRefreshTimer
    );

    rsvpAutoRefreshTimer = null;
  }


  if (galleryAutoRefreshTimer) {

    clearInterval(
      galleryAutoRefreshTimer
    );

    galleryAutoRefreshTimer = null;
  }
}


async function verifySession() {

  console.log(
    "YLai Admin Dashboard: Verifying session..."
  );

  const savedWallet =
    sessionStorage.getItem(
      "ylai_admin_wallet"
    );

  const authenticated =
    sessionStorage.getItem(
      "ylai_admin_authenticated"
    );

  const authTime =
    Number(
      sessionStorage.getItem(
        "ylai_admin_auth_time"
      ) || 0
    );

  const SESSION_DURATION =
    12 * 60 * 60 * 1000;


  /*
   * =======================================
   * SESSION EXISTENCE
   * =======================================
   */

  if (
    !savedWallet ||
    authenticated !== "true" ||
    !authTime
  ) {

    redirectToLogin();

    return false;
  }


  /*
   * =======================================
   * SESSION EXPIRATION
   * =======================================
   */

  if (
    Date.now() - authTime >
    SESSION_DURATION
  ) {

    console.warn(
      "YLai Admin Dashboard: Session expired."
    );

    clearAdminSession();

    redirectToLogin();

    return false;
  }


  /*
   * =======================================
   * WALLET CHECK
   * =======================================
   */

  if (
    savedWallet.toLowerCase() !==
    ADMIN_WALLET
  ) {

    console.warn(
      "YLai Admin Dashboard: Unauthorized saved wallet."
    );

    clearAdminSession();

    redirectToLogin();

    return false;
  }


  /*
   * =======================================
   * METAMASK
   * =======================================
   */

  if (
    typeof window.ethereum ===
    "undefined"
  ) {

    console.warn(
      "YLai Admin Dashboard: MetaMask unavailable."
    );

    clearAdminSession();

    redirectToLogin();

    return false;
  }


  try {

    const accounts =
      await window.ethereum.request({
        method: "eth_accounts"
      });


    if (!accounts.length) {

      console.warn(
        "YLai Admin Dashboard: No active wallet."
      );

      clearAdminSession();

      redirectToLogin();

      return false;
    }


    const activeWallet =
      accounts[0].toLowerCase();


    if (
      activeWallet !==
      ADMIN_WALLET
    ) {

      console.warn(
        "YLai Admin Dashboard: Wrong wallet."
      );

      clearAdminSession();

      redirectToLogin();

      return false;
    }


    currentWallet =
      activeWallet;


    walletAddress.textContent =
      shortAddress(
        currentWallet
      );


    console.log(
      "YLai Admin Dashboard: Session verified."
    );


    return true;


  } catch (error) {

    console.error(
      "YLai Admin Dashboard: Wallet verification failed:",
      error
    );

    clearAdminSession();

    redirectToLogin();

    return false;
  }
}


/*
 * =========================================
 * REDIRECT
 * =========================================
 */

function redirectToLogin() {

  window.location.replace(
    "index.html"
  );
}


/*
 * =========================================
 * LOAD GALLERY
 * =========================================
 */

async function loadGallery(
  isBackgroundRefresh = false
) {

  console.log(
    "YLai Admin Dashboard: Loading gallery..."
  );


  if (!adminSessionToken) {

    console.warn(
      "YLai Admin Dashboard: No admin session token available for gallery."
    );


    if (!isBackgroundRefresh) {

      setGalleryStatus(
        "Admin session is not available.",
        "error"
      );
    }


    return;
  }


  /*
   * Only show loading state during the
   * initial/manual load.
   *
   * Background refreshes happen silently.
   */

  if (!isBackgroundRefresh) {

    setGalleryStatus(
      "Loading photos..."
    );

    photoGrid.innerHTML =
      "";

    emptyState.hidden =
      true;
  }


  try {

    /*
     * =======================================
     * CALL SECURE GALLERY EDGE FUNCTION
     * =======================================
     */

    const {
      data,
      error
    } =
      await supabaseClient.functions.invoke(
        "admin-gallery-list",
        {
          body: {
            session_token:
              adminSessionToken
          }
        }
      );


    if (error) {

      console.error(
        "YLai Admin Dashboard: Gallery Edge Function error:",
        error
      );

      throw new Error(
        error.message ||
        "Unable to load gallery."
      );
    }


    /*
     * =======================================
     * VALIDATE RESPONSE
     * =======================================
     */

    if (
      !data ||
      data.success !== true
    ) {

      if (
        data?.error ===
          "Invalid admin session" ||
        data?.error ===
          "Admin session expired" ||
        data?.error ===
          "Unauthorized admin session"
      ) {

        adminSessionToken =
          null;


        if (!isBackgroundRefresh) {

          setGalleryStatus(
            "Admin session expired. Reload the dashboard to sign in again.",
            "error"
          );
        }


        return;
      }


      throw new Error(
        data?.error ||
        "The gallery request was rejected."
      );
    }


    /*
     * =======================================
     * PHOTOS
     * =======================================
     */

    const photos =
      Array.isArray(data.photos)
        ? data.photos
        : [];


    console.log(
      "YLai Admin Dashboard: Photos loaded:",
      photos.length
    );


    /*
     * =======================================
     * STATISTICS
     * =======================================
     */

    totalPhotos.textContent =
      photos.length;


    approvedPhotos.textContent =
      photos.filter(
        photo =>
          photo.approved === true
      ).length;

    /*
     * =======================================
     * CLEAR CURRENT GRID
     * =======================================
     *
     * Rebuild the Gallery on each refresh.
     * This keeps newly uploaded and removed
     * photos synchronized.
     */

    photoGrid.innerHTML =
      "";

    emptyState.hidden =
      true;


    /*
     * =======================================
     * EMPTY
     * =======================================
     */

    if (!photos.length) {

      emptyState.hidden =
        false;

      setGalleryStatus(
        "No photos uploaded yet."
      );

      return;
    }


    /*
     * =======================================
     * RENDER
     * =======================================
     */

    photos.forEach(
      renderPhoto
    );


    setGalleryStatus(
      photos.length +
      " photo" +
      (
        photos.length === 1
          ? ""
          : "s"
      ) +
      " loaded.",
      "success"
    );


  } catch (error) {

    console.error(
      "YLai Admin Dashboard: Gallery loading failed:",
      error
    );


    /*
     * Don't overwrite the current Gallery
     * display with an error during a silent
     * background refresh.
     */

    if (!isBackgroundRefresh) {

      setGalleryStatus(
        "Unable to load gallery: " +
        (
          error.message ||
          "Unknown error"
        ),
        "error"
      );
    }
  }
}


/*
 * =========================================
 * RENDER PHOTO
 * =========================================
 */

function renderPhoto(photo) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "photo-card";


  /*
   * =======================================
   * IMAGE URL
   * =======================================
   */

  const {
    data
  } =
    supabaseClient
      .storage
      .from("gallery")
      .getPublicUrl(
        photo.storage_path
      );


  const imageUrl =
    data.publicUrl;


  /*
   * =======================================
   * IMAGE BUTTON
   * =======================================
   */

  const imageButton =
    document.createElement(
      "button"
    );

  imageButton.type =
    "button";

  imageButton.className =
    "photo-image-button";


  imageButton.addEventListener(
    "click",
    function () {

      openPhoto(
        imageUrl,
        photo.caption ||
          "A special memory with Ylai."
      );
    }
  );


  const image =
    document.createElement(
      "img"
    );

  image.className =
    "photo-image";

  image.src =
    imageUrl;

  image.alt =
    photo.caption ||
    "Ylai gallery photo";

  image.loading =
    "lazy";


  imageButton.appendChild(
    image
  );


  /*
   * =======================================
   * INFO
   * =======================================
   */

  const info =
    document.createElement(
      "div"
    );

  info.className =
    "photo-info";


  /*
   * =======================================
   * FILE NAME
   * =======================================
   */

  const name =
    document.createElement(
      "p"
    );

  name.className =
    "photo-name";

  name.textContent =
    photo.file_name ||
    "Photo";


  /*
   * =======================================
   * UPLOADER
   * =======================================
   */

  const uploader =
    document.createElement(
      "p"
    );

  uploader.className =
    "photo-date";

  uploader.textContent =
    "Uploaded by: " +
    (
      photo.uploaded_by ||
      "Guest"
    );


  /*
   * =======================================
   * DATE
   * =======================================
   */

  const date =
    document.createElement(
      "p"
    );

  date.className =
    "photo-date";

  date.textContent =
    formatDate(
      photo.created_at
    );


  /*
   * =======================================
   * STATUS
   * =======================================
   */

  const status =
    document.createElement(
      "span"
    );

  status.className =
    "photo-status";

  status.textContent =
    photo.approved
      ? "Approved"
      : "Pending";


  /*
   * =======================================
   * ACTIONS
   * =======================================
   */

  const actions =
    document.createElement(
      "div"
    );

  actions.className =
    "photo-actions";


  /*
   * =======================================
   * VIEW
   * =======================================
   */

  const viewButton =
    document.createElement(
      "button"
    );

  viewButton.type =
    "button";

  viewButton.className =
    "photo-action-button";

  viewButton.textContent =
    "View";


  viewButton.addEventListener(
    "click",
    function () {

      openPhoto(
        imageUrl,
        photo.caption ||
          "A special memory with Ylai."
      );
    }
  );


  /*
   * =======================================
   * UNAPPROVE
   * =======================================
   */

  const approveButton =
    document.createElement(
      "button"
    );

  approveButton.type =
    "button";

  approveButton.className =
    "photo-action-button";

  approveButton.textContent =
    "Unapprove";


  approveButton.addEventListener(
    "click",
    function () {

      toggleApproval(
        photo,
        approveButton
      );
    }
  );


  /*
   * =======================================
   * ADD ACTIONS
   * =======================================
   */

  actions.appendChild(
    viewButton
  );

  actions.appendChild(
    approveButton
  );


  /*
   * =======================================
   * BUILD CARD
   * =======================================
   */

  info.appendChild(
    name
  );

  info.appendChild(
    uploader
  );

  info.appendChild(
    date
  );

  info.appendChild(
    status
  );

  info.appendChild(
    actions
  );


  card.appendChild(
    imageButton
  );

  card.appendChild(
    info
  );


  photoGrid.appendChild(
    card
  );
}


/*
 * =========================================
 * ADMIN PHOTO ACTION
 * =========================================
 */

async function callAdminAction(
  action,
  photoId
) {

  if (!currentWallet) {

    throw new Error(
      "Admin wallet is not connected."
    );
  }


  const nonce =
    crypto.randomUUID();


  const timestamp =
    new Date().toISOString();


  const message = [

    "YLai Admin Action",

    `Action: ${action}`,

    `Photo ID: ${photoId}`,

    `Nonce: ${nonce}`,

    `Timestamp: ${timestamp}`,

  ].join("\n");


  console.log(
    "YLai Admin Dashboard: Requesting MetaMask signature:",
    action
  );


  const signature =
    await window.ethereum.request({

      method:
        "personal_sign",

      params: [
        message,
        currentWallet,
      ],

    });


  if (!signature) {

    throw new Error(
      "MetaMask signature was not provided."
    );
  }


  console.log(
    "YLai Admin Dashboard: Calling Edge Function:",
    action
  );


  const {
    data,
    error
  } =
    await supabaseClient.functions.invoke(
      "admin-photo-action",
      {
        body: {
          action,
          photoId,
          nonce,
          timestamp,
          signature,
        },
      }
    );


  if (error) {

    console.error(
      "YLai Admin Dashboard: Edge Function error:",
      error
    );

    throw new Error(
      error.message ||
      "The admin action failed."
    );
  }


  if (
    !data ||
    data.success !== true
  ) {

    throw new Error(
      data?.error ||
      "The admin action was rejected."
    );
  }


  return data;
}


/*
 * =========================================
 * UNAPPROVE / DELETE
 * =========================================
 */

async function toggleApproval(
  photo,
  button
) {

  const originalText =
    button.textContent;


  const confirmed =
    window.confirm(

      "Unapprove this photo?\n\n" +

      (
        photo.file_name ||
        "Photo"
      ) +

      "\n\n" +

      "This will permanently remove the photo from the gallery."

    );


  if (!confirmed) {

    return;
  }


  /*
   * Unapprove currently means delete.
   */

  const action =
    "delete";


  button.disabled =
    true;

  button.textContent =
    "Removing...";


  try {

    console.log(
      "YLai Admin Dashboard: Photo action:",
      action,
      photo.id
    );


    await callAdminAction(
      action,
      photo.id
    );


    console.log(
      "YLai Admin Dashboard: Photo action completed."
    );


    /*
     * Reload immediately after successful
     * removal.
     */

    await loadGallery();


  } catch (error) {

    console.error(
      "YLai Admin Dashboard: Photo action failed:",
      error
    );


    if (
      error?.code === 4001 ||
      error?.message?.toLowerCase().includes(
        "user rejected"
      )
    ) {

      alert(
        "The MetaMask signature was cancelled."
      );


    } else {

      alert(
        "Unable to remove photo.\n\n" +
        (
          error.message ||
          "Unknown error"
        )
      );
    }


    button.textContent =
      originalText;


  } finally {

    button.disabled =
      false;
  }
}


/*
 * =========================================
 * RSVP SECTION
 * =========================================
 */

async function loadRSVPs() {

  console.log(
    "YLai Admin Dashboard: Loading RSVPs..."
  );


  if (!currentWallet) {

    return;
  }


  rsvpStatus.textContent =
    "Checking RSVPs...";

  rsvpStatus.className =
    "status";


  try {

    let body;


    /*
     * =======================================
     * USE EXISTING ADMIN SESSION
     * =======================================
     */

    if (adminSessionToken) {

      body = {
        session_token:
          adminSessionToken
      };


    } else {


      /*
       * =======================================
       * INITIAL METAMASK AUTHENTICATION
       * =======================================
       */

      const nonce =
        crypto.randomUUID();


      const timestamp =
        Date.now();


      const message = [

        "YLai Admin RSVP Access",

        `Nonce: ${nonce}`,

        `Timestamp: ${timestamp}`,

      ].join("\n");


      console.log(
        "YLai Admin Dashboard: Requesting RSVP access signature..."
      );


      const signature =
        await window.ethereum.request({

          method:
            "personal_sign",

          params: [
            message,
            currentWallet,
          ],

        });


      if (!signature) {

        throw new Error(
          "MetaMask signature was not provided."
        );
      }


      body = {

        message,

        signature,

        nonce,

        timestamp,

      };
    }


    /*
     * =======================================
     * CALL RSVP EDGE FUNCTION
     * =======================================
     */

    const {
      data,
      error
    } =
      await supabaseClient.functions.invoke(
        "admin-rsvp-list",
        {
          body,
        }
      );


    if (error) {

      console.error(
        "YLai Admin Dashboard: RSVP Edge Function error:",
        error
      );


      if (adminSessionToken) {

        adminSessionToken =
          null;
      }


      throw new Error(
        error.message ||
        "Unable to load RSVP records."
      );
    }


    if (
      !data ||
      data.success !== true
    ) {

      if (
        adminSessionToken &&
        (
          data?.error ===
            "Invalid session" ||

          data?.error ===
            "Session expired" ||

          data?.error ===
            "Unauthorized session"
        )
      ) {

        adminSessionToken =
          null;


        rsvpStatus.textContent =
          "Admin session expired. Reload the dashboard to sign in again.";

        rsvpStatus.className =
          "status error";


        return;
      }


      throw new Error(
        data?.error ||
        "The RSVP request was rejected."
      );
    }


    /*
     * =======================================
     * SAVE SESSION TOKEN
     * =======================================
     */

    if (data.session_token) {

      adminSessionToken =
        data.session_token;


      console.log(
        "YLai Admin Dashboard: RSVP admin session established."
      );
    }


    const rsvps =
      Array.isArray(data.rsvps)
        ? data.rsvps
        : [];


    /*
     * =======================================
     * TOTAL RSVPs
     * =======================================
     */

    totalRSVPs.textContent =
      rsvps.length;


    /*
    * =======================================
    * ATTENDING
    * =======================================
    */

    const attending =
      rsvps.filter(
        (rsvp) => {

          const attendance =
            String(
              rsvp.attendance ||
              ""
            ).toLowerCase().trim();


          return attendance === "confirmed";

        }
      );


    /*
    * =======================================
    * NOT ATTENDING
    * =======================================
    */

    const notAttending =
      rsvps.filter(
        (rsvp) => {

          const attendance =
            String(
              rsvp.attendance ||
              ""
            ).toLowerCase().trim();


          return attendance === "declined";

        }
      );


    attendingRSVPs.textContent =
      attending.length;


    notAttendingRSVPs.textContent =
      notAttending.length;


    /*
    * =======================================
    * TOTAL COMPANIONS
    * =======================================
    */

    const companionCount =
      rsvps.reduce(
        (
          total,
          rsvp
        ) => {

          const value =
            Number(
              rsvp.companion
            );


          return (
            total +

            (
              Number.isFinite(
                value
              )
                ? value
                : 0
            )
          );

        },
        0
      );


    totalCompanions.textContent =
      companionCount;


    /*
     * =======================================
     * EMPTY STATE
     * =======================================
     */

    rsvpTableBody.innerHTML =
      "";


    if (!rsvps.length) {

      const row =
        document.createElement(
          "tr"
        );


      const cell =
        document.createElement(
          "td"
        );


      cell.colSpan =
        5;


      cell.className =
        "rsvp-empty";


      cell.textContent =
        "No RSVPs yet.";


      row.appendChild(
        cell
      );


      rsvpTableBody.appendChild(
        row
      );


      rsvpStatus.textContent =
        "No RSVPs found.";


      return;
    }


    /*
     * =======================================
     * RENDER RSVP RECORDS
     * =======================================
     */

    rsvps.forEach(
      (rsvp) => {

        const row =
          document.createElement(
            "tr"
          );


        /*
         * GUEST NAME
         */

        const guestCell =
          document.createElement(
            "td"
          );

        guestCell.textContent =
          rsvp.guest_name ||
          "—";


        /*
         * COMPANION
         */

        const companionCell =
          document.createElement(
            "td"
          );

        companionCell.textContent =
          Number(
            rsvp.companion
          ) || 0;


        /*
         * ATTENDANCE
         */

        const attendanceCell =
          document.createElement(
            "td"
          );


        const attendance =
          String(
            rsvp.attendance ||
            ""
          );


        const attendanceText =
          attendance.toLowerCase();


        attendanceCell.textContent =
          attendance ||
          "—";


        if (
          attendanceText.includes(
            "can't"
          ) ||

          attendanceText.includes(
            "cant"
          ) ||

          attendanceText.includes(
            "sorry"
          )
        ) {

          attendanceCell.className =
            "rsvp-not-attending";


        } else {

          attendanceCell.className =
            "rsvp-attending";
        }


        /*
         * MESSAGE
         */

        const messageCell =
          document.createElement(
            "td"
          );

        messageCell.textContent =
          rsvp.message ||
          "—";


        /*
         * SUBMITTED DATE
         */

        const dateCell =
          document.createElement(
            "td"
          );

        dateCell.textContent =
          formatDate(
            rsvp.created_at
          );


        /*
         * ADD CELLS
         */

        row.appendChild(
          guestCell
        );

        row.appendChild(
          companionCell
        );

        row.appendChild(
          attendanceCell
        );

        row.appendChild(
          messageCell
        );

        row.appendChild(
          dateCell
        );


        rsvpTableBody.appendChild(
          row
        );
      }
    );


    /*
     * =======================================
     * SUCCESS
     * =======================================
     */

    rsvpStatus.textContent =
      rsvps.length +
      " RSVP" +
      (
        rsvps.length === 1
          ? ""
          : "s"
      ) +
      " loaded.";


    rsvpStatus.className =
      "status success";


  } catch (error) {

    console.error(
      "YLai Admin Dashboard: RSVP loading failed:",
      error
    );


    if (
      error?.code === 4001 ||
      error?.message?.toLowerCase().includes(
        "user rejected"
      )
    ) {

      rsvpStatus.textContent =
        "MetaMask signature was cancelled.";


    } else {

      rsvpStatus.textContent =
        "Unable to load RSVPs: " +
        (
          error.message ||
          "Unknown error"
        );
    }


    rsvpStatus.className =
      "status error";
  }
}


/*
 * =========================================
 * RSVP AUTO REFRESH
 * =========================================
 */

function startRSVPAutoRefresh() {

  if (rsvpAutoRefreshTimer) {

    clearInterval(
      rsvpAutoRefreshTimer
    );
  }


  /*
   * Check for new RSVPs every 30 seconds.
   *
   * The existing secure session token
   * is used, so MetaMask is NOT requested
   * again during automatic refreshes.
   */

  rsvpAutoRefreshTimer =
    setInterval(
      function () {

        if (!adminSessionToken) {

          return;
        }


        loadRSVPs();

      },
      30000
    );
}


/*
 * =========================================
 * GALLERY AUTO REFRESH
 * =========================================
 */

function startGalleryAutoRefresh() {

  if (galleryAutoRefreshTimer) {

    clearInterval(
      galleryAutoRefreshTimer
    );
  }


  /*
   * Check for new gallery photos every
   * 30 seconds.
   *
   * The existing secure admin session
   * token is reused, so MetaMask is NOT
   * requested again during automatic
   * refreshes.
   */

  galleryAutoRefreshTimer =
    setInterval(
      function () {

        if (!adminSessionToken) {

          return;
        }


        /*
         * true = background refresh.
         *
         * Gallery updates silently without
         * showing "Loading photos..."
         */

        loadGallery(true);

      },
      30000
    );
}


/*
 * =========================================
 * DATE
 * =========================================
 */

function formatDate(value) {

  if (!value) {

    return "";
  }


  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );
}


/*
 * =========================================
 * PHOTO VIEWER
 * =========================================
 */

function openPhoto(
  image,
  caption
) {

  modalImage.src =
    image;

  modalImage.alt =
    caption;

  modalCaption.textContent =
    caption;

  photoModal.hidden =
    false;

  document.body.style.overflow =
    "hidden";
}


function closeModal() {

  photoModal.hidden =
    true;

  modalImage.src =
    "";

  document.body.style.overflow =
    "";
}


/*
 * =========================================
 * LOGOUT
 * =========================================
 */

function disconnectAdmin() {

  console.log(
    "YLai Admin Dashboard: Logging out..."
  );

  clearAdminSession();

  redirectToLogin();
}


/*
 * =========================================
 * EVENT LISTENERS
 * =========================================
 */

disconnectButton.addEventListener(
  "click",
  disconnectAdmin
);


closePhotoModal.addEventListener(
  "click",
  closeModal
);


photoModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      photoModal
    ) {

      closeModal();
    }
  }
);


/*
 * =========================================
 * ESC KEY
 * =========================================
 */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      !photoModal.hidden
    ) {

      closeModal();
    }
  }
);


/*
 * =========================================
 * METAMASK ACCOUNT CHANGE
 * =========================================
 */

if (
  typeof window.ethereum !==
  "undefined"
) {

  window.ethereum.on(
    "accountsChanged",
    function (accounts) {

      console.log(
        "YLai Admin Dashboard: Account changed.",
        accounts
      );


      if (
        !accounts.length ||
        accounts[0].toLowerCase() !==
          ADMIN_WALLET
      ) {

        clearAdminSession();

        redirectToLogin();
      }
    }
  );
}


/*
 * =========================================
 * INITIALIZE
 * =========================================
 */

async function initializeDashboard() {

  console.log(
    "YLai Admin Dashboard: Initializing..."
  );


  const authenticated =
    await verifySession();


  if (!authenticated) {

    return;
  }


  /*
   * RSVP establishes the secure admin
   * session token used by both RSVP
   * and Gallery.
   */

  await loadRSVPs();


  /*
   * Only load and start Gallery
   * auto-refresh after the secure
   * admin session exists.
   */

  if (adminSessionToken) {

    await loadGallery();

    startGalleryAutoRefresh();
  }


  startRSVPAutoRefresh();
}


initializeDashboard();