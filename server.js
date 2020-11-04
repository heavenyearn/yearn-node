const { User, EmailCode } = require('./models')
const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { SECRETCODE } = require('./secretCode');
const { getSixRandom } = require('./commonMethod');
const nodemailer = require('./nodemailer');

const app = express();
app.use(express.json());
app.use(cors);

// 鉴权部分
const auth = async (req,res,next) => {
    const raw = req.headers.authorization.split(' ').pop();
    const tokenData = jwt.verify(raw,SECRETCODE)
    req.user = await User.findById(tokenData.id)
    next();
}

// 用户信息部分
app.get('/api/users',async (req,res) => {
    const users =await User.find();
    res.send({
        code: 1,
        msg: 'success',
        data: users
    })
})
app.get('/api/emailcode',async (req,res) => {
    const emailcode =await EmailCode.find();
    res.send({
        code: 1,
        msg: 'success',
        data: emailcode
    })
})

app.get('/api/check/username', async (req,res) => {
    const { username } = req.body;
    const exist = await User.findOne({
        username
    })
    if(exist){
        return res.status(422).send({
            msg:'用户名已经注册过',
            code:0
        })
    }
    res.send({
        msg:'用户名未被注册过',
        code:1
    })
})

app.post('/api/register',async (req,res) => {
    const { username, password, email } = req.body;
    const exist = await User.findOne({
        $or:[username,email]
    })
    if(exist){
        return res.status(422).send({
            msg:'用户名或邮箱已经注册过',
            code:0
        })
    }
    const user = await User.create({
        username,
        password
    })
    res.send({
        msg: '注册成功',
        code: 1
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
        msg:'登录成功',
        code:1,
        data:{
            token,
            username
        }
    });
})

app.get('/api/check/email', async (req,res) => {
    const { email } = req.body;
    const exist = await User.findOne({
        email
    })
    if(exist){
        return res.status(422).send({
            msg:'邮箱已经注册过',
            code:0
        })
    }
    res.send({
        msg:'邮箱未被注册过',
        code:1
    })
})

app.get('/api/email', async (req,res) => {
    const { email } = req.body;
    const exist = await User.findOne({
        email
    })
    if(exist){
        return res.status(422).send({
            msg:'邮箱已经注册过',
            code:0
        })
    }
    const code = await getSixRandom();
    const date = new Date();
    const mail = {
        from: '<yearn_mail@163.com>',
        subject:'Yearn 注册凭证',
        to: email,
        text:'用'+code+'作为你的注册凭证去注册吧'
    }
    const codeExist = await EmailCode.findOne({
        email
    })
    if(codeExist){
        await EmailCode.updateOne({ email },
        {
            email,
            code,
            date,
            isLive:'no'
        },(err,docs)=>{
            if(err) console.log(err);
            else console.log('更改成功: '+docs)
        })
    }else{
        await EmailCode.create({
            email,
            code,
            date,
            isLive:'no'
        })
    }
    setTimeout(async ()=>{ //5分钟后失效
        await EmailCode.deleteMany({email})
    },1000*60*5)

    await nodemailer(mail);
    res.send({
        msg:'验证码已发送',
        code:1
    })
})

app.listen(8090,() => {
    console.log('http://localhost:8090')
})