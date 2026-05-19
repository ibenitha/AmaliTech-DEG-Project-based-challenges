# SecureVault Design System

## Typography
- **Primary Font**: Inter (Sans-serif)
- **Scale**:
  - `Base`: 14px (Body text, tree labels)
  - `Small`: 12px (Headers, metadata labels)
  - `Extra Small`: 10px (Status indicators)
  - `Large`: 18px (Properties panel titles)

## Color Palette (Cyber-Secure Dark Mode)
- **Background**: `#0B0F19` (Deep Navy)
- **Surface**: `#151B28` (Dark Blue)
- **Surface Hover**: `#1E2638`
- **Accent**: `#00D1FF` (Cyan) - Primary interaction color
- **Status Green**: `#00FF94` (Emerald) - Secure state indicator
- **Text Primary**: `#E2E8F0`
- **Text Secondary**: `#94A3B8`
- **Border**: `#2D3748`

## Spacing Grid (8px Base)
- `XS`: 4px
- `SM`: 8px
- `MD`: 16px
- `LG`: 24px

## Component States
### Tree Item
- **Default**: Transparent border, primary text.
- **Hover**: Background changes to `var(--surface-hover)`.
- **Selected**: Background changes to semi-transparent Cyan, border left set to Cyan.
- **Focused**: Cyan shadow/ring and border to indicate keyboard focus.

### Search Input
- **Default**: Deep navy background with subtle border.
- **Focus**: Border changes to Cyan.

## Architecture
- **CSS Modules**: Used for component-level isolation.
- **Variables**: Global design tokens defined in `src/styles/variables.css`.
