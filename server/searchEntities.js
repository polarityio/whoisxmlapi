const { get, eq, filter, flow } = require('lodash/fp');
const { getWhois, getReverseWhois } = require('./queries');

const searchEntities = async (entities, options) => {
  const domainEntities = getEntitiesOfType('domain', entities);
  const stringEntities = getEntitiesOfType('string', entities);

  const [whois, reverseWhois] = await Promise.all([
    getWhois(domainEntities, options),
    getReverseWhois(stringEntities, options)
  ]);

  return {
    whois,
    reverseWhois
  };
};

const getEntitiesOfType = (type, entities) =>
  filter(flow(get('type'), eq(type)), entities);

module.exports = searchEntities;
