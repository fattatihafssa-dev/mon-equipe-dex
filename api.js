
const BASE_URL = "http://localhost:3000";

export async function request(method, route, body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${route}`, options);

    if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// GET all creatures with filters and sorting
export function getCreatures(params = {}) {
    const query = new URLSearchParams(params).toString();

    const route = query
        ? `/creatures?${query}`
        : "/creatures";

    return request("GET", route);
}

// GET one creature
export function getCreature(id) {
    return request("GET", `/creatures/${id}`);
}

// POST
export function createCreature(data) {
    return request("POST", "/creatures", data);
}

// PUT
export function updateCreature(id, data) {
    return request("PUT", `/creatures/${id}`, data);
}

// DELETE
export function deleteCreature(id) {
    return request("DELETE", `/creatures/${id}`);
}
