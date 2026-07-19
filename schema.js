const joi = require("joi");

module.exports.listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),

        description: joi.string().required(),

        country: joi.string().required(),

        location: joi.string().required(),

        price: joi.number().required().min(0),

        image: joi.object({
            filename: joi.string().allow("", null),

            url: joi.string().allow("", null)
        }).optional()
    }).required()
});

module.exports.reviewSchema = joi.object({
    review: joi.object({
        Rating: joi.number().required().min(1).max(5).integer(),

        Comment: joi.string().required()
    }).required()
});