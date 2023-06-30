const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getReverseNs = async (domainEntities, options) =>
  flow(
    map((entity) => ({
      //TODO: Add pagination
      entity,
      site: 'reverseNs',
      qs: {
        domainName: entity.value,
        outputFormat: 'JSON',
        type: '_all'
      },
      options
    })),
    async (reverseNsRequests) => await requestsInParallel(reverseNsRequests, 'body.result')
  )(domainEntities);

module.exports = getReverseNs;