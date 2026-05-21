# Comugest — Frontend

Aplicación web SaaS para administradores de fincas y vecinos.

## Stack

- **Vite + React 18 + TypeScript**
- **React Router v6** para enrutado
- **TanStack Query** para estado servidor (preparado, listo para usar en módulos siguientes)
- **React Hook Form + Zod** para formularios validados
- **Tailwind CSS** con paleta personalizada (verde oliva sobre crema, acentos terracota)
- **i18next** para español e inglés
- **Vitest + Testing Library** para tests

## Estructura

```
src/
├── api/            # Cliente axios + funciones por dominio (auth, invitations…)
├── components/     # UI compartida (Layout, ProtectedRoute, LanguageSwitcher)
├── contexts/       # AuthContext con login/register/logout
├── i18n/           # Configuración + locales es/en
├── lib/            # Schemas Zod
├── pages/          # Una página por ruta
├── types/          # Tipos compartidos
├── test/           # Setup y tests Vitest
├── App.tsx         # Rutas
├── main.tsx        # Entry point
└── index.css       # Tailwind + componentes globales
```

## Cómo arrancar

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:5173`. Asume que el backend está en `http://localhost:4000` (configurable via `VITE_API_URL`).

## Flujos implementados

### Login y registro

- `/login` — entrar con email + contraseña
- `/register` — registro de vecinos o administradores
- Tras registrarse, el usuario va a `/check-email` y debe verificar su correo

### Verificación de email

- `/verify-email?token=…` — al hacer clic en el enlace del correo recibido, la cuenta se activa y se inicia sesión automáticamente
- En `/check-email` se puede solicitar el reenvío del correo

### Invitaciones (admin → vecino)

- `/admin/invite` — el administrador rellena un formulario con los datos del nuevo vecino (nombre, email, comunidad, unidad, tipo de relación)
- El backend crea el usuario en estado `INVITED` y envía un correo al destinatario
- `/accept-invitation?token=…` — el vecino abre el enlace, ve la invitación, define su contraseña y entra activado

### Rutas protegidas

`<ProtectedRoute>` envuelve las páginas que requieren autenticación. Acepta `allowedRoles` para restringir por rol:

```tsx
<ProtectedRoute allowedRoles={['ADMIN_FINCAS', 'SUPPORT']}>
  <InviteResidentPage />
</ProtectedRoute>
```

## i18n

Cambiar idioma desde el componente `<LanguageSwitcher />` presente en todas las pantallas. El idioma se persiste en `localStorage`.

Añadir nuevas claves: edita `src/i18n/locales/es.json` y `en.json`. Los tipos no están generados automáticamente (i18next no obliga a hacerlo), pero conviene mantener ambos archivos en sincronía.

## Tests

```bash
npm test          # corre todos los tests una vez
npm run test:watch
```

## Diseño

La paleta se define en `tailwind.config.js`:
- **olive** (verde oliva): color principal de marca, navegación, botones
- **cream** (crema): fondo neutro
- **clay** (terracota): solo para acentos y errores

Tipografía:
- **Fraunces** (serif moderna) para títulos y display
- **Geist** (sans neutra) para cuerpo
- **Geist Mono** para IDs y datos técnicos

Cargadas desde Google Fonts en `index.html`.

## Próximos pasos

- [ ] Módulo de comunidades (CRUD desde la UI del admin)
- [ ] Selector de comunidad/unidad real en el formulario de invitación (sustituir IDs en crudo)
- [ ] Listado de invitaciones enviadas con estado (pendiente, aceptada, caducada)
- [ ] Sistema de mensajes en tiempo real (WebSockets)
- [ ] Carga y reparto de facturas con vista de morosos para admin
- [ ] Tablón de anuncios con notificaciones push
- [ ] Recuperación de contraseña
