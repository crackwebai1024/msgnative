import { defineMessages } from 'react-intl'

const ns = 'app.Zones'
const m = defineMessages({
  recordSets: {
    id: `${ns}.record-sets`,
    defaultMessage: 'Record sets'
  },

  recordName: {
    id: `${ns}.record-name`,
    defaultMessage: 'Name'
  },

  recordType: {
    id: `${ns}.record-type`,
    defaultMessage: 'Type'
  },

  recordTtl: {
    id: `${ns}.record-ttl`,
    defaultMessage: 'TTL'
  },

  recordContent: {
    id: `${ns}.record-content`,
    defaultMessage: 'Content'
  },

  recordPriority: {
    id: `${ns}.record-priority`,
    defaultMessage: 'Priority'
  },

  addNew: {
    id: `${ns}.add-new`,
    defaultMessage: 'Add New Record'
  },

  createRecord: {
    id: `${ns}.create-new`,
    defaultMessage: 'Create Record'
  },

  updateRecord: {
    id: `${ns}.update-record`,
    defaultMessage: 'Update Record'
  },

  recordCreated: {
    id: `${ns}.record-created`,
    defaultMessage: 'DNS Record created'
  },

  recordDeleted: {
    id: `${ns}.record-deleted`,
    defaultMessage: 'DNS Record deleted'
  },

  recordUpdated: {
    id: `${ns}.record-updated`,
    defaultMessage: 'DNS Record updated'
  },

  // validation
  mustBeIPv4: {
    id: `${ns}.must-be-ip-v4`,
    defaultMessage: 'Should be {ipv4}. E.g. 12.34.56.789'
  },

  mustBeIPv6: {
    id: `${ns}.must-be-ip-v6`,
    defaultMessage: 'Should be {ipv6}. E.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334'
  },

  identicalRecord: {
    id: `${ns}.identical-record`,
    defaultMessage: 'There is already a record identical to this one.'
  },

  uniqueCname: {
    id: `${ns}.unique-cname`,
    defaultMessage: 'The {cname} record with this name already exists.'
  },

  topLevelSpfTxtRestricted: {
    id: `${ns}.top-level-spf-txt-restricted`,
    defaultMessage: '{spfTxt} record for top-level domains are not allowed.'
  },

  topLevelMxRestricted: {
    id: `${ns}.top-level-mx-restricted`,
    defaultMessage: '{mx} record for top-level domains are not allowed.'
  }
})

export default m
