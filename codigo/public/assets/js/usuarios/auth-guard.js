export function verificarUsuarioLogado() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  if (!usuarioLogado) {
    alert("Você precisa estar logado para acessar esta página!");
    window.location.href = "../auth/login.html";
    return null;
  }

  return JSON.parse(usuarioLogado);
}

export function verificarAdmin() {
  const adminLogado = localStorage.getItem("adminLogado");

  if (!adminLogado) {
    alert("Acesso restrito a administradores!");
    window.location.href = "../auth/login-admin.html";
    return null;
  }

  return JSON.parse(adminLogado);
}

export function logoutUsuario() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("lembrarLogin");
  window.location.href = "../auth/login.html";
}

export function logoutAdmin() {
  localStorage.removeItem("adminLogado");
  window.location.href = "../auth/login-admin.html";
}

export function getUsuarioLogado() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  return usuarioLogado ? JSON.parse(usuarioLogado) : null;
}

export function getAdminLogado() {
  const adminLogado = localStorage.getItem("adminLogado");
  return adminLogado ? JSON.parse(adminLogado) : null;
}
