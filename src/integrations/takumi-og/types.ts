import type { ReactNode } from "react";
import type { Font, OutputFormat } from "takumi-js";

export interface PageDetails {
  title: string;
  description?: string;
  url: string;
  type: string;
  image: string;
}

export type RenderFunctionInput = {
  pathname: string;
  dir: URL;
  document: Document;
} & PageDetails;

export type RenderFunction = (input: RenderFunctionInput) => Promise<ReactNode>;

export interface IntegrationOptions {
  fonts?: Font[];
  width?: number;
  height?: number;
  format?: OutputFormat;
  quality?: number;
  verbose?: boolean;
  drawDebugBorder?: boolean;
}

export interface IntegrationInput {
  options: IntegrationOptions;
  render: RenderFunction;
}
