# MarketDash System Architecture & Mobile Migration Plan

This document maps the architecture of the MarketDash application, outlines the web-to-mobile migration strategy, compares the best launch options for Android & iOS, and serves as a living document to track development decisions and scoping.

---

## 1. System Schema & Links

### 1.1 Database Schema (Prisma / SQLite)

The database schema is defined in [schema.prisma](file:///c:/Users/AMR0/Documents/Market-Dash-main/prisma/schema.prisma) and uses a relational model suited for an e-commerce/delivery system:

```mermaid
erDiagram
    User ||--o{ Address : "has"
    User ||--o{ Order : "places"
    User ||--o| Cart : "owns"
    
    Category ||--o{ Product : "contains"
    Category ||--o{ Category : "parent/child"
    
    Cart ||--o{ CartItem : "contains"
    Product ||--o{ CartItem : "in"
    
    Order ||--o{ OrderItem : "contains"
    Product ||--o{ OrderItem : "ordered in"
    Order ||--|| Address : "delivered to"
    
    AdminUser {
        String id PK
        String email UNIQUE
        String passwordHash
        String role
        DateTime createdAt
    }
```

#### Database Entities:
1. **User**: Stores registered customer profiles (name, email, password hash, phone).
2. **Address**: Stores customer delivery addresses with a `isDefault` flag. Multiple addresses map to a single user.
3. **Product**: Contains details for items (name, description, price, compareAtPrice, SKU, stock, unit, weight, and `images` stored as a JSON string array).
4. **Category**: Implements a self-referencing hierarchical structure (`parentId` and `children`) for nesting subcategories.
5. **Cart & CartItem**: Temporary storage matching a customer's pending items before checkout.
6. **Order & OrderItem**: Persistent receipts of checkout operations, containing payment info, status details, and pricing snapshots.
7. **AdminUser**: Administrative accounts with management access.

---

### 1.2 Backend API Routes (Links)

All backend endpoints are prefixed with `/api` and are hosted concurrently in [server.ts](file:///c:/Users/AMR0/Documents/Market-Dash-main/server.ts).

| Route File | Endpoint | Method | Middleware | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | POST | None | Customer account registration |
| | `/api/auth/login` | POST | None | Customer login (returns Access + Refresh tokens) |
| | `/api/auth/admin/login` | POST | None | Admin login |
| | `/api/auth/refresh` | POST | None | Rotate refresh token for a new access token |
| | `/api/auth/logout` | POST | None | Invalidate session |
| **Products**| `/api/products` | GET | None | Fetch all active products |
| | `/api/products/featured` | GET | None | Fetch featured products |
| | `/api/products/search` | GET | None | Search products by query |
| | `/api/products/:id` | GET | None | Get detailed product by ID |
| | `/api/products` | POST | Auth + Admin | Create a new product |
| | `/api/products/:id` | PUT | Auth + Admin | Modify an existing product |
| | `/api/products/:id` | DELETE | Auth + Admin | Delete a product |
| | `/api/products/upload` | POST | Auth + Admin | Upload product images (max 5) |
| **Categories**| `/api/categories` | GET | None | Fetch category listing |
| | `/api/categories/:slug` | GET | None | Get category detail and its items |
| | `/api/categories` | POST | Auth + Admin | Create category |
| | `/api/categories/:id` | PUT | Auth + Admin | Update category |
| | `/api/categories/:id` | DELETE | Auth + Admin | Delete category |
| **Cart** | `/api/cart` | GET | Auth | Retrieve active cart items |
| | `/api/cart/add` | POST | Auth | Add item or increment quantity in cart |
| | `/api/cart/items/:cartItemId`| PUT | Auth | Update item quantity |
| | `/api/cart/items/:cartItemId`| DELETE | Auth | Remove item from cart |
| | `/api/cart` | DELETE | Auth | Clear active cart |
| | `/api/cart/summary` | GET | Auth | Calculate subtotal, delivery fees, and totals |
| **Orders** | `/api/orders` | POST | Auth | Place an order (checkout process) |
| | `/api/orders/my-orders` | GET | Auth | Get current customer's order history |
| | `/api/orders/my-orders/:orderId`| GET | Auth | View specific order details |
| | `/api/orders/my-orders/:orderId/cancel`| POST| Auth| Cancel active order |
| | `/api/orders/admin/all` | GET | Auth + Admin | View all system orders |
| | `/api/orders/admin/stats` | GET | Auth + Admin | Customer/revenue stats for Admin dashboard |
| | `/api/orders/admin/:orderId/status`| PUT | Auth + Admin | Transition order status |
| **Users** | `/api/users/profile` | GET | Auth | Fetch active user profile |
| | `/api/users/profile` | PUT | Auth | Update profile details |
| | `/api/users/change-password`| POST | Auth | Securely reset password |
| | `/api/users/addresses` | GET | Auth | Fetch user's address book |
| | `/api/users/addresses` | POST | Auth | Add a new address |
| | `/api/users/addresses/:addressId`| PUT | Auth | Edit address details |
| | `/api/users/addresses/:addressId`| DELETE | Auth | Delete address |
| | `/api/users/addresses/:addressId/default`| PUT | Auth | Set address as default for delivery |
| **Admin** | `/api/admin/customers` | GET | None* *(To secure)* | List all registered customers |
| **Dev** | `/api/dev/seed` | POST | None | Seed dummy data for testing |
| | `/api/dev/clear` | POST | None | Clear database of mocked data |

---

### 1.3 Frontend Web Routes

Defined via React Router in [App.tsx](file:///c:/Users/AMR0/Documents/Market-Dash-main/src/App.tsx):

*   **Storefront Routes (Wrapped in `Layout`)**:
    *   `/` (Home): Browse banners, category pills, and horizontal product listings.
    *   `/categories`: General categories display.
    *   `/category/:slug`: Detailed view of products in a single category.
    *   `/product/:id`: Detailed page for a product with add-to-cart controls.
    *   `/cart`: Review selected items and adjust quantities.
    *   `/login` / `/register`: Entry points for user accounts.
    *   `/checkout` *(Protected)*: Select address, payment options, and finalize order.
    *   `/orders` *(Protected)*: Track placement and statuses of past orders.
    *   `/orders/:id` *(Protected)*: Specific order summary.
    *   `/account` *(Protected)*: Address book management and profile updates.
*   **Admin Dashboard Routes**:
    *   `/admin/*` (Sub-app): Catalog management, order status dashboard, customer profiles list, and system metrics.

---

## 2. Mobile Launch Options Comparison (Android & iOS)

To take this application to Android and iOS, we have two primary paths. Since the frontend is written in **React**, **TypeScript**, and uses **Zustand** for state, the transition paths are clean:

### Comparison Matrix

| Criteria | Option A: **Capacitor (Ionic Framework)** | Option B: **Expo / React Native (Recommended)** |
| :--- | :--- | :--- |
| **Approach** | Wraps the existing React/Vite SPA in an optimized native WebView container. | Uses React logic to render 100% native platform UI components. |
| **Code Reuse** | **~90-95%**. Shares the exact HTML/CSS/JS frontend build. | **~40-50%**. Reuses state stores, API clients, and hooks, but UI layout requires rewriting. |
| **Look & Feel** | Good. Relies on Tailwind CSS responsive adjustments. May feel like a webapp on older phones. | **Premium / Native**. Smooth gestures, high-frame-rate scrolling, native transitions. |
| **Native Integrations** | Easy via Capacitor plugins (Camera, Push, Geolocation). | Excellent. Broad access to iOS/Android API bindings through Expo. |
| **Dev Velocity** | **Very Fast**. Ready to build and package within days. | **Medium**. Requires drafting native UI wrappers and testing screens. |
| **App Store Approval** | Generally approved if the web interface is high-fidelity and customized for mobile context. | Highly approved. Full native compliance out-of-the-box. |

### Recommendation for Launch
*   **Best Option**: **Expo (React Native)**.
*   **Rationale**: Delivery applications (like Instacart, UberEats, Toters) rely heavily on high-performance listings, cart-steppers, maps, and real-time push events. A web view solution (Capacitor) can feel sluggish during fast-scrolling list pages or complex cart interactions. Expo makes deploying, hot-updating, and publishing to iOS/Android extremely easy using **EAS (Expo Application Services)**, eliminating the typical complexities of Xcode/Android Studio configuration.

---

## 3. 1:1 React Web to Mobile Re-architecting Plan

Here is how the React Web entities map 1:1 to an **Expo React Native** project structure.

### 3.1 Code & Component Translation Map

| React Web Component / File | Expo / React Native Equivalent | Structural Changes / Translation Notes |
| :--- | :--- | :--- |
| **React Router Dom** (`BrowserRouter`, `Routes`) | **Expo Router** (File-based routing) | Map pages to directory structure: `/app/(tabs)/index.tsx`, `/app/product/[id].tsx`, etc. |
| `<div>`, `<section>`, `<header>` | `<View>`, `<SafeAreaView>` | Standard layout blocks. Style with Flexbox (default in React Native). |
| `<p>`, `<span>`, `<h1>` to `<h6>` | `<Text>` | All text nodes must be wrapped inside a Native `<Text>` component. |
| `<img>` | `<Image>` or `expo-image` | Replaces standard image tags. Supports placeholder fade-ins and client-side caching. |
| `<button>`, `<div onClick={...}>` | `<Pressable>` or `<TouchableOpacity>` | Adds ripple feedback (Android) and opacity dimming (iOS) on tap. |
| Tailwind CSS (v4) | `nativewind` or React Native Stylesheets | Tailwind syntax can be converted 1:1 using `nativewind` configuration, or standard JSON styles. |
| Zustand Stores (`useAuthStore`, `useCartStore`) | Shared 1:1 | State stores require **zero modifications**. We can import them straight into the mobile codebase. |
| Axios API Client (`src/api.ts`) | Shared 1:1 (with URL tweak) | Same client can be reused. Change `localhost` endpoint to point to a deployed server IP address. |

---

## 4. Scoping & Scenarios (Project Decisions Log)

This log is used to plan milestones, scopes, and sign off on core design choices.

### 4.1 Scope Phases

*   [ ] **Phase 1: REST API Optimization**
    *   Expose endpoints via a public/staging URL (e.g. tunneling via ngrok or deploying backend to a cloud host).
    *   Verify cookie/token behavior on mobile (Mobile requests store JWT tokens in secure device storage instead of browser cookies).
*   [ ] **Phase 2: Mobile Project Setup**
    *   Initialize Expo application using TypeScript.
    *   Configure `nativewind` for styling continuity.
    *   Install Zustand, Axios, and React Query.
*   [ ] **Phase 3: Core Navigation & Layouts**
    *   Build bottom-tab navigation matching [MOBILE_UI_SPEC.md](file:///c:/Users/AMR0/Documents/Market-Dash-main/MOBILE_UI_SPEC.md) (Home, Categories, Search, Orders, Account).
    *   Recreate the responsive Product Card (steppers, grid margins).
*   [ ] **Phase 4: State Hookup & Flows**
    *   Configure auth tokens in Expo SecureStore.
    *   Hook up the checkout and order placement flows.
*   [ ] **Phase 5: Deploy & Testing**
    *   Distribute internal test builds via Expo Go.
    *   Trigger EAS builds for Android (.aab) and iOS (.ipa).

---

### 4.2 Decisions Log

| Date | Topic | Options Considered | Chosen Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-07-22 | **Mobile Framework Choice** | A: Capacitor<br>B: Expo React Native | **Option B (Expo)** | **Approved** | Offers native performance and gestures necessary for a smooth delivery app experience. |
| 2026-07-22 | **CSS Migration** | A: Native Stylesheets<br>B: NativeWind (Tailwind) | **Option B (NativeWind)** | **Approved** | Preserves existing Tailwind styling from the web layout. |
| 2026-07-28 | **UI Corner Radius / Shape Theme** | A: Fully Rounded / Stadium Pills<br>B: Lightly Rounded / Square-Cornered | **Option B (Lightly Rounded / Square-Cornered)** | **Approved** | App theme is styled more square than rounded — using crisp, lightly rounded corners (4px–8px) across cards, buttons, and containers for a structured, modern aesthetic. |
