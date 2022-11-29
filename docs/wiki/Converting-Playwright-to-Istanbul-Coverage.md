How to convert `playwright` coverage format to `istanbul` coverage

To convert coverage generated from `playwright` to `istanbul` coverage, you first need to install
- [`v8-to-istanbul`](https://www.npmjs.com/package/v8-to-istanbul)

Once installed, convert the coverage to a format which `istanbul` can recognize, by writing a script as shown below.

```js
const v8toIstanbul = require('v8-to-istanbul');
// read all the coverage file from output/coverage folder
const coverage = require('./output/coverage/Visit_Home_1630335005.coverage.json');
const fs = require('fs/promises');

(async () => {
    for (const entry of coverage) {
        // Used to get file name
        const file = entry.url.match(/(?:http(s)*:\/\/.*\/)(?<file>.*)/);
        const converter = new v8toIstanbul(file.groups.file, 0, {
            source: entry.source
        });

        await converter.load();
        converter.applyCoverage(entry.functions);

        // Store converted coverage file which can later be used to generate report
        await fs.writeFile('./coverage/final.json', JSON.stringify(converter.toIstanbul(), null, 2));
    }
})();
```