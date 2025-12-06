import { MercadoService } from "../../../services/mercado-service.js";

const status = document.getElementById("status");
const inputBusca = document.querySelector(".search-bar input");
const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const service = new MercadoService();

let usuarioAtual = null;
let mercados = [];
let marcadoresMercados = [];
let marcadorMaisProximo = null;

const iconeUsuario = L.icon({
  iconUrl: "../../assets/img/user.png",
  iconAnchor: [15, 40],
});
const iconeMercadoAzul = L.icon({
  iconUrl: "../../assets/img/shopping-cart.png",
  iconAnchor: [15, 40],
});
const iconeMercadoVermelho = L.icon({
  iconUrl: "../../assets/img/shopping-cart-red.png",
  iconAnchor: [15, 40],
});

function criarBotaoDetalhes(mercado) {
  return `<button 
            style="padding:8px 16px; background:#000; color:#fff; border:none; border-radius:8px; font-weight:600;"
            onclick="sessionStorage.setItem('mercadoId', ${mercado.id}); window.location.href='detalhes.html';">
            ♿ Ver Detalhes
          </button>`;
}

async function carregarMercados() {
  try {
    mercados = await service.getMercados();

    mercados.forEach((m) => {
      const marker = L.marker(
        [m.localizacao.latitude, m.localizacao.longitude],
        {
          icon: iconeMercadoAzul,
        }
      ).addTo(map).bindPopup(`
        <div style="text-align:center;">
          <b>${m.nome}</b><br>
          ${m.endereco}<br><br>
          ${criarBotaoDetalhes(m)}
        </div>
      `);

      marcadoresMercados.push({ id: m.id, marker });
    });
  } catch (err) {
    console.error("Erro ao carregar mercados:", err);
    status.textContent = "❌ Erro ao carregar os mercados.";
  }
}

function localizarUsuario() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        usuarioAtual = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        status.textContent = `📍 Você está em: ${usuarioAtual.latitude.toFixed(
          5
        )}, ${usuarioAtual.longitude.toFixed(5)}`;

        map.setView([usuarioAtual.latitude, usuarioAtual.longitude], 15);

        L.marker([usuarioAtual.latitude, usuarioAtual.longitude], {
          icon: iconeUsuario,
        })
          .addTo(map)
          .bindPopup("📍 Sua localização atual")
          .openPopup();

        carregarMercados().then(destacarMaisProximo);
      },
      () => {
        status.textContent = "⚠️ Não foi possível obter sua localização.";
        map.setView([-19.6305, -43.936], 13);
        carregarMercados();
      }
    );
  } else {
    status.textContent = "⚠️ Geolocalização não suportada pelo navegador.";
    map.setView([-19.6305, -43.936], 13);
    carregarMercados();
  }
}

function destacarMaisProximo() {
  if (!usuarioAtual || mercados.length === 0) return;

  let maisProximo = mercados[0];
  let menorDist = calcularDistancia(
    usuarioAtual.latitude,
    usuarioAtual.longitude,
    maisProximo.localizacao.latitude,
    maisProximo.localizacao.longitude
  );

  for (let i = 1; i < mercados.length; i++) {
    const m = mercados[i];
    const dist = calcularDistancia(
      usuarioAtual.latitude,
      usuarioAtual.longitude,
      m.localizacao.latitude,
      m.localizacao.longitude
    );
    if (dist < menorDist) {
      menorDist = dist;
      maisProximo = m;
    }
  }

  marcadoresMercados.forEach((m) => m.marker.setIcon(iconeMercadoAzul));

  marcadorMaisProximo = marcadoresMercados.find(
    (m) => m.id === maisProximo.id
  ).marker;
  marcadorMaisProximo.setIcon(iconeMercadoVermelho);
  marcadorMaisProximo
    .bindPopup(
      `
    <div style="text-align:center;">
      <b>${maisProximo.nome} (mais próximo)</b><br>
      ${maisProximo.endereco}<br><br>
      ${criarBotaoDetalhes(maisProximo)}
    </div>
  `
    )
    .openPopup();

  map.setView(
    [maisProximo.localizacao.latitude, maisProximo.localizacao.longitude],
    17
  );
}

function buscarMercado(termo) {
  if (!usuarioAtual) return alert("Localização não obtida ainda.");

  const encontrados = mercados
    .filter((m) => m.nome.toLowerCase().includes(termo.toLowerCase()))
    .map((m) => ({
      ...m,
      distancia: calcularDistancia(
        usuarioAtual.latitude,
        usuarioAtual.longitude,
        m.localizacao.latitude,
        m.localizacao.longitude
      ),
    }))
    .sort((a, b) => a.distancia - b.distancia);

  if (encontrados.length > 0) {
    const maisProximo = encontrados[0];
    map.setView(
      [maisProximo.localizacao.latitude, maisProximo.localizacao.longitude],
      17
    );

    L.popup()
      .setLatLng([
        maisProximo.localizacao.latitude,
        maisProximo.localizacao.longitude,
      ])
      .setContent(
        `
        <div style="text-align:center;">
          <b>${maisProximo.nome}</b><br>
          ${maisProximo.endereco}<br>
          Distância: ${maisProximo.distancia.toFixed(2)} km<br><br>
          ${criarBotaoDetalhes(maisProximo)}
        </div>
      `
      )
      .openOn(map);
  } else {
    alert("Nenhum mercado encontrado.");
  }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

inputBusca.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscarMercado(inputBusca.value);
});

localizarUsuario();
