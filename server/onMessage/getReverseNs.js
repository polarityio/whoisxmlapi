const { get } = require('lodash/fp');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { parseErrorToReadableJson } = require('../dataTransformations');

const getReverseNs = async ({ entity }, options, callback) => {
  const Logger = getLogger();
  try {
    const reverseNsResponse = await requestWithDefaults({
      site: 'reverseNs',
      qs: {
        ns: entity.value,
        outputFormat: 'JSON'
      },
      options
    });

    const errorMessage = get('body.ErrorMessage.msg', reverseNsResponse);
    if (errorMessage) return callback(null, { failMessage: errorMessage });

    const reverseNs = get('body.result', reverseNsResponse);
    Logger.trace({ reverseNs }, 'Reverse NS Lookup Successful');

    callback(null, { reverseNs });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed Reverse NS Lookup',
        options,
        formattedError: err
      },
      'Reverse NS Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'Reverse NS Lookup Failed'
        }
      ]
    });
  }
};


module.exports = getReverseNs;
