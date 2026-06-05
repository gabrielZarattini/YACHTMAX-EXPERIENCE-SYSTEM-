# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Documento de Indicadores e Gestão de Risco (CMQ/OE).

---

# 08-quality-metrics.md — Indicadores KPI e Análise FMEA

Este documento estabelece as métricas de qualidade digital e percepção de luxo (Luxury Metrics) e apresenta a análise de modos de falha e efeitos (FMEA) para mitigar riscos técnicos e operacionais na plataforma.

## 1. KPIs de Experiência e Percepção de Luxo

Para quantificar a percepção de prestígio e eficácia digital, implementamos quatro métricas exclusivas:

### A. Desire Score™ (Pontuação de Desejo do Lead)
*   **Objetivo:** Medir a intenção e profundidade de interesse do comprador antes do contato direto.
*   **Fórmula de Cálculo:**
    $$\text{Desire Score} = (\text{Tempo de Página (segundos)} \times 0.5) + (\text{Interação WebGL} \times 20) + (\text{Download Media Kit} \times 30)$$
*   **Meta:** leads encaminhados aos brokers devem possuir score mínimo > 50 pontos.

### B. Luxury Score™ (Percepção Premium de UI)
*   **Objetivo:** Garantir que a estética e a velocidade do portal transmitam luxo.
*   **Métricas Técnicas de Suporte:**
    *   *First Contentful Paint (FCP):* < 1.0s.
    *   *Largest Contentful Paint (LCP):* < 1.5s (Lighthouse Performance > 90).
    *   *WebGL Frame Rate (FPS):* Mínimo de 30 FPS estável no desktop e mobile.

### C. Trust Score™ (Confiança e Autoridade do Canal)
*   **Objetivo:** Medir a eficácia dos brokers na conversão orgânica.
*   **Meta:** Tempo médio de resposta inicial do corretor via LNX-Core < 15 minutos para leads qualificados.

---

## 2. Análise de Modos de Falha e Efeitos (FMEA)

A tabela a seguir classifica as falhas operacionais críticas, avaliando Severidade (S), Ocorrência (O) e Detecção (D) de 1 a 10 para determinar o Número de Prioridade de Risco (NPR = S × O × D).

| Modo de Falha | Efeito Potencial | S | O | D | NPR | Plano de Ação & Mitigação |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **F-01: Carregamento lento de vídeo ou WebGL no dispositivo móvel do cliente.** | Perda de credibilidade e abandono da exploração do iate. O portal deixa de parecer premium. | **9** | **4** | **3** | **108** | Implementar compressão HLS dinâmica na Cloudinary CDN. Adicionar fallback automático de imagem estática fotorrealista de alta qualidade caso o Three.js meça FPS < 20. |
| **F-02: Vazamento de dados pessoais ou lista secreta de iates (pocket listings).** | Danos severos à reputação da marca e problemas regulatórios graves perante a LGPD. | **10** | **2** | **2** | **40** | Criptografia AES-256 no banco de dados, auditoria de código para chaves API e ativação obrigatória de políticas de Row-Level Security (RLS) no Supabase. |
| **F-03: Indisponibilidade temporária de conexão com a API LNX-Core.** | Perda de contatos de novos leads e desatualização temporária do inventário de corretores. | **8** | **3** | **2** | **48** | Implementar fila de sincronização de dados (outbox pattern) no front-end utilizando armazenamento temporário criptografado (SessionStorage) com re-tentativa automática em segundo plano. |
| **F-04: Quebra de consistência de design (ex: fontes padrão sendo exibidas no fallback).** | Perda do padrão visual Silent Luxury, reduzindo a estética editorial. | **7** | **3** | **2** | **42** | Declarar as fontes premium na folha de estilos do Next.js com pré-carregamento nativo (`next/font/google`) e fallback explícito de tipografia serif/sans clássica de alta elegância. |

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
