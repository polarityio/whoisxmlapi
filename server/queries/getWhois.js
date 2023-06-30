const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getWhois = async (domainEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      site: 'whois',
      qs: {
        domainName: entity.value,
        outputFormat: 'JSON',
        ip: 1,
        ipWhois: 1,
        checkProxyData: 1,
      },
      options
    })),
    async (whoisRequests) =>
      await requestsInParallel(whoisRequests, 'body.WhoisRecord')
  )(domainEntities);

module.exports = getWhois;
