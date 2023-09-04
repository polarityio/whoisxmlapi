const { flow, last, get, size, find, eq, map, some, getOr } = require('lodash/fp');
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
            summary: createSummaryTags(resultsForThisEntity, entity, options),
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

const createSummaryTags = ({ whois, reverseWhois }, entity, options) => {
  // Results for an entity will either be WHOIS results of ReverseWHOIS results
  if (whois && entity.isDomain) {
    return getWhoisDomainSummaryTags(whois);
  } else if (whois && entity.isIP) {
    return getWhoisIpSummaryTags(whois);
  } else if (reverseWhois) {
    return getReverseWhoisSummaryTags(reverseWhois);
  } else {
    return ['Record Found'];
  }
};

/**
 * IP WHOIS lookups don't contain registrant information but instead contian one or
 * more subrecords.  For the summary tags, we find the most recent subrecord that
 * has organization information and return that.
 *
 * @param whois
 * @returns {*[]}
 */
const getWhoisIpSummaryTags = (whois) => {
  let tags = [];

  // Registrant information is not always located in the same place
  const registrant = getFirstValidPathValue(
    null,
    ['registrant.organization', 'registryData.registrant.organization'],
    whois
  );
  let createdDate;

  if (registrant) {
    tags.push(registrant);
    createdDate = getFirstValidPathValue(
      null,
      ['createdDate', 'registryData.createdDate'],
      whois
    );
  } else {
    const subRecords = getOr([], 'subRecords', whois);
    const record = [...subRecords].reverse().find((record) => {
      return getOr(null, 'registrant.organization', record);
    });

    if (record && record.registrant && record.registrant.organization) {
      tags.push(record.registrant.organization);
    }

    createdDate = getOr(null, 'createdDate', record);
  }

  if (createdDate) {
    const date = DateTime.fromISO(createdDate);
    const humanReadableCreated = date.toLocaleString(DateTime.DATE_SHORT);

    tags.push(`Created: ${humanReadableCreated}`);
  }

  if (tags.length === 0) {
    tags.push('WHOIS Record Found');
  }

  return tags;
};

/**
 * For domain lookups return registrant information along with the created date
 * @param whois
 * @returns {*[]}
 */
const getWhoisDomainSummaryTags = (whois) => {
  let tags = [];

  // Registrant information is not always located in the same place
  const registrant = getFirstValidPathValue(
    null,
    ['registrant.organization', 'registryData.registrant.organization'],
    whois
  );
  const createdDate = getFirstValidPathValue(
    null,
    ['createdDate', 'registryData.createdDate'],
    whois
  );

  if (registrant) {
    tags.push(registrant);
  }

  if (createdDate) {
    const date = DateTime.fromISO(createdDate);
    const humanReadableCreated = date.toLocaleString(DateTime.DATE_SHORT);

    tags.push(`Created: ${humanReadableCreated}`);
  }

  if (tags.length === 0) {
    tags.push('WHOIS Record Found');
  }

  return tags;
};

const getReverseWhoisSummaryTags = (reverseWhois) => {
  let tags = [];
  const reverseWhoisCount = size(reverseWhois);
  if (reverseWhoisCount) {
    tags.push(`Reverse WHOIS: ${reverseWhoisCount}`);
  }
  return tags;
};

const getFirstValidPathValue = (defaultValue, paths, obj) => {
  const firstValidPath = find((path) => {
    const value = get(path, obj);
    return value && size(value);
  }, paths);

  return getOr(defaultValue, firstValidPath, obj);
};

module.exports = assembleLookupResults;
