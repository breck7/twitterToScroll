const JSZip = require('jszip');
const fetch = require('node-fetch');
const tweetsLib = require('./tweets');

// creates a zip folder containing the scroll files and returns its buffer
async function createScroll(username) {
  const { displayName, ppUrl, tweets } = await tweetsLib.getUserData(username);
  const folderName = username + '_scroll.zip';
  const fileName = 'index.scroll';
  const imageName = username + '_pfp.png';

  // create text of index.scroll file
  let scrollText = 'import header.scroll\n';
  scrollText += `title The Tweets of ${displayName}\n`;
  scrollText += `image images/${imageName}\n`;
  scrollText += '# \n';
  scrollText += `# @${username}\n`;
  scrollText += ` https://twitter.com/${username}\n`;
  scrollText += '# \n';

  // add Tweets to file
  for (let tweet of tweets) {
    scrollText += 'quote\n';
    // keys: text, id, created_at, edit_history_tweet_ids
    let text = tweet['text'];
    // add space before and after all newlines to keep tweet in quote
    text = text.replace(/\r?\n|\r/g, ' \n ');
    const createdAt = (new Date(tweet['created_at'])).toUTCString();
    scrollText += ` ${text}\n \n`;
    scrollText += ` ${createdAt}\n`;
    scrollText += 'endSnippet\n';

    scrollText += '\n';
  }
  scrollText += 'scrollFooter';

  const headerFileText = `importOnly
github https://github.com/breck7/scroll
viewSourceBaseUrl ./
twitter https://twitter.com/breckyunits
email feedback@scroll.pub
baseUrl https://scroll.pub/
scrollCssTag
scrollHeader
`;
  // create a zip folder containing the scroll files and an images folder
  // and return its buffer
  const zip = new JSZip();
  zip.file(fileName, scrollText);
  zip.file('header.scroll', headerFileText)
  const imgs = zip.folder('images');
  const imgPromise = fetch(ppUrl).then(r => r.arrayBuffer());
  imgs.file(imageName, imgPromise);
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return buffer;
}

module.exports = { createScroll };