const Brevo = require('@getbrevo/brevo');
console.log('Keys:', Object.keys(Brevo));

try {
    if (Brevo.TransactionalEmailsApi) {
        console.log("TransactionalEmailsApi class exists");
    } else {
        console.log("TransactionalEmailsApi class MISSING");
    }
} catch (e) {
    console.log("Error checking TransactionalEmailsApi:", e.message);
}

try {
    if (Brevo.SendSmtpEmail) {
        console.log("SendSmtpEmail class exists");
    } else {
        console.log("SendSmtpEmail class MISSING");
    }
} catch (e) {
    console.log("Error checking SendSmtpEmail:", e.message);
}
