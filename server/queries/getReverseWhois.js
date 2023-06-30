const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getReverseWhois = async (stringEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      method: 'POST',
      site: 'reverseWhois',
      body: {
        searchType: 'current',
        mode: 'purchase',
        punycode: true,
        basicSearchTerms: {
          include: [entity.value] //string for company names
        }
      },
      options
    })),
    async (reverseWhoisRequests) =>
      await requestsInParallel(reverseWhoisRequests, 'body.domainsList')
  )(stringEntities);

module.exports = getReverseWhois;
