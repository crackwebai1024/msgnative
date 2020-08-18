export const CONTACTS_CACHE_SCHEMA = `CREATE TABLE contacts_cache (
  id INTEGER primary key AUTOINCREMENT not null,
  email char(255) unique not null,
  display_name char(255),
  data text,
  created_on int,
  last_activity_on int,
  is_msgsafe_user int,
  modified_on int,
  max_ts int,
  state int,
  is_deleted int default 0
)`

export const CONTACTS_CACHE_INDEXES = `
  CREATE INDEX idx_contacts_id ON contacts_cache (id);
  CREATE INDEX idx_contacts_email ON contacts_cache (email);
  CREATE INDEX idx_contacts_display_name ON contacts_cache (display_name);
  CREATE INDEX idx_contacts_last_activity_on ON contacts_cache (last_activity_on);
  CREATE INDEX idx_contacts_is_msgsafe_user ON contacts_cache (is_msgsafe_user);
  CREATE INDEX idx_contacts_modified_on ON contacts_cache (modified_on);
  CREATE INDEX idx_contacts_max_ts ON contacts_cache (max_ts);
  CREATE INDEX idx_contacts_state ON contacts_cache (state);
  CREATE INDEX idx_contacts_is_deleted ON contacts_cache (is_deleted);
`

export const EMAIL_IS_PLATFORM_USER_SCHEMA = `CREATE TABLE email_is_platform_user (
  email char(255) primary key not null,
  is_platform_user int
)`

export const EMAIL_IS_PLATFORM_USER_INDEXES = `
  CREATE INDEX idx_email_is_platform_user_email ON email_is_platform_user (email);
  CREATE INDEX idx_email_is_platform_user ON email_is_platform_user (is_platform_user);
`

export const IDENTITIES_CACHE_SCHEMA = `CREATE TABLE identities_cache (
  id int primary key not null,
  email char(255) unique not null,
  display_name char(255),
  data text not null,
  created_on int,
  last_activity_on int,
  modified_on int,
  max_ts int,
  is_deleted int default 0
)`

export const IDENTITIES_CACHE_INDEXES = `
  CREATE INDEX idx_identities_cache_id ON identities_cache (id);
  CREATE INDEX idx_identities_cache_display_name ON identities_cache (display_name);
  CREATE INDEX idx_identities_cache_email ON identities_cache (email);
  CREATE INDEX idx_identities_cache_last_activity_on ON identities_cache (last_activity_on);
  CREATE INDEX idx_identities_cache_modified_on ON identities_cache (modified_on);
  CREATE INDEX idx_identities_max_ts ON identities_cache (max_ts);
  CREATE INDEX idx_identities_cache_is_deleted ON identities_cache (is_deleted);
`

export const USER_EMAILS_CACHE_SCHEMA = `CREATE TABLE user_emails_cache (
  id int primary key not null,
  email char(255) unique not null,
  display_name char(255),
  data text not null,
  created_on int,
  last_activity_on int,
  is_confirmed int,
  modified_on int,
  max_ts int,
  is_deleted int default 0
)`

export const USER_EMAILS_INDEXES = `
  CREATE INDEX idx_user_emails_cache_id ON user_emails_cache (id);
  CREATE INDEX idx_user_emails_display_name ON user_emails_cache (display_name);
  CREATE INDEX idx_user_emails_cache_email ON user_emails_cache (email);
  CREATE INDEX idx_user_emails_cache_last_activity_on ON user_emails_cache (last_activity_on);
  CREATE INDEX idx_user_emails_cache_is_confirmed ON user_emails_cache (is_confirmed);
  CREATE INDEX idx_user_emails_cache_modified_on ON user_emails_cache (modified_on);
  CREATE INDEX idx_user_emails_max_ts ON user_emails_cache (max_ts);
  CREATE INDEX idx_user_emails_cache_is_deleted ON user_emails_cache (is_deleted);
`

export const MAILBOX_CACHE_SCHEMA = `CREATE TABLE mailbox_cache (
  id int primary key not null,
  msg_from char(255),
  msg_from_displayname char(255),
  msg_to char(255),
  msg_to_displayname char(255),
  msg_subject text,
  msg_length int default 0,
  treatment int,
  is_read int,
  is_archive int,
  is_trash int,
  direction int,
  is_msgsafe_store int,
  data text not null,
  created_on int,
  last_activity_on int,
  modified_on int,
  max_ts int,
  is_deleted int default 0
)`

export const MAILBOX_CACHE_INDEXES = `
  CREATE INDEX idx_mailbox_id ON mailbox_cache (id);
  CREATE INDEX idx_mailbox_msg_from ON mailbox_cache (msg_from);
  CREATE INDEX idx_mailbox_msg_from_displayname ON mailbox_cache (msg_from_displayname);
  CREATE INDEX idx_mailbox_msg_to ON mailbox_cache (msg_to);
  CREATE INDEX idx_mailbox_msg_to_displayname ON mailbox_cache (msg_to_displayname);
  CREATE INDEX idx_mailbox_msg_subject ON mailbox_cache (msg_subject);
  CREATE INDEX idx_mailbox_msg_length ON mailbox_cache (msg_length);
  CREATE INDEX idx_mailbox_treatment ON mailbox_cache (treatment);
  CREATE INDEX idx_mailbox_is_read ON mailbox_cache (is_read);
  CREATE INDEX idx_mailbox_is_archive ON mailbox_cache (is_archive);
  CREATE INDEX idx_mailbox_is_trash ON mailbox_cache (is_trash);
  CREATE INDEX idx_mailbox_direction ON mailbox_cache (direction);
  CREATE INDEX idx_mailbox_is_msgsafe_store ON mailbox_cache (is_msgsafe_store);
  CREATE INDEX idx_mailbox_created_on ON mailbox_cache (created_on);
  CREATE INDEX idx_mailbox_last_activity_on ON mailbox_cache (last_activity_on);
  CREATE INDEX idx_mailbox_modified_on ON mailbox_cache (modified_on);
  CREATE INDEX idx_mailbox_max_ts ON mailbox_cache (max_ts);
  CREATE INDEX idx_mailbox_is_deleted ON mailbox_cache (is_deleted);
`

export const CHAT_ROOM_CACHE_SCHEMA = `CREATE TABLE chat_room_cache (
  room_id char(255) primary key not null,
  member_email char(255) not null,
  last_read_message_id char(255),
  last_delivered_message_id char(255),
  last_restricted_message_id char(255),
  last_message_id char(255),
  created_on int,
  last_activity_on int
)`

export const CHAT_ROOM_MEMBER_CACHE_SCHEMA = `CREATE TABLE chat_room_member_cache (
  room_id char(255) not null,
  contact_id int not null,
  is_joined int not null,
  FOREIGN KEY(room_id) REFERENCES chat_room_cache(room_id)
  FOREIGN KEY(contact_id) REFERENCES contacts_cache(id)
)`

export const CHAT_MESSAGE_CACHE_SCHEMA = `CREATE TABLE chat_message_cache (
  message_id char(255) primary key not null,
  room_id char(255) not null,
  user_from int,
  body text not null,
  created_on int,
  FOREIGN KEY(user_from) REFERENCES contacts_cache(id)
)`

export const CHAT_SYNC_STATISTICS_SCHEMA = `CREATE TABLE chat_sync_statistics (
  room_id char(255) primary key not null,
  oldest_message_id char(255),
  latest_message_id char(255),
  sanity_checked_message_id char(255),
  FOREIGN KEY(room_id) REFERENCES chat_room_cache(room_id),
  FOREIGN KEY(oldest_message_id) REFERENCES chat_message_cache(message_id),
  FOREIGN KEY(latest_message_id) REFERENCES chat_message_cache(message_id),
  FOREIGN KEY(sanity_checked_message_id) REFERENCES chat_message_cache(message_id)
)`

export const CHAT_CACHE_INDEXES = `
  CREATE INDEX idx_chat_room_room_id ON chat_room_cache (room_id);
  CREATE INDEX idx_chat_room_created_on ON chat_room_cache (created_on);
  CREATE INDEX idx_chat_room_last_activity_on ON chat_room_cache (last_activity_on);
  CREATE INDEX  idx_chat_room_last_restricted_message_id ON chat_room_cache (last_restricted_message_id);

  CREATE INDEX idx_chat_room_member_room_id ON chat_room_member_cache (room_id);
  CREATE INDEX idx_chat_room_member_contact_id ON chat_room_member_cache (contact_id);
  CREATE UNIQUE INDEX uniq_idx_chat_room_member_room_id_contact_id ON chat_room_member_cache(room_id, contact_id);

  CREATE INDEX idx_chat_message_message_id ON chat_message_cache (message_id);
  CREATE INDEX idx_chat_message_room_id ON chat_message_cache (room_id);
  CREATE INDEX idx_chat_message_created_on ON chat_message_cache (created_on);
`

export const CALL_HISTORY_CACHE_SCHEMA = `CREATE TABLE call_history_cache (
  call_id char(255) primary key not null,
  user_email char(255) not null,
  contact_user_email char(255) not null,
  contact_user_display_name char(255) not null,
  data text not null,
  is_missed int,
  created_on int,
  modified_on int,
  last_activity_on int,
  max_ts int,
  is_deleted int default 0
)`

export const CALL_HISTORY_CACHE_INDEXES = `
  CREATE INDEX idx_call_history_call_id ON call_history_cache (call_id);
  CREATE INDEX idx_call_history_user_email ON call_history_cache (user_email);
  CREATE INDEX idx_call_history_contact_user_email ON call_history_cache (contact_user_email);
  CREATE INDEX idx_call_history_contact_user_display_name ON call_history_cache (contact_user_display_name);
  CREATE INDEX idx_call_history_is_missed ON call_history_cache (is_missed);
  CREATE INDEX idx_call_history_created_on ON call_history_cache (created_on);
  CREATE INDEX idx_call_history_modified_on ON call_history_cache (modified_on);
  CREATE INDEX idx_call_history_max_ts ON call_history_cache (max_ts);
  CREATE INDEX idx_call_history_last_activity_on ON call_history_cache (last_activity_on);
`

export const SYNC_STATISTICS_SCHEMA = `CREATE TABLE sync_statistics (
  resource char(100) primary key not null,
  last_new_sync_ts  char(50),
  last_old_sync_ts  char(50)
)`

export const KEY_STORAGE_SCHEMA = `CREATE TABLE key_storage (
  key char(100) primary key not null,
  value text,
  updated_on int
)`

export const VERSION_SCHEMA = `CREATE TABLE version (
  version char(50) primary key not null
)`
