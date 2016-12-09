import nodemailer = require('nodemailer');
import config = require('config');
import * as CLError from "./CLError";

export class CLMailer {

    //Using nodemailer-sendgrid-transport
    sendMail(to: string, subject: string, text?: string, html?: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            let systemEmail = process.env.EMAIL || config.get("mail.email");
            let transporter: nodemailer.Transporter = getMailerTransporter('sendgrid');
            var mailOptions = {
                from: systemEmail.toString(),
                to: to,
                subject: subject,
                text: text,
                html: html
            };
            try {
                transporter.sendMail(mailOptions)
                    .then(function (info: nodemailer.SentMessageInfo) {
                        resolve(JSON.stringify(info));
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            }
            catch (ex) {
                reject(new CLError.InternalServerError(CLError.ErrorCode.MAILER_FAILED, ex.message + "---" + ex.stach + "---" + mailOptions.from + "-" + mailOptions.html + "-" + mailOptions.subject + "-" + mailOptions.text + "-" + mailOptions.to));
            }
        });
    }

    //Using nodemailer with default SMTP - GMAIL
    //sendMail(to: string, subject: string,text?: string,html?:string): Promise<string> {
    //    return new Promise<string>(function (resolve, reject) {
    //        let systemEmail = process.env.EMAIL || config.get("mail.email");            
    //        let pwd = process.env.PWD || config.get("mail.password");
    //        let smtp = process.env.SMTP || config.get("mail.smtp");
    //        var transporter = nodemailer.createTransport('smtps://'+ systemEmail  +':'+ pwd +'@' + smtp);

    //        var mailOptions = {
    //            from: systemEmail.toString(),
    //            to: to,
    //            subject: subject,
    //            text:text,
    //            html: html
    //        };
    //        try {
    //            transporter.sendMail(mailOptions)
    //                .then(function (value: nodemailer.SentMessageInfo) {
    //                    resolve(value.response);
    //                })
    //                .catch(function (err) {
    //                    reject(err);
    //                });
    //        }
    //        catch (ex) {
    //            reject(new CLError.InternalServerError(CLError.ErrorCode.MAILER_FAILED, ex.message + "---" + ex.stach + "---" + mailOptions.from + "-" + mailOptions.html + "-" + mailOptions.subject + "-" + mailOptions.text + "-" + mailOptions.to));
    //        }          
    //    });        
    //}
}

//change this code if mail transport service change
function getMailerTransporter(mailerService: string): nodemailer.Transporter {
    let api_username = process.env.SENDGRID_USERNAME || config.get("mail.sendgrid_username");
    let api_password = process.env.SENDGRID_PASSWORD || config.get("mail.sendgrid_password");    
    let transporter: nodemailer.Transporter;
    if (mailerService == 'sendgrid') {
        var sgTransport = require('nodemailer-sendgrid-transport');
        var options = {
            auth: {
                api_user: api_username,
                api_key: api_password
            }
        }
        transporter = nodemailer.createTransport(sgTransport(options));
    }  
    return transporter;
}