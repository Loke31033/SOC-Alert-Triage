import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const password = process.env.SMTP_PASSWORD;
const from = process.env.EMAIL_FROM;

console.log("SMTP CONFIGURATION");
console.log("-------------------");
console.log("Host :", host);
console.log("Port :", port);
console.log("User :", user);
console.log("From :", from);
console.log("Pass :", password ? "[SET]" : "[MISSING]");
console.log("-------------------");

if (!host || !user || !password || !from) {
  console.error("SMTP TEST FAILED");
  console.error("Required SMTP environment variables are missing.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: {
    user,
    pass: password,
  },
});

try {
  await transporter.verify();

  console.log("SMTP CONNECTION: SUCCESS");

  const info = await transporter.sendMail({
    from,
    to: user,
    subject: "SOC Contest Email Test",
    text: "SMTP email configuration is working successfully.",
  });

  console.log("EMAIL SENT SUCCESSFULLY");
  console.log("Message ID:", info.messageId);
} catch (error) {
  console.error("SMTP TEST FAILED");
  console.error(error);
  process.exit(1);
}
