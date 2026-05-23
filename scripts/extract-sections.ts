/**
 * Brasa CMS — Section Manifest Extractor
 *
 * Le todos os componentes em src/components/sections/,
 * extrai as interfaces Props com JSDoc annotations,
 * e gera src/manifest.json.
 *
 * Uso: pnpm run manifest
 */

import { Project, SyntaxKind, type InterfaceDeclaration, type TypeAliasDeclaration, type PropertySignature, type Node } from "ts-morph";
import * as path from "path";
import * as fs from "fs";

import type { FieldSchema, FieldType, FieldFormat, SectionSchema, BrasaManifest } from "../packages/brasa-core/src/manifest";

const SECTIONS_DIR = path.resolve(__dirname, "../src/components/sections");
const OUTPUT_PATH = path.resolve(__dirname, "../src/manifest.json");

// Widget type → format mapping
const WIDGET_FORMATS: Record<string, FieldFormat> = {
  ImageWidget: "image",
  RichText: "rich-text",
  Color: "color",
  VideoWidget: "url",
};

function getJsDocTag(node: PropertySignature, tag: string): string | undefined {
  const jsDocs = node.getJsDocs();
  for (const doc of jsDocs) {
    for (const jsTag of doc.getTags()) {
      if (jsTag.getTagName() === tag) {
        return jsTag.getCommentText()?.trim();
      }
    }
    // Also check raw comment for inline @tag patterns
    const comment = doc.getComment();
    if (typeof comment === "string") {
      const match = comment.match(new RegExp(`@${tag}\\s+(.+?)(?:\\s*@|$)`));
      if (match) return match[1].trim();
    }
  }
  return undefined;
}

function getJsDocDescription(node: PropertySignature): string | undefined {
  const jsDocs = node.getJsDocs();
  for (const doc of jsDocs) {
    // First check for @description tag
    const descTag = getJsDocTag(node, "description");
    if (descTag) return descTag;

    // Then use the main comment text (filtering out @tags)
    const comment = doc.getComment();
    if (typeof comment === "string") {
      const cleaned = comment.replace(/@\w+\s+[^\n]*/g, "").trim();
      if (cleaned) return cleaned;
    }
  }
  return undefined;
}

function resolveFieldType(prop: PropertySignature): FieldSchema {
  const typeNode = prop.getTypeNode();
  let type = prop.getType();
  const isOptional = prop.hasQuestionToken();

  // Strip undefined from optional union types (e.g. "string | undefined" → "string")
  if (type.isUnion()) {
    const nonUndefined = type.getUnionTypes().filter((t) => !t.isUndefined());
    if (nonUndefined.length === 1) {
      type = nonUndefined[0];
    }
  }

  const typeText = type.getText(prop);

  const title = getJsDocTag(prop, "title");
  const description = getJsDocDescription(prop);
  const format = getJsDocTag(prop, "format") as FieldFormat | undefined;
  const defaultVal = getJsDocTag(prop, "default");
  const hide = getJsDocTag(prop, "hide");
  const group = getJsDocTag(prop, "group");
  const options = getJsDocTag(prop, "options");

  if (hide !== undefined) {
    return { type: "string", format: "hidden", title, required: !isOptional };
  }

  // Check for widget types (handle import paths like "import(...).ImageWidget")
  const simpleType = typeText.replace(/import\(.+?\)\./g, "");

  // Also check the type annotation text directly from the source
  const typeAnnotation = typeNode?.getText() || "";
  const typeNameToCheck = typeAnnotation.replace(/import\(.+?\)\./g, "") || simpleType;

  for (const [widgetName, widgetFormat] of Object.entries(WIDGET_FORMATS)) {
    if (simpleType === widgetName || typeNameToCheck === widgetName) {
      return {
        type: "string",
        format: format || widgetFormat,
        title,
        description,
        required: !isOptional,
        default: defaultVal,
        group,
      };
    }
  }

  // Also honor @format from JSDoc even if type is plain string
  if (format && (type.isString() || simpleType === "string")) {
    return {
      type: "string",
      format,
      title,
      description,
      required: !isOptional,
      default: defaultVal,
      group,
    };
  }

  // Options → select
  if (options) {
    return {
      type: "string",
      format: "select",
      title,
      description,
      required: !isOptional,
      default: defaultVal,
      options: options.split(",").map((o) => o.trim()),
      group,
    };
  }

  // Object / Interface (inline or referenced) — check BEFORE primitives
  // because TS might resolve type aliases to their underlying type
  if (type.isObject() && !type.isArray() && !type.isString() && !type.isNumber() && !type.isBoolean()) {
    const objProps = type.getProperties();
    // Filter out built-in properties (from String, Number prototypes etc)
    const declaredProps = objProps.filter((p) => {
      const decls = p.getDeclarations();
      return decls.length > 0 && decls.some((d) =>
        d.getSourceFile().getFilePath().includes("/src/") ||
        d.getSourceFile().getFilePath().includes("/packages/")
      );
    });
    if (declaredProps.length > 0) {
      const properties: Record<string, FieldSchema> = {};
      for (const objProp of declaredProps) {
        const decl = objProp.getDeclarations()[0];
        if (decl && decl.getKind() === SyntaxKind.PropertySignature) {
          properties[objProp.getName()] = resolveFieldType(decl as PropertySignature);
        }
      }
      if (Object.keys(properties).length > 0) {
        return {
          type: "object",
          title,
          description,
          required: !isOptional,
          properties,
          group,
        };
      }
    }
  }

  // Union of string literals → select
  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    const allLiterals = unionTypes.every((t) => t.isStringLiteral());
    if (allLiterals) {
      return {
        type: "union",
        format: "select",
        title,
        description,
        required: !isOptional,
        default: defaultVal,
        options: unionTypes.map((t) => t.getLiteralValue() as string),
        group,
      };
    }
  }

  // Primitives
  if (type.isString() || simpleType === "string") {
    return {
      type: "string",
      format: format || "text",
      title,
      description,
      required: !isOptional,
      default: defaultVal,
      group,
    };
  }

  if (type.isNumber() || simpleType === "number") {
    return {
      type: "number",
      format: format,
      title,
      description,
      required: !isOptional,
      default: defaultVal ? Number(defaultVal) : undefined,
      group,
    };
  }

  const resolvedText = type.getText(prop).replace(/ \| undefined/g, "").trim();
  if (type.isBoolean() || type.isBooleanLiteral() || simpleType === "boolean" || resolvedText === "boolean" || simpleType === "false | true" || simpleType === "true | false") {
    return {
      type: "boolean",
      title,
      description,
      required: !isOptional,
      default: defaultVal === "true" ? true : defaultVal === "false" ? false : undefined,
      group,
    };
  }

  // Array
  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    if (elementType) {
      const itemSchema = resolveTypeToSchema(elementType, prop);
      return {
        type: "array",
        title,
        description,
        required: !isOptional,
        items: itemSchema,
        group,
      };
    }
  }

  // Fallback
  return {
    type: "string",
    format: format || "text",
    title,
    description,
    required: !isOptional,
    default: defaultVal,
    group,
  };
}

function resolveTypeToSchema(type: any, context: Node): FieldSchema {
  if (type.isString()) return { type: "string", format: "text" };
  if (type.isNumber()) return { type: "number" };
  if (type.isBoolean()) return { type: "boolean" };

  if (type.isObject() && !type.isArray()) {
    const properties: Record<string, FieldSchema> = {};
    for (const prop of type.getProperties()) {
      const decl = prop.getDeclarations()[0];
      if (decl && decl.getKind() === SyntaxKind.PropertySignature) {
        properties[prop.getName()] = resolveFieldType(decl as PropertySignature);
      }
    }
    return { type: "object", properties };
  }

  return { type: "string", format: "text" };
}

function extractPropsFromInterface(iface: InterfaceDeclaration): Record<string, FieldSchema> {
  const props: Record<string, FieldSchema> = {};
  for (const member of iface.getProperties()) {
    props[member.getName()] = resolveFieldType(member);
  }
  return props;
}

function extractPropsFromTypeAlias(alias: TypeAliasDeclaration): Record<string, FieldSchema> {
  const type = alias.getType();
  const props: Record<string, FieldSchema> = {};
  for (const prop of type.getProperties()) {
    const decl = prop.getDeclarations()[0];
    if (decl && decl.getKind() === SyntaxKind.PropertySignature) {
      props[prop.getName()] = resolveFieldType(decl as PropertySignature);
    }
  }
  return props;
}

function main() {
  if (!fs.existsSync(SECTIONS_DIR)) {
    fs.mkdirSync(SECTIONS_DIR, { recursive: true });
    console.log(`Created sections directory: ${SECTIONS_DIR}`);
  }

  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, "../tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  // Add section files
  const sectionFiles = fs.readdirSync(SECTIONS_DIR).filter((f) => f.endsWith(".tsx"));

  if (sectionFiles.length === 0) {
    console.log("No section files found in src/components/sections/");
    const manifest: BrasaManifest = { generatedAt: new Date().toISOString(), sections: [] };
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
    console.log(`Empty manifest written to ${OUTPUT_PATH}`);
    return;
  }

  const sections: SectionSchema[] = [];

  for (const file of sectionFiles) {
    const filePath = path.join(SECTIONS_DIR, file);
    const sourceFile = project.addSourceFileAtPath(filePath);
    const componentName = path.basename(file, ".tsx");

    // Look for exported "Props" interface or type alias
    let propsSchema: Record<string, FieldSchema> | null = null;

    const propsInterface = sourceFile.getInterface("Props");
    if (propsInterface && propsInterface.isExported()) {
      propsSchema = extractPropsFromInterface(propsInterface);
    }

    if (!propsSchema) {
      const propsType = sourceFile.getTypeAlias("Props");
      if (propsType && propsType.isExported()) {
        propsSchema = extractPropsFromTypeAlias(propsType);
      }
    }

    if (!propsSchema) {
      console.log(`  Skipping ${file} — no exported Props interface/type found`);
      continue;
    }

    // Get component-level JSDoc from the Props interface/type
    const propsNode = sourceFile.getInterface("Props") || sourceFile.getTypeAlias("Props");
    let sectionTitle = componentName;
    let sectionDescription: string | undefined;
    let sectionGroup: string | undefined;

    if (propsNode) {
      const jsDocs = propsNode.getJsDocs();
      for (const doc of jsDocs) {
        const comment = doc.getComment();
        if (typeof comment === "string") {
          const titleMatch = comment.match(/@title\s+(.+?)(?:\s*@|$)/);
          if (titleMatch) sectionTitle = titleMatch[1].trim();
          const descMatch = comment.match(/@description\s+(.+?)(?:\s*@|$)/);
          if (descMatch) sectionDescription = descMatch[1].trim();
          const groupMatch = comment.match(/@group\s+(.+?)(?:\s*@|$)/);
          if (groupMatch) sectionGroup = groupMatch[1].trim();
        }
        for (const tag of doc.getTags()) {
          if (tag.getTagName() === "title") sectionTitle = tag.getCommentText()?.trim() || sectionTitle;
          if (tag.getTagName() === "description") sectionDescription = tag.getCommentText()?.trim();
          if (tag.getTagName() === "group") sectionGroup = tag.getCommentText()?.trim();
        }
      }
    }

    sections.push({
      key: componentName,
      title: sectionTitle,
      description: sectionDescription,
      group: sectionGroup,
      path: `sections/${componentName}`,
      props: propsSchema,
    });

    console.log(`  ${componentName}: ${Object.keys(propsSchema).length} props`);
  }

  const manifest: BrasaManifest = {
    generatedAt: new Date().toISOString(),
    sections,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest generated: ${OUTPUT_PATH}`);
  console.log(`${sections.length} sections extracted`);
}

main();
