polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  activeTab: '',
  expandableTitleStates: {},
  showCopySuccessCheck: {},
  displayTabNames: {
    whois: 'WHOIS',
    reverseWhois: 'Reverse WHOIS',
    dns: 'DNS Lookup',
    dnsWhoisHistory: 'WHOIS History',
    domainAvailability: 'Domain Availability',
    domainSubDomain: 'Subdomain Discovery',
    reverseNs: 'Reverse NS'
  },
  tabRenderOrder: [
    'whois',
    'reverseWhois',
    'dns',
    'dnsWhoisHistory',
    'domainAvailability',
    'domainSubDomain',
    'reverseNs'
  ],
  getDefaultActiveTab() {
    const details = this.get('details');
    return this.get('tabRenderOrder').find((tab) => details[tab] && details[tab].length);
  },

  displayReverseWhois: [],
  init() {
    this.set('activeTab', this.getDefaultActiveTab() || this.get('tabRenderOrder')[0]);

    const reverseWhois = this.get('details.reverseWhois');
    if (reverseWhois && reverseWhois.length)
      this.set('displayReverseWhois', reverseWhois.slice(0, 20));

    this._super(...arguments);
  },

  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
      if (tabName === 'dns' && !this.get('dnsHasBeenObtained')) return this.getDns();
      if (tabName === 'dnsWhoisHistory' && !this.get('dnsWhoisHistoryHasBeenObtained'))
        return this.getDnsWhoisHistory();
      if (
        tabName === 'domainAvailability' &&
        !this.get('domainAvailabilityHasBeenObtained')
      )
        return this.getDomainAvailability();
      if (tabName === 'domainSubDomain' && !this.get('domainSubDomainHasBeenObtained'))
        return this.getDomainSubDomain();
      if (tabName === 'reverseNs' && !this.get('reverseNsHasBeenObtained'))
        return this.getReverseNs();
    },
    toggleExpandableTitle: function () {
      const titleKey = Array.from(arguments).slice(0, -1).join('');

      this.set(
        `expandableTitleStates`,
        Object.assign({}, this.get('expandableTitleStates'), {
          [titleKey]: !this.get('expandableTitleStates')[titleKey]
        })
      );

      this.get('block').notifyPropertyChange('data');
    },
    loadMoreDisplayItems: function (displayItemName, itemName) {
      const displayItems = this.get(displayItemName);
      this.set(
        displayItemName,
        displayItems.concat(
          this.get(itemName).slice(displayItems.length, displayItems.length + 20)
        )
      );

      this.get('block').notifyPropertyChange('data');
    },
    copyData: function (element) {
      const text =
        typeof element === 'string'
          ? document.getElementById(element).innerText
          : element.innerText;

      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.set(`showCopySuccessCheck.${element}`, true);
        })
        .catch((err) => {
          console.log('Error in copying text: ', err);
        })
        .finally(() => {
          setTimeout(() => {
            this.set(`showCopySuccessCheck.${element}`, false);
          }, 2000);
        });
    }
  },

  dns: {},
  dnsFailureMessage: '',
  gettingDnsErrorMessage: '',
  getDnsIsRunning: false,
  dnsHasBeenObtained: false,

  getDns: function () {
    const outerThis = this;

    this.set('gettingDnsErrorMessage', '');
    this.set('getDnsIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDns',
      data: { entity: this.get('block.entity') }
    })
      .then(({ dns, failureMessage }) => {
        this.set('dns', dns);

        this.set('dnsFailureMessage', failureMessage);
        this.set('dnsHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('dnsHasBeenObtained', false);
        outerThis.set(
          'gettingDnsErrorMessage',
          `Failed to Get Dns: ${
            (err &&
              (err.detail || err.message || err.err || err.title || err.description)) ||
            'Unknown Reason'
          }`
        );
      })
      .finally(() => {
        this.set('getDnsIsRunning', false);
        outerThis.get('block').notifyPropertyChange('data');
      });
  },

  dnsWhoisHistory: [],
  dnsWhoisHistoryFailureMessage: '',
  gettingDnsWhoisHistoryErrorMessage: '',
  getDnsWhoisHistoryIsRunning: false,
  dnsWhoisHistoryHasBeenObtained: false,

  getDnsWhoisHistory: function () {
    const outerThis = this;

    this.set('gettingDnsWhoisHistoryErrorMessage', '');
    this.set('getDnsWhoisHistoryIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDnsWhoisHistory',
      data: { entity: this.get('block.entity') }
    })
      .then(({ dnsWhoisHistory, failureMessage }) => {
        this.set('dnsWhoisHistory', dnsWhoisHistory);

        this.set('dnsWhoisHistoryFailureMessage', failureMessage);
        this.set('dnsWhoisHistoryHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('dnsWhoisHistoryHasBeenObtained', false);
        outerThis.set(
          'gettingDnsWhoisHistoryErrorMessage',
          `Failed to Get DNS WHOIS History: ${
            (err &&
              (err.detail || err.message || err.err || err.title || err.description)) ||
            'Unknown Reason'
          }`
        );
      })
      .finally(() => {
        this.set('getDnsWhoisHistoryIsRunning', false);
        outerThis.get('block').notifyPropertyChange('data');
      });
  },

  domainAvailability: [],
  domainAvailabilityFailureMessage: '',
  gettingDomainAvailabilityErrorMessage: '',
  getDomainAvailabilityIsRunning: false,
  domainAvailabilityHasBeenObtained: false,

  getDomainAvailability: function () {
    const outerThis = this;

    this.set('gettingDomainAvailabilityErrorMessage', '');
    this.set('getDomainAvailabilityIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDomainAvailability',
      data: { entity: this.get('block.entity') }
    })
      .then(({ domainAvailability, failureMessage }) => {
        this.set('domainAvailability', domainAvailability);

        this.set('domainAvailabilityFailureMessage', failureMessage);
        this.set('domainAvailabilityHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('domainAvailabilityHasBeenObtained', false);
        outerThis.set(
          'gettingDomainAvailabilityErrorMessage',
          `Failed to Get SubDomains: ${
            (err &&
              (err.detail || err.message || err.err || err.title || err.description)) ||
            'Unknown Reason'
          }`
        );
      })
      .finally(() => {
        this.set('getDomainAvailabilityIsRunning', false);
        outerThis.get('block').notifyPropertyChange('data');
      });
  },

  domainSubDomain: [],
  displaySubDomains: [],
  domainSubDomainFailureMessage: '',
  gettingDomainSubDomainErrorMessage: '',
  getDomainSubDomainIsRunning: false,
  domainSubDomainHasBeenObtained: false,

  getDomainSubDomain: function () {
    const outerThis = this;

    this.set('gettingDomainSubDomainErrorMessage', '');
    this.set('getDomainSubDomainIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDomainSubDomain',
      data: { entity: this.get('block.entity') }
    })
      .then(({ domainSubDomain, failureMessage }) => {
        this.set('domainSubDomain', domainSubDomain);
        this.set('displaySubDomains', domainSubDomain.slice(0, 20));

        this.set('domainSubDomainFailureMessage', failureMessage);
        this.set('domainSubDomainHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('domainSubDomainHasBeenObtained', false);
        outerThis.set(
          'gettingDomainSubDomainErrorMessage',
          `Failed to Get SubDomains: ${
            (err &&
              (err.detail || err.message || err.err || err.title || err.description)) ||
            'Unknown Reason'
          }`
        );
      })
      .finally(() => {
        this.set('getDomainSubDomainIsRunning', false);
        outerThis.get('block').notifyPropertyChange('data');
      });
  },

  reverseNs: [],
  displayReverseNs: [],
  reverseNsFailureMessage: '',
  gettingReverseNsErrorMessage: '',
  getReverseNsIsRunning: false,
  reverseNsHasBeenObtained: false,

  getReverseNs: function () {
    const outerThis = this;

    this.set('gettingReverseNsErrorMessage', '');
    this.set('getReverseNsIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getReverseNs',
      data: { entity: this.get('block.entity') }
    })
      .then(({ reverseNs, failureMessage }) => {
        this.set('reverseNs', reverseNs);
        this.set('displayReverseNs', reverseNs.slice(0, 20));

        this.set('reverseNsFailureMessage', failureMessage);
        this.set('reverseNsHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('reverseNsHasBeenObtained', false);
        outerThis.set(
          'gettingReverseNsErrorMessage',
          `Failed to Get Reverse NS: ${
            (err &&
              (err.detail || err.message || err.err || err.title || err.description)) ||
            'Unknown Reason'
          }`
        );
      })
      .finally(() => {
        this.set('getReverseNsIsRunning', false);
        outerThis.get('block').notifyPropertyChange('data');
      });
  }
});
