/* =========================================
   YLAI ADMIN
   MetaMask Authentication
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

const loginScreen =
  document.getElementById(
    "loginScreen"
  );


const dashboardScreen =
  document.getElementById(
    "dashboardScreen"
  );


const connectButton =
  document.getElementById(
    "connectButton"
  );


const disconnectButton =
  document.getElementById(
    "disconnectButton"
  );


const loginStatus =
  document.getElementById(
    "loginStatus"
  );


const galleryStatus =
  document.getElementById(
    "galleryStatus"
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


const pendingPhotos =
  document.getElementById(
    "pendingPhotos"
  );


const photoGrid =
  document.getElementById(
    "photoGrid"
  );


const emptyState =
  document.getElementById(
    "emptyState"
  );


const refreshButton =
  document.getElementById(
    "refreshButton"
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
 * STATE
 * =========================================
 */

let currentWallet = null;



/*
 * =========================================
 * HELPERS
 * =========================================
 */

function setLoginStatus(
  message,
  type = ""
) {

  if (!loginStatus) {
    return;
  }

  loginStatus.textContent =
    message;

  loginStatus.className =
    "status " + type;

}


function setGalleryStatus(
  message,
  type = ""
) {

  if (!galleryStatus) {
    return;
  }

  galleryStatus.textContent =
    message;

  galleryStatus.className =
    "status " + type;

}


function shortAddress(
  address
) {

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



/*
 * =========================================
 * METAMASK CHECK
 * =========================================
 */

function hasMetaMask() {

  return (
    typeof window.ethereum !==
    "undefined"
  );

}



/*
 * =========================================
 * CONNECT METAMASK
 * =========================================
 */

async function connectMetaMask() {

  console.log(
    "YLai Admin: Starting MetaMask authentication..."
  );


  /*
   * Check MetaMask.
   */

  if (!hasMetaMask()) {

    console.error(
      "YLai Admin: MetaMask was not detected."
    );

    setLoginStatus(
      "MetaMask was not detected. Please install MetaMask first.",
      "error"
    );

    return;

  }


  connectButton.disabled =
    true;


  setLoginStatus(
    "Connecting to MetaMask..."
  );


  try {


    /*
     * =========================================
     * REQUEST WALLET
     * =========================================
     */

    console.log(
      "YLai Admin: Requesting wallet account..."
    );


    const accounts =
      await window.ethereum.request({
        method:
          "eth_requestAccounts"
      });


    if (
      !accounts ||
      !accounts.length
    ) {

      throw new Error(
        "No wallet account was returned."
      );

    }


    const account =
      accounts[0].toLowerCase();


    console.log(
      "YLai Admin: Wallet connected:",
      account
    );


    /*
     * =========================================
     * CHECK ADMIN WALLET
     * =========================================
     */

    if (
      account !==
      ADMIN_WALLET
    ) {

      console.warn(
        "YLai Admin: Unauthorized wallet:",
        account
      );


      setLoginStatus(
        "This wallet is not authorized to access the admin page.",
        "error"
      );


      clearAdminSession();


      return;

    }


    currentWallet =
      account;


    console.log(
      "YLai Admin: Authorized wallet confirmed."
    );


    /*
     * =========================================
     * CREATE NONCE
     * =========================================
     */

    const nonce =
      crypto.randomUUID();


    const message =
      [
        "YLai Admin Login",
        "",
        "Sign this message to authenticate",
        "your MetaMask wallet.",
        "",
        "Wallet: " + account,
        "Nonce: " + nonce,
        "",
        "This signature does not authorize",
        "any blockchain transaction."
      ].join("\n");


    console.log(
      "YLai Admin: Requesting signature..."
    );


    setLoginStatus(
      "Please confirm the signature in MetaMask..."
    );


    /*
     * =========================================
     * REQUEST SIGNATURE
     * =========================================
     */

    const signature =
      await window.ethereum.request({

        method:
          "personal_sign",

        params: [
          message,
          account
        ]

      });


    console.log(
      "YLai Admin: Signature successful."
    );


    console.log(
      "YLai Admin: Wallet:",
      account
    );


    /*
     * =========================================
     * STORE SESSION
     * =========================================
     */

    sessionStorage.setItem(
      "ylai_admin_wallet",
      account
    );


    sessionStorage.setItem(
      "ylai_admin_authenticated",
      "true"
    );


    sessionStorage.setItem(
      "ylai_admin_auth_time",
      Date.now().toString()
    );


    /*
     * Keep signature in memory only.
     */

    window.ylaiAdminSignature =
      signature;


    /*
     * =========================================
     * SHOW DASHBOARD
     * =========================================
     */

    console.log(
      "YLai Admin: Authentication complete."
    );


    await showDashboard();


  } catch (error) {


    console.error(
      "YLai Admin: MetaMask authentication error:",
      error
    );


    /*
     * User rejected request.
     */

    if (
      error &&
      error.code === 4001
    ) {

      setLoginStatus(
        "Signature request was cancelled.",
        "error"
      );


      return;

    }


    setLoginStatus(
      error.message ||
      "Unable to authenticate with MetaMask.",
      "error"
    );


  } finally {

    connectButton.disabled =
      false;

  }

}



/*
 * =========================================
 * RESTORE SESSION
 * =========================================
 */

async function restoreSession() {

  console.log(
    "YLai Admin: Checking existing session..."
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


  /*
   * Session expires after 12 hours.
   */

  const SESSION_DURATION =
    12 * 60 * 60 * 1000;


  /*
   * No valid session.
   */

  if (
    !savedWallet ||
    authenticated !== "true" ||
    !authTime ||
    Date.now() - authTime >
      SESSION_DURATION
  ) {

    console.log(
      "YLai Admin: No valid session found."
    );


    clearAdminSession();

    return;

  }


  /*
   * Make sure saved wallet is ours.
   */

  if (
    savedWallet.toLowerCase() !==
    ADMIN_WALLET
  ) {

    console.warn(
      "YLai Admin: Saved wallet is not authorized."
    );


    clearAdminSession();

    return;

  }


  /*
   * Check current MetaMask account.
   */

  if (hasMetaMask()) {

    try {

      const accounts =
        await window.ethereum.request({
          method:
            "eth_accounts"
        });


      /*
       * No active wallet.
       */

      if (!accounts.length) {

        console.log(
          "YLai Admin: No active MetaMask account."
        );


        clearAdminSession();

        return;

      }


      /*
       * Wrong wallet.
       */

      if (
        accounts[0].toLowerCase() !==
        ADMIN_WALLET
      ) {

        console.warn(
          "YLai Admin: Active MetaMask wallet is not authorized."
        );


        clearAdminSession();

        return;

      }


    } catch (error) {

      console.warn(
        "YLai Admin: Unable to verify current MetaMask account.",
        error
      );

    }

  }


  currentWallet =
    ADMIN_WALLET;


  console.log(
    "YLai Admin: Existing session restored."
  );


  await showDashboard();

}



/*
 * =========================================
 * SHOW DASHBOARD
 * =========================================
 */

async function showDashboard() {

  console.log(
    "YLai Admin: Showing dashboard..."
  );


  /*
   * =========================================
   * HIDE LOGIN
   * =========================================
   */

  loginScreen.hidden = true;
  loginScreen.style.display = "none";


  /*
   * =========================================
   * SHOW DASHBOARD
   * =========================================
   */

  dashboardScreen.hidden = false;
  dashboardScreen.style.display = "block";


  /*
   * Show wallet.
   */

  walletAddress.textContent =
    shortAddress(
      currentWallet
    );


  console.log(
    "YLai Admin: Dashboard is visible."
  );


  /*
   * =========================================
   * LOAD GALLERY
   * =========================================
   */

  setGalleryStatus(
    "Loading photos..."
  );


  try {

    await loadGallery();

  } catch (error) {

    console.error(
      "YLai Admin: Gallery loading failed:",
      error
    );

    setGalleryStatus(
      "Dashboard connected, but the gallery could not be loaded.",
      "error"
    );

  }

}



/*
 * =========================================
 * LOGOUT
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


  window.ylaiAdminSignature =
    null;


  currentWallet =
    null;

}


async function disconnectWallet() {

  console.log(
    "YLai Admin: Disconnecting..."
  );


  clearAdminSession();


  /*
   * Hide dashboard.
   */

  dashboardScreen.hidden = true;
  dashboardScreen.style.display = "none";


  /*
   * Show login screen.
   */

  loginScreen.hidden = false;
  loginScreen.style.display = "grid";


  walletAddress.textContent =
    "Connected";


  setLoginStatus(
    "Wallet disconnected."
  );

}



/*
 * =========================================
 * LOAD GALLERY
 * =========================================
 */

async function loadGallery() {

  console.log(
    "YLai Admin: Loading gallery..."
  );


  setGalleryStatus(
    "Loading photos..."
  );


  photoGrid.innerHTML =
    "";


  emptyState.hidden =
    true;


  try {


    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          "gallery_photos"
        )
        .select(
          "id,file_name,storage_path,caption,uploaded_by,approved,created_at"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        "YLai Admin: Supabase error:",
        error
      );


      throw error;

    }


    const photos =
      data || [];


    console.log(
      "YLai Admin: Photos loaded:",
      photos.length
    );


    /*
     * =========================================
     * UPDATE STATISTICS
     * =========================================
     */

    totalPhotos.textContent =
      photos.length;


    approvedPhotos.textContent =
      photos.filter(
        photo =>
          photo.approved === true
      ).length;


    pendingPhotos.textContent =
      photos.filter(
        photo =>
          photo.approved !== true
      ).length;


    /*
     * =========================================
     * EMPTY
     * =========================================
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
     * =========================================
     * RENDER PHOTOS
     * =========================================
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
      "YLai Admin: Gallery loading error:",
      error
    );


    setGalleryStatus(
      "Unable to load gallery: " +
      (
        error.message ||
        "Unknown error"
      ),
      "error"
    );


    throw error;

  }

}



/*
 * =========================================
 * RENDER PHOTO
 * =========================================
 */

function renderPhoto(
  photo
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "photo-card";


  /*
   * =========================================
   * SUPABASE PUBLIC URL
   * =========================================
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
   * =========================================
   * IMAGE
   * =========================================
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
   * =========================================
   * INFO
   * =========================================
   */

  const info =
    document.createElement(
      "div"
    );


  info.className =
    "photo-info";


  /*
   * FILE NAME
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
   * UPLOADER
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
   * DATE
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
   * APPROVAL STATUS
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
   * =========================================
   * ACTIONS
   * =========================================
   */

  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "photo-actions";


  /*
   * VIEW
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
   * APPROVE / UNAPPROVE
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
    photo.approved
      ? "Unapprove"
      : "Approve";


  approveButton.addEventListener(
    "click",
    async function () {

      await toggleApproval(
        photo,
        approveButton
      );

    }
  );


  /*
   * DELETE
   */

  const deleteButton =
    document.createElement(
      "button"
    );


  deleteButton.type =
    "button";


  deleteButton.className =
    "photo-action-button danger";


  deleteButton.textContent =
    "Delete";


  deleteButton.addEventListener(
    "click",
    async function () {

      await deletePhoto(
        photo,
        deleteButton
      );

    }
  );


  /*
   * ADD ACTIONS
   */

  actions.appendChild(
    viewButton
  );


  actions.appendChild(
    approveButton
  );


  actions.appendChild(
    deleteButton
  );


  /*
   * =========================================
   * BUILD CARD
   * =========================================
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
 * TOGGLE APPROVAL
 * =========================================
 */

async function toggleApproval(
  photo,
  button
) {

  const newStatus =
    !photo.approved;


  const originalText =
    button.textContent;


  button.disabled =
    true;


  button.textContent =
    "Saving...";


  try {

    console.log(
      "YLai Admin: Updating approval:",
      photo.id,
      newStatus
    );


    /*
     * TEMPORARY DIRECT DATABASE UPDATE
     *
     * This will later be moved to a
     * Supabase Edge Function with
     * MetaMask signature verification.
     */

    const {
      error
    } =
      await supabaseClient
        .from(
          "gallery_photos"
        )
        .update({
          approved:
            newStatus
        })
        .eq(
          "id",
          photo.id
        );


    if (error) {

      throw error;

    }


    console.log(
      "YLai Admin: Approval updated successfully."
    );


    await loadGallery();


  } catch (error) {

    console.error(
      "YLai Admin: Approval update failed:",
      error
    );


    alert(
      "Unable to update photo approval.\n\n" +
      (
        error.message ||
        "Unknown error"
      )
    );


    button.textContent =
      originalText;


  } finally {

    button.disabled =
      false;

  }

}



/*
 * =========================================
 * DELETE PHOTO
 * =========================================
 */

async function deletePhoto(
  photo,
  button
) {

  const confirmed =
    window.confirm(
      "Delete this photo?\n\n" +
      (
        photo.file_name ||
        "Photo"
      ) +
      "\n\n" +
      "This will permanently remove the photo."
    );


  if (!confirmed) {

    return;

  }


  button.disabled =
    true;


  button.textContent =
    "Deleting...";


  try {

    console.log(
      "YLai Admin: Deleting photo:",
      photo.id
    );


    /*
     * =========================================
     * DELETE DATABASE RECORD
     * =========================================
     */

    const {
      error:
        databaseError
    } =
      await supabaseClient
        .from(
          "gallery_photos"
        )
        .delete()
        .eq(
          "id",
          photo.id
        );


    if (databaseError) {

      throw databaseError;

    }


    console.log(
      "YLai Admin: Database record deleted."
    );


    /*
     * =========================================
     * DELETE STORAGE FILE
     * =========================================
     */

    const {
      error:
        storageError
    } =
      await supabaseClient
        .storage
        .from(
          "gallery"
        )
        .remove([
          photo.storage_path
        ]);


    /*
     * Storage deletion failure should
     * not undo the database deletion.
     */

    if (storageError) {

      console.warn(
        "YLai Admin: Database record deleted, but storage file could not be removed:",
        storageError
      );

    } else {

      console.log(
        "YLai Admin: Storage file deleted."
      );

    }


    /*
     * =========================================
     * REFRESH
     * =========================================
     */

    await loadGallery();


  } catch (error) {

    console.error(
      "YLai Admin: Delete failed:",
      error
    );


    alert(
      "Unable to delete photo.\n\n" +
      (
        error.message ||
        "Unknown error"
      )
    );


    button.disabled =
      false;


    button.textContent =
      "Delete";

  }

}



/*
 * =========================================
 * DATE FORMAT
 * =========================================
 */

function formatDate(
  value
) {

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
 * EVENT LISTENERS
 * =========================================
 */

connectButton.addEventListener(
  "click",
  connectMetaMask
);


disconnectButton.addEventListener(
  "click",
  disconnectWallet
);


refreshButton.addEventListener(
  "click",
  async function () {

    console.log(
      "YLai Admin: Refreshing gallery..."
    );


    try {

      await loadGallery();

    } catch (error) {

      console.error(
        "YLai Admin: Refresh failed:",
        error
      );

    }

  }
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
 * METAMASK ACCOUNT CHANGES
 * =========================================
 */

if (hasMetaMask()) {

  window.ethereum.on(
    "accountsChanged",
    function (accounts) {

      console.log(
        "YLai Admin: MetaMask account changed.",
        accounts
      );


      /*
       * No wallet connected.
       */

      if (!accounts.length) {

        clearAdminSession();


        dashboardScreen.hidden =
          true;


        loginScreen.hidden =
          false;


        setLoginStatus(
          "MetaMask wallet disconnected.",
          "error"
        );


        return;

      }


      /*
       * Wrong wallet connected.
       */

      if (
        accounts[0].toLowerCase() !==
        ADMIN_WALLET
      ) {

        clearAdminSession();


        dashboardScreen.hidden =
          true;


        loginScreen.hidden =
          false;


        setLoginStatus(
          "The connected wallet is not the authorized admin wallet.",
          "error"
        );


        return;

      }


      /*
       * Correct wallet.
       */

      currentWallet =
        ADMIN_WALLET;


      walletAddress.textContent =
        shortAddress(
          ADMIN_WALLET
        );

    }
  );

}



/*
 * =========================================
 * INITIALIZE
 * =========================================
 */

console.log(
  "YLai Admin: Initializing..."
);


console.log(
  "YLai Admin: MetaMask detected:",
  hasMetaMask()
);


console.log(
  "YLai Admin: Authorized wallet:",
  ADMIN_WALLET
);


restoreSession();