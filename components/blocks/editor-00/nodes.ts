import { LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  type Klass,
  type LexicalNode,
  type LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"

import { ImageNode } from "@/components/editor/nodes/image-node"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    QuoteNode,
    ParagraphNode,
    TextNode,
    ListNode,
    ListItemNode,
    LinkNode,
    ImageNode,
  ]
