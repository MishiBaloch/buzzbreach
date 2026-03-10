const transporter = require("./transporter.js");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config();

const otpEmail = async ({ firstName, lastName, corporateEmail, otp, isPasswordReset = false }) => {
  // Set proper sender name - always use "BuzzBreach" as display name
  let fromEmail;
  
  // Always format as: "BuzzBreach" <email@example.com>
  // This ensures the display name is set correctly
  if (process.env.EMAIL_FROM) {
    // Use EMAIL_FROM if set, but ensure it has proper format
    fromEmail = process.env.EMAIL_FROM;
    // If EMAIL_FROM doesn't have quotes, add them
    if (!fromEmail.includes('"') && fromEmail.includes('<')) {
      const emailMatch = fromEmail.match(/<(.+)>/);
      if (emailMatch) {
        fromEmail = `"BuzzBreach" <${emailMatch[1]}>`;
      }
    } else if (!fromEmail.includes('<')) {
      // If EMAIL_FROM is just an email, format it properly
      fromEmail = `"BuzzBreach" <${process.env.EMAIL_FROM}>`;
    }
  } else if (process.env.EMAIL_HOST_USER) {
    // Format: "BuzzBreach" <email@example.com>
    fromEmail = `"BuzzBreach" <${process.env.EMAIL_HOST_USER}>`;
  } else {
    // Fallback
    fromEmail = '"BuzzBreach" <noreply@buzzbreach.com>';
  }
  
  // Final check - ensure proper format
  if (!fromEmail.match(/^"[^"]+"\s*<[^>]+>$/)) {
    // If format is still wrong, try to fix it
    const emailMatch = fromEmail.match(/<(.+)>/);
    if (emailMatch) {
      fromEmail = `"BuzzBreach" <${emailMatch[1]}>`;
    } else if (fromEmail.includes('@')) {
      // If it's just an email address, wrap it
      fromEmail = `"BuzzBreach" <${fromEmail}>`;
    }
  }
  
  console.log(`[Email] Sending from: ${fromEmail}`);
  console.log(`[Email] From field formatted correctly: ${fromEmail.match(/^"[^"]+"\s*<[^>]+>$/) ? 'YES' : 'NO'}`);
  
  // Choose template based on purpose
  const templatePath = isPasswordReset 
    ? path.join(__dirname, "../views/passwordResetOtp.ejs")
    : path.join(__dirname, "../views/verifyEmailWithOtp.ejs");
  
  const subject = isPasswordReset 
    ? "Password Reset Verification Code - BuzzBreach"
    : "Your OTP Code";

  // Parse the from email to use nodemailer's object format for better compatibility
  // This ensures the display name is properly set
  let fromField;
  const fromMatch = fromEmail.match(/^"([^"]+)"\s*<([^>]+)>$/);
  if (fromMatch) {
    // Use object format: { name: "BuzzBreach", address: "email@example.com" }
    fromField = {
      name: fromMatch[1], // "BuzzBreach"
      address: fromMatch[2] // email address
    };
  } else {
    // Fallback: extract email if format is different
    const emailMatch = fromEmail.match(/<([^>]+)>/) || fromEmail.match(/([^\s<>]+@[^\s<>]+)/);
    if (emailMatch) {
      fromField = {
        name: "BuzzBreach",
        address: emailMatch[1]
      };
    } else {
      // Last resort: use as-is
      fromField = fromEmail;
    }
  }

  const mailOptions = {
    from: fromField,
    to: corporateEmail,
    subject: subject,
    html: await ejs.renderFile(
      templatePath,
      {
        name: firstName + " " + lastName,
        otp,
        isPasswordReset,
      }
    ),
  };
  
  console.log(`[Email] From field (object format):`, JSON.stringify(fromField));
  
  // Wrap sendMail in a Promise so it can be awaited
  return new Promise((resolve, reject) => {
    console.log(`[Email] Preparing to send email to: ${corporateEmail}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Template path: ${templatePath}`);
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("[Email] ❌ Error sending OTP email:");
        console.error("[Email] Error code:", err.code);
        console.error("[Email] Error command:", err.command);
        console.error("[Email] Error response:", err.response);
        console.error("[Email] Full error:", err);
        reject(err);
      } else {
        console.log("[Email] ✅ OTP email sent successfully!");
        console.log("[Email] Response: " + info.response);
        console.log("[Email] Message ID: " + info.messageId);
        console.log("[Email] Accepted: " + info.accepted);
        console.log("[Email] Rejected: " + info.rejected);
        resolve(info);
      }
    });
  });
};

module.exports = {
  otpEmail,
};
