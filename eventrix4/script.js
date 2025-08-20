const text = "Welcome to Eventrix";
const welcomeEl = document.getElementById("welcome-text");
const buttonsEl = document.getElementById("buttons");
const themeToggle = document.getElementById("theme-toggle");
const logoEl = document.getElementById("logo");
let index = 0;


const typing = setInterval(() => {
  welcomeEl.textContent += text[index];
  index++;
  if (index === text.length) {
    clearInterval(typing);
    setTimeout(() => {
      welcomeEl.classList.add("move-up");
      buttonsEl.classList.add("fade-in");
    }, 500); 
  }
}, 100);

function toggleTheme()
{
  document.body.classList.toggle("light");
  
  themeToggle.textContent = document.body.classList.contains("light") 
    ? "🌙 Dark" 
    : "☀ Light";

  
  if (document.body.classList.contains("light")) {
    logoEl.src = "logo-light.png"; 
  } else {
    logoEl.src = "logo-dark.png"; 
  }
}

themeToggle.addEventListener("click", () => {
  toggleTheme();
});

const loginBtn = document.getElementById("open-login"); 
const modal = document.getElementById("login-modal");
const closeBtn = document.querySelector(".close-btn");
const userField = document.getElementsByClassName("username-field")[0];
const passField = document.getElementsByClassName("pass-field")[0];
const submitBtn = document.getElementsByClassName("btn-login-submit")[0];
const loginStatus = document.getElementById("login-message");

const backend = "https://478f5f46aca4.ngrok-free.app/";

class AuthenticationInfo
{
  constructor(username, password, token, role, expiresAt)
  {
    this.username = username;
    this.password = password;
    this.token = token;
    this.role = role;
    this.expiresAt = expiresAt;
  }

  save()
  {
	  localStorage.setItem("username", this.username);
	  localStorage.setItem("password", this.password);
  }
}

var AuthInfo = new AuthenticationInfo();

async function handle_auth(data)
{
  const parsed = await data.json();

  AuthInfo = new AuthenticationInfo(parsed.details.username, parsed.details.password, parsed.details.role, parsed.token.code, parsed.token.expiresAt);
  AuthInfo.save();
  
  window.location.href = 'dashboard.html';
}

loginBtn.addEventListener("click", () => {
  modal.style.display = "block";
});


closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});


window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


const registerBtn = document.getElementById("open-register");
const registerModal = document.getElementById("register-modal");
const registerCloseBtn = registerModal.querySelector(".close-btn");
const regUserField = document.getElementsByClassName("username-field")[1];
const regPassField = document.getElementsByClassName("pass-field")[1];
const regSubmitBtn = document.getElementsByClassName("btn-register-submit")[0];
const registerStatus = document.getElementById("register-message");

// this is... annoying
function assert(b) { if (!b) {console.error("assertion failed")} }

assert(regUserField != undefined)
assert(regPassField != undefined)
assert(regSubmitBtn != undefined)

// Open modal
registerBtn.addEventListener("click", () => {
  registerModal.style.display = "block";
});

// Close modal
registerCloseBtn.addEventListener("click", () => {
  registerModal.style.display = "none";
});

// Close on outside click
window.addEventListener("click", (event) => {
  if (event.target === registerModal) {
    registerModal.style.display = "none";
  }
});

// Handle register submit
regSubmitBtn.addEventListener("click", async () => {
  let username = regUserField.value.trim();
  let password = regPassField.value.trim();

  if (!username || !password) {
    registerStatus.textContent = "Please fill all fields.";
    return;
  }

  try {
    const response = await fetch(backend + "/auth/register", { 
      method: "POST", 
      body: JSON.stringify({ username, password }), 
      headers: { "Content-Type": "application/json" } 
    });

    if (!response.ok) {
      const data = await response.json();
      registerStatus.textContent = translateError(data);
      return;
    }

    registerStatus.style.color = "green";
    registerStatus.textContent = "✅ Account created! You can now log in.";
    setTimeout(() => { registerModal.style.display = "none"; }, 1500);
    window.location.href = 'dashboard.html';
  } catch (exc) {
    registerStatus.textContent = "An error occurred.";
    throw exc;
  }
});

function translateError(data)
{
  console.log(data);
  let err = data.error
  switch (err)
  {
    case "INVALIDLOGIN": return "Invalid login credentials received, please recheck your details.";
    case "INVALIDTOKEN": return "Invalid login token passed to backend, please refresh this page and login again.";
    case "UNPRIVILEGED": return "Your account does not have Administrator privileges, so it cannot perform this action.";
    case "EXPIREDTOKEN": return "Your login details have expired, please refresh this page to continue.";
    case "INVALIDAUTHHEADER": return "Invalid authentication headers passed to backend, please refresh this page.";
    case "MISSINGAUTHHEADER": return "Client did not send authentication bearer to backend, please refresh this page.";
    case "USEREXISTS": return "This username is already taken. Please choose another.";

    default:
      return `An unknown error occurred! (${err})`;
  }
}

submitBtn.addEventListener("click", async (event) => {
  let username = userField.value;
  let password = passField.value;
  
  // Fetch login token from backend
  try {
    const response = await fetch(backend + "/auth/login", { method: "POST", body: JSON.stringify({username: username, password: password}), headers: {"Content-Type": "application/json"} })
    if (!response.ok)
    {
      const data = await response.json();
      loginStatus.textContent = translateError(data);
      return;
    }

    handle_auth(response);
  } catch (exc) {
    loginStatus.textContent = "An error occurred.";
    throw exc;
  }
})
