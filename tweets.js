const needle = require('needle');

const bearerToken = process.env['BEARER_TOKEN'];
const TWEETS_PER_PAGE = 10;
const MAX_PAGES = 3;

async function getRequest(url, params) {
  try {
    const resp = await needle('get', url, params, {
      headers: {
        "User-Agent": "v2UserTweetsJS",
        "authorization": `Bearer ${bearerToken}` //use bearer auth
      }
    });

    if (resp.statusCode != 200) {
      console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
      return;
    }
    return resp.body;
  } catch (err) {
    throw new Error(`Request failed: ${err}`);
  }
}

// get user data json from endpoint
async function getUser(username) {
  const [url, params] = createUserEndpoint(username);
  const res = await getRequest(url, params);
  return res['data'][0];
}

// create the Twitter API endpoint url for user data
function createUserEndpoint(username) {
  const userFields = 'name,username,profile_image_url';
  const url = `https://api.twitter.com/2/users/by`;
  const params = { 'usernames': username, 'user.fields': userFields };
  return [url, params];
}

// create the Twitter API endpoint url for user tweets
function createUserTweetsEndpoint(userID) {
  const url = `https://api.twitter.com/2/users/${userID}/tweets`;
  params = { 'tweet.fields': 'created_at', 'max_results': TWEETS_PER_PAGE };
  return [url, params];
}

// get an array of Tweet dicts from endpoint
async function getUserTweets(userID) {
  /* each page returns 10 tweets */

  let userTweets = [];
  const [url, params] = createUserTweetsEndpoint(userID);

  let hasNextPage = true;
  let nextToken = null;
  let userName;
  console.log("Retrieving Tweets...");

  let pageCount = 0;
  while (hasNextPage && pageCount < MAX_PAGES) {
    let resp = await getPage(url, params, nextToken);
    if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
      if (resp.data) {
        userTweets.push.apply(userTweets, resp.data);
      }
      if (resp.meta.next_token) {
        nextToken = resp.meta.next_token;
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
    pageCount++;
  }

  console.log(`Got ${userTweets.length} Tweets from (user ID ${userID})!`);
  return userTweets;
}

async function getPage(url, params, nextToken) {
  if (nextToken) {
    params.pagination_token = nextToken;
  }
  return await getRequest(url, params);
}

function getBiggerPPUrl(ppUrl) {
  // change to bigger image url
  // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/user-profile-images-and-banners
  const underscore = ppUrl.lastIndexOf('_');
  const dot = ppUrl.lastIndexOf('.');
  const bigPPUrl = ppUrl.slice(0, underscore + 1) + 'bigger' + ppUrl.slice(dot);
  return bigPPUrl;
}

async function getUserData(username) {
  /* 
  input: Twitter username
  output: Twitter display name, profile pic url, list of Tweet dicts
  */
  const data = await getUser(username);
  const userID = data['id'];
  const displayName = data['name'];
  let ppUrl = data['profile_image_url'];
  ppUrl = getBiggerPPUrl(ppUrl);
  const tweets = await getUserTweets(userID);
  return { displayName, ppUrl, tweets };
}


module.exports = { getUserData };