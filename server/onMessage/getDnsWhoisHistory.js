const { get } = require('lodash/fp');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { parseErrorToReadableJson } = require('../dataTransformations');

const getDnsWhoisHistory = async ({ entity }, options, callback) => {
  const Logger = getLogger();
  try {
    const dnsWhoisHistoryResponse = await requestWithDefaults({
      method: 'POST',
      site: 'dnsWhoisHistory',
      body: {
        domainName: entity.value,
        mode: 'purchase'
      },
      options
    });

    const errorMessage = get('body.ErrorMessage.msg', dnsWhoisHistoryResponse);
    if (errorMessage) return callback(null, { failMessage: errorMessage });

    const dnsWhoisHistory = get('body.records', dnsWhoisHistoryResponse);
    Logger.trace({ dnsWhoisHistory }, 'DNS WHOIS History Lookup Successful');

    callback(null, { dnsWhoisHistory });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed DNS WHOIS History Lookup',
        options,
        formattedError: err
      },
      'DNS WHOIS History Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'DNS WHOIS History Lookup Failed'
        }
      ]
    });
  }
};

module.exports = getDnsWhoisHistory;
