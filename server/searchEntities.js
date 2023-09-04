const { __, includes, get, eq, filter, flow } = require('lodash/fp');
const { getWhois, getReverseWhois } = require('./queries');
const { getLogger } = require('./logging');

const searchEntities = async (entities, options) => {
  const Logger = getLogger();

  const domainAndIpEntities = getEntitiesOfType(['IPv4', 'domain'], entities);
  const stringEmailCustomEntities = getEntitiesOfType(
    ['email', 'string', 'custom'],
    entities
  );

  Logger.trace(
    { domainAndIpEntities, stringEmailCustomEntities },
    'Sorted Entities for Lookup'
  );

  const [whois, reverseWhois] = await Promise.all([
    getWhois(domainAndIpEntities, options),
    getReverseWhois(stringEmailCustomEntities, options)
  ]);

  return {
    whois,
    reverseWhois
  };
};

const getEntitiesOfType = (types, entities) => {
  return filter((entity) => {
    return get('types', entity).some((type) => {
      return types.includes(type);
    });
  }, entities);
};

module.exports = searchEntities;
