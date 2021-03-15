const qs = require('qs');
const request = require('request');

function validateNetLicensing(user, context, callback) {
  const {
    NETLICENSING_API_KEY: apiKey,
    NETLICENSING_BASE_URL: baseUrl = 'https://go.netlicensing.io/core/v2/rest',
    NETLICENSING_PRODUCT_NUMBER: productNumber,
    NETLICENSING_PRODUCT_MODULE_NUMBER: productModuleNumber,
  } = configuration;

  if (!apiKey) {
    console.error('Missing required configuration: NetLicensing API_KEY; skipping.');
    return callback(null, user, context);
  }

  const { user_id, email, name, user_metadata = {} } = user;

  const licenseeNumber = email;
  const licenseeName = name;

  // skip if no user email available (used as NetLicensing customer number)
  if (!licenseeNumber) {
    return callback(null, user, context);
  }

  let isExpired = false;

  if (user_metadata.netlicensing) {
    const { ttl } = user_metadata.netlicensing;
    const ttlDate = new Date(ttl);
    const now = new Date();

    console.log(`User metadata found; TTL=${ttlDate}`);

    if (ttlDate.getTime() < now.getTime()) {
      isExpired = true;
      console.log('User metadata expired');
    }
  } else {
    isExpired = true;
    console.log('No user metadata found');
  }

  // Skip NetLicensing validation if exists and not expired yet
  if (isExpired) {
    console.log(`Send NetLicensing validation request for ${licenseeNumber}`);

    request.post(
      `${baseUrl}/licensee/${licenseeNumber}/validate`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from('apiKey:' + apiKey).toString('base64')}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify({ licenseeName, productNumber, productModuleNumber })
      },
      (httpError, response, body) => {
        if (httpError) {
          console.error(`Error calling NetLicensing API: ${httpError.message}`);
          // swallow NetLicensing api errors and just continue login
          return callback(null, user, context);
        }

        // if we reach here, it means NetLicensing returned info and we'll add it to the metadata
        let parsedBody = '';

        try {
          parsedBody = JSON.parse(body);
        } catch (parseError) {
          console.error(`Error parsing NetLicensing response: ${parseError.message}`);
          return callback(null, user, context);
        }

        try {
          auth0.users.updateUserMetadata(user_id, { ...user_metadata, netlicensing: parsedBody });
        } catch (auth0Error) {
          console.error(`Error updating the user profile: ${auth0Error.message}`);
          return callback(null, user, context);
        }

        // Add user metadata to the /userinfo context
        const data = JSON.parse(JSON.stringify(parsedBody));
        delete data.details;

        context.idToken['https://netlicensing.io/auth0'] = data;

        return callback(null, user, context);
      }
    );
  } else {
    // Add user metadata to the /userinfo context
    const data = JSON.parse(JSON.stringify(user_metadata.netlicensing));
    delete data.details;

    context.idToken['https://netlicensing.io/auth0'] = data;

    return callback(null, user, context);
  }

}
