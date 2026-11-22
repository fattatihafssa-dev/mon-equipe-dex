
export function validateCreature(data) {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
        errors.name = "Le nom est obligatoire.";
    }

    if (!data.type || data.type === "") {
        errors.type = "Choisissez un type.";
    }

    if (!Number.isInteger(data.stats.hp) ||
        data.stats.hp < 1 || data.stats.hp > 255) {
        errors.hp = "Les PV doivent être entre 1 et 255.";
    }

    if (!Number.isInteger(data.stats.attack) ||
        data.stats.attack < 1 || data.stats.attack > 255) {
        errors.attack = "L'attaque doit être entre 1 et 255.";
    }

    if (!Number.isInteger(data.stats.defence) ||
        data.stats.defence < 1 || data.stats.defence > 255) {
        errors.defence = "La défense doit être entre 1 et 255.";
    }

    return errors;
}
