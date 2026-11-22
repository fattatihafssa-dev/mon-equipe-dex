
// =====================================
// IMPORTS
// =====================================

import {
    getCreatures,
    getCreature,
    createCreature,
    updateCreature,
    deleteCreature
} from "./api.js";

import {
    displayCreatures,
    displayCreatureDetails,
    showMessage,
    showDetailLoading,
    showCreatureNotFound,
    showFieldErrors,
    clearFieldErrors,
    fillCreatureForm,
    clearCreatureForm,
    setFormLoading
} from "./ui.js";

import { validateCreature } from "./rules.js";

import {
    saveFilter,
    getFilter,
    saveDraft,
    getDraft,
    clearDraft
} from "./storage.js";

// =====================================
// HTML ELEMENTS
// =====================================

const searchInput = document.getElementById("search");
const filtersContainer = document.getElementById("filters");
const sortSelect = document.getElementById("sort");
const loadMoreButton = document.getElementById("load-more");
const grid = document.getElementById("grid");
const form = document.getElementById("creature-form");
const creatureCount = document.getElementById("creature-count");

let selectedType = getFilter();
let editingId = null;

let allCreatures = [];
let visibleCount = 6;

const PAGE_SIZE = 6;

// =====================================
// LOAD CREATURES
// =====================================

async function loadCreatures() {
    try {
        showMessage("Chargement...");

        const params = {};

        const search = searchInput?.value.trim() || "";

        if (search) {
            params.q = search;
        }

        if (selectedType !== "Tous") {
            params.type = selectedType;
        }

        // Sorting (optional HTML select)
        const sort = sortSelect?.value || "";

        if (sort === "name-asc") {
            params._sort = "name";
            params._order = "asc";
        }

        if (sort === "name-desc") {
            params._sort = "name";
            params._order = "desc";
        }

        if (sort === "number") {
            params._sort = "id";
            params._order = "asc";
        }

        allCreatures = await getCreatures(params);

        visibleCount = PAGE_SIZE;

        displayCreatures(
            allCreatures.slice(0, visibleCount)
        );

        // Update total count
        if (creatureCount) {
            creatureCount.textContent = allCreatures.length;
        }

        // Show or hide Afficher plus
        if (loadMoreButton) {
            loadMoreButton.hidden =
                allCreatures.length <= visibleCount;
        }

        if (allCreatures.length === 0) {
            showMessage("Aucun Pokémon trouvé.");
        } else {
            showMessage("");
        }

    } catch (error) {
        console.error(error);

        showMessage(
            "Impossible de charger les Pokémon. Vérifiez json-server.",
            "error"
        );
    }
}

// =====================================
// SEARCH
// =====================================

if (searchInput) {
    searchInput.addEventListener("input", loadCreatures);
}

// =====================================
// TYPE FILTER BUTTONS
// =====================================

if (filtersContainer) {
    const filterButtons =
        filtersContainer.querySelectorAll("button");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            // Read data-type if available, otherwise button text
            selectedType =
                button.dataset.type || button.textContent.trim();

            saveFilter(selectedType);

            // Update active button appearance
            filterButtons.forEach(btn => {
                const active =
                    (btn.dataset.type || btn.textContent.trim()) === selectedType;

                btn.classList.toggle("border-ink", active);
                btn.classList.toggle("bg-ink", active);
                btn.classList.toggle("text-white", active);

                btn.setAttribute("aria-pressed", active);
            });

            loadCreatures();
        });

        // Restore selected filter
        const buttonType =
            button.dataset.type || button.textContent.trim();

        const active = buttonType === selectedType;

        button.classList.toggle("border-ink", active);
        button.classList.toggle("bg-ink", active);
        button.classList.toggle("text-white", active);

        button.setAttribute("aria-pressed", active);
    });
}

// =====================================
// SORT
// =====================================

if (sortSelect) {
    sortSelect.addEventListener("change", loadCreatures);
}

// =====================================
// AFFICHER PLUS
// =====================================

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
        const nextCreatures = allCreatures.slice(
            visibleCount,
            visibleCount + PAGE_SIZE
        );

        displayCreatures(nextCreatures, true);

        visibleCount += nextCreatures.length;

        loadMoreButton.hidden =
            visibleCount >= allCreatures.length;
    });
}

// =====================================
// DISPLAY DETAILS / EDIT / DELETE
// =====================================

if (grid) {
    grid.addEventListener("click", async event => {
        const card = event.target.closest(".creature-card");

        if (!card) return;

        const id = card.dataset.id;

        // Edit button
        if (event.target.closest(".edit-creature")) {
            await editCreature(id);
            return;
        }

        // Delete button
        if (event.target.closest(".delete-creature")) {
            await removeCreature(id);
            return;
        }

        // Load creature details
        try {
            showDetailLoading();

            const creature = await getCreature(id);

            displayCreatureDetails(creature);

        } catch (error) {
            console.error(error);

            if (error.message.includes("404")) {
                showCreatureNotFound();
            } else {
                showMessage(
                    "Impossible de charger cette fiche.",
                    "error"
                );
            }
        }
    });
}

// =====================================
// EDIT CREATURE
// =====================================

async function editCreature(id) {
    try {
        showMessage("Chargement...");

        const creature = await getCreature(id);

        editingId = id;

        fillCreatureForm(creature);

        showMessage(
            "Modifiez les informations de la créature."
        );

        document.getElementById("create")?.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error(error);

        showMessage(
            "Impossible de charger la créature.",
            "error"
        );
    }
}

// =====================================
// DELETE CREATURE
// =====================================

async function removeCreature(id) {
    const confirmed = confirm(
        "Voulez-vous supprimer cette créature ?"
    );

    if (!confirmed) return;

    try {
        showMessage("Suppression...");

        await deleteCreature(id);

        showMessage(
            "Créature supprimée avec succès.",
            "success"
        );

        await loadCreatures();

    } catch (error) {
        console.error(error);

        showMessage(
            "Erreur pendant la suppression.",
            "error"
        );
    }
}

// =====================================
// RESTORE FORM DRAFT
// =====================================

if (form) {
    const draft = getDraft();

    if (draft) {
        Object.entries(draft).forEach(([key, value]) => {
            const field = form.elements[key];

            if (field) {
                field.value = value;
            }
        });
    }

    // Save draft when user types
    form.addEventListener("input", () => {
        if (editingId !== null) return;

        const formData = new FormData(form);

        const draftData = Object.fromEntries(
            formData.entries()
        );

        saveDraft(draftData);
    });
}

// =====================================
// CREATE / UPDATE CREATURE
// =====================================

if (form) {
    form.addEventListener("submit", async event => {
        event.preventDefault();

        const formData = new FormData(form);

        const data = {
            numero: String(formData.get("id") || "").trim(),
            name: String(formData.get("name") || "").trim(),
            type: String(formData.get("type") || ""),
            level: String(formData.get("level") || "").trim(),

            stats: {
                hp: Number(formData.get("stat1")),
                attack: Number(formData.get("stat2")),
                defence: Number(formData.get("stat3"))
            },

            image: String(formData.get("image") || "").trim(),

            description: String(
                formData.get("description") || ""
            ).trim()
        };

        // Validate creature
        const errors = validateCreature(data);

        if (Object.keys(errors).length > 0) {
            showFieldErrors(errors);

            showMessage(
                "Veuillez corriger les erreurs du formulaire.",
                "error"
            );

            return;
        }

        try {
            clearFieldErrors();

            setFormLoading(true);

            if (editingId !== null) {
                await updateCreature(editingId, {
                    ...data,
                    id: Number(editingId)
                });

                showMessage(
                    "Créature modifiée avec succès.",
                    "success"
                );

            } else {
                await createCreature(data);

                showMessage(
                    "Créature ajoutée avec succès.",
                    "success"
                );
            }

            editingId = null;

            clearCreatureForm();
            clearDraft();

            await loadCreatures();

        } catch (error) {
            console.error(error);

            showMessage(
                "Erreur pendant l'enregistrement.",
                "error"
            );

        } finally {
            setFormLoading(false);
        }
    });
}

// =====================================
// CANCEL EDIT WHEN FORM IS RESET
// =====================================

if (form) {
    form.addEventListener("reset", () => {
        editingId = null;
        clearDraft();
        clearFieldErrors();
    });
}

// =====================================
// INITIALIZE
// =====================================

loadCreatures();
