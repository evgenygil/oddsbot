const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 30
};

// Log Schema
let logSchema = mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true
        },
        pinnacle: {
            type: Object,
            required: true,
        },
        marathonbet: {
            type: Object,
            required: true,
        },
        xbet: {
            type: Object,
            required: true,
        },
        comment: {
            type: String
        }
    },
    {
        timestamps: true
    });

logSchema.index({title: 1, matchDate: 1}, {unique: true});

logSchema.plugin(uniqueValidator);
logSchema.plugin(mongoosePaginate);

let Log = module.exports = mongoose.model('Log', logSchema);
