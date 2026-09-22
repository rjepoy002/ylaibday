/* =========================================
   YLAI ADMIN LOGIN
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

const connectButton =
  document.getElementById(
    "connectButton"
  );


const loginStatus =
  document.getElementById(
    "loginStatus"
  );



/*
 * =========================================
 * HELPERS
 * =========================================
 */

function setLoginStatus(
  message,
  type = ""
) {

  loginStatus.textContent =
    message;

  loginStatus.className =
    "status " + type;

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
 * CLEAR SESSION
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

}



/*
 * =========================================
 * CONNECT METAMASK
 * =========================================
 */

async function connectMetaMask() {

  console.log(
    "YLai Admin Login: Starting authentication..."
  );


  if (!hasMetaMask()) {

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
     * =======================================
     * REQUEST ACCOUNT
     * =======================================
     */

    console.log(
      "YLai Admin Login: Requesting wallet..."
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
      "YLai Admin Login: Wallet connected:",
      account
    );


    /*
     * =======================================
     * CHECK AUTHORIZED WALLET
     * =======================================
     */

    if (
      account !==
      ADMIN_WALLET
    ) {

      clearAdminSession();


      setLoginStatus(
        "This wallet is not authorized to access the admin page.",
        "error"
      );


      console.warn(
        "YLai Admin Login: Unauthorized wallet:",
        account
      );


      return;

    }


    console.log(
      "YLai Admin Login: Authorized wallet confirmed."
    );


    /*
     * =======================================
     * CREATE NONCE
     * =======================================
     */

    const nonce =
      crypto.randomUUID();


    /*
     * =======================================
     * SIGN MESSAGE
     * =======================================
     */

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


    setLoginStatus(
      "Please confirm the signature in MetaMask..."
    );


    console.log(
      "YLai Admin Login: Requesting signature..."
    );


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
      "YLai Admin Login: Signature successful."
    );


    console.log(
      "YLai Admin Login: Authentication complete."
    );


    /*
     * =======================================
     * CREATE TEMPORARY SESSION
     * =======================================
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
     * Keep signature only in memory.
     */

    window.ylaiAdminSignature =
      signature;


    /*
     * =======================================
     * REDIRECT
     * =======================================
     */

    setLoginStatus(
      "Authentication successful. Opening dashboard...",
      "success"
    );


    console.log(
      "YLai Admin Login: Redirecting to dashboard..."
    );


    window.location.href =
      "dashboard.html";


  } catch (error) {


    console.error(
      "YLai Admin Login: Authentication error:",
      error
    );


    if (
      error &&
      error.code === 4001
    ) {

      setLoginStatus(
        "Signature request was cancelled.",
        "error"
      );

    } else {

      setLoginStatus(
        error.message ||
        "Unable to authenticate with MetaMask.",
        "error"
      );

    }

  } finally {

    connectButton.disabled =
      false;

  }

}



/*
 * =========================================
 * ALREADY AUTHENTICATED?
 * =========================================
 */

function checkExistingSession() {

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
   * No session.
   */

  if (
    !savedWallet ||
    authenticated !== "true" ||
    !authTime
  ) {

    return;

  }


  /*
   * Session expired.
   */

  if (
    Date.now() - authTime >
    SESSION_DURATION
  ) {

    clearAdminSession();

    return;

  }


  /*
   * Wrong wallet stored.
   */

  if (
    savedWallet.toLowerCase() !==
    ADMIN_WALLET
  ) {

    clearAdminSession();

    return;

  }


  /*
   * Check MetaMask account.
   */

  if (!hasMetaMask()) {

    clearAdminSession();

    return;

  }


  window.ethereum.request({
    method:
      "eth_accounts"

  }).then(
    function (accounts) {

      if (
        accounts.length &&
        accounts[0].toLowerCase() ===
          ADMIN_WALLET
      ) {

        console.log(
          "YLai Admin Login: Existing session found."
        );


        window.location.href =
          "dashboard.html";

      } else {

        clearAdminSession();

      }

    }
  ).catch(
    function (error) {

      console.error(
        "YLai Admin Login: Session check failed:",
        error
      );

    }
  );

}



/*
 * =========================================
 * EVENT
 * =========================================
 */

connectButton.addEventListener(
  "click",
  connectMetaMask
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

      if (
        accounts.length &&
        accounts[0].toLowerCase() ===
          ADMIN_WALLET
      ) {

        return;

      }


      clearAdminSession();

    }
  );

}



/*
 * =========================================
 * INITIALIZE
 * =========================================
 */

console.log(
  "YLai Admin Login: Initialized."
);


console.log(
  "YLai Admin Login: MetaMask detected:",
  hasMetaMask()
);


checkExistingSession();