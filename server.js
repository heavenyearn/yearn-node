const { User } = require('./models')
const express = require('express');
const jwt = require('jsonwebtoken');
const { SECRETCODE } = require('./secretCode');

const app = express();
app.use(express.json());

const auth = async (req,res,next) => {
    const raw = req.headers.authorization.split(' ').pop();
    const tokenData = jwt.verify(raw,SECRETCODE)
    req.user = await User.findById(tokenData.id)
    next();
}

app.get('/api/users',async (req,res) => {
    const users =await User.find();
    res.send({
        code: 1,
        msg: 'success',
        data: users
    })
})
app.get('/api/profile',auth, async (req,res) => {
    res.send(req.user)
})
app.post('/api/register',async (req,res) => {
    const { username,password } = req.body;
    const user = await User.create({
        username,
        password
    })
    res.send({
        code: 1,
        msg: 'success'
    })
})
app.post('/api/login',async (req,res) => {
    const { username,password } = req.body;
    const user = await User.findOne({
        username: username
    })
    if(!user){
        return res.status(422).send({
            msg:'用户名不存在',
            code:'0'
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(password,user.password);
    if(!isPasswordValid){
        return res.status(422).send({
            msg:'密码错误',
            code:'0'
        })
    }
    // 生成token
    const token = jwt.sign({
        id : String(user._id),
    },SECRETCODE)
    res.send({
        user,
        token
    });
})

app.listen(8090,() => {
    console.log('http://localhost:8090')
})