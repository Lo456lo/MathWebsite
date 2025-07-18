const filterBtns = document.querySelectorAll('.filter-btn');
const resources = document.querySelectorAll('.resource');

let selectedTheme = null;
let selectedLevel = null;

filterBtns.forEach(btn => {
  btn.onclick = () => {
    const type = btn.dataset.type;
    const value = btn.dataset.value;

    // Désélectionner boutons du même type
    filterBtns.forEach(b => {
      if(b.dataset.type === type) b.classList.remove('active');
    });
    // Toggle sélection/désélection
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

function filterResources() {
  resources.forEach(res => {
    const theme = res.dataset.theme ? res.dataset.theme.split(' ') : []; // Cela permets de sélectionner plusieurs thèmes d’une ressource sous forme de tableau
    const levels = res.dataset.level ? res.dataset.level.split(' ') : []; // Cela permets de sélectionner plusieurs niveaux  d’une ressource sous forme de tableau (ex : ["Tales", "L1", "Prépa"]).
    let show = true;
    if (selectedTheme && !theme.includes(selectedTheme)) show = false; // on passe à une fonction qui vérifie si le thème est inclus
    if (selectedLevel && !levels.includes(selectedLevel)) show = false; // on passe à une fonction qui vérifie si le niveau est inclus
    res.style.display = show ? "" : "none";
  });
}

// Met à jour la couleur des tags thème dans les ressources affichées
function updateTagColors() {
  resources.forEach(res => {
    const tags = res.querySelectorAll('.tag');
    tags.forEach(tag => {
      tag.classList.remove('red');
      // Rougir le thème sélectionné
      if (selectedTheme && tag.dataset.type === "theme" && tag.textContent === selectedTheme) {
        tag.classList.add('red');
      }
      // Rougir le niveau sélectionné
      if (selectedLevel && tag.dataset.type === "level" && tag.textContent === selectedLevel) {
        tag.classList.add('red');
      }
    });
  });
}

// Appel initial pour être sûr que couleur propre au chargement
updateTagColors();
