const status = document.getElementById("status");
const inputBusca = document.querySelector(".search-bar input");

const map = L.map("map");

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let usuarioAtual = null;
let mercados = [];
let marcadoresMercados = [];
let marcadorMaisProximo = null;

const iconeUsuario = L.icon({
  iconUrl: "../assets/img/user.png",
  iconAnchor: [15, 40],
});
const iconeMercadoAzul = L.icon({
  iconUrl: "../assets/img/shopping-cart.png",
  iconAnchor: [15, 40],
});
const iconeMercadoVermelho = L.icon({
  iconUrl: "../assets/img/shopping-cart-red.png",
  iconAnchor: [15, 40],
});

async function carregarMercados() {
  try {
    const res = await fetch("http://localhost:3000/mercados");
    const data = await res.json();
    mercados = data;

    mercados.forEach((m) => {
      const marker = L.marker(
        [m.localizacao.latitude, m.localizacao.longitude],
        { icon: iconeMercadoAzul }
      ).addTo(map).bindPopup(`
          <div style="text-align: center;">
            <b>${m.nome}</b><br>
            ${m.endereco}<br><br>
            <a href="acessibilidade.html?id=${m.id}" 
               style="display: inline-block; 
                      padding: 8px 16px; 
                      background: #000; 
                      color: white; 
                      text-decoration: none; 
                      border-radius: 8px;
                      font-weight: 600;">
              ♿ Ver Acessibilidade
            </a>
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
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        usuarioAtual = { latitude: lat, longitude: lon };

        status.textContent = `📍 Você está em: ${lat.toFixed(5)}, ${lon.toFixed(
          5
        )}`;

        map.setView([lat, lon], 15);

        L.marker([lat, lon], { icon: iconeUsuario })
          .addTo(map)
          .bindPopup("📍 Sua localização atual")
          .openPopup();

        carregarMercados().then(destacarMaisProximo);
      },
      () => {
        status.textContent = "⚠️ Não foi possível obter sua localização.";
        map.setView([-19.6305, -43.936], 13); // Centraliza em Lagoa Santa
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
      <div style="text-align: center;">
        <b>${maisProximo.nome} (mais próximo)</b><br>
        ${maisProximo.endereco}<br><br>
        <a href="acessibilidade.html?id=${maisProximo.id}" 
           style="display: inline-block; 
                  padding: 8px 16px; 
                  background: #000; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 8px;
                  font-weight: 600;">
          ♿ Ver Acessibilidade
        </a>
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
        <div style="text-align: center;">
          <b>${maisProximo.nome}</b><br>
          ${maisProximo.endereco}<br>
          Distância: ${maisProximo.distancia.toFixed(2)} km<br><br>
          <a href="acessibilidade.html?id=${maisProximo.id}" 
             style="display: inline-block; 
                    padding: 8px 16px; 
                    background: #000; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px;
                    font-weight: 600;">
            ♿ Ver Acessibilidade
          </a>
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
