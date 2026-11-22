
// =====================================
// HTML ELEMENTS
// =====================================

const grid = document.getElementById("grid");
const message =
    document.getElementById("message") ||
    document.getElementById("api-status");

// =====================================
// TYPE TRANSLATION
// =====================================

function translateType(type) {
    return type || "Inconnu";
}

// =====================================
// MESSAGES
// =====================================

export function showMessage(text, type = "info") {
    if (!message) return;

    message.textContent = text;
    message.className = "text-center text-muted";

    if (type === "error") {
        message.className = "text-center text-red-600";
    }

    if (type === "success") {
        message.className = "text-center text-green-600";
    }
}

// =====================================
// DISPLAY CREATURES
// =====================================

export function displayCreatures(list, append = false) {
    if (!grid) return;

    if (!append) {
        grid.replaceChildren();
    }

    if (list.length === 0 && !append) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "Aucun Pokémon trouvé.";
        emptyMessage.className = "col-span-full text-center text-muted";

        grid.appendChild(emptyMessage);
        return;
    }

    list.forEach(creature => {
        const card = document.createElement("article");

        card.dataset.id = creature.id;
        card.className =
            "creature-card flex min-w-0 cursor-pointer flex-col gap-4 rounded-card bg-white p-4 pb-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";

        // Image container
        const imageContainer = document.createElement("div");

        imageContainer.className =
            "relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-brand-light";

        const number = document.createElement("span");

        number.textContent =
            creature.numero ||
            `#${String(creature.id).padStart(3, "0")}`;

        number.className =
            "absolute left-3 top-2 font-mono text-sm text-muted";

        const image = document.createElement("img");

        image.src = creature.image || "";
        image.alt = creature.name;
        image.className = "h-24 w-24 object-contain";
        image.loading = "lazy";

        image.onerror = () => {
            image.alt = "Image indisponible";
        };

        imageContainer.append(number, image);

        // Information
        const information = document.createElement("div");

        information.className = "flex flex-col gap-2";

        const name = document.createElement("h3");

        name.textContent = creature.name;
        name.className =
            "font-display text-xl font-semibold capitalize";

        const type = document.createElement("span");

        type.textContent = translateType(creature.type);
        type.className =
            "w-fit rounded-full bg-brand-light px-3 py-1 text-sm font-bold text-ink";

        const stats = creature.stats || {};

        const total = document.createElement("p");

        total.textContent =
            "Total " +
            (
                Number(stats.hp || 0) +
                Number(stats.attack || 0) +
                Number(stats.defence || 0)
            );

        total.className = "text-sm text-muted";

        information.append(name, type, total);

        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Modifier";
        editButton.className = "edit-creature btn-outline";

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";
        deleteButton.className = "delete-creature btn-outline";

        card.append(
            imageContainer,
            information,
            editButton,
            deleteButton
        );

        grid.appendChild(card);
    });
}

// =====================================
// DISPLAY CREATURE DETAILS
// =====================================

export function displayCreatureDetails(creature) {
    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "";
        }
    };

    const stats = creature.stats || {};

    setText(
        "detail-number",
        creature.numero || `#${creature.id}`
    );

    setText("detail-name", creature.name);
    setText("detail-type", translateType(creature.type));

    setText("detail-hp", stats.hp);
    setText("detail-attack", stats.attack);
    setText("detail-defence", stats.defence);

    setText(
        "detail-description",
        creature.description || "Aucune description disponible."
    );

    // The HTML uses a DIV for the detail image
    const imageContainer = document.getElementById("detail-image");

    if (imageContainer) {
        imageContainer.replaceChildren();

        const image = document.createElement("img");

        image.src = creature.image || "";
        image.alt = creature.name;
        image.className = "h-40 w-40 object-contain";

        image.onerror = () => {
            image.alt = "Image indisponible";
        };

        imageContainer.appendChild(image);
    }

    // Stat bars
    const updateBar = (id, value) => {
        const bar = document.getElementById(id);

        if (bar) {
            const percentage = Math.min(
                100,
                Math.max(0, (Number(value) / 255) * 100)
            );

            bar.style.width = `${percentage}%`;
        }
    };

    updateBar("detail-hp-bar", stats.hp);
    updateBar("detail-attack-bar", stats.attack);
    updateBar("detail-defence-bar", stats.defence);
}

// =====================================
// LOADING AND NOT FOUND
// =====================================

export function showDetailLoading() {
    const name = document.getElementById("detail-name");

    if (name) {
        name.textContent = "Chargement...";
    }
}

export function showCreatureNotFound() {
    showMessage("Créature introuvable.", "error");
}

// =====================================
// FORM ERRORS
// =====================================

export function showFieldErrors(errors) {
    clearFieldErrors();

    const fieldNames = {
        hp: "stat1",
        attack: "stat2",
        defence: "stat3"
    };

    Object.entries(errors).forEach(([field, error]) => {
        const name = fieldNames[field] || field;

        const input = document.querySelector(
            `#creature-form [name="${name}"]`
        );

        if (!input) return;

        const errorElement =
            input.parentElement.querySelector(".error-message");

        if (errorElement) {
            errorElement.textContent = error;
            errorElement.classList.add("text-red-600");
        }
    });
}

export function clearFieldErrors() {
    document.querySelectorAll(".error-message").forEach(element => {
        element.textContent = "";
        element.classList.remove("text-red-600");
    });
}

// =====================================
// FILL FORM FOR EDITING
// =====================================

export function fillCreatureForm(creature) {
    const form = document.getElementById("creature-form");

    if (!form) return;

    form.elements["id"].value = creature.numero || "";
    form.elements["name"].value = creature.name;
    form.elements["type"].value = creature.type;
    form.elements["level"].value = creature.level || "";

    form.elements["stat1"].value = creature.stats.hp;
    form.elements["stat2"].value = creature.stats.attack;
    form.elements["stat3"].value = creature.stats.defence;

    form.elements["image"].value = creature.image || "";
    form.elements["description"].value =
        creature.description || "";
}

// =====================================
// CLEAR FORM
// =====================================

export function clearCreatureForm() {
    const form = document.getElementById("creature-form");

    if (form) {
        form.reset();
    }

    clearFieldErrors();
}

// =====================================
// FORM LOADING
// =====================================

export function setFormLoading(loading) {
    const form = document.getElementById("creature-form");

    if (!form) return;

    const button = form.querySelector('button[type="submit"]');

    if (button) {
        button.disabled = loading;

        button.textContent = loading
            ? "Envoi..."
            : "Ajouter la créature";
    }
}
