const form = document.getElementById("form-login-admin");
const alertContainer = document.getElementById("alert-container");
const ADMIN_CREDENTIALS = {
  email: "admin@poupai.com",
  senha: "admin123",
};

const togglePassword = document.getElementById("toggle-password");
const senhaInput = document.getElementById("senha");

togglePassword.addEventListener("click", () => {
  const type = senhaInput.type === "password" ? "text" : "password";
  senhaInput.type = type;

  const icon = togglePassword.querySelector("i");
  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

function showAlert(message, type = "danger") {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <i class="bi bi-${
        type === "success" ? "check-circle" : "exclamation-triangle"
      }"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}

function verificarLoginAdmin() {
  const adminLogado = localStorage.getItem("adminLogado");
  if (adminLogado) {
    window.location.href = "dashboard-admin.html";
  }
}

function fazerLoginAdmin(email, senha) {
  if (email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha) {
    const adminData = {
      email: ADMIN_CREDENTIALS.email,
      role: "admin",
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("adminLogado", JSON.stringify(adminData));

    showAlert(
      "Login administrativo realizado com sucesso! Redirecionando...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "dashboard-admin.html";
    }, 1500);

    return true;
  } else {
    showAlert(
      "Credenciais de administrador inválidas. Acesso negado.",
      "danger"
    );
    return false;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = senhaInput.value;

  if (!email || !senha) {
    showAlert("Por favor, preencha todos os campos.", "danger");
    return;
  }

  const btnSubmit = form.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';

  fazerLoginAdmin(email, senha);

  setTimeout(() => {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML =
      '<i class="bi bi-shield-lock"></i> Acessar Painel Admin';
  }, 1000);
});

verificarLoginAdmin();
