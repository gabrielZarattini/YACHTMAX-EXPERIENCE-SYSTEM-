# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Documento de Requisitos Funcionais (FRD).

---

# 04-frd.md — Documento de Requisitos Funcionais (FRD)

Este documento especifica os fluxos de dados, comportamentos do sistema e regras de negócio funcionais que regem a inteligência e as integrações do Yachtmax Experience System™.

## 1. Módulo Smart Search (Busca Emocional & Tags)

### FR-SS-01: Processamento de Tags Emocionais
*   **Comportamento:** O sistema deve filtrar o catálogo de iates mapeando as tags emocionais (`emotional_tags`) associadas a cada registro no banco de dados.
*   **Regra de Negócio:** Se o usuário selecionar "Family Cruiser", o sistema faz uma busca lógica retornando apenas os iates onde a tag `family_cruiser` é igual a `true` ou possui peso de relevância > 0.8 no modelo de classificação.
*   **Fallback:** Caso nenhum iate satisfaça a tag emocional selecionada, o sistema deve sugerir iates alternativos com menor pontuação de tag, exibindo uma mensagem sutil (ex: "Exibindo outras embarcações ideais para longas jornadas").

---

## 2. Módulo de Integração LNX-Core Custom API

Em substituição ao HubSpot CRM, todas as comunicações com a retaguarda empresarial do grupo são realizadas através de chamadas seguras para os endpoints do **LNX-Core API**.

### FR-LNX-01: Cadastro de Leads e Eventos
*   **Comportamento:** Quando um cliente clica em "Agendar Café" ou envia um formulário de contato, a aplicação Next.js realiza um POST assíncrono para o endpoint `/api/v1/leads/register` da API do LNX-Core.
*   **Payload do POST:**
    ```json
    {
      "lead_name": "Gabriel Zarattini",
      "lead_contact": "+55 11 99999-9999",
      "preferred_broker_id": "uuid-broker-01",
      "target_yacht_id": "uuid-yacht-123",
      "interaction_type": "cafe_marina",
      "utm_source": "instagram_organic",
      "client_analytics": {
        "desire_score": 85,
        "viewed_3d_deck": true
      }
    }
    ```

### FR-LNX-02: Rastreamento do "Desire Score™"
*   **Comportamento:** O sistema monitora a atividade do cliente na página de detalhes de um iate (tempo de visualização das fotos, abertura do tour 3D WebGL e download do PDF de especificações).
*   **Regra:** Se o tempo acumulado na página de um iate exceder 45 segundos e o tour 3D for acionado, o sistema adiciona +30 pontos ao `desire_score` do usuário localmente. O valor consolidado é transmitido para o LNX-Core no momento em que o lead se identifica.

---

## 3. Módulo WebGL (Interactive Deck Explorer)

### FR-3D-01: Renderização Tridimensional do Layout
*   **Comportamento:** O componente gráfico deve instanciar uma cena Three.js utilizando o arquivo de modelo 3D otimizado (`.glb`/`.gltf`) baixado assincronamente da CDN.
*   **Regra de Fallback de Performance:** O sistema deve medir a taxa de quadros (FPS) nos primeiros 2 segundos de renderização. Se o FPS for menor que 20, o visualizador 3D deve ser desativado automaticamente, exibindo em seu lugar uma galeria de imagens estáticas 360° de alta resolução com uma transição suave.
*   **Controle de Câmera:** Bloquear zoom excessivo e eixos de câmera que possam ultrapassar as paredes do modelo 3D do iate, garantindo a integridade visual da apresentação.

---

## 4. Módulo de Reprodução de Vídeo CDN (Video Loops)

### FR-VD-01: Player Cinematográfico de Alta Performance
*   **Comportamento:** Loops de vídeo de 5 a 8 segundos da Golden Hour devem ser transmitidos via HLS (HTTP Live Streaming) utilizando URLs dinâmicas da Cloudinary CDN.
*   **Regra:** O player deve ajustar automaticamente a resolução do vídeo (1080p, 720p ou 480p) dependendo da largura de banda do dispositivo móvel do usuário para evitar buffering e congelamento, que arruinariam a percepção de luxo silencioso.

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
