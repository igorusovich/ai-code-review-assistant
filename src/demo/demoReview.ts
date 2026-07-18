import type { Language } from '../types/review.ts'

export const DEMO_LANGUAGE: Language = 'TypeScript'

export const DEMO_CONTEXT = 'This module sits on a hot path in production — user data is rendered on every dashboard load.'

export const DEMO_CODE = `interface User {
  id: number
  name: string
  email?: string
}

const cache: Record<number, User> = {}

export async function getUser(id: number): Promise<User> {
  if (cache[id]) {
    return cache[id]
  }

  const res = await fetch(\`/api/users/\${id}\`)
  const user = await res.json()

  cache[id] = user

  document.getElementById('username')!.innerHTML = user.name

  return user
}

export function formatUsers(users: User[]): string {
  let output = ''
  for (let i = 0; i < users.length; i++) {
    output += users[i].name + ' <' + users[i].email + '>\\n'
  }
  return output
}`

export const DEMO_REVIEW = `## Bug Risk: High
The combination of unescaped HTML injection, unchecked fetch responses, and an unbounded cache makes this module fragile in production. The innerHTML assignment is the most urgent issue.

## Summary
The module fetches and caches user data, then renders a user's name into the DOM. The core flow works, but there is a cross-site scripting vulnerability, no error handling on the network path, and a cache that grows forever. The formatting helper is functional but does unnecessary string concatenation and mishandles optional emails.

## Style Issues
- Non-null assertion on getElementById hides a real failure mode — if the element is missing, this throws at runtime.
- String concatenation with + in formatUsers is harder to read than template literals or Array.join.
- \`user\` from res.json() is implicitly \`any\`; the User type is asserted but never validated.
- Inconsistent guard style: the cache check returns early, but the fetch path has no guards at all.

## Performance
- The cache is a plain object that never evicts — it grows unbounded with every distinct user id and will leak memory in a long-lived SPA.
- Repeated string concatenation in the loop creates a new string per iteration; negligible at small n, but users.map().join() is both faster to read and cheaper.
- No request deduplication: concurrent calls for the same uncached id fire duplicate fetches.

## Security
- XSS: user.name is written via innerHTML without escaping. A name like <img src=x onerror=alert(1)> executes arbitrary JS in every viewer's session. Use textContent instead.
- No check of res.ok before parsing — a 500 with an HTML error body will produce garbage data that flows into the cache and the DOM.
- Cache poisoning: whatever the API returns is trusted blindly and reused for all future calls.

## Suggested Fix
\`\`\`typescript
interface User {
  id: number
  name: string
  email?: string
}

const CACHE_TTL_MS = 60_000
const cache = new Map<number, { user: User; expires: number }>()
const pending = new Map<number, Promise<User>>()

export async function getUser(id: number): Promise<User> {
  const hit = cache.get(id)
  if (hit && hit.expires > Date.now()) {
    return hit.user
  }

  const inFlight = pending.get(id)
  if (inFlight) return inFlight

  const request = (async () => {
    const res = await fetch(\`/api/users/\${id}\`)
    if (!res.ok) {
      throw new Error(\`Failed to load user \${id}: \${res.status}\`)
    }
    const user = (await res.json()) as User
    cache.set(id, { user, expires: Date.now() + CACHE_TTL_MS })
    return user
  })().finally(() => pending.delete(id))

  pending.set(id, request)
  return request
}

export function renderUserName(user: User): void {
  const el = document.getElementById('username')
  if (el) el.textContent = user.name // textContent, not innerHTML — immune to XSS
}

export function formatUsers(users: User[]): string {
  return users
    .map((u) => (u.email ? \`\${u.name} <\${u.email}>\` : u.name))
    .join('\\n')
}
\`\`\``
