How to convert `playwright` coverage format to `istanbul` coverage

To convert coverage generated from `playwright` to `istanbul` coverage, you first need to install
- [`v8-to-istanbul`](https://www.npmjs.com/package/v8-to-istanbul)

Once installed, convert the coverage to a format which `istanbul` can recognize, by writing a script as shown below.

```ts
import glob from 'glob'
import v8toIstanbul from 'v8-to-istanbul'
let coverage

import fs from 'fs'

const coverageFolder = `${process.cwd()}/coverage`

async function isExists(path) {
    try {
        await fs.access(path, null)
        return true
    } catch {
        return false
    }
}

glob.sync(process.cwd() + '/output/coverage/**/').forEach(item => {
    const directory = fs.opendirSync(item)
    let file
    while ((file = directory.readSync()) !== null) {
        if (file && file.name.includes('.coverage.json') === true) {
            const fileName = file.name
            if (fileName) {
                coverage = require(`${process.cwd()}/output/coverage/${fileName}`)
            }
        }
    }
    directory.closeSync()
})

void (async () => {
    for (const entry of coverage) {
        // Used to get file name
        const file = entry.url.match(/(?:http(s)*:\/\/.*\/)(?<file>.*)/)

        const converter = v8toIstanbul(file.groups.file, 0, {
            source: entry.source,
        })

        await converter.load()
        converter.applyCoverage(entry.functions)

        // Store converted coverage file which can later be used to generate report
        const exist = await isExists(coverageFolder)
        if (!exist) {
            fs.mkdirSync(coverageFolder, {recursive: true})
        }

        await fs.writeFileSync(`${coverageFolder}/final.json`, JSON.stringify(converter.toIstanbul(), null, 2))
    }
})()
```