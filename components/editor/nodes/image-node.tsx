"use client";

import type { JSX } from "react";
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

function InlineImage({ src, altText }: { src: string; altText: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={altText}
      className="my-4 aspect-[4/3] w-full max-w-full rounded-lg object-cover"
    />
  );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode) {
    return $createImageNode(serializedNode.src, serializedNode.altText);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (domNode: HTMLElement) => {
        if (!(domNode instanceof HTMLImageElement)) {
          return null;
        }

        return {
          conversion: () => convertImageElement(domNode),
          priority: 1,
        };
      },
    };
  }

  constructor(src: string, altText = "", key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.className = "my-4 aspect-[4/3] w-full max-w-full rounded-lg object-cover";

    return { element };
  }

  createDOM() {
    const span = document.createElement("span");
    span.className = "block";
    return span;
  }

  updateDOM() {
    return false;
  }

  decorate(): JSX.Element {
    return <InlineImage src={this.__src} altText={this.__altText} />;
  }
}

function convertImageElement(domNode: HTMLImageElement): DOMConversionOutput {
  const src = domNode.getAttribute("src") ?? "";
  const altText = domNode.getAttribute("alt") ?? "";

  return {
    node: $createImageNode(src, altText),
  };
}

export function $createImageNode(src: string, altText = "") {
  return $applyNodeReplacement(new ImageNode(src, altText));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
