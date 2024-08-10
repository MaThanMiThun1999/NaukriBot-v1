const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();
const {
  BOT_EMAILID,
  BOT_MAIL_PASSWORD,
  RECEIVING_EMAILID,
} = process.env;

const sendEmail = async (subject, text, videoBuffer) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: BOT_EMAILID,
        pass: BOT_MAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: `NauKrI BoT <${BOT_EMAILID}>`,
      to:RECEIVING_EMAILID,
      subject: subject,
      text: text,
      attachments: [
        {
          filename: "screenrecord.mp4",
          content: videoBuffer,
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const manageCookies = async (page) => {
  try {
    const cookiesPath = "./cookies.json";
    const previousSession = fs.existsSync(cookiesPath);
    if (previousSession) {
      const cookiesString = fs.readFileSync(cookiesPath, "utf8");
      const cookies = JSON.parse(cookiesString);
      if (cookies.length !== 0) {
        await page.setCookie(...cookies);
      }
    }
    page.on("response", async (response) => {
      if (response.url().includes("naukri.com")) {
        const cookies = await page.cookies();
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
      }
    });
  } catch (error) {
    console.error("Error managing cookies:", error);
    throw error;
  }
};

const randomDelay = (min, max) => new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { sendEmail, manageCookies, randomDelay, delay };
