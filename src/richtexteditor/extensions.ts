import {
  boldExtension,
  italicExtension,
  underlineExtension,
  strikethroughExtension,
  linkExtension,
  horizontalRuleExtension,
  TableExtension,
  listExtension,
  historyExtension,
  imageExtension,
  blockFormatExtension,
  htmlExtension,
  MarkdownExtension,
  codeExtension,
  codeFormatExtension,
  HTMLEmbedExtension,
  floatingToolbarExtension,
  contextMenuExtension,
  commandPaletteExtension,
  DraggableBlockExtension,
  ALL_MARKDOWN_TRANSFORMERS,
} from "@lexkit/editor";

// Create markdown extension instance
const markdownExt = new MarkdownExtension().configure({
  customTransformers: ALL_MARKDOWN_TRANSFORMERS,
});

// Define extensions array
export const extensions = [
  boldExtension,
  italicExtension,
  underlineExtension,
  strikethroughExtension,
  linkExtension.configure({
    linkSelectedTextOnPaste: true,
    autoLinkText: true,
    autoLinkUrls: true,
  }),
  horizontalRuleExtension,
  new TableExtension().configure({
    enableContextMenu: true,
    markdownExtension: markdownExt,
  }),
  listExtension,
  historyExtension,
  imageExtension,
  blockFormatExtension,
  htmlExtension,
  markdownExt,
  codeExtension,
  codeFormatExtension,
  new HTMLEmbedExtension().configure({
    markdownExtension: markdownExt,
  }),
  floatingToolbarExtension,
  contextMenuExtension,
  commandPaletteExtension,
  new DraggableBlockExtension().configure({}),
] as const;
