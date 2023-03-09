const paystack = (request) => {
  const initializePayment = (form, mycallback) => {
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
        "Content-type": "application/json",
      },
      form,
    };
    const callback = (error, body) => {
      return mycallback(error, body);
    };
    request.post(options, callback);
  };

  const verifyPayment = (ref, mycallback) => {
    const options = {
      url:
        "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
    };
    const callback = (error, body) => {
      return mycallback(error, body);
    };
    request(options, callback);
  };

  return { initializePayment, verifyPayment };
};

module.exports = paystack;
