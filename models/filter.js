const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

// Filter Schema
let filterSchema = mongoose.Schema({
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

filterSchema.index({type: 1, value: 1}, {unique: true});

filterSchema.plugin(uniqueValidator);

let Filter = module.exports = mongoose.model('Filter', filterSchema);
