import nodemailer = require('nodemailer');
import config = require('config');
import * as CLError from "./CLError";
var SparkPost = require('sparkpost');

export class CLMailer {
    sendMail(to: string, subject: string,text?: string,html?:string): Promise<string> {
        return new Promise<string>(function (resolve, reject) {
            //let systemEmail = process.env.EMAIL || config.get("mail.email");            
            //let pwd = process.env.PWD || config.get("mail.password");
            //let smtp = process.env.SMTP || config.get("mail.smtp");
            //var transporter = nodemailer.createTransport('smtps://'+ systemEmail  +':'+ pwd +'@' + smtp);

            //var mailOptions = {
            //    from: systemEmail.toString(),
            //    to: to,
            //    subject: subject,
            //    text:text,
            //    html: html
            //};
            //try {
            //    transporter.sendMail(mailOptions)
            //        .then(function (value: nodemailer.SentMessageInfo) {
            //            resolve(value.response);
            //        })
            //        .catch(function (err) {
            //            reject(err);
            //        });
            //}
            //catch (ex) {
            //    reject(new CLError.InternalServerError(CLError.ErrorCode.MAILER_FAILED, ex.message + "---" + ex.stach + "---" + mailOptions.from + "-" + mailOptions.html + "-" + mailOptions.subject + "-" + mailOptions.text + "-" + mailOptions.to));
            //}
            var sparky = new SparkPost(); // uses process.env.SPARKPOST_API_KEY
            sparky.transmissions.send({
                transmissionBody: {
                    content: {
                        from: 'testing@' + process.env.SPARKPOST_SANDBOX_DOMAIN, // 'testing@sparkpostbox.com'
                        subject: 'Oh hey!',
                        html: '<html><body><p>Testing SparkPost - the world\'s most awesomest email service!</p></body></html>'
                    },
                    recipients: [
                        { address: to }
                    ]
                }
            }, function (err, res) {
                if (err) {
                    console.log('Whoops! Something went wrong');
                    console.log(err);
                } else {
                    console.log('Woohoo! You just sent your first mailing!');
                }
            });
        });        
    }
}