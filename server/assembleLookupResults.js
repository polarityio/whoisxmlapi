const { flow, get, size, find, eq, map, some, sum } = require('lodash/fp');

const assembleLookupResults = (
  entities,
  whois,
  dns,
  dnsWhoisHistory,
  domainAvailability,
  domainSubDomain,
  reverseNs,
  reverseWhois,
  options
) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(
      entity,
      whois,
      dns,
      dnsWhoisHistory,
      domainAvailability,
      domainSubDomain,
      reverseNs,
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

const getResultsForThisEntity = (
  entity,
  whois,
  dns,
  dnsWhoisHistory,
  domainAvailability,
  domainSubDomain,
  reverseNs,
  reverseWhois
) => ({
  whois: getResultForThisEntity(entity, whois),
  dns: getResultForThisEntity(entity, dns),
  dnsWhoisHistory: getResultForThisEntity(entity, dnsWhoisHistory),
  domainAvailability: getResultForThisEntity(entity, domainAvailability),
  domainSubDomain: getResultForThisEntity(entity, domainSubDomain),
  reverseNs: getResultForThisEntity(entity, reverseNs),
  reverseWhois: getResultForThisEntity(entity, reverseWhois)
});

const createSummaryTags = (
  {
    whois,
    dns,
    dnsWhoisHistory,
    domainAvailability,
    domainSubDomain,
    reverseNs,
    reverseWhois
  },
  options
) => {
  return [].concat();
};

const getAggregateFieldCount = (fieldPath, companies) =>
  flow(map(get(fieldPath)), sum)(companies);

module.exports = assembleLookupResults;
