import { generateImportMap } from './node_modules/payload/dist/bin/generateImportMap/index.js';

const configModule = await import('./src/payload.config.ts');
const config = configModule.default;

await generateImportMap(config);
console.log('ImportMap generated');
