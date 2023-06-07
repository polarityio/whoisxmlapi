const { size, flow } = require('lodash/fp');
const { parseErrorToReadableJson } = require('../dataTransformations');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { validateStringOptions, flattenOptions } = require('./utils');

const validateOptions = async (options, callback) => {
  const stringOptionsErrorMessages = {
    apiKey: '* Required'
  };

  const stringValidationErrors = validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  const authenticationError = !size(stringValidationErrors)
    ? await validateAuthentication(options)
    : [];

  const errors = stringValidationErrors.concat(authenticationError);

  callback(null, errors);
};

const validateAuthentication = async (unParsedOptions) => {
  const options = flattenOptions(unParsedOptions);

  try {
    await requestWithDefaults({
      //TODO
      route: 'companies/search',
      qs: { domain: 'google.com', limit: 1 },
      options
    });
    return [];
  } catch (error) {
    getLogger().error(
      { error, formattedError: parseErrorToReadableJson(error) },
      'Authentication Failed'
    );
    const message = `Authentication Failed: ${error.message} - Confirm your Company API Key is correct.`;
    return { key: 'apiKey', message };
  }
};

module.exports = validateOptions;
