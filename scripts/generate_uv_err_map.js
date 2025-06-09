
/**
 *  run with `node --expose_internals scripts/generate_uv_err_map.js`
 */

const { internalBinding } = require('internal/test/binding');
const fs = require('fs');

const errmap = internalBinding('uv').getErrorMap()

let cHeader = ""

errmap.forEach(([name, what], code) => {
    cHeader += `#define UV_${name} ${code}\n`
})

cHeader = `

////// AUTO GENERATED //////

#ifndef NODERT_UV_ERRMAP_H
#define NODERT_UV_ERRMAP_H

${cHeader}

#endif // NODERT_UV_ERRMAP_H
`

fs.writeFileSync('src/uv_errno.h', cHeader)

let json = {}

errmap.forEach(([name, what], code) => {
    json[code] = [name, what]
})

fs.writeFileSync('shims/internal_util/uv_errmap.json', JSON.stringify(json, null, 2))
