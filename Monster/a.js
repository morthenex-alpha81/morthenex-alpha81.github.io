function fetchMonsterImage(prompt) {
    const apiUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";

    return fetch(apiUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.blob();
    });
}