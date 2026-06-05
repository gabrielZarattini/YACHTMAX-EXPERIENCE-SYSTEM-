# YACHTMAX EXPERIENCE SYSTEM™ — HANDOFF
## KNOWLEDGE CORE STATUS: SOLIDIFIED

---

## 🔮 ESTADO QUÂNTICO DO PROJETO

*   **Sólido (Solid):**
    *   [README.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/README.md) — Design System vNext Beyond Luxury
    *   [docs/bok/](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/) — Suite completa de 9 documentos BoK + Agents QRAM
    *   [web/src/index.css](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/web/src/index.css) — Design System CSS (tokens, glassmorphism, motion)
    *   [web/src/components/CinematicScroller.jsx](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/web/src/components/CinematicScroller.jsx) — Scroll-teller Mobile-First com Three.js, GSAP e Anatomy Boat HUD
    *   [video/](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/video/) — Pipeline Remotion para vídeos programáticos
    *   [DS.md/yachtmax_promo_render.mp4](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/DS.md/yachtmax_promo_render.mp4) — Vídeo H.264 renderizado
*   **Líquido (Liquid):**
    *   Ajustes finos de shaders/materiais MeshPhysicalMaterial no Three.js (reflexões, clearcoat roughness)
    *   Refinamento do mobile drawer animation timing
*   **Gasoso (Gas):**
    *   Raycasting interativo nos hotspots 3D (click-to-zoom)
    *   LNX-Core webhook mock para simulação de leads CRM
    *   Integração com Concierge IA para atendimento via chat no scroll-teller
*   **Plasma (Plasma):**
    *   Realidade Aumentada para visualização de barcos em ambiente real
    *   Voice-first interaction para brokers mobile

---

## 📅 HISTÓRICO DE INTERFERÊNCIAS

### [Sessão 05/06/2026 — Inicialização]
*   **Ação:** Inicialização do repositório Git e definição do repositório remoto oficial.
*   **Commit:** `67aa3ed` — `docs: inicializacao do design system yachtmax`
*   **Descrição:** Adicionado o manifesto filosófico, paleta de cores Midnight Ocean, champagne metal, sandstone, pearl white, escala de tipografia premium, motion design e metas de experiência IA-First.

### [Sessão 05/06/2026 — Sprint Principal]
*   **Ação:** Implementação completa do Experience System com todas as camadas.
*   **Commits Granulares:**

| Hash | Camada | Descrição |
|:-----|:-------|:----------|
| `8f3be2c` | docs(bok) | Suite completa de especificação — 9 documentos + 10 agentes QRAM (UX/UI separados) |
| `58277bd` | feat(design-system) | Tokens CSS midnight-ocean, glassmorphism 2.0, motion engine GSAP+Three.js |
| `753d371` | feat(scroll-teller) | CinematicScroller mobile-first com escultura 3D gold/chrome, anatomy HUD, hotspots projetados |
| `0d7956a` | chore(infra) | Vite React scaffold, dependências (gsap/three/react), assets oficiais yachtmax.com.br |
| `b0d03b9` | assets(media) | Screenshots de validação browser, render Remotion H.264, imagens oficiais |
| `57a69db` | feat(remotion) | Pipeline de vídeo programático para campanhas WhatsApp/Instagram |
| `c95649c` | chore(assets) | Hero image e ícones SVG do scaffold Vite |

---

## 🧠 LEARNINGS & PADRÕES DESCOBERTOS

### Three.js em Scroll-Tellers
- `MeshPhysicalMaterial` com `clearcoat` e `reflectivity` produz resultados superiores ao `MeshStandardMaterial` para metais nobres (ouro/cromo).
- A projeção `Vector3.project(camera)` permite vincular coordenadas 3D a elementos HTML em tempo real, criando HUDs dinâmicos sem overhead de re-render React.
- Atualizar posições de elementos DOM diretamente via `.style.left/.top` dentro do render loop é 60fps-safe e não dispara reconciliação React.

### GSAP + Pointer Events Architecture
- Em scroll-tellers com múltiplos painéis empilhados (position: absolute), é **obrigatório** gerenciar `pointerEvents` via GSAP timeline (`.set()`) para evitar que painéis invisíveis bloqueiem clicks.
- O padrão correto: wrapper div sempre `pointerEvents: 'none'`, inner glass-panel recebe `pointerEvents: 'auto'` apenas quando visível.

### Mobile-First para Luxo Náutico
- Em viewport mobile, a escultura 3D precisa ser reposicionada (y: +0.35) e redimensionada (scale: 0.7) para não competir com os painéis de texto.
- Hotspots devem ter `min-width/height: 32px` mobile (vs 24px desktop) com 48px touch area (WCAG).
- SVG connecting lines devem ser ocultadas em mobile; substituir por bottom drawer com navegação "Próximo Detalhe →".

---

## 🚀 PRÓXIMOS PASSOS (BACKLOG ESTADO GASOSO)
1. Refinar shaders e materiais 3D — especialmente reflexões especulares e environment maps.
2. Implementar raycasting interativo nos 3D hotspots (click-to-zoom com GSAP camera tween).
3. Construir mock webhook LNX-Core para simular inserção de leads quando usuário clica "Falar com Broker" ou "Agendar Café".
4. Expandir Remotion pipeline com templates adicionais (Stories vertical 9:16, LinkedIn landscape 16:9).
5. Integrar analytics de scroll depth para medir engajamento do scroll-teller.

---

## 🛡️ AUDITORIA DE SEGURANÇA
- **Segredos/Chaves no diff:** Zero detectados ✅
- **RLS / JWT bypass check:** N/A (sem backend ativo nesta fase) ✅
- **Credenciais .env:** Excluídas via .gitignore ✅
