const { flow, get, orderBy, map, keys, reduce, omit } = require('lodash/fp');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { parseErrorToReadableJson } = require('../dataTransformations');

const getDns = async ({ entity }, options, callback) => {
  const Logger = getLogger();
  try {
    const dnsResponse = await requestWithDefaults({
      site: 'dns',
      qs: {
        domainName: entity.value,
        outputFormat: 'JSON',
        type: '_all'
      },
      options
    });

    const errorMessage = get('body.ErrorMessage.msg', dnsResponse);
    if (errorMessage) return callback(null, { failMessage: errorMessage });

    const dns = formatDnsRecords(dnsResponse);
    Logger.trace({ dns }, 'DNS Lookup Successful');

    callback(null, { dns });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed DNS Lookup',
        options,
        formattedError: err
      },
      'DNS Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'DNS Lookup Failed'
        }
      ]
    });
  }
};

const formatDnsRecords = (dnsResponse) => {
  const dns = get('body.DNSData', dnsResponse);
  const dnsRecordsWithFieldsRemoved = flow(
    get('dnsRecords'),
    map((dnsRecords) => {
      const record = omit(['type', 'rRsetType', 'rawText'], dnsRecords);
      const sortedRecord = flow(
        keys,
        orderBy(
          (key) =>
            DNS_RECORD_KEY_ORDERS.indexOf(key) !== -1
              ? DNS_RECORD_KEY_ORDERS.indexOf(key)
              : 9999,
          'asc'
        ),
        reduce((agg, key) => ({ ...agg, [key]: record[key] }), {})
      )(record);
      return sortedRecord;
    })
  )(dns);

  const formattedDns = {
    ...dns,
    dnsRecords: dnsRecordsWithFieldsRemoved
  };

  return formattedDns;
};

const DNS_RECORD_KEY_ORDERS = [
  'name',
  'dnsType',
  'additionalName',
  'admin',
  'host',
  'target',
  'address',
  'priority',
  'ttl'
];

module.exports = getDns;
