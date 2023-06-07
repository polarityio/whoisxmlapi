const authenticateRequest = async ({ route, options, ...requestOptions }) => ({
  ...requestOptions,
  //TODO
  url: 'https://api.bitsighttech.com/v1/' + route,
  auth: {
    username: options.apiKey
  }
});

module.exports = authenticateRequest;
