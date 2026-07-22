const form = document.getElementById("aiSearchForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const query = document.getElementById("aiSearchInput").value;

        const response = await fetch("/ai/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const html = await response.text();

        document.open();
        document.write(html);
        document.close();
    });
}