'use strict';
const { validateOptions } = require('./server/userOptions');
const { setLogger, getLogger } = require('./server/logging');

const {
  buildIgnoreResults,
  organizeEntities,
  parseErrorToReadableJson
} = require('./server/dataTransformations');

const searchEntities = require('./server/searchEntities');
const assembleLookupResults = require('./server/assembleLookupResults');
const onMessageFunctions = require('./server/onMessage');

const doLookup = async (entities, options, cb) => {
  const Logger = getLogger();
  try {
    Logger.debug({ entities }, 'Entities');

    // Remove email, string, and custom (all text) entities if reverse whois is disabled
    if (options.enableReserveWhois === false) {
      entities = entities.filter(
        (entity) =>
          !(
            entity.type === 'email' ||
            entity.type === 'string' ||
            (entity.type === 'custom' &&
              entity.isDomain === false &&
              entity.isIP === false)
          )
      );
    }

    const { searchableEntities, nonSearchableEntities } = organizeEntities(entities);

    Logger.trace({ searchableEntities }, 'Searchable Entities');

    const { whois, reverseWhois } = await searchEntities(searchableEntities, options);

    Logger.trace({
      whois,
      reverseWhois
    });

    const lookupResults = assembleLookupResults(entities, whois, reverseWhois, options);

    const ignoreResults = buildIgnoreResults(nonSearchableEntities);

    Logger.trace({ lookupResults, ignoreResults }, 'Lookup Results');
    cb(null, lookupResults.concat(ignoreResults));
  } catch (error) {
    const err = parseErrorToReadableJson(error);

    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

const onMessage = ({ action, data: actionParams }, options, callback) =>
  onMessageFunctions[action](actionParams, options, callback);

module.exports = {
  startup: setLogger,
  validateOptions,
  doLookup,
  onMessage
};
