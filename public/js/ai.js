const btn = document.getElementById("generateAI");

if (btn) {
    btn.addEventListener("click", async () => {

        const title = document.getElementById("title").value;
        const location = document.getElementById("location").value;
        const country = document.getElementById("country").value;
        const price = document.getElementById("price").value;

        if (!title || !location || !country || !price) {
            alert("Please fill all the required credintials!.");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = "⏳ Generating...";

        try {

            const response = await fetch("/ai/generate-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    location,
                    country,
                    price
                })
            });

           const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to generate description");
                console.error(data);
                return;
            }

document.getElementById("description").value = data.description;

        } catch (err) {
            console.log(err);
            alert("Something went wrong!");
        }

        btn.disabled = false;
        btn.innerHTML = "✨ Generate AI";

    });
}