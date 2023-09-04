const { get, flow, map, split, reverse, drop, size, join, take } = require('lodash/fp');
const { getLogger } = require('../logging');
const { requestWithDefaults } = require('../request');
const { parseErrorToReadableJson } = require('../dataTransformations');

const getDomainSubDomain = async ({ entity }, options, callback) => {
  const Logger = getLogger();
  try {
    const domainSubDomainResponse = await requestWithDefaults({
      method: 'POST',
      site: 'domainSubDomain',
      body: {
        domains: { include: [getRootDomain(entity.value)] },
        subdomains: { include: getSubDomainIncludes(entity.value) }
      },
      options
    });

    const errorMessage = get('body.ErrorMessage.msg', domainSubDomainResponse);
    if (errorMessage) return callback(null, { failMessage: errorMessage });

    const domainSubDomain = get('body.domainsList', domainSubDomainResponse);
    Logger.trace({ domainSubDomain }, 'SubDomain Lookup Successful');

    callback(null, { domainSubDomain });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed SubDomain Lookup',
        options,
        formattedError: err
      },
      'SubDomain Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'SubDomain Lookup Failed'
        }
      ]
    });
  }
};

const getSubDomainIncludes = flow(split('.'), reverse, drop(2), reverse, (subdomains) =>
  size(subdomains) ? map((subdomain) => subdomain + '*', subdomains) : ['*']
);

const getRootDomain = flow(split('.'), reverse, take(2), reverse, join('.'));

module.exports = getDomainSubDomain;
