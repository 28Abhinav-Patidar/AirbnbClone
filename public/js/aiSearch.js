const form = document.getElementById("aiSearchForm");
const btn = document.getElementById("aiSearchBtn");

if (form && btn) {
    form.addEventListener("submit", () => {
        btn.disabled = true;

        btn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Searching...
        `;
    });
}