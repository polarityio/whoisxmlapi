const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getDomainAvailability = async (domainEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      site: 'domainAvailability',
      qs: { domainName: entity.value },
      options
    })),
    async (domainAvailabilityRequests) =>
      await requestsInParallel(domainAvailabilityRequests, 'body.DomainInfo')
  )(domainEntities);

module.exports = getDomainAvailability;
