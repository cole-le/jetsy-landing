# OpenAI Model Usage Map

This document lists every OpenAI API call in the backend, including model names, endpoints, functions, and source locations.

Note: Line numbers are based on current source and may drift with edits. Paths are absolute within the repo.

## Backend: src/worker.js

- __Generate Business Name__
  - Function: `handleGenerateBusinessName()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - First attempt request: ~3047–3062
    - Model field: ~3054
    - Fallback attempt request: ~3090–3105
    - Fallback model field: ~3097

- __Business Type Detection__
  - Function: `callOpenAIBusinessType()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Endpoint const: ~9703
    - Request and model: ~9735–9739 (model at ~9735)

- __Background Image Prompt Generation with Web Search__
  - Function: `generateWebSearchedBackgroundPrompts()`
  - Endpoint: `https://api.openai.com/v1/responses` (Responses API)
  - Model: `o4-mini`
  - File: `src/worker.js`
  - Lines:
    - Endpoint const: ~9785
    - Request: ~9820–9827
    - Model field in payload: ~9797–9806 (model at ~9797)

- __Template Content Generation__
  - Function: `generateTemplateContent()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10195–10210
    - Model field: ~10202

- __Ad Copy Generation (single prompt)__
  - Function: `handleAdCopyGeneration()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10297–10312
    - Model field: ~10304

- __Ad Creative Background Prompt Research__
  - Function: `handleAdCreativeGeneration()` (research step)
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10391–10406
    - Model field: ~10398

- __Multi-platform Ads Content (Sabri Suby style)__
  - Function: `generateAdsContent()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10730–10745
    - Model field: ~10737

- __Ad Image Prompt (no text images)__
  - Function: `generateImagePromptForAds()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10825–10840
    - Model field: ~10832

- __Auto-fill Business Info__
  - Function: `handleAutoFillBusinessInfo()`
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - File: `src/worker.js`
  - Lines:
    - Fetch call: ~10987–11002
    - Model field: ~10994

