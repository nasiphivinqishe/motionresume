var nodemailer = require('nodemailer');
const EMAIL_TRANSPORT_USERNAME = "nassiphivinqishe@gmail.com"
const EMAIL_TRANSPORT_USER_PASSWORD = "07328911200"



class SendEmail {

    constructor() {

        this.emailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_TRANSPORT_USERNAME,
                pass: EMAIL_TRANSPORT_USER_PASSWORD
            }
        });
    }

    sendEmail = (recipient, subject, body) => {
        const mailOptions = {
            from: EMAIL_TRANSPORT_USERNAME,
            to: recipient,
            subject: subject,
            html: body
        };

        return new Promise((resolve, reject) => {
            this.emailTransport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error)
                } else {
                    resolve(info)
                }
            });
        })
    }
}

module.exports = SendEmail