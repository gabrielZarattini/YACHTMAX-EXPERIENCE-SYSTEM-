# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Índice de documentação conceitual, técnica e física de engenharia.

---

# 00-index.md — Índice e Matriz de Rastreabilidade

Este documento serve como mapa de navegação para a suite de especificações BoK e define a matriz de rastreabilidade que interconecta os requisitos de mercado, negócio, funcionais e a arquitetura física.

## 1. Família de Documentos BoK

Toda a documentação técnica está estruturada na seguinte trilha:

| Documento | Identificador | Escopo Principal | Estado |
| :--- | :--- | :--- | :---: |
| **Índice & Rastreabilidade** | [00-index.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/00-index.md) | Índice geral e mapeamento de dependências | Sólido (Sealed ✅) |
| **Requisitos de Mercado (MRD)** | [01-mrd.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/01-mrd.md) | Análise de concorrência, tendências de luxo e WebGL | Sólido (Sealed ✅) |
| **Requisitos de Negócio (BRD)** | [02-brd.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/02-brd.md) | Investimento OKEAN, fluxos LNX-Core e monetização | Sólido (Sealed ✅) |
| **Requisitos do Produto (PRD)** | [03-prd.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/03-prd.md) | Smart Search, Broker Cards, WebGL Explorer, Silent Luxury | Sólido (Sealed ✅) |
| **Requisitos Funcionais (FRD)** | [04-frd.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/04-frd.md) | Regras lógicas de WebGL, busca emocional, integração API | Sólido (Sealed ✅) |
| **Design de Sistema (SDD)** | [05-sdd.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/05-sdd.md) | Arquitetura Next.js, Cloudinary CDN e API LNX-Core | Sólido (Sealed ✅) |
| **Modelagem de Dados (DMBOK)** | [06-data-model.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/06-data-model.md) | Schemas de banco, tabelas de iates, RLS e dados LNX | Sólido (Sealed ✅) |
| **Fluxo de Processo (BPMN)** | [07-process-flow.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/07-process-flow.md) | Roteiro do corretor, Kit de Mídia, integração LNX API | Sólido (Sealed ✅) |
| **Métricas & Riscos (CMQ/OE)** | [08-quality-metrics.md](file:///c:/Users/gabri/OneDrive%20-%20OKEAN%20ESTALEIRO%20S.A/Onedrive%20OKEAN%20-%20Marketing/Elementos%20Gr%C3%A1ficos/03%20-%20YACHTMAX/03-%20Experience%20System/docs/bok/yachtmax-experience-system/08-quality-metrics.md) | KPIs de luxo (Desire/Trust), FMEA e planos de mitigação | Sólido (Sealed ✅) |

---

## 2. Matriz de Rastreabilidade Vertical

A matriz a seguir mapeia a jornada de cada requisito, provando o alinhamento de ponta a ponta:

| ID Requisito Mercado | ID Requisito Negócio | ID Requisito Produto | ID Requisito Funcional | Componente de Sistema (SDD/DMBOK) |
| :--- | :--- | :--- | :--- | :--- |
| **MR-01:** Demanda por experiências WebGL/3D | **BR-01:** Conversão visual remota e pre-qualificação | **PR-01:** Interactive Deck Explorer 3D | **FR-01:** Renderizador Three.js e carregamento assíncrono de arquivos `.glb` | `src/components/DeckExplorer.tsx` / `Tabela yachts.asset_3d_url` |
| **MR-02:** Foco em privacidade de dados UHNWI | **BR-02:** Conformidade com a LGPD e pocket listings confidenciais | **PR-02:** Portal Off-Market de listagens restritas | **FR-02:** Controle de acesso baseado em roles (RBAC) e RLS de banco | `src/middleware/auth.ts` / `Supabase Row-Level Security` |
| **MR-03:** Dispositivos Móveis como canal de descoberta | **BR-03:** Atração orgânica de leads via brokers ativos no WhatsApp | **PR-03:** Broker Cards humanizados integrados ao CRM corporativo | **FR-03:** Sincronização em tempo real de contatos com a API do **LNX-Core** | `src/services/lnxSync.ts` / `Tabela brokers` & `leads` |
| **MR-04:** Vídeo-first e mídias de alto impacto | **BR-04:** Entrega imediata de Kits de Mídia fotorrealistas | **PR-04:** Media Kit Player adaptável a conexões móveis | **FR-04:** Stream adaptável HLS de loops de vídeo otimizados | `src/components/VideoPlayer.tsx` / `Cloudinary CDN Dynamic Delivery` |

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
