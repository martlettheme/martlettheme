import { version as coreVersion, foundation, design, capabilities, themes, heritage, layout } from '@martlet/theme';
import { version as astroVersion, peerDependencies } from '@martlet/astro/package.json';
export function GET() {
  return new Response(JSON.stringify({
    schemaVersion: 1,
    family: 'martlet',
    packages: { core: {name: '@martlet/theme', version: coreVersion}, astro: {name: '@martlet/astro', version: astroVersion, peerDependencies} },
    foundation: { origin: foundation.origin, tokens: foundation.tokens, typographyRoles: foundation.typographyRoles },
    design, capabilities, themes, heritage,
    layout: { ...layout, sources: layout.sources.map(({ url }) => ({ url })) },
  }, null, 2) + '\n', {headers: {'Content-Type': 'application/json; charset=utf-8'}});
}
