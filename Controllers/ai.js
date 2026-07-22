const ai = require("../utils/gemini");
const Listing = require("../models/listing");

module.exports.generateDescription = async (req, res) => { 
    try {
         const { title, location, country, price } = req.body; 
         const prompt = `Generate an attractive Airbnb property description. 
                        Title: ${title} 
                        Location: ${location} 
                        Country: ${country} 
                        Price: ₹${price} 
                        Rules: - Write plain text only. 
                                - Do NOT use Markdown. 
                                - Do NOT use headings. 
                                - Around 50-80 words. 
                                - Professional and engaging. 
                                - Mention comfort and nearby attractions.` ; 
                // Models to try in order const 
        models = [ "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.0-flash" ]; 
        let response = null; 
        let usedModel = ""; 
        for (const model of models) {
             try { 
                response = await ai.models.generateContent({ model, contents: prompt, }); 
                usedModel = model; 
                break; 
            } catch (err) { 
                if (err.status === 503 || err.status === 404) 
                    { continue; 

                    } 
                throw err; 
            } } 
                if (!response) { 
                    return res.status(503).json({
                         error: "All AI models are currently unavailable. Please try again later.", }); 
                        } 
                // Safely extract generated text
                const description = response?.candidates?.[0]?.content?.parts ?.map(part => part.text || "") .join("") .trim() || ""; 
                res.json({ model: usedModel, description, }); 
            } catch (err) { console.error(err); 
                res.status(500).json({ error: "Failed to generate description.", }); } };



module.exports.searchListings = async (req, res) => {
    try {
        const { query } = req.body;

        const prompt = `
You are an AI that extracts search filters for an Airbnb website.

Return ONLY valid JSON.

Example:

{
  "location": "Goa",
  "maxPrice": 5000,
  "keywords": ["beach", "luxury"]
}

User Query:
"${query}"
`;

        const models = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash"
];

let response = null;

for (const model of models) {
    try {
        response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        console.log(`Using model: ${model}`);
        break;

    } catch (err) {

        if (err.status === 503 || err.status === 404) {
            console.log(`${model} unavailable, trying next...`);
            continue;
        }

        throw err;
    }
}

if (!response) {
    return res.status(503).json({
        error: "All AI models are currently unavailable. Please try again in a few minutes."
    });
}
        let text = response?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        text = text.replace(/```json|```/g, "").trim();

        const filters = JSON.parse(text);

        console.log("AI Filters:", filters);

      const listings = await Listing.find({
    ...(filters.location && {
        location: {
            $regex: filters.location,
            $options: "i"
        }
    }),

    ...(filters.maxPrice && {
        price: {
            $lte: Number(filters.maxPrice)
        }
    })
});

// Optional keyword filtering
let filteredListings = listings;

if (filters.keywords?.length) {

    filteredListings = listings.filter(listing => {

        const text = `${listing.title} ${listing.description}`.toLowerCase();

        return filters.keywords.some(keyword =>
            text.includes(keyword.toLowerCase())
        );

    });

    // If keyword filtering removes everything,
    // return the location+price matches instead.
    if (filteredListings.length === 0) {
        filteredListings = listings;
    }
}

console.log(`Found ${filteredListings.length} listing(s)`);

return res.render("listing/index.ejs", {
    allListing: filteredListings,
    aiQuery: query,
    totalResults: filteredListings.length
});

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "AI search failed."
        });
    }
};