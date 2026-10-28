  var SONGS = [
    ["Bohemian Rhapsody", "Queen", "Rock"],
    ["Billie Jean", "Michael Jackson", "Pop"],
    ["Blinding Lights", "The Weeknd", "Synth-pop"],
    ["Shape of You", "Ed Sheeran", "Pop"],
    ["Despacito", "Luis Fonsi y Daddy Yankee", "Reggaetón"],
    ["Hips Don't Lie", "Shakira", "Pop latino"],
    ["De Música Ligera", "Soda Stereo", "Rock en español"],
    ["Llorando se fue", "Los Kjarkas", "Folclore boliviano"]
  ].map(function (s, i) { return { id: i, title: s[0], artist: s[1], genre: s[2] }; });

  var grid = document.getElementById("grid");
  var q = document.getElementById("q");
  var statusEl = document.getElementById("status");
  var totalEl = document.getElementById("total");
  var tabAll = document.getElementById("tab-all");
  var tabLiked = document.getElementById("tab-liked");

  var liked = {};
  try { liked = JSON.parse(localStorage.getItem("musica-likes") || "{}") || {}; } catch (e) { liked = {}; }
  var onlyLiked = false;

  function totalLikes() {
    return Object.keys(liked).reduce(function (sum, k) { return sum + (liked[k] || 0); }, 0);
  }
  function save() { try { localStorage.setItem("musica-likes", JSON.stringify(liked)); } catch (e) {} }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

  // Portada generada: disco de vinilo con colores propios de cada canción
  function cover(song) {
    var h = hash(song.title + song.artist);
    var h1 = h % 360, h2 = (h1 + 50 + (h >> 4) % 90) % 360;
    var gid = "g" + song.id;
    var tilt = 20 + (h >> 7) % 50;
    return '<svg viewBox="0 0 100 100" role="img" aria-label="Portada de ' + esc(song.title) + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h1 + ',78%,58%)"/><stop offset="1" stop-color="hsl(' + h2 + ',72%,38%)"/></linearGradient></defs>' +
      '<rect width="100" height="100" fill="url(#' + gid + ')"/>' +
      '<circle cx="50" cy="50" r="40" fill="#0B0B12"/>' +
      '<circle cx="50" cy="50" r="33" fill="none" stroke="#fff" stroke-opacity=".12"/>' +
      '<circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-opacity=".12"/>' +
      '<circle cx="50" cy="50" r="21" fill="none" stroke="#fff" stroke-opacity=".12"/>' +
      '<path d="M50 50 L' + (50 + 40 * Math.cos(tilt * Math.PI / 180)).toFixed(1) + ' ' + (50 - 40 * Math.sin(tilt * Math.PI / 180)).toFixed(1) +
      ' A40 40 0 0 0 ' + (50 + 40 * Math.cos((tilt + 28) * Math.PI / 180)).toFixed(1) + ' ' + (50 - 40 * Math.sin((tilt + 28) * Math.PI / 180)).toFixed(1) +
      ' Z" fill="#fff" fill-opacity=".07"/>' +
      '<circle cx="50" cy="50" r="12" fill="hsl(' + h2 + ',85%,62%)"/>' +
      '<circle cx="50" cy="50" r="2.200" fill="#0B0B12"/></svg>';
  }

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.8 8.1 2.9 4.5 6.4 4.5c2 0 3.8 1.1 5.6 3.2 1.8-2.1 3.6-3.2 5.6-3.2 3.5 0 5.6 3.6 4 7.2C19.500 16.400 12 21 12 21z"/></svg>';

  function card(song) {
    var n = liked[song.id] || 0;
    return '<li class="card">' +
      '<div class="cover">' + cover(song) + '</div>' +
      '<div class="meta"><h2 class="song">' + esc(song.title) + '</h2>' +
      '<p class="artist">' + esc(song.artist) + '</p>' +
      '<p class="genre">' + esc(song.genre) + '</p></div>' +
      '<button type="button" class="like" data-id="' + song.id + '" data-has="' + (n > 0) + '" aria-label="Dar like a ' + esc(song.title) + '">' + HEART +
      '<span>Like</span><span class="n" aria-hidden="true">' + n + '</span></button></li>';
  }

  function render() {
    var term = norm(q.value.trim());
    var list = SONGS.filter(function (s) {
      if (onlyLiked && !liked[s.id]) return false;
      if (!term) return true;
      return norm(s.title + " " + s.artist + " " + s.genre).indexOf(term) !== -1;
    });

    if (list.length) {
      grid.innerHTML = list.map(card).join("");
    } else if (onlyLiked && !term) {
      grid.innerHTML = '<li class="empty"><strong>Todavía no tienes likes.</strong><br>Dale like a una canción y aparecerá aquí.</li>';
    } else {
      grid.innerHTML = '<li class="empty"><strong>No hay resultados' + (term ? ' para «' + esc(q.value.trim()) + '»' : '') + '.</strong><br>Prueba con otro nombre, artista o género.</li>';
    }

    statusEl.textContent = list.length
      ? (term ? "Mostrando " + list.length + " de " + SONGS.length + " canciones" : "Mostrando " + list.length + " canciones")
      : "";
    totalEl.textContent = totalLikes();
  }

  q.addEventListener("input", render);

  grid.addEventListener("click", function (e) {
    var btn = e.target.closest(".like");
    if (!btn) return;
    var id = btn.getAttribute("data-id");
    liked[id] = (liked[id] || 0) + 1;
    save();
    btn.setAttribute("data-has", "true");
    btn.querySelector(".n").textContent = liked[id];
    totalEl.textContent = totalLikes();
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  });

  function setTab(likedOnly) {
    onlyLiked = likedOnly;
    tabAll.setAttribute("aria-pressed", String(!likedOnly));
    tabLiked.setAttribute("aria-pressed", String(likedOnly));
    render();
  }
  tabAll.addEventListener("click", function () { setTab(false); });
  tabLiked.addEventListener("click", function () { setTab(true); });

  render();
