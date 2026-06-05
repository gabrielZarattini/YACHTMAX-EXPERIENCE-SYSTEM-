# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Documento de Modelagem de Dados (DMBOK v2).

---

# 06-data-model.md — Modelagem de Dados Física e Lógica

Este documento apresenta a especificação do modelo de dados relacional para o Yachtmax Experience System™, projetado sob as diretrizes do DMBOK v2, suportando filtros emocionais, rastreamento de Desire Score™ e sincronização com o LNX-Core.

## 1. Diagrama de Relacionamentos (ERD)

```
  +------------------+          +------------------+
  |     brokers      |          |      yachts      |
  +------------------+          +------------------+
  | PK id (UUID)     |          | PK id (UUID)     |
  |    name          |          |    name          |
  |    avatar_url    |          |    brand         |
  |    email         |          |    size_feet     |
  |    phone_whatsapp|          |    year          |
  |    favorites (arr)----------->   emotional_tags|
  |    lnx_broker_id |          |    asset_3d_url  |
  +--------|---------+          |    is_pocket     |
           |                    +--------|---------+
           |                             |
           |                             |
           v                             v
  +------------------------------------------------+
  |                     leads                      |
  +------------------------------------------------+
  | PK id (UUID)                                   |
  |    name                                        |
  |    contact_phone                               |
  |    contact_email                               |
  | FK broker_id ----------------------------------+
  | FK yacht_id  ----------------------------------+
  |    desire_score                                |
  |    lnx_sync_status                             |
  |    created_at                                  |
  +-----------------------|------------------------+
                          |
                          v
  +------------------------------------------------+
  |                 leads_activity                 |
  +------------------------------------------------+
  | PK id (UUID)                                   |
  | FK lead_id   ----------------------------------+
  |    activity_type (click, 3d_open, video_loop)  |
  |    duration_seconds                            |
  |    timestamp                                   |
  +------------------------------------------------+
```

---

## 2. Dicionário de Dados e SQL DDL

### Tabela `brokers`
Armazena os dados dos corretores de luxo Yachtmax.
```sql
CREATE TABLE brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_whatsapp VARCHAR(50) NOT NULL,
    bio TEXT,
    languages VARCHAR(50)[] NOT NULL,
    favorite_yachts_ids UUID[],
    lnx_broker_id VARCHAR(100) UNIQUE NOT NULL, -- Código de identificação no LNX-Core CRM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `yachts`
Armazena o inventário de iates gerenciados pela Yachtmax.
```sql
CREATE TABLE yachts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    size_feet NUMERIC(5,2) NOT NULL,
    year INT NOT NULL,
    specs JSONB NOT NULL, -- Armazena dados técnicos dinâmicos
    emotional_tags JSONB NOT NULL, -- Ex: {"family_cruiser": true, "day_boat": false}
    asset_3d_url TEXT, -- Link para o arquivo .glb WebGL
    is_pocket_listing BOOLEAN DEFAULT false, -- Pocket listings / Off-market flag
    lnx_yacht_id VARCHAR(100) UNIQUE NOT NULL, -- Código de sincronização no LNX-Core
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `leads`
Armazena a intenção do comprador, vinculando-o ao LNX-Core.
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
    yacht_id UUID REFERENCES yachts(id) ON DELETE SET NULL,
    desire_score INT DEFAULT 0,
    lnx_sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `leads_activity`
Histórico de interações do lead para cálculo de Desire Score™ no front-end.
```sql
CREATE TABLE leads_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'view_details', 'open_3d', 'media_kit_download'
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Índices de Alta Performance
Para suportar buscas dinâmicas em milissegundos, implementamos índices baseados em JSONB:
```sql
-- Índice GIN nas tags emocionais dos iates para aceleração do Smart Search
CREATE INDEX idx_yachts_emotional_tags ON yachts USING GIN (emotional_tags);

-- Índice GIN nas especificações para buscas de texto
CREATE INDEX idx_yachts_specs ON yachts USING GIN (specs);

-- Índice de cobertura para chaves estrangeiras em leads
CREATE INDEX idx_leads_broker_yacht ON leads(broker_id, yacht_id);
```

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
