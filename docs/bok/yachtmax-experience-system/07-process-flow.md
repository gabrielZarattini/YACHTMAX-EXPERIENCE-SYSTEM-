# SOFTWARE ENGINEERING INTELLIGENCE
## KNOWLEDGE CORE v2.0.0 | STATUS: ONLINE

> **Yachtmax Experience System™ — BoK Documentation Suite**
> Documento de Fluxo de Processos (BPM CBOK).

---

# 07-process-flow.md — Diagramas de Fluxo BPMN e Interações

Este documento descreve as rotinas operacionais e fluxos de dados de ponta a ponta do Yachtmax Experience System™, mapeando as interações dos brokers, clientes e do sistema LNX-Core.

## 1. Fluxo de Atração e Qualificação Digital (BPMN)

O diagrama a seguir descreve o fluxo de ponta a ponta: da descoberta do lead no Instagram/WhatsApp até o fechamento físico a bordo das instalações da OKEAN.

```
+------------------+     +------------------+     +--------------------+
| 1. Descoberta    |     | 2. Engajamento   |     | 3. Qualificação    |
| (Broker Profile/ |---->| (Smart Search/   |---->| (Desire Score™ &   |
|   Social Media)  |     |   WebGL Explorer)|     |  3D Interaction)   |
+------------------+     +------------------+     +---------|----------+
                                                            |
                                                            v
+------------------+     +------------------+     +--------------------+
| 6. Experiência   |     | 5. Sincronização |     | 4. Conversão       |
| (Café na Marina/ |<----| (LNX-Core CRM    |<----| (Solicitar Visita/ |
|  Sea Trial OKEAN)|     |  Lead Register)  |     |   WhatsApp Link)   |
+------------------+     +------------------+     +--------------------+
```

---

## 2. Roteiro Passo a Passo das Interações

### Fase A: Ações do Cliente (Portal Web)
1.  **Exploração Visual:** O comprador acessa o portal e inicia a busca pelo painel de buscas baseado em filtros emocionais (Smart Search).
2.  **Imersão Tridimensional:** O usuário clica no **Yacht Card 3.0** e abre o visualizador WebGL (Interactive Deck Explorer) para analisar o iate. O sistema monitora as interações em background.
3.  **Conversão de Alta Intenção:** O cliente decide agendar uma visita privada ("Agendar Café na Marina") ou clica para iniciar conversa rápida por WhatsApp com o broker indicado no perfil da embarcação.

### Fase B: Lógica de Back-End e Integração LNX-Core
4.  **Pontuação do Lead:** O sistema Next.js calcula o score de engajamento do cliente localmente (Desire Score™).
5.  **Registro de Entrada:** Quando o cliente se identifica ou aciona o WhatsApp do broker, o sistema Next.js envia os dados do lead e a pontuação para a API do **LNX-Core**.
6.  **Criação de Oportunidade:** O LNX-Core (desenvolvido pelo co-fundador da Linx) recebe o lead, valida se o corretor já está associado e gera um ticket de alta prioridade na fila de atendimento do broker no aplicativo corporativo da OKEAN.

### Fase C: Ação do Broker (Atendimento Físico)
7.  **Follow-up Imediato:** O broker recebe a notificação no aplicativo com todo o histórico de navegação do cliente (quais conveses ele olhou no 3D e qual iate gerou maior Desire Score™).
8.  **Envio do Kit de Mídia:** O broker entra em contato direto via WhatsApp enviando o link do Media Kit digital exclusivo com renders da Golden Hour e vídeos cinematográficos adaptados.
9.  **Fechamento a Bordo:** O broker agenda o encontro presencial para o café na marina no Guarujá ou agenda o teste de mar (Sea Trial) sob suporte da infraestrutura logística OKEAN.

---
→ ALIGN  →  INTEGRATE  →  OPTIMIZE  →  INNOVATE  →  TRANSFORM  →  DELIVER VALUE

**SYSTEM STATUS: ALL SYSTEMS OPERATIONAL**
