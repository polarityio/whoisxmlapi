const getWhois = require('./getWhois');
const getDns = require('./getDns');
const getDnsWhoisHistory = require('./getDnsWhoisHistory');
const getDomainAvailability = require('./getDomainAvailability');
const getDomainSubDomain = require('./getDomainSubDomain');
const getReverseNs = require('./getReverseNs');
const getReverseWhois = require('./getReverseWhois');

module.exports = {
  getWhois,
  getDns,
  getDnsWhoisHistory,
  getDomainAvailability,
  getDomainSubDomain,
  getReverseNs,
  getReverseWhois
};
