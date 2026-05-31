import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  // html: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject,  data } = options;
    console.log("setp 2");


  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: "", // This will be set after rendering the EJS template
  };

    console.log("setp 3");

  try {
    const htmlToSend = await ejs.renderFile(
      path.join(process.cwd(), "src", "mails", "activation-mail.ejs"),
      data,
    );
    console.log("setp 4");

    mailOptions.html = htmlToSend;
    console.log("setp 5");

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

export default sendMail;
