# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Documento de Design de Sistema (SDD).

---

# 05-sdd.md — Documento de Design de Sistema (SDD)

Este documento define a arquitetura técnica, stack de desenvolvimento, infraestrutura de rede e topologia de integração de sistemas para o Yachtmax Experience System™.

## 1. Topologia da Arquitetura

O sistema é construído utilizando uma abordagem híbrida (SSG para páginas estáticas de conteúdo editorial e SSR/Client-side para interações dinâmicas e WebGL).

```
[ Comprador / Mobile Browser ]
             |
             |  HTTPS (Lighthouse 95+ Otimizado)
             v
     [ Vercel Edge CDN ]
             |
             +---> [ Next.js Front-End (Static Site / WebGL Canvas) ]
             |
             +---> [ AWS S3 / Cloudinary CDN ] (Modelos 3D GLB & Vídeos HLS)
             |
             v
  [ API Gateway (TLS 1.3) ]
             |
             +---> [ Supabase Database / Auth ] (Metadata, RLS e Logs)
             |
             +---> [ LNX-Core Custom CRM/ERP API ] (Serviço de Negócios / Leads)
```

---

## 2. Stack Tecnológica e Componentes

### A. Front-End (Experience Layer)
*   **Next.js v15 (App Router):** Utilizado com Static Site Generation (SSG) e Incremental Static Regeneration (ISR) para garantir tempos de carregamento de página menores que 1.2s em redes móveis (fator crítico para UHNWIs).
*   **Three.js / React Three Fiber:** Motor de renderização WebGL leve para o Interactive Deck Explorer.
*   **Vanilla CSS Variables:** Sistema de tokens de design implementado de forma nativa para evitar dependências de builds pesados de frameworks como Tailwind, dando controle total ao CXBOK sobre o design system do luxo silencioso.

### B. Mídias e CDN (Media Distribution Layer)
*   **Cloudinary CDN:** Otimização automática e empacotamento dinâmico de imagens Golden Hour e compressão de loops de vídeo em formatos modernos (AVIF, WebP, HLS streaming adaptativo).
*   **AWS S3 Bucket:** Armazenamento central de arquivos 3D brutos (`.glb`/`.gltf`) sincronizados com os dados CAD fornecidos pela infraestrutura industrial da OKEAN.

### C. Barramento de Integração Enterprise (LNX-Core Connection)
*   **LNX-Core API Gateway:** O sistema Next.js interage com a retaguarda corporativa da OKEAN de forma assíncrona, usando Serverless API Routes no Next.js como um proxy reverso para a API privada do **LNX-Core**.
*   **Sincronização Segura:** As credenciais de acesso ao LNX-Core são armazenadas estritamente em variáveis de ambiente seguras na Vercel, nunca vazando para o navegador do cliente.

---

## 3. Segurança e Controle de Acesso (IAM)

### RLS (Row-Level Security)
O banco de dados relacional Supabase armazena tabelas de cache e configurações. O acesso a registros de embarcações off-market é bloqueado no banco de dados por políticas rígidas de Row-Level Security:
```sql
-- Exemplo de política PostgreSQL RLS para pocket listings
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_public_yachts 
ON yachts FOR SELECT 
USING (is_pocket_listing = false);

CREATE POLICY select_pocket_yachts 
ON yachts FOR SELECT 
USING (is_pocket_listing = true AND auth.jwt() ->> 'role' = 'qualified_client');
```

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
