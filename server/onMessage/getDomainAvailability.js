const { get } = require('lodash/fp');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { parseErrorToReadableJson } = require('../dataTransformations');

const getDomainAvailability = async ({ entity }, options, callback) => {
  const Logger = getLogger();
  try {
    const domainAvailabilityResponse = await requestWithDefaults({
      site: 'domainAvailability',
      qs: { domainName: entity.value },
      options
    });

    const errorMessage = get('body.ErrorMessage.msg', domainAvailabilityResponse);
    if (errorMessage) return callback(null, { failMessage: errorMessage });

    const domainAvailability = get('body.DomainInfo', domainAvailabilityResponse);
    Logger.trace({ domainAvailability }, 'Domain Availability Lookup Successful');

    callback(null, { domainAvailability });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed Domain Availability Lookup',
        options,
        formattedError: err
      },
      'Domain Availability Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'Domain Availability Lookup Failed'
        }
      ]
    });
  }
};

module.exports = getDomainAvailability;
