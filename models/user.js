var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
        User : Number,
    }
);

module.exports = mongoose.model('User',userSchema);