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
You are an AI that extracts Airbnb search filters.

Return ONLY valid JSON.

If the user's query is meaningless, random text, or you cannot confidently determine any filters, return:

{
  "location": "",
  "maxPrice": null,
  "keywords": []
}

Examples:

User: Luxury hotel in Goa under 5000

{
  "location":"Goa",
  "maxPrice":5000,
  "keywords":["luxury","hotel"]
}

EXample 2 :

User: hotel in Goa under budget

{
  "location":"Goa",
  "maxPrice":5000,
  "keywords":["hotel"]
}

EXample 2 :

User: luxury house in jammu under budget

{
  "location":"jaammu",
  "maxPrice":5000,
  "keywords":["house stay","budget","luxury","jammu"]
}

User: dsxzcx

{
  "location":"",
  "maxPrice":null,
  "keywords":[]
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
            if (
            !filters.location &&
            !filters.maxPrice &&
            (!filters.keywords || filters.keywords.length === 0)
        ) {
            return res.render("listing/index.ejs", {
                allListing: [],
                aiQuery: query,
                totalResults: 0
            });
        }

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
// Optional keyword filtering
let filteredListings = listings;

if (filters.keywords?.length) {

    filteredListings = listings.filter(listing => {

        const text = `${listing.title} ${listing.description}`.toLowerCase();

        return filters.keywords.some(keyword =>
            text.includes(keyword.toLowerCase())
        );

    });

}

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