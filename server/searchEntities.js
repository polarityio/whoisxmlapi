const { __, includes, get, eq, filter, flow } = require('lodash/fp');
const { getWhois, getReverseWhois } = require('./queries');
const { getLogger } = require('./logging');

const searchEntities = async (entities, options) => {
  const Logger = getLogger();

  const domainAndIpEntities = getEntitiesOfType(['IPv4', 'domain'], entities);
  const stringAndEmailEntities = getEntitiesOfType(['email', 'string'], entities);

  Logger.trace({ domainAndIpEntities, stringAndEmailEntities }, 'Sorted Entities for Lookup');

  const [whois, reverseWhois] = await Promise.all([
    getWhois(domainAndIpEntities, options),
    getReverseWhois(stringAndEmailEntities, options)
  ]);

  return {
    whois,
    reverseWhois
  };
};

const getEntitiesOfType = (types, entities) =>
  filter(flow(get('type'), includes(__, types)), entities);

module.exports = searchEntities;
