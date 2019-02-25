const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema({
    _id: String,
    author: String,
    title: String,
    description: String,
    publishedAt: String,
    content: String,
    urlToImage: String,
    url: String
});

const userSchema = new Schema({
    _id: String,
    emails: Array
});

const Article = mongoose.model('Article', articleSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Article,
    User,
};
