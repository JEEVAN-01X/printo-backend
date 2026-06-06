const twilio = require('twilio');

const getClient = () => {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
};

const sendOrderReady = async (order) => {
  const client = getClient();
  await client.messages.create({
    body: `Hi ${order.student_name}, your print order #${order.token_number} is ready at Printo. Please collect within 30 minutes. - Printo`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${order.student_phone}`,
  });
};

const sendOrderCancelled = async (order) => {
  const client = getClient();
  await client.messages.create({
    body: `Hi ${order.student_name}, your print order #${order.token_number} was cancelled. Please re-submit or visit the shop. - Printo`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${order.student_phone}`,
  });
};

module.exports = { sendOrderReady, sendOrderCancelled };
