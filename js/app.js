// API de TVmaze
const API = "https://api.tvmaze.com";

// Elementos del DOM
const rowsContainer = document.getElementById("rowsContainer");
const hero = document.getElementById("hero");
const heroTitle = document.getElementById("heroTitle");
const heroDesc = document.getElementById("heroDesc");
const heroPlay = document.getElementById("heroPlay");

// Inicialización principal
const init = async () => {
  try {
    const trending = await fetchJSON(`${API}/shows?page=1`);
    renderHero(trending[Math.floor(Math.random() * trending.length)]);
    renderRow("Tendencias", trending.slice(0, 20));
    wireSearch();
    console.log("@@@ trending =>", trending);
  } catch (err) {
    console.error("Error en init:", err);
  }
};

// Manejo del formulario de búsqueda
const wireSearch = () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const movie = input.value.trim();
    if (!movie) return;

    try {
      const results = await fetchJSON(
        `${API}/search/shows?q=${encodeURIComponent(movie)}`
      );
      const shows = results.map((r) => r.show);
      rowsContainer.innerHTML = "";
      renderRow(`Resultados para "${movie}"`, shows);
    } catch (err) {
      console.error("Error en búsqueda:", err);
    }
  });
};

// Renderiza una fila de series/películas
const renderRow = (title, shows) => {
  const section = document.createElement("section");
  section.className = "mb-3";
  section.innerHTML = `
    <h3 class="rowTitle">${title}</h3>
    <div class="rail" data-rail></div>
  `;

  const rail = section.querySelector("[data-rail]");
  shows.forEach((show) => {
    rail.appendChild(posterCard(show));
  });

  rowsContainer.appendChild(section);
};

// Crea una tarjeta para cada show
const posterCard = (show) => {
  const card = document.createElement("div");
  card.className = "card card-poster";

  const img =
    show?.image?.medium || "https://placehold.co/600x400?text=Sin+Imagen";

  card.innerHTML = `
    <img class="card-img-top" src="${img}" alt="${escapeHTML(show.name)}">
    <div class="card-body p-2">
      <div class="small text-secondary">
        ${(show.genres || []).slice(0, 2).join(" · ")}
      </div>
      <div class="fw-semibold">
        ${escapeHTML(show.name)}
      </div>
    </div>
  `;

  // Al hacer clic se abre el modal con los detalles
  card.addEventListener("click", () => openDetail(show.id));

  return card;
};

// Escapa texto para evitar inyección HTML
const escapeHTML = (str = "") => {
  return str.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
};

// Elimina etiquetas HTML
const stripHtml = (html) => {
  return (html || "").replace(/<[^>]*>/g, "");
};

// Función para obtener datos JSON
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error al cargar los datos: ${url}`);
  return res.json();
};

// Renderiza el "hero" principal
const renderHero = (show) => {
  if (!show) return;

  const img =
    show?.image?.original ||
    show?.image?.medium ||
    "https://placehold.co/1200x800?text=Sin+Imagen";

  hero.style.backgroundImage = `url(${img})`;
  hero.style.backgroundSize = "cover";
  hero.style.backgroundPosition = "center";
  hero.style.color = "#fff";
  heroTitle.textContent = show.name || "Sin título";
  heroDesc.textContent = stripHtml(show?.summary || "").slice(0, 200) + "...";

  heroPlay.onclick = () => openDetail(show.id);
};

// Muestra los detalles de una serie/película
const openDetail = async (id) => {
  const modalEl = document.getElementById("detailModal");
  const modalBody = document.getElementById("detailBody");
  const modalTitle = document.getElementById("detailTitle");

  modalTitle.textContent = "Cargando...";
  modalBody.innerHTML = "Cargando...";

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const show = await fetchJSON(`${API}/shows/${id}`);

  const img =
    show?.image?.original ||
    show?.image?.medium ||
    "https://placehold.co/600x400?text=Sin+Imagen";

  modalTitle.textContent = show.name;
  modalBody.innerHTML = `
    <div class="row g-4">
      <div class="col-md-4">
        <img class="img-fluid rounded" src="${img}" alt="${escapeHTML(show.name)}"/>
      </div>
      <div class="col-md-8">
        ${(show.genres || [])
          .map((g) => `<span class="badge badge-genre me-1">${g}</span>`)
          .join("")}
        <p class="text-secondary small mt-2">
          ${show.summary || "Sin descripción disponible."}
        </p>
        <p class="text-secondary small">
          ⭐ <b>${show?.rating?.average ?? "N/A"}</b> · 
          Lenguaje: ${show?.language ?? "N/A"} · 
          Estado: ${show?.status ?? "N/A"}
        </p>
        <a class="btn btn-outline-light me-2" href="${
          show?.officialSite || show?.url
        }" target="_blank" rel="noopener">Visitar sitio oficial</a>
      </div>
    </div>
  `;
  modal.show();
};

// Inicializa la app
init();
