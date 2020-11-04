const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yearn', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
});

const UserScheme = new mongoose.Schema({
    username: { type:String, unique:true },
    password: {
        type:String,
        set(val){
            return require('bcrypt').hashSync(val,10);
        }
    },
    email : { type:String, unique:true }
})

const EmailCodeScheme = new mongoose.Schema({
    email:  { type:String ,unique:true},
    code:  { type:String },
    date: { type:Date},
    isLive :  { type:String },
})

const EmailCode = mongoose.model('EmailCode',EmailCodeScheme)

const User = mongoose.model('User',UserScheme)

// User.db.dropCollection('users');
// EmailCode.db.dropCollection('emailcodes');

module.exports = {
    User,
    EmailCode
};