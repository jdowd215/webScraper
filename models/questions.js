var mongoose = require("mongoose");

//Save reference to schema constructor
var Schema = mongoose.Schema;

//Create new UserSchema object
var QuestionsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

//Create model from the above schema
var Questions = mongoose.model("Questions", QuestionsSchema);

//Export the Questions model
module.exports = Questions;