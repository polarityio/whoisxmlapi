module.exports = {
  name: 'WhoisXMLAPI',
  acronym: 'WXA',
  description:
    'The WhoisXMLAPI Polarity Integration allows you to search WHOIS, Reverse WHOIS, DNS, WHOIS DNS History, Domain Purchase Availability, & Reverse NS',
  entityTypes: ['domain', 'string', 'IPv4', 'email'],
  customTypes: [
    {
      key: 'allText',
      regex: /\S[\s\S]{2,256}\S/
    }
  ],
  defaultColor: 'light-blue',
  styles: ['./client/styles.less'],
  onDemandOnly: true,
  block: {
    component: {
      file: './client/block.js'
    },
    template: {
      file: './client/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'A Company API Key associated with your WhoisXMLAPI Instance',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'enableReserveWhois',
      name: 'Enable Reverse WHOIS Lookups',
      description:
        'If checked, the integration will perform Reverse WHOIS lookups on emails, annotated entities, and "all text" if those Data Types are enabled.  Configure which Data Types are enabled for Reverse WHOIS searches via the Data Types page.',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
