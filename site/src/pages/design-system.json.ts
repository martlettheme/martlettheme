import distribution from '../data/distribution.json';
import language from '../../../docs/language/language.json';
import languageSource from '../../../docs/language/snapshot.json';
import { version as coreVersion, foundation, design, capabilities, themes, heritage } from '@martlet/theme';
import { version as astroVersion, peerDependencies } from '@martlet/astro/package.json';
export function GET() {
  return new Response(JSON.stringify({
    schemaVersion: 1,
    family: 'martlet',
    packages: { core: {name: '@martlet/theme', version: coreVersion}, astro: {name: '@martlet/astro', version: astroVersion, peerDependencies} },
    foundation, design, capabilities, themes, heritage, distribution,
    language: { ...language, canonicalSource: languageSource },
  }, null, 2) + '\n', {headers: {'Content-Type': 'application/json; charset=utf-8'}});
}
