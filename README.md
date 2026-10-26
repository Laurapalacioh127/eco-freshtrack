# FreshTrack

Plataforma para reducir el desperdicio de comida en casa. Tiene dos portales conectados:

- **Portal del hogar:** inventario con alertas de vencimiento, lista de mercado inteligente, recetas, escáner de alimentos y donaciones.
- **Portal del equipo:** feed en vivo, panel de donaciones, moderación de recetas y catálogo maestro.

Proyecto de la materia **Ecosistemas de Aplicaciones** (Universidad Icesi) — Entrega Parte 2.

## Enlaces

| Qué | URL |
| --- | --- |
| Client (Next.js) | https://eco-freshtrack-1861.vercel.app |
| Server (API REST con Express) | https://eco-freshtrack.vercel.app |
| Repositorio | https://github.com/Laurapalacioh127/eco-freshtrack |

Ejemplos de endpoints del server: `/api/products`, `/api/inventory`, `/api/recipes`, `/api/donations`, `/api/users`.

## Equipo

- Laura Palacio
- Mariana Quintero

## Estructura del repositorio

```
eco-freshtrack/
├─ server/   API REST en Express + TypeScript
└─ client/   Aplicación Next.js (React Context + Axios)
```

## Tecnologías

- **Server:** Node.js, Express, TypeScript, @hapi/boom, cors, dotenv.
- **Client:** Next.js (App Router), React, TypeScript, Tailwind CSS, Axios.
- **Despliegue:** Vercel (dos proyectos independientes desde este mismo repositorio).

## Arquitectura del server

Cada feature (`products`, `inventory`, `recipes`, `donations`, `users`) vive en `server/src/features/` con la misma estructura de 4 capas:

```
router → controller → service → repository
```

- **Router:** une el método HTTP y la ruta con una función del controller.
- **Controller:** recibe la petición, llama al service y responde con JSON.
- **Service:** contiene la lógica de negocio y lanza los errores.
- **Repository:** único acceso a los datos; en esta entrega devuelve los datos simulados de `data.mock.ts`.

Esta entrega solo expone operaciones de lectura (GET).

## Arquitectura del client

- Toda petición HTTP sale con **Axios** desde `client/src/providers/`.
- `AxiosProvider` crea la única instancia de Axios (con `NEXT_PUBLIC_API_URL` como `baseURL`).
- Cada provider de datos (`ProductsProvider`, `InventoryProvider`, `RecipesProvider`, `DonationsProvider`, `UsersProvider`) pide los datos con `useAxios()` y los expone con un hook (`useInventory()`, `useRecipes()`, etc.).
- Las páginas y los componentes solo leen esos hooks: no hacen llamadas HTTP.

## Endpoints (todos GET)

| Feature | Endpoints |
| --- | --- |
| products | `/api/products`, `/api/products/:id` |
| inventory | `/api/inventory`, `/api/inventory/summary`, `/api/inventory/shopping-list`, `/api/inventory/:id` |
| recipes | `/api/recipes`, `/api/recipes/:id` |
| donations | `/api/donations`, `/api/donations/summary`, `/api/donations/:id` |
| users | `/api/users`, `/api/users/:id` |

## Cómo correrlo en local

Server:

```bash
cd server
cp .env.example .env
npm install
npm run dev      # http://localhost:3001
```

Client (en otra terminal):

```bash
cd client
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
```

El archivo `client/.env.local` debe tener la dirección del server:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Despliegue en Vercel

Son dos proyectos de Vercel conectados al mismo repositorio:

| Proyecto | Root Directory | Variable de entorno |
| --- | --- | --- |
| Server | `server` | Ninguna |
| Client | `client` | `NEXT_PUBLIC_API_URL` = URL pública del server |

Cada `git push` a `main` vuelve a desplegar el proyecto que cambió.
