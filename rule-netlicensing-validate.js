function validateNetLicensing(user, context, callback) {
  if (!configuration.NETLICENSING_API_KEY) {
    console.log('Missing required configuration: NetLicensing API_KEY; skipping.');
    return callback(null, user, context);
  }

  const { NETLICENSING_BASE_URL = 'https://go.netlicensing.io/core/v2/rest' } = configuration;
  const { NETLICENSING_API_KEY } = configuration;
  const { NETLICENSING_PRODUCT_NUMBER } = configuration;
  const { NETLICENSING_PRODUCT_MODULE_NUMBER } = configuration;

  const qs = require('qs');
  const request = require('request');

  // skip if no user email available (used as NetLicensing customer number)
  if (!user.email) {
    return callback(null, user, context);
  }

  // (optional) skip if NetLicensing metadata has already been added to the user profile
  /*
  if (user.user_metadata && user.user_metadata.netlicensing) {
    return callback(null, user, context);
  }
  */

  let data = {
    licenseeName: user.name
  };
  data.productNumber = NETLICENSING_PRODUCT_NUMBER;
  data.productModuleNumber = NETLICENSING_PRODUCT_MODULE_NUMBER;

  let auth = 'Basic ' + Buffer.from('apiKey:' + NETLICENSING_API_KEY).toString('base64');

  request.post(
    `${NETLICENSING_BASE_URL}/licensee/${user.email}/validate`,
    {
      headers: {
        Authorization: auth,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(data)
    },
    (httpError, response, body) => {
      if (httpError) {
        console.error('Error calling NetLicensing API: ' + httpError.message);
        // swallow NetLicensing api errors and just continue login
        return callback(null, user, context);
      }

      // if we reach here, it means NetLicensing returned info and we'll add it to the metadata

      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        console.error(
          'Error parsing NetLicensing response: ' + parseError.message
        );
        return callback(null, user, context);
      }

      user.user_metadata = user.user_metadata || {};
      user.user_metadata.netlicensing = parsedBody;

      try {
        auth0.users.updateUserMetadata(user.user_id, user.user_metadata);
      } catch (auth0Error) {
        console.error('Error updating the user profile: ' + auth0Error.message);
        return callback(null, user, context);
      }

      // The details property could be very large
      const parsedBodyClone = JSON.parse(JSON.stringify(parsedBody));
      delete parsedBodyClone.details;
      context.idToken['https://netlicensing.io/auth0'] = parsedBodyClone;

      return callback(null, user, context);
    }
  );
}
