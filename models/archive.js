const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
ObjectId = mongoose.Types.ObjectId;

let uniqueValidator = require('mongoose-unique-validator');

mongoosePaginate.paginate.options = {
    lean: true,
    limit: 20
};

// Archive Schema
let archiveSchema = mongoose.Schema({
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

archiveSchema.index({title: 1, matchDate: 1}, {unique: true});

archiveSchema.plugin(uniqueValidator);
archiveSchema.plugin(mongoosePaginate);

let Log = module.exports = mongoose.model('Archive', archiveSchema);
