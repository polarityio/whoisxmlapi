const { flow, get, size, find, eq, map, some, getOr } = require('lodash/fp');
const { DateTime } = require('luxon');
const { getLogger } = require('./logging');

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
  let tags = [];

  const registrant = getOr(null, 'registrant.organization', whois);
  const createdDate = getOr(null, 'createdDate', whois);
  const reverseWhoisCount = size(reverseWhois);

  if (registrant) {
    tags.push(registrant);
  }

  if (createdDate) {
    const date = DateTime.fromISO(createdDate);
    const humanReadableCreated = date.toLocaleString(DateTime.DATE_SHORT);

    tags.push(`Created: ${humanReadableCreated}`);
  }

  if (reverseWhoisCount) {
    tags.push(`Reverse WHOIS: (${reverseWhoisCount})`);
  }

  return tags;
};

module.exports = assembleLookupResults;
