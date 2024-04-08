const { Resend } = require("resend");

const resend = new Resend(process.env.Email_Api_Key);

async function sendEmail(subject, htmlContent, toEmails) {
  try {
    const data = await resend.emails.send({
      from: process.env.Email_Sender,
      to: toEmails,
      subject: subject,
      html: htmlContent,
    });

    //console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = sendEmail;
