const authenticateRequest = ({ site, url, options, ...requestOptions }) => ({
  ...requestOptions,
  url: url || URLS_BY_SITE[site],
  ...(requestOptions.method === 'POST'
    ? {
        headers: { 'Content-Type': 'application/json' },
        body: {
          ...requestOptions.body,
          apiKey: options.apiKey
        }
      }
    : {
        qs: {
          ...requestOptions.qs,
          apiKey: options.apiKey
        }
      })
});

const URLS_BY_SITE = {
  whois: 'https://www.whoisxmlapi.com/whoisserver/WhoisService',
  domainSubDomain: 'https://domains-subdomains-discovery.whoisxmlapi.com/api/v1',
  domainAvailability: 'https://domain-availability.whoisxmlapi.com/api/v1',
  dns: 'https://www.whoisxmlapi.com/whoisserver/DNSService',
  reverseNs: 'https://reverse-ns.whoisxmlapi.com/api/v1',
  reverseWhois: 'https://reverse-whois.whoisxmlapi.com/api/v2',
  dnsWhoisHistory: 'https://whois-history.whoisxmlapi.com/api/v1'
};

module.exports = authenticateRequest;