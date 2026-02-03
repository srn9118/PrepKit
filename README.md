# PrepKit – Full‑Stack Meal Planner

PrepKit es una aplicación **full‑stack** para planificar comidas, gestionar recetas y generar listas de la compra de forma automática. Incluye autenticación de usuarios, cálculo nutricional y un planificador semanal visual.

---

## 🚀 Stack Tecnológico

- **Frontend**
  - React + TypeScript
  - React Router
  - Context API para auth
  - CSS/utility classes (estilo tipo dashboard moderno)
- **Backend**
  - Python + FastAPI
  - SQLAlchemy / ORM
  - Autenticación JWT
- **Base de datos**
  - PostgreSQL (o equivalente SQL)
- **Otros**
  - Subida de imágenes (recetas)
  - API REST organizada por módulos

---

## ✨ Funcionalidades Principales

### Autenticación

- Registro de usuario y login.
- Tokens JWT almacenados en el cliente.
- Rutas protegidas en el frontend (solo accesibles si el usuario está autenticado).
- Contexto de autenticación para compartir estado de usuario en toda la app.

### Ingredientes

- CRUD de ingredientes en el backend.
- Cada ingrediente define:
  - Nombre
  - Calorías por 100 g
  - Proteínas por 100 g
  - Carbohidratos por 100 g
  - Grasas por 100 g
- Endpoints para listar, crear, actualizar y borrar ingredientes.
- Interfaz en el frontend para gestionar ingredientes desde el panel.

### Recetas

- Modelo de **Recipe** con relación a usuario e ingredientes.
- Cada receta incluye:
  - Título
  - Descripción
  - Imagen
  - Tiempo de preparación/cocción
  - Número de raciones (servings)
  - Lista de ingredientes con cantidades
- Lógica en el backend para calcular:
  - Calorías totales y por ración
  - Proteínas, carbohidratos y grasas totales y por ración
- En el frontend:
  - Listado de recetas
  - Vista de detalle de receta
  - Formulario para crear/editar receta con:
    - Selección de ingredientes existentes
    - Cantidades por ingrediente
    - Subida de imagen
  - Tarjeta de receta con imagen, nutrición y acciones.

### Subida de imágenes

- Endpoint en el backend para recibir y guardar imágenes de recetas.
- Campo `image_url` en el modelo de receta.
- El frontend envía `FormData` y muestra la imagen subida tanto en el detalle como en el formulario.

### Meal Planner (Planificador Semanal)

Módulo que permite planificar las comidas de toda la semana.

#### Modelo de planificación

- Entidad `MealPlanItem` con:
  - Usuario
  - Receta
  - Fecha (`YYYY-MM-DD`)
  - Tipo de comida (`breakfast`, `lunch`, `dinner`, `snack`)
  - Número de raciones
  - Flag `is_cooked`
  - Información nutricional por ración (para agregados rápidos)

#### Endpoints principales

- `GET /api/planner`  
  Devuelve los `MealPlanItem` de un rango de fechas.
- `POST /api/planner`  
  Crea un nuevo ítem de planificación.
- `PUT /api/planner/{id}`  
  Actualiza raciones o estado (`is_cooked`).
- `DELETE /api/planner/{id}`  
  Elimina un ítem del plan.
- `GET /api/planner/shopping-list`  
  Devuelve la lista de la compra agregada para un rango de fechas.

#### Interfaz de calendario

- Página `/planner` con:
  - Vista semanal (7 días × 4 tipos de comida).
  - Navegación entre semanas (anterior/siguiente).
  - Cada celda de día/tipo de comida muestra:
    - Botón **"+"** si está vacío.
    - `MealSlot` con imagen, título y raciones si hay comida planificada.
- `AddMealModal`:
  - Se abre al pulsar en **"+"**.
  - Búsqueda de recetas existentes.
  - Selección de raciones.
  - Botón **"Add to plan"** que crea el `MealPlanItem` y refresca el calendario.
- Estadísticas semanales:
  - Calorías totales y macros agregados en la semana según lo planificado.

### Shopping List (Lista de la compra)

- Página `/shopping-list`.
- Selección de rango de fechas (por defecto, la semana actual).
- Backend agrega todos los ingredientes de las recetas planificadas en ese rango.
- Se muestra:
  - Lista de ingredientes con:
    - Nombre
    - Cantidad total
    - Unidad
  - Checkboxes para marcar ítems comprados.
  - Opción de impresión (optimizada para impresión del navegador).

### Quick Actions en el dashboard

En la página principal (dashboard) hay un bloque **Quick Actions** con tres accesos rápidos:

- **Plan your meals** → Navega a `/planner`.
- **Browse recipes** → Navega a `/recipes`.
- **Shopping list** → Navega a `/shopping-list`.

Cada acción usa navegación de React Router para mover al usuario a la sección correspondiente.

---

## 🧱 Estructura de carpetas (resumen)

```text
prepkit/
├─ backend/
│  ├─ app/
│  │  ├─ models/        # Modelos SQLAlchemy (User, Ingredient, Recipe, MealPlanItem, etc.)
│  │  ├─ schemas/       # Pydantic schemas
│  │  ├─ routes/        # Rutas /api/auth, /api/ingredients, /api/recipes, /api/planner, ...
│  │  ├─ services/      # Lógica de negocio (nutrición, planner, shopping list)
│  │  └─ main.py        # Aplicación FastAPI
│  └─ ...
└─ frontend/ (o raíz del proyecto React)
   ├─ src/
   │  ├─ api/
   │  │  ├─ client.ts
   │  │  ├─ auth.ts
   │  │  ├─ recipes.ts
   │  │  └─ meal-plan.ts
   │  ├─ components/
   │  │  ├─ Navbar.tsx
   │  │  ├─ RecipeForm.tsx
   │  │  ├─ RecipeCard.tsx
   │  │  ├─ MealSlot.tsx
   │  │  └─ WeeklyCalendar.tsx
   │  ├─ pages/
   │  │  ├─ Login.tsx
   │  │  ├─ Register.tsx
   │  │  ├─ Recipes.tsx
   │  │  ├─ RecipeDetail.tsx
   │  │  ├─ MealPlanner.tsx
   │  │  └─ ShoppingList.tsx
   │  ├─ context/
   │  │  └─ AuthContext.tsx
   │  ├─ types/
   │  │  ├─ auth.ts
   │  │  ├─ recipe.ts
   │  │  └─ meal-plan.ts
   │  ├─ utils/
   │  │  └─ dateHelpers.ts
   │  ├─ App.tsx
   │  └─ main.tsx
   └─ ...
(Ajusta la estructura a cómo tengas realmente organizadas las carpetas.)

⚙️ Puesta en marcha
Backend
bash
# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # en Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones / crear tablas (según configuración)
# ...

# Lanzar servidor
uvicorn app.main:app --reload
El backend quedará disponible en http://localhost:8000 y la documentación automática en http://localhost:8000/docs.

Frontend
bash
# Instalar dependencias
npm install

# Lanzar el servidor de desarrollo
npm run dev
El frontend quedará disponible en algo como http://localhost:5173.

🔐 Variables de entorno
Ejemplos de variables típicas que deben configurarse en un archivo .env (no subir a Git):

Backend:

text
DATABASE_URL=postgresql://user:password@localhost:5432/prepkit
JWT_SECRET=tu_secreto_seguro
JWT_ALGORITHM=HS256
Frontend:

text
VITE_API_BASE_URL=http://localhost:8000
🧭 Rutas principales del Frontend
/login – Login de usuario.

/register – Registro.

/recipes – Listado de recetas.

/recipes/:id – Detalle de receta.

/recipes/create – Crear receta.

/planner – Planificador semanal.

/shopping-list – Lista de la compra.

Todas las rutas (excepto login/registro) están protegidas y requieren usuario autenticado.

✅ Estado actual
MVP completo funcionando:

Autenticación

Gestión de ingredientes

Gestión de recetas con nutrición e imágenes

Meal planner semanal

Shopping list agregada

Código versionado en GitHub.

📌 Ideas futuras
Drag & drop en el planner.

Plantillas de semanas.

Objetivos nutricionales diarios y semanales.

App móvil (por ejemplo, con Flutter) consumiendo la misma API.

Exportación de lista de la compra a PDF o integración con supermercados online.