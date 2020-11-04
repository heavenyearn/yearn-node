const { model } = require('mongoose');
const nodemailer = require('nodemailer');

const config = {
    host:'smtp.163.com',
    port: 465,
    auth : {
        user: 'yearn_mail@163.com',
        pass: 'PROMXAGTFIVOGYQB',
    }
};

const transporter = nodemailer.createTransport(config);

module.exports = mail => {
    transporter.sendMail(mail, (error , info) => {
        if(error){
            return console.log(error)
        }
        console.log('mail sent:',info.response);
    })
}