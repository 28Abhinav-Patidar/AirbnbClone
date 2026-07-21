const ai = require("../utils/gemini");

module.exports.generateDescription = async (req, res) => {
    try {
        const { title, location, country, price } = req.body;

        const prompt = `
Generate an attractive Airbnb property description.

Title: ${title}
Location: ${location}
Country: ${country}
Price: ₹${price}

Rules:
- Write plain text only.
- Do NOT use Markdown.
- Do NOT use headings.
- Around 50-80 words.
- Professional and engaging.
- Mention comfort and nearby attractions.
`;

        // Models to try in order
        const models = [
            "gemini-3.5-flash",
            "gemini-3.1-flash-lite",
            "gemini-2.0-flash"
        ];

        let response = null;
        let usedModel = "";

        for (const model of models) {
            try {

                response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                });

                usedModel = model;
                break;

            } catch (err) {

                if (err.status === 503 || err.status === 404) {
                    continue;
                }

                throw err;
            }
        }

        if (!response) {
            return res.status(503).json({
                error: "All AI models are currently unavailable. Please try again later.",
            });
        }

        // Safely extract generated text
        const description =
            response?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim() || "";


        res.json({
            model: usedModel,
            description,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to generate description.",
        });
    }
};