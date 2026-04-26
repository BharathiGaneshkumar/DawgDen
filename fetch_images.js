const https = require('https');

async function fetchImageId(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results[0].id);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const queries = ['ikea desk', 'calculus textbook', 'mini fridge', 'computer monitor', 'coffee maker', 'office chair'];
  for (const q of queries) {
    try {
      const id = await fetchImageId(q);
      console.log(`${q}: ${id}`);
    } catch(e) {
      console.log(`${q}: FAILED`);
    }
  }
}

main();
