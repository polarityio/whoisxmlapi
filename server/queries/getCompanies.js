const { flow, map } = require('lodash/fp');
const { MAX_PAGE_SIZE } = require('../constants');
const { requestsInParallel } = require('../request');

const getCompanies = async (entities, options) =>
  flow(
    map((entity) => ({
      entity,
      route: 'companies/search',
      qs: {
        domain: entity.value,
        expand: 'details',
        limit: MAX_PAGE_SIZE
      },
      options
    })),
    async (companySearchRequests) =>
      await requestsInParallel(companySearchRequests, 'body.results')
  )(entities);

module.exports = getCompanies;
