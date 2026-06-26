/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUB_URL?: string;
  readonly VITE_VAULT_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
