import * as nodemailer from "nodemailer";
import config = require('config');
export class CLMailer {
    sendMail(to: string, subject: string,text?: string,html?:string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            let systemEmail = config.get("mail.email");            
            let pwd = config.get("mail.password");
            let smtp = config.get("mail.smtp");
            var transporter = nodemailer.createTransport('smtps://'+ systemEmail  +':'+ pwd +'@' + smtp);

            var mailOptions = {
                from: systemEmail.toString(),
                to: to,
                subject: subject,
                text:text,
                html: html
            };
            transporter.sendMail(mailOptions)            
                .then(function (value: nodemailer.SentMessageInfo) {
                    resolve(value.response);
                })
                .catch(function (err) {
                    reject(err);
                })
        });        
    }
}