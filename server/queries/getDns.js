const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getDns = async (domainEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      site: 'dns',
      qs: {
        domainName: entity.value,
        outputFormat: 'JSON',
        type: '_all'
      },
      options
    })),
    async (dnsRequests) => await requestsInParallel(dnsRequests, 'body.DNSData')
  )(domainEntities);

module.exports = getDns;
