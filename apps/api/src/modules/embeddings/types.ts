export interface EmbeddingProvider {
  readonly modelName: string;
  readonly dimensions: number;

  embedText(text: string): Promise<number[]>;
  embedTexts(texts: string[]): Promise<number[][]>;
}
