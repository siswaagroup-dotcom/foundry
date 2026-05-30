# Foundry Auth UI

Modern authentication experience built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui style components, React Hook Form, Zod, Framer Motion, and Lucide React.

## Project Setup Commands

```bash
npx create-next-app@latest foundry-auth-ui --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd foundry-auth-ui
npm install react-hook-form zod @hookform/resolvers framer-motion lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-slot
npx shadcn@latest init
npx shadcn@latest add button input checkbox label
npm run dev
```

This repository already contains the completed folder structure and code.

## Implementation

- Mobile below `768px` keeps the screenshot-style centered auth card.
- Desktop from `1024px` uses a two-column SaaS landing/auth layout.
- Framer Motion powers page entrance, hero/card motion, tab pill layout animation, and button hover/tap states.
