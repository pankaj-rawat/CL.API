import nodemailer = require('nodemailer');
import config = require('config');
import * as CLError from "./CLError";

export class CLMailer {

    sendMail(to: string, subject: string, text?: string, html?: string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            let postmark_key: string = process.env.POSTMARK_KEY || config.get("postmark_key");;
            let systemEmail = process.env.EMAIL || config.get("mail.email");
            var mailOptions = {
                From: systemEmail.toString(),
                To: to,
                Subject: subject,
                TextBody: text,
                HtmlBody: html
            };
            try {
                var postmark = require("postmark")(postmark_key);
                postmark.send(mailOptions, function (err, to) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    resolve("mail sent to : " + to);
                });
            }
            catch (ex) {
                reject(new CLError.InternalServerError(CLError.ErrorCode.MAILER_FAILED, ex.message + "---" + ex.stach + "---" + mailOptions.From + "-" + mailOptions.Subject + "-" + mailOptions.TextBody + "-" + mailOptions.To));
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