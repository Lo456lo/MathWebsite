// --- Edition/Suppression des ressources statiques ---
// SUPPRIMÉ : plus de gestion d'édition/suppression sur les ressources statiques

// --- Gestion ouverture/fermeture modale ---
// Ouvre la modale d'administration (rubriques/cours) et réinitialise les listes JS si besoin
const manageBtn = document.getElementById('manage-categories-btn');
const modal = document.getElementById('manage-categories-modal');
const closeModal = document.getElementById('close-categories-modal');
if (manageBtn && modal && closeModal) {
  manageBtn.addEventListener('click', function() {
    // Toujours réinitialiser les listes JS à partir du HTML si elles sont vides
    if (!themes || themes.length === 0) {
      themes = Array.from(document.querySelectorAll('#themes .filter-btn')).map(btn => btn.textContent);
    }
    if (!levels || levels.length === 0) {
      levels = Array.from(document.querySelectorAll('#levels .filter-btn')).map(btn => btn.textContent);
    }
    renderCategories();
    renderCourseLevelsSelect();
    renderCourseThemesSelect();
    modal.style.display = 'flex';
  });
  closeModal.addEventListener('click', function() { modal.style.display = 'none'; });
  window.addEventListener('keydown', e => { if(e.key === 'Escape') modal.style.display = 'none'; });
}

// --- Dark mode toggle ---
// Gère l'icône et l'état du mode sombre/clair (stocké dans localStorage ou selon le système)
const darkBtn = document.getElementById('darkmode-toggle');
const darkIcon = document.getElementById('darkmode-icon');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

function setDarkIcon(isDark) {
  if(isDark) {
    // Soleil (mode sombre)
    darkIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="19" r="8" stroke="#fff" stroke-width="2" fill="none"/><g stroke="#fff" stroke-width="2"><line x1="19" y1="4" x2="19" y2="10"/><line x1="19" y1="28" x2="19" y2="34"/><line x1="4" y1="19" x2="10" y2="19"/><line x1="28" y1="19" x2="34" y2="19"/><line x1="8.5" y1="8.5" x2="13" y2="13"/><line x1="25" y1="25" x2="29.5" y2="29.5"/><line x1="8.5" y1="29.5" x2="13" y2="25"/><line x1="25" y1="13" x2="29.5" y2="8.5"/></g></svg>`;
  } else {
    // Lune (mode clair)
    darkIcon.innerHTML = `<svg width="28" height="28" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 19c0 6-4.5 10-10 10a10 10 0 0 1 0-20c.5 0 1 .03 1.5.1A8 8 0 1 0 27 19z" stroke="#222" stroke-width="2" fill="#fff"/></svg>`;
  }
}

function updateDarkModeIcon() {
  setDarkIcon(document.body.classList.contains('dark-mode'));
}

if (darkBtn && darkIcon) {
  // Initialisation du mode sombre selon préférence utilisateur ou système
  if(localStorage.getItem('dark-mode') === 'on' || (prefersDark && !localStorage.getItem('dark-mode'))){
    document.body.classList.add('dark-mode');
  }
  updateDarkModeIcon();

  darkBtn.onclick = function() {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')){
      localStorage.setItem('dark-mode','on');
    }else{
      localStorage.setItem('dark-mode','off');
    }
    updateDarkModeIcon();
  };
  // Si l'utilisateur change le mode système, on adapte l'icône
  if(window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if(!localStorage.getItem('dark-mode')) {
        if(e.matches) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        updateDarkModeIcon();
      }
    });
  }
}

// --- Gestion dynamique des rubriques (thèmes et niveaux) ---
// Permet d'ajouter, éditer, supprimer les thèmes et niveaux via la modale
const themesContainer = document.getElementById('themes');
const levelsContainer = document.getElementById('levels');
const themesList = document.getElementById('themes-list');
const levelsList = document.getElementById('levels-list');
const addThemeBtn = document.getElementById('add-theme-btn');
const addLevelBtn = document.getElementById('add-level-btn');
const newThemeInput = document.getElementById('new-theme-input');
const newLevelInput = document.getElementById('new-level-input');
const resources = document.querySelectorAll('.resource');

// Variables globales pour le filtrage
let selectedTheme = null;
let selectedLevel = null;

// Listes des thèmes et niveaux (utilisées pour générer les filtres et les sélecteurs)
let themes = Array.from(themesContainer.querySelectorAll('.filter-btn')).map(btn => btn.textContent);
let levels = Array.from(levelsContainer.querySelectorAll('.filter-btn')).map(btn => btn.textContent);
// Fonction de filtrage (affiche/masque les ressources selon les filtres actifs)
function filterResources() {
  document.querySelectorAll('.resource').forEach(res => {
    // On ne touche plus aux boutons d'édition/suppression
    const theme = res.dataset.theme ? res.dataset.theme.split(' ') : [];
    const levelsArr = res.dataset.level ? res.dataset.level.split(' ') : [];
    let show = true;
    if (selectedTheme && !theme.includes(selectedTheme)) show = false;
    if (selectedLevel && !levelsArr.includes(selectedLevel)) show = false;
    res.style.display = show ? "" : "none";
  });
  // Filtrage aussi pour les cours dynamiques
  const coursesDynamic = document.getElementById('courses-dynamic');
  if (coursesDynamic) {
    Array.from(coursesDynamic.querySelectorAll('.resource')).forEach(res => {
      let show = true;
      const tags = Array.from(res.querySelectorAll('.tag'));
      if (selectedTheme && !tags.some(t => t.dataset.type === 'theme' && t.textContent === selectedTheme)) show = false;
      if (selectedLevel && !tags.some(t => t.dataset.type === 'level' && t.textContent === selectedLevel)) show = false;
      res.style.display = show ? '' : 'none';
    });
  }
}

// Fonction de coloration des tags (rouge si sélectionné)
function updateTagColors() {
  // Statique
  document.querySelectorAll('.resource').forEach(res => {
    const tags = res.querySelectorAll('.tag');
    tags.forEach(tag => {
      tag.classList.remove('red');
      if (selectedTheme && tag.dataset.type === "theme" && tag.textContent === selectedTheme) {
        tag.classList.add('red');
      }
      if (selectedLevel && tag.dataset.type === "level" && tag.textContent === selectedLevel) {
        tag.classList.add('red');
      }
    });
  });
  // Dynamique
  if (coursesDynamic) {
    coursesDynamic.querySelectorAll('.resource').forEach(res => {
      const tags = res.querySelectorAll('.tag');
      tags.forEach(tag => {
        tag.classList.remove('red');
        if (selectedTheme && tag.dataset.type === "theme" && tag.textContent === selectedTheme) {
          tag.classList.add('red');
        }
        if (selectedLevel && tag.dataset.type === "level" && tag.textContent === selectedLevel) {
          tag.classList.add('red');
        }
      });
    });
  }
}

// Affiche la liste des thèmes/niveaux dans la modale d'admin
function renderCategories() {
  // Affiche la liste dans la modale
  themesList.innerHTML = '';
  themes.forEach((theme, i) => {
    const li = document.createElement('li');
    li.textContent = theme;
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '8px';
    // Bouton suppression
    const del = document.createElement('button');
    del.textContent = '✕';
    del.title = 'Supprimer';
    del.style.background = 'none';
    del.style.border = 'none';
    del.style.color = '#d00';
    del.style.fontWeight = 'bold';
    del.style.cursor = 'pointer';
    del.onclick = () => {
      themes.splice(i, 1);
      renderCategories();
      updateFilterButtons();
    };
    // Bouton édition
    const edit = document.createElement('button');
    edit.textContent = '✎';
    edit.title = 'Renommer';
    edit.style.background = 'none';
    edit.style.border = 'none';
    edit.style.color = '#222';
    edit.style.cursor = 'pointer';
    edit.onclick = () => {
      const nv = prompt('Nouveau nom du thème ?', theme);
      if(nv && nv.trim() && !themes.includes(nv.trim())) {
        themes[i] = nv.trim();
        renderCategories();
        updateFilterButtons();
      }
    };
    li.appendChild(edit);
    li.appendChild(del);
    themesList.appendChild(li);
  });
  levelsList.innerHTML = '';
  levels.forEach((level, i) => {
    const li = document.createElement('li');
    li.textContent = level;
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '8px';
    const del = document.createElement('button');
    del.textContent = '✕';
    del.title = 'Supprimer';
    del.style.background = 'none';
    del.style.border = 'none';
    del.style.color = '#d00';
    del.style.fontWeight = 'bold';
    del.style.cursor = 'pointer';
    del.onclick = () => {
      levels.splice(i, 1);
      renderCategories();
      updateFilterButtons();
    };
    const edit = document.createElement('button');
    edit.textContent = '✎';
    edit.title = 'Renommer';
    edit.style.background = 'none';
    edit.style.border = 'none';
    edit.style.color = '#222';
    edit.style.cursor = 'pointer';
    edit.onclick = () => {
      const nv = prompt('Nouveau nom du niveau ?', level);
      if(nv && nv.trim() && !levels.includes(nv.trim())) {
        levels[i] = nv.trim();
        renderCategories();
        updateFilterButtons();
      }
    };
    li.appendChild(edit);
    li.appendChild(del);
    levelsList.appendChild(li);
  });
}

// Met à jour dynamiquement les boutons de filtre sur la page principale
function updateFilterButtons() {
  // Met à jour les boutons de filtre sur la page
  themesContainer.innerHTML = '';
  themes.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.type = 'theme';
    btn.dataset.value = theme;
    btn.textContent = theme;
    themesContainer.appendChild(btn);
  });
  levelsContainer.innerHTML = '';
  levels.forEach(level => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.type = 'level';
    btn.dataset.value = level;
    btn.textContent = level;
    levelsContainer.appendChild(btn);
  });
  // Rebind les events de filtre
  bindFilterEvents();
  // Applique le filtrage et la coloration immédiatement
  filterResources();
  updateTagColors();
}

// Ajout d'un thème/niveau depuis la modale
addThemeBtn.onclick = () => {
  const val = newThemeInput.value.trim();
  if(val && !themes.includes(val)) {
    themes.push(val);
    newThemeInput.value = '';
    renderCategories();
    updateFilterButtons();
  }
};
addLevelBtn.onclick = () => {
  const val = newLevelInput.value.trim();
  if(val && !levels.includes(val)) {
    levels.push(val);
    newLevelInput.value = '';
    renderCategories();
    updateFilterButtons();
  }
};

// Rebind les events sur les boutons de filtre (pour chaque update)
function bindFilterEvents() {
  // Rebind les events sur les nouveaux boutons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      const value = btn.dataset.value;
      filterBtns.forEach(b => {
        if(b.dataset.type === type) b.classList.remove('active');
      });
      if (type === 'theme' && selectedTheme === value) {
        selectedTheme = null;
        btn.classList.remove('active');
      } else if (type === 'level' && selectedLevel === value) {
        selectedLevel = null;
        btn.classList.remove('active');
      } else {
        btn.classList.add('active');
        if (type === 'theme') selectedTheme = value;
        if (type === 'level') selectedLevel = value;
      }
      filterResources();
      updateTagColors();
    }
  });
}

// Initialisation de la modale (remplit les listes et sélecteurs au chargement)
if(themesList && levelsList) {
  // Correction : on initialise les thèmes et niveaux à partir du HTML si la liste JS est vide
  if (themes.length === 0) {
    themes = Array.from(document.querySelectorAll('#themes .filter-btn')).map(btn => btn.textContent);
  }
  if (levels.length === 0) {
    levels = Array.from(document.querySelectorAll('#levels .filter-btn')).map(btn => btn.textContent);
  }
  renderCategories();
  updateFilterButtons();
  // Correction : on affiche aussi les sélecteurs dans la modale dès le départ
  renderCourseLevelsSelect();
  renderCourseThemesSelect();
}

// --- Gestion des cours dynamiques ---
// Structure de données des cours (ajoutés dynamiquement)
let courses = [];

const coursesList = document.getElementById('courses-list');
const addCourseForm = document.getElementById('add-course-form');
const courseLevelsSelect = document.getElementById('course-levels-select');
const courseThemesSelect = document.getElementById('course-themes-select');

// Génère les cases à cocher pour les niveaux/thèmes dans le formulaire d'ajout/édition de cours
function renderCourseLevelsSelect(selected=[]) {
  if (!courseLevelsSelect) return;
  courseLevelsSelect.innerHTML = '<span>Niveaux :</span>';
  levels.forEach(level => {
    const id = 'clv-' + level.replace(/\s/g,'_');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.value = level;
    if(selected.includes(level)) cb.checked = true;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = level;
    courseLevelsSelect.appendChild(cb);
    courseLevelsSelect.appendChild(label);
  });
}
function renderCourseThemesSelect(selected=[]) {
  if (!courseThemesSelect) return;
  courseThemesSelect.innerHTML = '<span>Thèmes :</span>';
  themes.forEach(theme => {
    const id = 'cth-' + theme.replace(/\s/g,'_');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.value = theme;
    if(selected.includes(theme)) cb.checked = true;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = theme;
    courseThemesSelect.appendChild(cb);
    courseThemesSelect.appendChild(label);
  });
}

// Affiche la liste des cours dans la modale d'admin (avec boutons édition/suppression)
function renderCourses() {
  if (!coursesList) return;
  coursesList.innerHTML = '';
  courses.forEach((course, i) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.flexDirection = 'column';
    li.style.gap = '2px';
    li.style.marginBottom = '8px';
    li.innerHTML = `<b>${course.title}</b> <span>${course.desc||''}</span> <a href="${course.link||'#'}" target="_blank">${course.link||''}</a> <span>Niveaux: ${course.levels.join(', ')}</span> <span>Thèmes: ${course.themes ? course.themes.join(', ') : ''}</span>`;
    // SUPPRIMÉ : plus de boutons édition/suppression sur les cours dynamiques dans la modale
    coursesList.appendChild(li);
  });
}

// Callback par défaut pour l'ajout d'un cours (utilisé par le formulaire)
function defaultAddCourseSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('course-title').value.trim();
  const desc = document.getElementById('course-desc').value.trim();
  const link = document.getElementById('course-link').value.trim();
  // Correction : on récupère bien les niveaux et thèmes cochés
  const levelsSel = Array.from(document.querySelectorAll('#course-levels-select input[type=checkbox]:checked')).map(cb=>cb.value);
  const themesSel = Array.from(document.querySelectorAll('#course-themes-select input[type=checkbox]:checked')).map(cb=>cb.value);
  if(title) {
    courses.push({title, desc, link, levels: levelsSel, themes: themesSel});
    renderCoursesAll();
    addCourseForm.reset();
    renderCourseLevelsSelect();
    renderCourseThemesSelect();
    addCourseForm.onsubmit = defaultAddCourseSubmit;
    if (modal) modal.style.display = 'none';
  }
}
if(addCourseForm) {
  addCourseForm.onsubmit = defaultAddCourseSubmit;
}
renderCourseLevelsSelect();
renderCourseThemesSelect();
renderCourses();

// Affichage dynamique des cours sur la page principale
function renderCoursesDynamic() {
  if (!coursesDynamic) return;
  if (courses.length === 0) {
    coursesDynamic.innerHTML = '';
    return;
  }
  let html = '<h2 style="margin-bottom:18px;">Cours ajoutés</h2>';
  courses.forEach((course, idx) => {
    // Construction des tags
    let tags = '';
    (course.levels||[]).forEach(level => {
      tags += `<span class="tag" data-type="level">${level}</span>`;
    });
    (course.themes||[]).forEach(theme => {
      tags += `<span class="tag" data-type="theme">${theme}</span>`;
    });
    html += `
      <div class="resource" data-theme="${(course.themes||[]).join(' ')}" data-level="${(course.levels||[]).join(' ')}">
        <h2>${course.title}</h2>
        <div class="tags">${tags}</div>
        <p>${course.desc||''}</p>
        <a class="btn-red" href="${course.link||'#'}" target="_blank">Accéder à la ressource</a>
        <!-- SUPPRIMÉ : plus de boutons édition/suppression sur les cartes dynamiques -->
      </div>
    `;
  });
  coursesDynamic.innerHTML = html;
}

// On affiche à chaque changement (modale + page principale)
function renderCoursesAll() {
  renderCourses();
  renderCoursesDynamic();
  filterResources();
  updateTagColors();
}

// SUPPRIMÉ : plus de patch pour les boutons d'édition/suppression

// Initialisation globale (affiche tout au chargement)
renderCoursesAll();

// Si les niveaux ou thèmes changent, on met à jour les cases à cocher
const _oldUpdateFilterButtons = updateFilterButtons;
updateFilterButtons = function() {
  _oldUpdateFilterButtons();
  renderCourseLevelsSelect();
  renderCourseThemesSelect();
};
