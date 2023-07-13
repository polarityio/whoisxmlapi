module.exports = {
  name: 'WhoisXMLAPI',
  acronym: 'WXA',
  description: 'The WhoisXMLAPI Polarity Integration allows you to search WHOIS, Reverse WHOIS, DNS, WHOIS DNS History, Domain Purchase Availability, & Reverse NS',
  entityTypes: ['domain', 'string'],
  defaultColor: 'light-blue',
  styles: ['./client/styles.less'],
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
    }
  ]
};
