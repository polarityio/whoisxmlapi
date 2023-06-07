polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  getCompanyInsightsErrorMessage: Ember.computed.alias(
    'block._state.getCompanyInsightsErrorMessage'
  ),
  init: function () {
    if (!this.get('block._state')) {
      this.set('block._state', {});
      this.set('block._state.getCompanyInsightsErrorMessage', {});
    }
    this._super(...arguments);
  },
  actions: {
  }
});
