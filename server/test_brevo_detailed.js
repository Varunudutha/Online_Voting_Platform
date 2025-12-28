const Brevo = require('@getbrevo/brevo');
console.log('Brevo.ApiClient:', Brevo.ApiClient);
console.log('Brevo keys:', JSON.stringify(Object.keys(Brevo), null, 2));

try {
    const instance = new Brevo.TransactionalEmailsApi();
    console.log('Instance created');
    console.log('Instance authentications:', JSON.stringify(Object.keys(instance.authentications || {}), null, 2));
} catch (e) {
    console.log('Error creating instance:', e.message);
}
