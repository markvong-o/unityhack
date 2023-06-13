# 1. Progressive Profiling:
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  /**
   * If this user doesn't have the following information saved in their metadata, redirect them to our hosted form to collect the info.
   * We should ideally send a signed session token with relevant information if we need to pass any data. 
   * More info: https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions#pass-data-to-the-external-site
   */


  let firstname = event.user.user_metadata.firstname;
  let accepted_terms = event.user.user_metadata.accepted_terms;
  const redirectUrl = `http://hacknextserver.vercel.app/moreinfo?domain=${event.request.hostname}&firstname=${firstname}&accepted_terms=${accepted_terms}`;
  if (!firstname || !accepted_terms) {

    api.redirect.sendUserTo(redirectUrl);
  }
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onContinuePostLogin = async (event, api) => {
  /**
   * When we come back from the redirect, store the information in the user profile
   * Note: This is not secure as we're sending information in the front channel. Ideally we would want to update thru
   * the management API/back channel for security. If front channel is a must, we should return a signed session token with respective
   * payload. More info: https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions#send-data-on-the-front-channel
   */
  let { firstname, terms } = event.request.query;
  console.log(firstname, terms);
  api.user.setUserMetadata('firstname', firstname);
  api.user.setUserMetadata('accepted_terms', terms === 'true');
}

# 2. Step Up MFA
## Pre-req:
## Create an API in CIC, name it api://resource
## Add as an audience to React SPA auth_config.json
## Enable MFA options in Auth0 console. Refresh React SPA application to be challenged with MFA.
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  /**
   * If authorization is initiated and a token for our API : api://resource is requested, 
   * challenge the user with a secondary factor.
   */
  const resource_server_identifier = 'api://resource';
  if (event.authorization && event.resource_server?.identifier === resource_server_identifier) {
    api.multifactor.enable('any');
  }
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };

# 3. Augment the ID token by pulling information from external service. Relog as user to show new claims in token.
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/

// Add axios to list of dependencies on the left
const axios = require('axios');

exports.onExecutePostLogin = async (event, api) => {
  /**
   * Fetch data from an external source.
   */
  const externalSourceUrl = 'https://hacknextserver.vercel.app/augment';
  let res = await axios.get(externalSourceUrl);
  let augmentData = res.data;
  /**
   * For each key, add the value to our id token
   */
  for (let key in augmentData) {
    api.idToken.setCustomClaim(key, augmentData[key]);
  }
  
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };

# 4. Validate user registration based on pre-defined condition
/**
* Handler that will be called during the execution of a PreUserRegistration flow.
*
* @param {Event} event - Details about the context and user that is attempting to register.
* @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the signup.
*/

// Add axios to list of dependencies on the left
const axios = require('axios');

exports.onExecutePreUserRegistration = async (event, api) => {
  /**
   * Deny user registration if they don't exist in our database first.
   */
  let usersUrl = `https://hacknextserver.vercel.app/users`;
  let users = await axios.get(usersUrl);
  users = users.data;

  let currUserEmail = event.user.email;

  const userExists = (users, currUserEmail) => {
    return users.filter(user => user.email === currUserEmail).length > 0;
  }
  if (!userExists(users, currUserEmail)) {
    api.access.deny('user-does-not-exist', 'User does not exist.')
  }

};

# 5. Augment user profile during registration
/**
* Handler that will be called during the execution of a PreUserRegistration flow.
*
* @param {Event} event - Details about the context and user that is attempting to register.
* @param {PreUserRegistrationAPI} api - Interface whose methods can be used to change the behavior of the signup.
*/
// Install axios as a dependency
const axios = require('axios');
exports.onExecutePreUserRegistration = async (event, api) => {
  /**
   * Get UID from our external user store and augment the local user profile
   */
  const usersUrl = `https://hacknextserver.vercel.app/users`
  let users = await axios.get(usersUrl);
  users = users.data;
  users = users.filter(user => user.email === event.user.email);
  // Found a matching existing user
  if (users.length > 0) {
    let externalUserProfile = users[0];
    api.user.setUserMetadata('external_id', externalUserProfile['uid'])
  }
};

# 6. Assign roles to users
exports.onExecutePostUserRegistration = async (event) => {
  const namespace = 'https://auth0.com';
  const ManagementClient = require('auth0').ManagementClient;

  function createManagementClient () {
    const management = new ManagementClient({
      domain: event.secrets.DOMAIN,
      clientId: event.secrets.CLIENT_ID,
      clientSecret: event.secrets.CLIENT_SECRET,
      scope: 'read:roles update:users create:role_members'
    });
    return management
  }

  const userRole = {
    id: 'rol_bauILE6QiYVsFEfO', // ID of Member Role in your Tenant.
    name: 'User'
  }

  try {
    const management = createManagementClient();
    await management.assignRolestoUser(
      { id: event.user.user_id },
      { roles: [ userRole.id ] }
    );
  } catch (err) {
    console.error(err);
  }
}

# 7. Augment JWT
exports.onExecutePostLogin = async (event, api) => {
    const namespace = 'https://';
    const { last_name, first_name, no, client_id } = event.user.user_metadata;
  
    if (event.authentication) {
      // Set claims 
      api.accessToken.setCustomClaim(`${namespace}/family_name`, last_name);
      api.accessToken.setCustomClaim(`${namespace}/given_name`, first_name);
      api.accessToken.setCustomClaim(`${namespace}/no`, no);
   
    }
  };

# 8. Denying login if user isn't verified.
exports.onExecutePreUserRegistration = async (event, api) => {
};
function emailVerified(user, context, callback) {
  if (!user.email_verified) {
    return callback(
      new UnauthorizedError('Please verify your email before logging in.')
    );
  } else {
    return callback(null, user, context);
  }
}