# MarketDash Mobile UI Specification

## Design reference: Toters Fresh / Instacart style

## Color tokens
- Primary green: #1A9E5C
- Primary green light: #E8F7EF
- Text primary: #1A1A1A
- Text secondary: #6B7280
- Background: #F8F8F8
- Card background: #FFFFFF
- Sale badge: #E53935 background, white text
- Border: #EEEEEE

## Theme Shape & Corner Radius
- **Square-Cornered Aesthetic**: Theme is styled more square than rounded. Elements (cards, buttons, containers, search bars, pills) use lightly rounded corners (`borderRadius: 6px` to `8px`) to appear crisp and square-cornered rather than fully rounded stadium shapes.

## Typography
- Product name: 14px, font-weight 600, color #1A1A1A, max 2 lines (line-clamp-2)
- Product unit: 12px, font-weight 400, color #6B7280
- Price: 16px, font-weight 700, color #1A1A1A
- Compare-at price (strikethrough): 12px, color #9CA3AF, text-decoration line-through
- Section title: 18px, font-weight 700
- "View All" link: 13px, color #1A9E5C

## ProductCard (most important component)
- Width: exactly 160px on mobile (2 columns with 12px gap and 16px side padding)
- Card: white background, border-radius 12px, border 1px solid #EEEEEE, overflow hidden
- NO box shadow
- Image container: width 100%, aspect-ratio 1/1 (square), background #F5F5F5, overflow hidden
  - img: object-fit cover, width 100%, height 100%
  - Sale badge: absolute top-8px left-8px, background #E53935, color white, 
    font-size 11px, font-weight 600, padding 2px 6px, border-radius 4px
- Content area: padding 8px
  - Product name: 14px, 600 weight, line-clamp-2, min-height 40px
  - Unit: 12px, #6B7280, margin-top 2px
  - Price row: margin-top 8px, display flex, align-items center, 
    justify-content space-between
    - Left: price (bold) above compare-at price if exists
    - Right: add button (see below)
- Add button: 32x32px circle, background #E8F7EF, color #1A9E5C, 
  font-size 20px, border none, border-radius 50%
  - When item in cart: replace with quantity stepper 
    (minus button | count | plus button) inline, same green color scheme

## Horizontal product row (per category section on Home)
- Section header: padding 0 16px, display flex, justify space-between, align center
- Scroll container: display flex, overflow-x auto, gap 12px, 
  padding 12px 16px, scrollbar hidden (scrollbar-hide)
- Each card: flex-shrink 0, width 160px

## Home page structure (top to bottom)
1. Search bar — full width, 16px padding sides, height 44px, 
   border-radius 22px, background #F0F0F0, search icon left, 
   placeholder "Search products..."
2. Promo banner — 16px margin sides, border-radius 12px, 
   height 120px, image with overlay text (skip if no image)
3. Category pills row — horizontal scroll, no scrollbar, 
   icons + label, active pill: green background white text, 
   inactive: white background gray text, border 1px #EEE
4. Per-category product rows — section title + View All + horizontal card scroll
   Repeat for each category that has products

## Bottom navigation
- Height: 60px, background white, border-top 1px #EEEEEE
- 5 items: Home, Categories, Search, Orders, Account
- Icon size: 22px
- Label: 11px
- Active: color #1A9E5C
- Inactive: color #9CA3AF
- Safe area: add padding-bottom env(safe-area-inset-bottom)

## Image handling — CRITICAL
- All product images must use: src={product.images?.[0] || '/placeholder.png'}
- Create /client/public/placeholder.png (a simple gray square)
- Never render broken <img> tags — always have fallback
- Add onError handler: onError={(e) => e.target.src = '/placeholder.png'}

## Spacing system
- Page horizontal padding: 16px
- Section vertical gap: 24px
- Card internal padding: 8px
- Card gap in grid: 12px
