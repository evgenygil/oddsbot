const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 20
};

// Match Schema
let matchSchema = mongoose.Schema({
        title: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true
        },
        league: {
            type: String,
            required: true
        },
        link: {
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
        },
        archive: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    });

matchSchema.index({title: 1, matchDate: 1}, {unique: true});

matchSchema.plugin(uniqueValidator);
matchSchema.plugin(mongoosePaginate);

let Match = module.exports = mongoose.model('Match', matchSchema);
