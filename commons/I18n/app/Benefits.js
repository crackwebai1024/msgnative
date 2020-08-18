import { defineMessages } from 'react-intl'

const ns = 'app.Benefits'
const m = defineMessages({
  benefitsPlural: {
    id: `${ns}.benefits`,
    defaultMessage: 'Benefits'
  },
  tocTitle: {
    id: `${ns}.toc-title`,
    defaultMessage: 'Table of Contents'
  },

  seoTitle: {
    id: `${ns}.seo-title`,
    defaultMessage: 'Benefits of using secure encrypted email | MsgSafe.io'
  },
  seoDescription: {
    id: `${ns}.seo-description`,
    defaultMessage: 'Benefits of using MsgSafe.io. Email that protects your identity and communications with SSL, end to end encryption, anonymous sending and more.'
  },
  seoKeywords: {
    id: `${ns}.seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  title: {
    id: `${ns}.title`,
    defaultMessage: 'Use MsgSafe.io to Secure Your Privacy Online'
  },
  learnMore: {
    id: `${ns}.learn-more`,
    defaultMessage: 'Learn more'
  },
  p1Body1: {
    id: `${ns}.p1-body-1`,
    defaultMessage: 'MsgSafe.io utilizes Transport Layer Security to protect the connection between you and our service.'
  },
  p1Body2: {
    id: `${ns}.p1-body-2`,
    defaultMessage: 'about MsgSafe’s Secure Internet Transactions.'
  },
  p2Body1: {
    id: `${ns}.p2-body-1`,
    defaultMessage: 'By using our service, we immediately begin to protect your identity online, by providing as many email addresses as you need to create. You can use our webmail or take advantage of our advanced forwarding features.'
  },
  p2Body2: {
    id: `${ns}.p2-body-2`,
    defaultMessage: 'about how you can take control of the email you receive or block — make it difficult for others to track you down, market to you, share your address or steal your identity!'
  },
  p3Body1: {
    id: `${ns}.p3-body-1`,
    defaultMessage: 'We reduce (and in some cases eliminate) the way people learn more about you from the metadata hidden in your email. Did you know smart marketing companies and enterprises insert tracking images and scan your email to learn more about you?'
  },
  p3Body2: {
    id: `${ns}.p3-body-2`,
    defaultMessage: 'about how we minimize or eliminate these tricks by removing or blocking this unnecessary information.'
  },
  p4Body1: {
    id: `${ns}.p4-body-1`,
    defaultMessage: 'MsgSafe.io can be your mailbox, or we can hide your real email account — whether you want to use our service exclusively or you’re using us alongside Gmail, Mail.ru, Yahoo Mail , Protonmail or any other service provider (or private server).'
  },
  p4Body2: {
    id: `${ns}.p4-body-2`,
    defaultMessage: 'how we can improve your privacy and the managability of your email.'
  },
  p5Body1: {
    id: `${ns}.p5-body-1`,
    defaultMessage: 'Our solution works with your existing providers and doesn’t require you install additional software or understand complicated encryption technologies.'
  },
  p5Body2: {
    id: `${ns}.p5-body-2`,
    defaultMessage: 'how we can make email security/privacy easier for you to do.'
  },
  p6Body1: {
    id: `${ns}.p6-body-1`,
    defaultMessage: 'Protecting communications from interception requires a multi-pronged approach.'
  },
  p6Body2: {
    id: `${ns}.p6-body-2`,
    defaultMessage: 'how we protect the transmision, source of origin, and other various aspects of “sending” and “receiving” your communications.'
  },
  p7Body1: {
    id: `${ns}.p7-body-1`,
    defaultMessage: 'To protect yourself completely, you’ll want to take full advantage of encryption at every intersection of your communication.'
  },
  p7Body2: {
    id: `${ns}.p7-body-2`,
    defaultMessage: 'about our full support of end-to-end email encryption.'
  },
  p8Body1: {
    id: `${ns}.p8-body-1`,
    defaultMessage: 'MsgSafe.io doesn’t just protect the email you send and receive!'
  },
  p8Body2: {
    id: `${ns}.p8-body-2`,
    defaultMessage: 'about how we analyze your incoming email, including the geographical path it took to get to your mailbox or forwarded address.'
  },

  tlsSeoTitle: {
    id: `${ns}.tls-seo-title`,
    defaultMessage: 'Secure Internet Transactions With MsgSafe.io'
  },
  tlsSeoDescription: {
    id: `${ns}.tls-seo-description`,
    defaultMessage: 'The most commonly used protocol for web security is TLS (Transport Layer Security).  This technology is commonly referred to as SSL (Secure Sockets Layer), the predecessor to TLS.  In addition to providing security for web browser transactions, TLS works with other TCP/IP standards including SMTP.   TLS encrypts the data that you send, and incorporates a mechanism for detecting any alteration in transit, so that eavesdropping on or tampering with the data is almost impossible.'
  },
  tlsSeoKeywords: {
    id: `${ns}.tls-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  tslTitle: {
    id: `${ns}.tsl-title`,
    defaultMessage: 'Secure Internet Transactions With MsgSafe.io'
  },
  tslSmallTitle: {
    id: `${ns}.tsl-small-title`,
    defaultMessage: 'Secure transaction'
  },
  tslp1Body: {
    id: `${ns}.tslp1-body`,
    defaultMessage: 'The most commonly used protocol for web security is TLS (Transport Layer Security).  This technology is commonly referred to as SSL (Secure Sockets Layer), the predecessor to TLS.  In addition to providing security for web browser transactions, TLS works with other TCP/IP standards including SMTP.   TLS encrypts the data that you send, and incorporates a mechanism for detecting any alteration in transit, so that eavesdropping on or tampering with the data is almost impossible.'
  },
  tslp2Body: {
    id: `${ns}.tslp2-body`,
    defaultMessage: 'To deliver our websites and client application to your browser and/or device as quickly as possible, we leverage a CDN (Content Delivery Network).  The SSL certificate used by the CDN was issued by GlobalSign, however, our client is designed to only communicate with our back-end systems in Curaçao.  Our client will never send or receive your private transactional data through 3rd party services.  We have implemented additional protective measures to guarantee the client has not been compromised.'
  },
  tslp3Body: {
    id: `${ns}.tslp3-body`,
    defaultMessage: "Our parent company, TrustCor Systems S. de R.L., has been building it’s CA (Certificate Authority), an entity that issues digital certificates for TLS that has been certified by WebTrust since 2014.  MsgSafe.io's services and global infrastructure leverage TrustCor’s CA whenever possible.  In addition to TLS, we use only strong ciphers and both implicit and explicit methods for establishing encrypted connections and encrypting data at rest.  For example, some examples of Industry standard cryptographic technologies we use include AES, PGP, S/MIME and NaCl."
  },
  tslp4Body: {
    id: `${ns}.tslp4-body`,
    defaultMessage: 'To allow users to verify their connections, we provide fingerprints and Pin SHA-256 for our website and application public keys.'
  },

  s1SeoTitle: {
    id: `${ns}.s1-seo-title`,
    defaultMessage: 'Protecting your email address'
  },
  s1SeoDescription: {
    id: `${ns}.s1-seo-description`,
    defaultMessage: 'MsgSafe.io immediately protects your identity online, by providing as many email addresses as you need to create. This allows you to stop giving out your private email addresses and keep them private. When you start using your MsgSafe.io email addresses, you can take advantage of advanced features, like encryption and forwarding, or simply control the email you receive or block — making it difficult for others to track you down, market to you or steal your identity.'
  },
  s1SeoKeywords: {
    id: `${ns}.s1-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s1Title: {
    id: `${ns}.s1-title`,
    defaultMessage: 'Protecting your email address'
  },
  s1SmallTitle: {
    id: `${ns}.s1-small-title`,
    defaultMessage: 'Protecting your email address'
  },
  s1p1Body: {
    id: `${ns}.s1p1-body`,
    defaultMessage: 'MsgSafe.io immediately protects your identity online, by providing as many email addresses as you need to create. This allows you to stop giving out your private email addresses and keep them private. When you start using your MsgSafe.io email addresses, you can take advantage of advanced features, like encryption and forwarding, or simply control the email you receive or block — making it difficult for others to track you down, market to you or steal your identity.'
  },
  s1p2Body: {
    id: `${ns}.s1p2-body`,
    defaultMessage: 'Our Free Plan is packed with features that will help you manage and protect your privacy, free of charge, but we hope you’ll also explore our reasonably-priced enhancements once you have experience with our service. With MsgSafe.io you can:'
  },
  s1p2Bullet1: {
    id: `${ns}.s1p2-bullet1`,
    defaultMessage: 'Create a different email address for each online site or store you visit. If a website is hacked and their database is stolen, or if they misbehave and sell your information to a third party, it won’t be long before you\'re spammed or phished — with MsgSafe.io, you can see the email address leak and turn it off in seconds. For example, on a trip to a real-world store you might sign up for an account using "tom96@privyonline.com", and when you sign up for a new online service maybe you\'ll pick "facebook.tom96@offtherecordmail.com" — we have many domain names to choose from, or you can use your own.'
  },
  s1p2Bullet2: {
    id: `${ns}.s1p2-bullet2`,
    defaultMessage: 'If you connect your own domain or purchase one thru MsgSafe.io, you can give people a unique email address and we’ll automatically activate it for you when it receives mail. In fact, there is no reason to give anyone your private email address any more! Before MsgSafe.io, the convenience of a lifetime vanity email address could be ruined by any merchant who sells your email address or experiences data theft. With MsgSafe.io, you can use your own domain and create hundreds of virtual email addresses to protect yourself or your whole organization, while still benefiting from using your own domain name.'
  },
  s1p2Bullet3: {
    id: `${ns}.s1p2-bullet3`,
    defaultMessage: 'Detect even the most convincing phishing attempts. If you use MsgSafe.io and you\'ve given your bank an email address like "mybank.tomas1996@privyonline.com", and then you receive email that looks like it\'s from the bank but uses the wrong virtual email address or your real address, you know instantly it\'s fake and you\'re protected.'
  },
  s1p3Body: {
    id: `${ns}.s1p3-body`,
    defaultMessage: 'We have an increasing variety of anonymizing domain names like @msgsafe.io that you can use to generate new email addresses.  If you have your own domain name like "@thesmithfamily.com", we\'ll help you manage a group and make it easy for you to allow the members your group to also create addresses using the same custom domain, without losing any privacy features or transferring large lists of email aliases later. You can use our webmail, your own email server, or Gmail, Yahoo Mail, Outlook to store and manage your mail — and if later you decide to change where the mail goes, you can do that too!'
  },
  s1p4Body: {
    id: `${ns}.s1p4-body`,
    defaultMessage: 'Using our Forwarding feature, you can continue to use the software applications and providers you currently use for email: no configuration changes are needed.  With Forwarding, you can also enhance your privacy experience by uploading your email encryption keys and have us use them for all of the mail we forward.  We support both popular standards — GPG and S/MIME.'
  },

  s2SeoTitle: {
    id: `${ns}.s2-seo-title`,
    defaultMessage: 'No leaking metadata'
  },
  s2SeoDescription: {
    id: `${ns}.s2-seo-description`,
    defaultMessage: 'MsgSafe.io reduces (or eliminates) the way people learn more about you using email metadata hidden in your messages.'
  },
  s2SeoKeywords: {
    id: `${ns}.s2-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s2Title: {
    id: `${ns}.s2-title`,
    defaultMessage: 'No leaking metadata'
  },
  s2SmallTitle: {
    id: `${ns}.s2-small-title`,
    defaultMessage: 'No leaking metadata'
  },
  s2p1Body: {
    id: `${ns}.s2p1-body`,
    defaultMessage: 'MsgSafe.io reduces (or eliminates) the way people learn more about you using email metadata hidden in your messages.'
  },
  s2p2Body: {
    id: `${ns}.s2p2-body`,
    defaultMessage: 'Did you know smart marketing companies and enterprises insert tracking images and scan your email to extract metadata to try to learn more about you? When you\'re not using MsgSafe.io, they can learn the languages you speak, the type of computer you have, the email software you use, what cell phone you have, your email service provider (where your email is actually stored or originates from) and sometimes even your current physical location or which cellular telephone tower you’re connected-to? How? By looking at the technical "header information" transmitted inside your email. Some companies even use this information to tell whether you\'re at home, at work, or on vacation (and where on vacation) by recording this information every time you send email.'
  },
  s2p3Body: {
    id: `${ns}.s2p3-body`,
    defaultMessage: 'Metadata risk isn\'t exclusive to messages you send — the messages you receive may also include dangerous metadata. Some marketing companies embed tracking technologies in the emails they send to you, and MsgSafe.io does whatever it can to reduce or remove these materials.  For the ultra-paranoid, we will even convert rich text and HTML to readable text and URLs.'
  },
  s2p4Body: {
    id: `${ns}.s2p4-body`,
    defaultMessage: 'MsgSafe.io knows all these tricks, and we minimize or eliminate them completely by removing or modifying this unnecessary information and tracking technologies to protect your privacy, your identity, your location and other details about you.'
  },

  s3SeoTitle: {
    id: `${ns}.s3-seo-title`,
    defaultMessage: 'Protecting your real email address'
  },
  s3SeoDescription: {
    id: `${ns}.s3-seo-description`,
    defaultMessage: 'MsgSafe.io hides your real email account so nobody knows which account to hack or subpoena to get your email contents.'
  },
  s3SeoKeywords: {
    id: `${ns}.s3-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s3Title: {
    id: `${ns}.s3-title`,
    defaultMessage: 'Protecting your real email address'
  },
  s3SmallTitle: {
    id: `${ns}.s3-small-title`,
    defaultMessage: 'Your real email address'
  },
  s3p1Body: {
    id: `${ns}.s3p1-body`,
    defaultMessage: 'MsgSafe.io hides your real email account so nobody knows which account to hack or subpoena to get your email contents.'
  },
  s3p2Body: {
    id: `${ns}.s3p2-body`,
    defaultMessage: 'When you use MsgSafe.io, nobody can tell you\'re really storing and managing your email somewhere else — whether you\'re using Gmail, Mail.ru, Yahoo Mail or any other service provider (or your own servers). This makes it difficult for them to send subpoenas or use other legal or illegal leverage to target your email service provider to access your email.'
  },
  s3p3Body: {
    id: `${ns}.s3p3-body`,
    defaultMessage: 'MsgSafe.io is operated in legal jurisdictions where it\'s difficult or impossible for us to reveal anything regarding your privacy. Our technical operations are based in Curaçao — one of the most secure, privacy oriented jurisdictions in the world. Traditional safe havens such as Switzerland and Luxembourg don\'t even come close to the privacy protection offered by Curaçao\'s strict privacy laws.'
  },
  s3p4Body: {
    id: `${ns}.s3p4-body`,
    defaultMessage: 'Even if somehow your privacy is successfully contested by law enforcement and we\'re forced to comply, we\'re not in a position to help with forwarded email because we don\'t store any of your messages and we don\'t need or want to store them to do our forwarding job — so they\'re out of luck. In the case of our Webmail, every email stored is encrypted.  If you and the people you communicate with are also using GPG or S/MIME, your email is actually encrypted twice -- and once if you do not use GPG or S/MIME.  See our privacy policy for more details about how we\'re doing everything possible to protect your privacy.'
  },

  s4SeoTitle: {
    id: `${ns}.s4-seo-title`,
    defaultMessage: 'No changes to your system'
  },
  s4SeoDescription: {
    id: `${ns}.s4-seo-description`,
    defaultMessage: 'MsgSafe.io works with your existing software or webmail service without requiring any changes, special applications or plug-ins. When you use our webmail, you have the added assurance that we encryption every email we store, regardless of whether or not the sender is using GPG or S/MIME encryption.'
  },
  s4SeoKeywords: {
    id: `${ns}.s4-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s4Title: {
    id: `${ns}.s4-title`,
    defaultMessage: 'No changes to your system'
  },
  s4SmallTitle: {
    id: `${ns}.s4-small-title`,
    defaultMessage: 'No changes to your system'
  },
  s4p1Body: {
    id: `${ns}.s4p1-body`,
    defaultMessage: 'MsgSafe.io works with your existing software or webmail service without requiring any changes, special applications or plug-ins. When you use our webmail, you have the added assurance that we encryption every email we store, regardless of whether or not the sender is using GPG or S/MIME encryption.'
  },
  s4p2Body: {
    id: `${ns}.s4p2-body`,
    defaultMessage: 'Many companies provide proprietary software you can download that claims to protect your identity. At MsgSafe.io we think that approach is limiting and potentially dangerous. Open source web standards are transparent and fast evolving, and we implement solutions that work wherever you are, on whatever device you\'re using.'
  },
  s4p3Body: {
    id: `${ns}.s4p3-body`,
    defaultMessage: 'Other solutions make you download and install software on your devices or computers. Downloading new programs opens new holes:'
  },
  s4p3Bullet1: {
    id: `${ns}.s4p3-bullet1`,
    defaultMessage: 'You have to trust the company that developed it'
  },
  s4p3Bullet2: {
    id: `${ns}.s4p3-bullet2`,
    defaultMessage: 'You have to trust the companies that wrote any third-party software included in it for advertising or user experience tracking'
  },
  s4p3Bullet3: {
    id: `${ns}.s4p3-bullet3`,
    defaultMessage: 'You have to trust the network over which the software is being downloaded or when it’s updated'
  },
  s4p3Bullet4: {
    id: `${ns}.s4p3-bullet4`,
    defaultMessage: 'You have to trust the storage devices used to transfer it'
  },
  s4p3Bullet5: {
    id: `${ns}.s4p3-bullet5`,
    defaultMessage: 'You have to trust the app itself not to do anything else on your computer'
  },
  s4p3Bullet6: {
    id: `${ns}.s4p3-bullet6`,
    defaultMessage: 'You have to hope the software developers didn’t introduce new vulnerabilities into your device accidentally'
  },
  s4p4Body: {
    id: `${ns}.s4p4-body`,
    defaultMessage: 'Our software works through the web and operates using open standards so you know what\'s happening at all times. There\'s no software to download, no app store to trust, there\'s just you and us, and you\'re in control.'
  },

  s5SeoTitle: {
    id: `${ns}.s5-seo-title`,
    defaultMessage: 'Protecting your communications from interception'
  },
  s5SeoDescription: {
    id: `${ns}.s5-seo-description`,
    defaultMessage: 'MsgSafe.io reduces the ways your messages could be intercepted by third parties.'
  },
  s5SeoKeywords: {
    id: `${ns}.s5-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s5Title: {
    id: `${ns}.s5-title`,
    defaultMessage: 'Protecting your communications from interception'
  },
  s5SmallTitle: {
    id: `${ns}.s5-small-title`,
    defaultMessage: 'Protecting from interception'
  },
  s5p1Body: {
    id: `${ns}.s5p1-body`,
    defaultMessage: 'MsgSafe.io reduces the ways your messages could be intercepted by third parties.'
  },
  s5p2Body: {
    id: `${ns}.s5p2-body`,
    defaultMessage: 'We have more hands-on experience with advanced Internet networking techniques than most service providers. Thanks to our dedicated team of founders and engineers, we\'ve developed a platform that protects traffic to and from our network like nothing before. When we\'re talking about protecting the transmission of your information, we\'re really talking about "sending" and "receiving" data on the Internet and we have different ways of protecting each.'
  },
  s5p3Body: {
    id: `${ns}.s5p3-body`,
    defaultMessage: 'To help protect data people send to you, we make it more difficult for people to intercept traffic by distributing it to many locations around the world.'
  },
  s5p4Body: {
    id: `${ns}.s5p4-body`,
    defaultMessage: 'We start by distributing transit nodes (combinations of routers and computers) in different countries and legal jurisdictions, and we\'re constantly working to grow and increase their diversity. But that\'s not enough. We\'re also using a little-understood routing technique called Anycast. By Anycasting our data receiving infrastructure, no single nation-state-level interception system can predict where data will enter our network — we can\'t even predict it ourselves.'
  },
  s5p5Body: {
    id: `${ns}.s5p5-body`,
    defaultMessage: 'For example, when someone from New York sends you an email it may enter our network in Phoenix even though your email account is actually located in Germany. Even your email provider doesn\'t know from what region your contacts are sending you email. When someone from Colombia sends you an email, we may receive it in Curaçao even if your actual inbox is in London. Since traffic between our nodes is encrypted with pre-shared keys, even unencrypted email is protected with strong encryption where most countries intercept traffic (at their telecommunications borders). That means once a message reaches any transit node of our network, it\'s protected through encryption and aggregated with everyone else\'s traffic making interception difficult or impossible.'
  },
  s5p6Body: {
    id: `${ns}.s5p6-body`,
    defaultMessage: 'Our goal is to continue to fund expansion into as many countries as we can and to Anycast our transit nodes wherever possible so we can eventually make it nearly impossible for any of our customers\' traffic to be intercepted in transit.'
  },
  s5p7Body: {
    id: `${ns}.s5p7-body`,
    defaultMessage: 'While we\'re expanding our own nodes worldwide, we\'re also connecting to as many independent telecom networks as possible through an open and transparent peering policy. This allows us to reduce the hops, or transit networks, that your data has to go through to get from your contacts to us and back to your real email inbox. The more interconnectivity the better — for faster service, and so we can more effectively identify misbehaving operators by reducing the number of them between our service, our customers,and their contacts. This also makes our service more difficult to surveil because you\'d have to be in many different positions around the network to see the data flows, further reducing the risk of interception. For example, see our joint announcement with the Amsterdam Internet Exchange (AMS-IX).'
  },
  s5p8Body: {
    id: `${ns}.s5p8-body`,
    defaultMessage: 'To help protect data you send to others, we use our meshed network (interconnectivity between our transit nodes) to transmit according to your preferences. This means you control how we route your data outbound. If you want email from one of your identities to always enter the Internet through Singapore, you simply select Singapore as your exit routing point in the Advanced Settings section of that identity. You can have as many identities as you want with different exit points for each identity! This way, it\'s impossible for any third party to know where your messages will enter the Internet, and you can change that exit point in real-time, as many times as you want.'
  },
  s5p9Body: {
    id: `${ns}.s5p9-body`,
    defaultMessage: 'All the connections between our nodes are strongly encrypted using pre-shared keys, which means they are not subject to man-in-the-middle interception techniques. Once your message arrives at any of our nodes (either sending or receiving), it is encrypted and aggregated with other network traffic and then transmitted securely to another node for delivery, protected from interception. In the "last hop" where our system delivers your email to third-party mail servers or they deliver to us, we support high-grade opportunistic encryption. So even for infrastructure we don\'t control, if it supports industry standards and best practices, your email will be encrypted not only end-to-end through our network, but also end-to-end to and from third-party networks. If someone tries to find the center of our system to intercept the traffic between it and the rest of our infrastructure, they\'ll quickly discover: there is no center, there is no arbitrary middle, this is a distributed meshed system. Good luck.'
  },
  s5p10Body: {
    id: `${ns}.s5p10-body`,
    defaultMessage: 'Since you can pick your Internet exit point separately for each identity, you can choose the location where you’ll appear to be when you send or reply to messages. You can change that location in real-time, as many times as you want.'
  },
  s5p11Body: {
    id: `${ns}.s5p11-body`,
    defaultMessage: 'For example, if I\'m a Venezuelan in Caracas, and I want one of my email identities to appear to be from Singapore, I can set my chosen identity\'s exit node to be Singapore. When my message is received by its intended recipient, not only will it appear to have originated from Singapore, it really went through Singapore! Technically, it will have left my email service provider in Caracas, it may have entered our network in Curaçao (following Anycast routing which made that the closest entry point at that moment), been cleansed to protect my real identity, have its headers cleared and/or rewritten, then it would have been encrypted and aggregated, transmitted securely to our node in Singapore, and transmitted to its natural next-hop via our Singapore transit node, which will appear to have been its point of origination to the email recipient.'
  },

  s6SeoTitle: {
    id: `${ns}.s6-seo-title`,
    defaultMessage: 'End-to-end encryption'
  },
  s6SeoDescription: {
    id: `${ns}.s6-seo-description`,
    defaultMessage: 'MsgSafe.io has been working for the last two years with device manufacturers and major software companies and WebTrust-certified auditors to develop our own globally trusted certificate authority in partnership with our parent Company, TrustCor Systems S. de R.L.  We built full support for both popular encryption standards, GPG and S/MIME.'
  },
  s6SeoKeywords: {
    id: `${ns}.s6-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s6Title: {
    id: `${ns}.s6-title`,
    defaultMessage: 'End-to-end encryption'
  },
  s6SmallTitle: {
    id: `${ns}.s6-small-title`,
    defaultMessage: 'End-to-end encryption'
  },
  s6p1Body: {
    id: `${ns}.s6p1-body`,
    defaultMessage: 'MsgSafe.io has been working for the last two years with device manufacturers and major software companies and WebTrust-certified auditors to develop our own globally trusted certificate authority in partnership with our parent Company, TrustCor Systems S. de R.L.  We built full support for both popular encryption standards, GPG and S/MIME.'
  },
  s6p2Body: {
    id: `${ns}.s6p2-body`,
    defaultMessage: 'We have been using this certificate authority to guarantee encryption key material security between elements of our own infrastructure for a couple of years now. We also dynamically generate globally-trusted, secure email encryption certificates for all of your email identities. With this added capability, we can encrypt and protect your messages at rest (in addition to when they\'re being transmitted across the network) when they\'re saved on computers, without using any third parties that may not honor your privacy the way we do.  And we also support the popular GPG standard.'
  },

  s7SeoTitle: {
    id: `${ns}.s7-seo-title`,
    defaultMessage: 'Email path analytics and enrichment'
  },
  s7SeoDescription: {
    id: `${ns}.s7-seo-description`,
    defaultMessage: 'MsgSafe.io detects and interprets the metadata hidden in messages you receive and uses it to give you more information about the person (or machine) sending you the message. MsgSafe.io also uses the metadata to understand the path email takes to to reach us in order to help us determine the best future locations for expansion of our transit node infrastructure. MsgSafe.io also uses the metadata to detect foul play amongst telecommunications service providers who may be misrouting traffic. In every case, this is being done to further enhance your privacy.'
  },
  s7SeoKeywords: {
    id: `${ns}.s7-seo-keywords`,
    defaultMessage: 'email, secure video, secure chat, encrypted email, gpg, smime, end-to-end encryption, virtual email, privacy, protection'
  },
  s7Title: {
    id: `${ns}.s7-title`,
    defaultMessage: 'Email path analytics and enrichment'
  },
  s7SmallTitle: {
    id: `${ns}.s7-small-title`,
    defaultMessage: 'Email path analytics'
  },
  s7p1Body: {
    id: `${ns}.s7p1-body`,
    defaultMessage: 'MsgSafe.io detects and interprets the metadata hidden in messages you receive and uses it to give you more information about the person (or machine) sending you the message. MsgSafe.io also uses the metadata to understand the path email takes to to reach us in order to help us determine the best future locations for expansion of our transit node infrastructure.'
  },
  s7p2Body: {
    id: `${ns}.s7p2-body`,
    defaultMessage: 'MsgSafe.io also uses the metadata to detect foul play amongst telecommunications service providers who may be misrouting traffic. In every case, this is being done to further enhance your privacy.'
  },
  s7p3Body: {
    id: `${ns}.s7p3-body`,
    defaultMessage: 'Unlike MsgSafe.io, most email services and applications insert metadata into every email they transmit. By interpreting this metadata when messages are received, MsgSafe.io can often determine the type of device the sender used, their email software and sometimes even their current physical location. This metadata is only decoded when messages are being received and the information extracted is provided to you in the form of new email headers added when the message is relayed to your real email address. Read more information in our FAQ to find out how to view and use this information.'
  },
  s7b1Body: {
    id: `${ns}.s7b1-body`,
    defaultMessage: 'Unlike MsgSafe.io, most email services and applications insert metadata into every email they transmit.'
  }
})

export default m
