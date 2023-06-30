const { get, eq } = require('lodash/fp');
const {
  getWhois,
  getDns,
  getDnsWhoisHistory,
  getDomainAvailability,
  getDomainSubDomain,
  getReverseNs,
  getReverseWhois
} = require('./queries');

const searchEntities = async (entities, options) => {
  const domainEntities = getEntitiesOfType('domain', entities);
  const stringEntities = getEntitiesOfType('string', entities);

  const [
    whois,
    dns,
    dnsWhoisHistory,
    domainAvailability,
    domainSubDomain,
    reverseNs,
    reverseWhois
  ] = await Promise.all([
    getWhois(domainEntities, options),
    getDns(domainEntities, options),
    getDnsWhoisHistory(domainEntities, options),
    getDomainAvailability(domainEntities, options),
    getDomainSubDomain(domainEntities, options),
    getReverseNs(domainEntities, options),
    getReverseWhois(stringEntities, options)
  ]);

  return {
    whois,
    dns,
    dnsWhoisHistory,
    domainAvailability,
    domainSubDomain,
    reverseNs,
    reverseWhois
  };
};

const getEntitiesOfType = (type, entities) =>
  filter(flow(get('type'), eq(type)), entities);

module.exports = searchEntities;
