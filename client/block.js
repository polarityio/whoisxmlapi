polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  dns: Ember.computed.alias('block.data.details.dns'),
  dnsWhoisHistory: Ember.computed.alias('block.data.details.dnsWhoisHistory'),
  domainAvailability: Ember.computed.alias('block.data.details.domainAvailability'),
  domainSubDomain: Ember.computed.alias('block.data.details.domainSubDomain'),
  displaySubDomains: Ember.computed.alias('block.data.details.displaySubDomains'),
  reverseNs: Ember.computed.alias('block.data.details.reverseNs'),
  displayReverseNs: Ember.computed.alias('block.data.details.displayReverseNs'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  expandableTitleStates: {},
  showCopySuccessCheck: {},
  tabRenderOrder: [
    'whois',
    'reverseWhois',
    'dns',
    'dnsWhoisHistory',
    'domainAvailability',
    'domainSubDomain',
    'reverseNs'
  ],
  displayReverseWhois: [],
  getDefaultActiveTab() {
    const details = this.get('details');
    return this.get('tabRenderOrder').find((tab) => details[tab] && details[tab].length);
  },
  init() {
    if (!this.get('block._state')) {
      this.set('block._state', {});
      this.set(
        'block._state.activeTab',
        this.getDefaultActiveTab() || this.get('tabRenderOrder')[0]
      );
      this.set('block._state.dnsHasBeenObtained', false);
      this.set('block._state.dnsWhoisHistoryHasBeenObtained', false);
      this.set('block._state.domainAvailabilityHasBeenObtained', false);
      this.set('block._state.domainSubDomainHasBeenObtained', false);
      this.set('block._state.reverseNsHasBeenObtained', false);
    }

    const reverseWhois = this.get('details.reverseWhois');
    if (reverseWhois && reverseWhois.length)
      this.set('displayReverseWhois', reverseWhois.slice(0, 20));

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('block._state.activeTab', tabName);
      if (tabName === 'dns' && !this.get('block._state.dnsHasBeenObtained'))
        return this.getDns();
      if (
        tabName === 'dnsWhoisHistory' &&
        !this.get('block._state.dnsWhoisHistoryHasBeenObtained')
      )
        return this.getDnsWhoisHistory();
      if (
        tabName === 'domainAvailability' &&
        !this.get('block._state.domainAvailabilityHasBeenObtained')
      )
        return this.getDomainAvailability();
      if (
        tabName === 'domainSubDomain' &&
        !this.get('block._state.domainSubDomainHasBeenObtained')
      )
        return this.getDomainSubDomain();
      if (tabName === 'reverseNs' && !this.get('block._state.reverseNsHasBeenObtained'))
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

  dnsFailureMessage: '',
  gettingDnsErrorMessage: '',
  getDnsIsRunning: false,

  getDns: function () {
    const outerThis = this;

    this.set('gettingDnsErrorMessage', '');
    this.set('getDnsIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDns',
      data: { entity: this.get('block.entity') }
    })
      .then(({ dns, failureMessage }) => {
        this.set('details.dns', dns);

        this.set('dnsFailureMessage', failureMessage);
        this.set('block._state.dnsHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('block._state.dnsHasBeenObtained', false);
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

  dnsWhoisHistoryFailureMessage: '',
  gettingDnsWhoisHistoryErrorMessage: '',
  getDnsWhoisHistoryIsRunning: false,

  getDnsWhoisHistory: function () {
    const outerThis = this;

    this.set('gettingDnsWhoisHistoryErrorMessage', '');
    this.set('getDnsWhoisHistoryIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDnsWhoisHistory',
      data: { entity: this.get('block.entity') }
    })
      .then(({ dnsWhoisHistory, failureMessage }) => {
        this.set('details.dnsWhoisHistory', dnsWhoisHistory);

        this.set('dnsWhoisHistoryFailureMessage', failureMessage);
        this.set('block._state.dnsWhoisHistoryHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('block._state.dnsWhoisHistoryHasBeenObtained', false);
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

  domainAvailabilityFailureMessage: '',
  gettingDomainAvailabilityErrorMessage: '',
  getDomainAvailabilityIsRunning: false,

  getDomainAvailability: function () {
    const outerThis = this;

    this.set('gettingDomainAvailabilityErrorMessage', '');
    this.set('getDomainAvailabilityIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDomainAvailability',
      data: { entity: this.get('block.entity') }
    })
      .then(({ domainAvailability, failureMessage }) => {
        this.set('details.domainAvailability', domainAvailability);

        this.set('domainAvailabilityFailureMessage', failureMessage);
        this.set('block._state.domainAvailabilityHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('block._state.domainAvailabilityHasBeenObtained', false);
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

  domainSubDomainFailureMessage: '',
  gettingDomainSubDomainErrorMessage: '',
  getDomainSubDomainIsRunning: false,

  getDomainSubDomain: function () {
    const outerThis = this;

    this.set('gettingDomainSubDomainErrorMessage', '');
    this.set('getDomainSubDomainIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getDomainSubDomain',
      data: { entity: this.get('block.entity') }
    })
      .then(({ domainSubDomain, failureMessage }) => {
        this.set('details.domainSubDomain', domainSubDomain);
        this.set('details.displaySubDomains', domainSubDomain.slice(0, 20));

        this.set('domainSubDomainFailureMessage', failureMessage);
        this.set('block._state.domainSubDomainHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('block._state.domainSubDomainHasBeenObtained', false);
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

  reverseNsFailureMessage: '',
  gettingReverseNsErrorMessage: '',
  getReverseNsIsRunning: false,

  getReverseNs: function () {
    const outerThis = this;

    this.set('gettingReverseNsErrorMessage', '');
    this.set('getReverseNsIsRunning', true);

    this.sendIntegrationMessage({
      action: 'getReverseNs',
      data: { entity: this.get('block.entity') }
    })
      .then(({ reverseNs, failureMessage }) => {
        this.set('details.reverseNs', reverseNs);
        this.set('details.displayReverseNs', reverseNs.slice(0, 20));

        this.set('reverseNsFailureMessage', failureMessage);
        this.set('block._state.reverseNsHasBeenObtained', true);
      })
      .catch((err) => {
        this.set('block._state.reverseNsHasBeenObtained', false);
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
