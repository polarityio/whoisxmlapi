const { __, includes, get, eq, filter, flow } = require('lodash/fp');
const { getWhois, getReverseWhois } = require('./queries');
const { getLogger } = require('./logging');

const searchEntities = async (entities, options) => {
  const Logger = getLogger();

  const domainAndIpEntities = getEntitiesOfType(['IPv4', 'domain'], entities);
  const stringEmailCustomEntities = getReverseWhoisLookupEntities(entities);

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

const getWhoisLookupEntities = (entities) => {};

/**
 * Reverse WHOIS lookups should be run for entities of type email, string and custom (all text).
 * However, since `string` and `custom` can also match domains and IPs, we need to ensure we're
 * only returning entities that are `string` and `custom` but not `domain` or `IPv4`.
 * @param entities
 */
const getReverseWhoisLookupEntities = (entities) => {
  return filter((entity) => {
    return (
      (entity.type === 'custom' || entity.isEmail || entity.type === 'string') &&
      !entity.isDomain &&
      !entity.isIP
    );
  }, entities);
};

module.exports = searchEntities;
