const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

// CalcFilter Schema
let calcFilterSchema = mongoose.Schema({
        type: {
            type: Number,
            required: true,
        },
        value: {
            type: String,
            required: true
        },
        comment: {
            type: String
        }
    },
    {
        timestamps: true
    });

calcFilterSchema.index({type: 1, value: 1}, {unique: true});

calcFilterSchema.plugin(uniqueValidator);

let CalcFilter = module.exports = mongoose.model('CalcFilter', calcFilterSchema);
