/**
 * Project Slug & AI Codename Utilities
 *
 * Generates URL-friendly slugs from project names and
 * provides mock AI codename generation (to be replaced with real AI module).
 */

/**
 * Generates a URL-friendly slug from a project name.
 * Removes accents, special characters, and replaces spaces with hyphens.
 *
 * @example
 * generateSlug("Venda da TechCorp Brasil") // "venda-da-techcorp-brasil"
 * generateSlug("Captação de Recursos 2024") // "captacao-de-recursos-2024"
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Mock AI codename generator.
 * In the future, this will call an AI module to generate creative codenames.
 *
 * Current implementation: generates a random codename from predefined word pools.
 */

const ADJECTIVES = [
  'aurora', 'crystal', 'diamond', 'eagle', 'falcon',
  'golden', 'horizon', 'iron', 'jade', 'knight',
  'lunar', 'marble', 'nova', 'omega', 'phoenix',
  'quantum', 'ruby', 'silver', 'titan', 'ultra',
  'vortex', 'wave', 'apex', 'bolt', 'cipher',
  'delta', 'echo', 'flare', 'granite', 'helix',
]

const NOUNS = [
  'alpha', 'bridge', 'cascade', 'dawn', 'empire',
  'forge', 'genesis', 'harbor', 'impulse', 'junction',
  'keystone', 'legacy', 'meridian', 'nexus', 'orbit',
  'pinnacle', 'quest', 'radiance', 'summit', 'thunder',
  'unity', 'venture', 'zenith', 'atlas', 'beacon',
  'compass', 'dynasty', 'frontier', 'gateway', 'haven',
]

/**
 * Generates a creative AI codename for a project (mock implementation).
 *
 * @param _projectName - The project name (will be used by real AI in the future)
 * @returns A creative codename like "project-phoenix-nexus"
 */
export async function generateAICodename(_projectName: string): Promise<string> {
  // TODO: Replace with actual AI module call
  // This is a mock implementation that generates creative codenames
  await new Promise(resolve => setTimeout(resolve, 800)) // Simulate AI latency

  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]

  // Capitalize first letter of each word for a readable project name
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return `Projeto ${capitalize(adjective)} ${capitalize(noun)}`
}
