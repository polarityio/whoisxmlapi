const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getDnsWhoisHistory = async (stringEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      method: 'POST',
      site: 'dnsWhoisHistory',
      body: {
        domainName: entity.value,
        mode: 'purchase'
      },
      options
    })),
    async (dnsWhoisHistoryRequests) =>
      await requestsInParallel(dnsWhoisHistoryRequests, 'body.records')
  )(stringEntities);

module.exports = getDnsWhoisHistory;
