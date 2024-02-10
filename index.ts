import fs from 'node:fs/promises'
import gitmojis from './json/gitmoji.json'

gitmojis.sort((a, b) => a.code > b.code ? 1 : a.code < b.code ? -1 : 0)
// console.log(gitmojis)

const cwd = process.cwd()

const emojiFontSize = '3rem'

let doc = `# Gitmoji Markdown

This is an overview of emojis for use in Git commit messages and GitHub Markdown. Based on [Gitmoji](https://github.com/carloscuesta/gitmoji) and [this Gist with the complete list of GitHub emoji markup](https://gist.github.com/rxaviers/7360908).

## Git messages

| Emoji | Code | Description |
|---|---|---|
`

for (const { emoji, code, description } of gitmojis) {
  doc += `| <span style="font-size:${emojiFontSize}">${emoji}</span> | \`${code}\` | ${description} |\n`
}

doc += '\n\n'

async function txt2json(category: string) {

  const txt = await fs.readFile(`${cwd}/json/${category}.txt`, 'utf-8')

  const lines = txt.split('\n')
  const emojis = lines.reduce((emojis: [string, string][], line) => {
    const found = line.split('\t')
    const pairs = found.reduce((pairs: [string, string][], pair: string) => {
      const [emoji, code] = pair.split(' ').slice(0, 2).map(str => str.trim())
      if (emoji && code && emoji[0]!==':' ) {
        pairs.push([emoji, code])
      } 
      return pairs
    }, [])
    emojis.push(...pairs)
    return emojis
  }, [])

  const jsonFile = `${cwd}/json/${category}.json`
  await fs.writeFile(jsonFile, JSON.stringify(emojis, null, 2))  
}

for (const category of [
  'people',
  'nature',
  'objects',
  'places',
  'symbols'
]) {

  // await txt2json(category)
  const emojis = JSON.parse(await fs.readFile(`${cwd}/json/${category}.json`, 'utf-8'))

  doc += `## ${category[0].toUpperCase() + category.slice(1)}

| Emoji | Code | Emoji | Code |
|---|---|---|---|
`

const columnsPerRow = 2

for (let i=0, len=emojis.length; i < (len+3); i+= columnsPerRow) {
  for (let j=0; j <= columnsPerRow-1; j++) {
    const e = emojis[i + j]
    if (!e) {
      // Fill the rest of table columns for this row
      if (j===0) break
      if (j===1) doc += `| &nbsp; | &nbsp; `
      // if (j<=2) doc += `| &nbsp; | &nbsp; `
      doc += `|\n`
      break
    }
    const [emoji, code] = e
    doc += `| <span style="font-size:${emojiFontSize}">${emoji}</span> | \`${code}\` `
    if (j===columnsPerRow-1) doc += `|\n`
  }
}

doc += '\n\n'

}

await fs.writeFile(`${cwd}/readme.md`, doc)
