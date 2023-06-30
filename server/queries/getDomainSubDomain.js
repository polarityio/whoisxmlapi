const { flow, map } = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getDomainSubDomain = async (domainEntities, options) =>
  flow(
    map((entity) => ({
      entity,
      method: 'POST',
      site: 'domainSubDomain',
      body: {
        domains: { include: [getRootDomain(entity.value)] },
        subdomains: { include: getSubDomainIncludes(entity.value) }
      },
      options
    })),
    async (getDomainSubDomain) =>
      await requestsInParallel(getDomainSubDomain, 'body.domainsList')
  )(domainEntities);

const getSubDomainIncludes = flow(split('.'), reverse, drop(2), reverse, (subdomains) =>
  size(subdomains) ? map((subdomain) => subdomain + '*', subdomains) : ['*']
);

const getRootDomain = flow(split('.'), reverse, take(2), reverse, join('.'));

module.exports = getDomainSubDomain;
