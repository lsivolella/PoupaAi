const API_URL = "http://localhost:3001";
const form = document.getElementById("form-cadastro");
const alertContainer = document.getElementById("alert-container");
const telefoneInput = document.getElementById("telefone");

telefoneInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length <= 11) {
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  }

  e.target.value = value;
});

const togglePassword = document.getElementById("toggle-password");
const senhaInput = document.getElementById("senha");
const toggleConfirmPassword = document.getElementById(
  "toggle-confirm-password"
);
const confirmarSenhaInput = document.getElementById("confirmar-senha");

togglePassword.addEventListener("click", () => {
  const type = senhaInput.type === "password" ? "text" : "password";
  senhaInput.type = type;

  const icon = togglePassword.querySelector("i");
  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

toggleConfirmPassword.addEventListener("click", () => {
  const type = confirmarSenhaInput.type === "password" ? "text" : "password";
  confirmarSenhaInput.type = type;

  const icon = toggleConfirmPassword.querySelector("i");
  icon.classList.toggle("bi-eye");
  icon.classList.toggle("bi-eye-slash");
});

const passwordStrength = document.getElementById("password-strength");

senhaInput.addEventListener("input", () => {
  const senha = senhaInput.value;

  if (senha.length === 0) {
    passwordStrength.className = "password-strength";
    return;
  }

  passwordStrength.classList.add("active");

  let strength = 0;
  if (senha.length >= 6) strength++;
  if (senha.length >= 10) strength++;
  if (/[A-Z]/.test(senha)) strength++;
  if (/[0-9]/.test(senha)) strength++;
  if (/[^A-Za-z0-9]/.test(senha)) strength++;

  if (strength <= 2) {
    passwordStrength.className = "password-strength active weak";
  } else if (strength <= 3) {
    passwordStrength.className = "password-strength active medium";
  } else {
    passwordStrength.className = "password-strength active strong";
  }
});

confirmarSenhaInput.addEventListener("input", validarSenhas);
senhaInput.addEventListener("input", () => {
  if (confirmarSenhaInput.value) validarSenhas();
});

function validarSenhas() {
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;

  if (confirmarSenha && senha !== confirmarSenha) {
    confirmarSenhaInput.classList.add("is-invalid");
    confirmarSenhaInput.classList.remove("is-valid");
    return false;
  } else if (confirmarSenha) {
    confirmarSenhaInput.classList.remove("is-invalid");
    confirmarSenhaInput.classList.add("is-valid");
    return true;
  }
  return true;
}

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

async function verificarEmailExistente(email) {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const usuarios = await response.json();
    return usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return false;
  }
}

async function cadastrarUsuario(nome, sobrenome, telefone, email, senha) {
  try {
    const emailExiste = await verificarEmailExistente(email);

    if (emailExiste) {
      showAlert(
        "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.",
        "danger"
      );
      return false;
    }

    const novoUsuario = {
      nome: `${nome} ${sobrenome}`,
      telefone,
      email,
      senha,
    };

    const response = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novoUsuario),
    });

    if (!response.ok) {
      throw new Error("Erro ao cadastrar usuário");
    }

    showAlert(
      "Cadastro realizado com sucesso! Redirecionando para o login...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

    return true;
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    showAlert("Erro ao criar conta. Tente novamente.", "danger");
    return false;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const sobrenome = document.getElementById("sobrenome").value.trim();
  const telefone = telefoneInput.value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = senhaInput.value;
  const confirmarSenha = confirmarSenhaInput.value;
  const termos = document.getElementById("termos").checked;

  let isValid = true;

  if (nome.length < 2) {
    document.getElementById("nome").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("nome").classList.remove("is-invalid");
  }
  if (sobrenome.length < 2) {
    document.getElementById("sobrenome").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("sobrenome").classList.remove("is-invalid");
  }
  if (telefone.length < 14) {
    telefoneInput.classList.add("is-invalid");
    isValid = false;
  } else {
    telefoneInput.classList.remove("is-invalid");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("email").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("email").classList.remove("is-invalid");
  }
  if (senha.length < 6) {
    senhaInput.classList.add("is-invalid");
    isValid = false;
  } else {
    senhaInput.classList.remove("is-invalid");
  }
  if (senha !== confirmarSenha) {
    confirmarSenhaInput.classList.add("is-invalid");
    showAlert(
      "As senhas não coincidem. Verifique e tente novamente.",
      "danger"
    );
    isValid = false;
  } else {
    confirmarSenhaInput.classList.remove("is-invalid");
  }
  if (!termos) {
    showAlert("Você deve aceitar os termos de uso para continuar.", "danger");
    isValid = false;
  }
  if (!isValid) return;

  const btnSubmit = form.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Criando conta...';

  await cadastrarUsuario(nome, sobrenome, telefone, email, senha);

  btnSubmit.disabled = false;
  btnSubmit.innerHTML = '<i class="bi bi-person-plus"></i> Criar Conta';
});
