// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper for request with error handling
 */
async function handleResponse(response: Response) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP error ${response.status}`);
    }
    return response.json();
}

/**
 * Save new metadata entry
 * @param formData - The metadata key/value object
 * @param groupId
 */
export async function createQuestionForm(formData: Record<string, any>, groupId: string) {
    const token = localStorage.getItem("token");
    const payload = {
        formData: formData,
        group_id: groupId
    };

    const response = await fetch(`${API_URL}/api/editor/question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
}

/**
 * Load metadata entry by ID (for editing)
 * @param id - The ID of the metadata
 */
export async function loadQuestionForm(id: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/editor/question/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    });
    return handleResponse(response);
}

/**
 * Update existing metadata entry
 * @param id - Metadata ID
 * @param formData - Updated content
 */
export async function updateQuestionForm(id: string, formData: Record<string, any>) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/editor/question/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
    });
    return handleResponse(response);
}


/**
 * Load all questions for a specific group
 * @param groupId - The ID of the group
 */
export async function loadAllQuestions(groupId: string) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/editor/questions/${groupId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    return handleResponse(response);
}