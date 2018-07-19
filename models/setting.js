const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

// Setting Schema
let settingSchema = mongoose.Schema({
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

settingSchema.index({type: 1, value: 1}, {unique: true});

settingSchema.plugin(uniqueValidator);

let Setting = module.exports = mongoose.model('Setting', settingSchema);
