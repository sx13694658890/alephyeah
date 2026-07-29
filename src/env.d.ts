declare module '*.css';

declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_KNOWLEDGE_PASSWORD?: string;
  }
}
