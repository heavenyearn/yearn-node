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
    }
})

const User = mongoose.model('User',UserScheme)

module.exports = {
    User
};