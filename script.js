
const fighters = [
  {id:"shelly",name:"Shelly",ru:"Шелли",imageId:"16000000",rarity:"Стартовый",className:"Урон",description:"Универсальный боец с дробовиком. Особенно опасна на близкой дистанции.",attack:"Дробовик",super:"Суперобстрел",style:["aggressive"],reason:"Шелли уверенно чувствует себя в ближнем бою и может резко изменить ход столкновения."},
  {id:"colt",name:"Colt",ru:"Кольт",imageId:"16000001",rarity:"Редкий",className:"Урон",description:"Меткий стрелок, выпускающий длинную очередь пуль по прямой.",attack:"Шесть патронов",super:"Пуля-бур",style:["range"],reason:"Кольт подходит тем, кто любит держать дистанцию и попадать точными очередями."},
  {id:"spike",name:"Spike",ru:"Спайк",imageId:"16000005",rarity:"Легендарный",className:"Контроль",description:"Бросает колючие кактусы, которые разлетаются во все стороны.",attack:"Игольчатая граната",super:"Колючая ловушка",style:["range","support"],reason:"Спайк помогает контролировать пространство и мешает соперникам занимать удобные позиции."},
  {id:"crow",name:"Crow",ru:"Ворон",imageId:"16000012",rarity:"Легендарный",className:"Убийца",description:"Быстрый боец, отравляющий противников и изматывающий их на расстоянии.",attack:"Кинжалы",super:"Налёт",style:["stealth","aggressive"],reason:"Ворон мобилен, может внезапно ворваться в бой и быстро сменить позицию."},
  {id:"leon",name:"Leon",ru:"Леон",imageId:"16000023",rarity:"Легендарный",className:"Убийца",description:"Скрытный боец, который умеет становиться невидимым для противников.",attack:"Вращающиеся лезвия",super:"Дымовая бомба",style:["stealth"],reason:"Леон создан для неожиданных атак и выбора момента, когда противник меньше всего готов."},
  {id:"jessie",name:"Jessie",ru:"Джесси",imageId:"16000007",rarity:"Сверхредкий",className:"Контроль",description:"Инженер, чьи выстрелы могут отскакивать между противниками.",attack:"Шоковая винтовка",super:"Турель Скрэппи",style:["support","range"],reason:"Джесси помогает команде контролировать область, а её турель добавляет давление."},
  {id:"poco",name:"Poco",ru:"Поко",imageId:"16000013",rarity:"Редкий",className:"Поддержка",description:"Музыкант, который поддерживает союзников музыкальными волнами.",attack:"Музыкальная волна",super:"Encore",style:["support"],reason:"Поко ориентирован на командную игру и помогает союзникам оставаться в бою."},
  {id:"edgar",name:"Edgar",ru:"Эдгар",imageId:"16000043",rarity:"Эпический",className:"Убийца",description:"Мобильный боец ближнего боя, который прыгает к противникам и восстанавливает здоровье атаками.",attack:"Быстрые удары",super:"Прыжок",style:["aggressive","stealth"],reason:"Эдгар подходит для динамичного стиля: он сокращает дистанцию и атакует вблизи."}
];

const modes = {
  gems:{title:"Gem Grab",text:"Собирайте кристаллы и удерживайте преимущество до конца отсчёта."},
  showdown:{title:"Showdown",text:"Выживай, собирай усиления и останься последним бойцом на арене."},
  ball:{title:"Brawl Ball",text:"Работайте командой, контролируйте мяч и забивайте голы."},
  heist:{title:"Heist",text:"Защищай свой сейф и пробивайся к сейфу противника."}
};

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const grid = $("#fighterGrid");
const searchInput = $("#searchInput");
const classFilter = $("#classFilter");
const rarityFilter = $("#rarityFilter");
const emptyState = $("#emptyState");
const visibleCount = $("#visibleCount");
const favoritesBanner = $("#favoritesBanner");
const favoriteCount = $("#favoriteCount");
const modalElement = $("#fighterModal");
const modal = window.bootstrap ? new bootstrap.Modal(modalElement) : null;
let favorites = readStorage("brawlUniverseFavorites", []);
let favoritesOnly = false;
let toastTimer;
let formTimer;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Не удалось прочитать ${key}:`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Не удалось сохранить ${key}:`, error);
    return false;
  }
}

function imageUrl(fighter) {
  return `https://cdn.brawlify.com/brawlers/borderless/${fighter.imageId}.png`;
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

function updateFavoriteCount() {
  favoriteCount.textContent = favorites.length;
  $("#showFavorites").setAttribute("aria-label", `Показать избранное, ${favorites.length} бойцов`);
}

function isFavorite(id) {
  return favorites.includes(id);
}

function toggleFavorite(id) {
  favorites = isFavorite(id)
    ? favorites.filter(item => item !== id)
    : [...favorites, id];

  saveStorage("brawlUniverseFavorites", favorites);
  updateFavoriteCount();
  renderFighters();

  const current = fighters.find(f => f.id === id);
  if (current) {
    showToast(isFavorite(id)
      ? `${current.ru} добавлен(а) в избранное`
      : `${current.ru} удалён(а) из избранного`);
  }
}

function fighterCard(fighter, index) {
  const favorite = isFavorite(fighter.id);

  return `<article class="fighter-card" style="animation-delay:${Math.min(index*45,300)}ms;--glow:${fighter.id==="spike"?"#ff766c35":fighter.id==="crow"?"#a35cff35":fighter.id==="poco"?"#ff9b6235":"#7976ff30"}" tabindex="0" role="button" aria-label="Подробнее о бойце ${fighter.ru}" data-detail="${fighter.id}">
    <span class="card-bg-number">${String(index+1).padStart(2,"0")}</span>
    <button class="card-favorite ${favorite?"is-favorite":""}" data-favorite="${fighter.id}" aria-label="${favorite?"Удалить из":"Добавить в"} избранное: ${fighter.ru}" aria-pressed="${favorite}">${favorite?"♥":"♡"}</button>
    <div class="card-art">
      <img src="${imageUrl(fighter)}" alt="${fighter.ru} — персонаж Brawl Stars" loading="lazy">
      <div class="art-fallback" hidden>${fighter.ru}</div>
    </div>
    <div class="card-info">
      <div class="card-meta"><span class="rarity-tag">${fighter.rarity}</span><span class="class-tag">${fighter.className}</span></div>
      <h3>${fighter.ru}</h3>
      <p>${fighter.description}</p>
      <div class="card-actions"><button class="card-detail" data-detail="${fighter.id}">Подробнее <span>↗</span></button></div>
    </div>
  </article>`;
}

function renderFighters() {
  const query = searchInput.value.trim().toLocaleLowerCase("ru");
  const selectedClass = classFilter.value;
  const selectedRarity = rarityFilter.value;

  const visible = fighters.filter(fighter => {
    const matchesQuery = `${fighter.name} ${fighter.ru}`.toLocaleLowerCase("ru").includes(query);
    const matchesClass = !selectedClass || fighter.className === selectedClass;
    const matchesRarity = !selectedRarity || fighter.rarity === selectedRarity;
    const matchesFavorite = !favoritesOnly || isFavorite(fighter.id);

    return matchesQuery && matchesClass && matchesRarity && matchesFavorite;
  });

  grid.innerHTML = visible.map(fighterCard).join("");
  visibleCount.textContent = String(visible.length).padStart(2,"0");
  emptyState.hidden = visible.length > 0;
  favoritesBanner.hidden = !favoritesOnly;

  grid.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      img.hidden = true;
      const fallback = img.parentElement.querySelector(".art-fallback");
      if (fallback) fallback.hidden = false;
    }, {once:true});
  });
}

function openDetails(id) {
  const fighter = fighters.find(item => item.id === id);
  if (!fighter) return;

  $("#modalBody").innerHTML = `<div class="modal-fighter">
    <img src="${imageUrl(fighter)}" alt="${fighter.ru}">
    <div>
      <div class="modal-meta"><span>${fighter.rarity}</span><span>${fighter.className}</span></div>
      <h2 id="modalTitle">${fighter.ru}</h2>
      <p>${fighter.description}</p>
      <p><b>Основная атака:</b> ${fighter.attack}.<br><b>Супер:</b> ${fighter.super}.</p>
      <button class="btn btn-primary-custom" data-modal-favorite="${fighter.id}">${isFavorite(fighter.id)?"♥ В избранном":"♡ Добавить в избранное"}</button>
    </div>
  </div>`;

  const img = $("#modalBody img");
  img.addEventListener("error", () => {
    img.alt = `Изображение ${fighter.ru} временно недоступно`;
    img.style.opacity = ".35";
  }, {once:true});

  if (modal) modal.show();
  else modalElement.classList.add("show");
}

function showToast(message) {
  const toast = $("#toastMessage");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function resetFilters() {
  searchInput.value = "";
  classFilter.value = "";
  rarityFilter.value = "";
  favoritesOnly = false;
  renderFighters();
}

function setTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  $("#themeToggle").textContent = theme === "light" ? "☾" : "☼";
  $("#themeToggle").setAttribute("aria-label", theme === "light" ? "Включить тёмную тему" : "Включить светлую тему");
  saveStorage("brawlUniverseTheme", theme);
}

function findMatch(style) {
  const priority = {
    aggressive:["shelly","edgar","crow"],
    support:["poco","jessie","spike"],
    range:["colt","spike","jessie"],
    stealth:["leon","crow","edgar"]
  };

  const ranked = (priority[style] || [])
    .map(id => fighters.find(f => f.id === id))
    .filter(Boolean);

  return ranked[0] || fighters[0];
}

function showFinderResult(fighter, style) {
  const explanations = {
    aggressive:"Ты выбрал динамичную игру. Этот боец хорошо подходит для давления на соперников и активных столкновений.",
    support:"Тебе ближе командная игра. Этот боец может помогать союзникам или создавать для них удобные условия.",
    range:"Тебе нравится держать дистанцию. Этот персонаж умеет наносить урон или контролировать пространство издалека.",
    stealth:"Тебе по душе неожиданные ходы. Этот боец способен менять позицию и создавать угрозу внезапной атакой."
  };

  const result = $("#finderResult");
  result.innerHTML = `<img src="${imageUrl(fighter)}" alt="${fighter.ru}">
    <div>
      <div class="section-kicker">ТВОЙ ВЫБОР</div>
      <h4>${fighter.ru}</h4>
      <p>${explanations[style]} ${fighter.reason}</p>
      <button data-result-detail="${fighter.id}">Посмотреть бойца ↗</button>
    </div>`;

  result.hidden = false;

  const img = $("img", result);
  img.addEventListener("error", () => {
    img.alt = `Изображение ${fighter.ru} недоступно`;
    img.style.opacity = ".25";
  }, {once:true});
}

function handleFeedback(event) {
  event.preventDefault();

  const name = $("#userName").value.trim();
  const email = $("#userEmail").value.trim();
  const message = $("#userMessage").value.trim();
  const box = $("#formMessage");

  box.hidden = false;
  box.className = "form-message error";

  if (!name || !email || !message) {
    box.textContent = "Заполни все обязательные поля.";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    box.textContent = "Проверь email: адрес должен быть в формате name@example.com.";
    return;
  }

  if ($("#saveConsent").checked) {
    const submissions = readStorage("brawlUniverseDemoFeedback", []);
    submissions.push({name,email,message,createdAt:new Date().toISOString()});

    if (!saveStorage("brawlUniverseDemoFeedback", submissions)) {
      box.textContent = "Браузер не разрешил сохранить данные. Форма проверена, но данные не сохранены.";
      return;
    }
  }

  box.className = "form-message success";
  box.textContent = $("#saveConsent").checked
    ? "Проверка прошла! Демонстрационные данные сохранены только в этом браузере."
    : "Проверка прошла! Это демонстрационная форма: сообщение не отправлено на сервер.";

  clearTimeout(formTimer);
  formTimer = setTimeout(() => {
    box.hidden = true;
  }, 3000);
}

grid.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(favoriteButton.dataset.favorite);
    return;
  }

  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) {
    openDetails(detailButton.dataset.detail);
  }
});

grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".fighter-card")) {
    event.preventDefault();
    openDetails(event.target.dataset.detail);
  }
});

$("#modalBody").addEventListener("click", event => {
  const button = event.target.closest("[data-modal-favorite]");
  if (button) {
    toggleFavorite(button.dataset.modalFavorite);
    button.textContent = isFavorite(button.dataset.modalFavorite)
      ? "♥ В избранном"
      : "♡ Добавить в избранное";
  }
});

$("#finderResult").addEventListener("click", event => {
  const button = event.target.closest("[data-result-detail]");
  if (button) openDetails(button.dataset.resultDetail);
});

[searchInput,classFilter,rarityFilter].forEach(control => {
  control.addEventListener("input", () => {
    favoritesOnly = false;
    renderFighters();
  });
});

$("#resetFilters").addEventListener("click", resetFilters);

$("#showFavorites").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  renderFighters();
  $("#fighters").scrollIntoView({behavior:"smooth"});

  if (favoritesOnly && favorites.length === 0) {
    showToast("Пока нет избранных бойцов — нажми ♡ на карточке.");
  }
});

$("#clearFavorites").addEventListener("click", () => {
  favorites = [];
  saveStorage("brawlUniverseFavorites", favorites);
  updateFavoriteCount();
  renderFighters();
  showToast("Список избранного очищен.");
});

$("#themeToggle").addEventListener("click", () => {
  setTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
});

$("#findFighter").addEventListener("click", () => {
  const selected = $('input[name="playStyle"]:checked');
  $("#finderError").hidden = !!selected;

  if (!selected) return;

  const match = findMatch(selected.value);
  showFinderResult(match, selected.value);
});

$("#feedbackForm").addEventListener("submit", handleFeedback);

$("#menuToggle").addEventListener("click", () => {
  const panel = $("#navPanel");
  const open = panel.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
});

$("#navPanel").addEventListener("click", event => {
  if (event.target.matches("a")) {
    $("#navPanel").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded","false");
  }
});

$("#year").textContent = new Date().getFullYear();
setTheme(readStorage("brawlUniverseTheme","dark"));
updateFavoriteCount();
renderFighters();

