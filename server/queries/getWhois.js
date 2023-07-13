const {
  flow,
  get,
  map,
  keys,
  filter,
  includes,
  groupBy,
  replace,
  values,
  toLower,
  negate
} = require('lodash/fp');
const { requestsInParallel } = require('../request');

const getWhois = async (domainEntities, options) => {
  const whoisRequests = map(
    (entity) => ({
      entity,
      site: 'whois',
      qs: {
        domainName: entity.value,
        outputFormat: 'JSON',
        ip: 1,
        ipWhois: 1,
        checkProxyData: 1,
      },
      options
    }),
    domainEntities
  );

  const whoisResponses = await requestsInParallel(whoisRequests, 'body.WhoisRecord');

  const whoIsWithoutDataErrors = filter(negate(get('dataError')), whoisResponses);

  const whoisWithFormattedCustomFields = map(
    getWhoisWithFormattedCustomFields,
    whoIsWithoutDataErrors
  );

  return whoisWithFormattedCustomFields;
};

/**
 * WHOIS is an object response, and can contain fields like:
 *  "customField1Name": "RegistrarContactEmail",
 *  "customField1Value": "abusecomplaints@markmonitor.com",
 *
 * This function parses out all of the custom fields into a field:
 * customFields: [
 *   {
 *     name: "RegistrarContactEmail",
 *     value: "abusecomplaints@markmonitor.com"
 *   },
 *   ...
 * ]
 *
 * This allows for rendering these fields in the UI
 */
const getWhoisWithFormattedCustomFields = ({ entity, result: whois }) => {
  const whoisWithCustomFields = flow(
    keys,
    filter(includes('customField')),
    groupBy(replace(/customField|Name|Value/g, '')),
    values,
    map(([key1, key2]) => ({
      [replace(/customfield|\d/gi, '', toLower(key1))]: get(key1, whois),
      [replace(/customfield|\d/gi, '', toLower(key2))]: get(key2, whois)
    })),
    (customFields) => ({ ...whois, customFields })
  )(whois);

  return { entity, result: whoisWithCustomFields };
};

module.exports = getWhois;
