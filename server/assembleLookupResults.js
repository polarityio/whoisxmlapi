const { flow, get, size, find, eq, map, some, sum } = require('lodash/fp');

const assembleLookupResults = (entities, TODO, options) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(entity, TODO, options);

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

const getResultsForThisEntity = (entity, TODO) => {
  return {
    TODO: getResultForThisEntity(entity, TODO)
  };
};

const createSummaryTags = ({ TODO }, options) => {

  return []
    .concat();
};

const getAggregateFieldCount = (fieldPath, companies) =>
  flow(map(get(fieldPath)), sum)(companies);
  
module.exports = assembleLookupResults;
