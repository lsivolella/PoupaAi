const API_URL = "http://localhost:3001";
const form = document.getElementById("form-login");
const alertContainer = document.getElementById("alert-container");
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

function verificarLogin() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    window.location.href = "../index.html";
  }
}

async function fazerLogin(email, senha) {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();

    const usuario = usuarios.find((u) => u.email === email);

    if (!usuario) {
      showAlert("E-mail não encontrado. Verifique suas credenciais.", "danger");
      return false;
    }

    if (usuario.senha !== senha) {
      showAlert("Senha incorreta. Tente novamente.", "danger");
      return false;
    }

    const usuarioSemSenha = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioSemSenha));

    const lembrar = document.getElementById("lembrar").checked;
    if (lembrar) {
      localStorage.setItem("lembrarLogin", "true");
    }

    showAlert("Login realizado com sucesso! Redirecionando...", "success");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    showAlert("Erro ao conectar com o servidor. Tente novamente.", "danger");
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    showAlert("Por favor, preencha todos os campos.", "danger");
    return;
  }

  const btnSubmit = form.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

  await fazerLogin(email, senha);

  btnSubmit.disabled = false;
  btnSubmit.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Entrar';
});

verificarLogin();
