const { flow, get, size, find, eq, map, some, getOr } = require('lodash/fp');

const assembleLookupResults = (entities, whois, reverseWhois, options) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(
      entity,
      whois,
      reverseWhois,
      options
    );

    const resultsFound = some(size, resultsForThisEntity);

    const lookupResult = {
      entity,
      data: resultsFound
        ? {
            summary: createSummaryTags(resultsForThisEntity, options),
            details: resultsForThisEntity
          }
        : null
    };

    return lookupResult;
  }, entities);

const getResultForThisEntity = (entity, results) =>
  flow(find(flow(get('entity.value'), eq(entity.value))), get('result'))(results);

const getResultsForThisEntity = (entity, whois, reverseWhois) => {
  return {
    whois: getResultForThisEntity(entity, whois),
    reverseWhois: getResultForThisEntity(entity, reverseWhois)
  };
};

const createSummaryTags = ({ whois, reverseWhois }, options) => {
  const reverseWhoisCount = size(reverseWhois);
  const whoisStatus = getOr('', 'status', whois);
  const whoisStatusTrimmed = `${whoisStatus.slice(0, 40)}${
    whoisStatus.length > 40 ? '...' : ''
  }`;
  return []
    .concat(whoisStatus ? whoisStatusTrimmed : [])
    .concat(reverseWhoisCount ? `Reverse WHOIS (${reverseWhoisCount})` : []);
};

module.exports = assembleLookupResults;
