import type { ReactNode } from "react";
import {
  cssWidthRows,
  functionDocs,
  optionRows,
  recipeDocs,
  typeDocs,
  type ApiFunctionDoc,
  type ApiRecipeDoc,
} from "./apiDocsModel";
import { Badge, CopyButton, PreBlock, T } from "./ui.tsx";

function tableMd(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
    ...rows.map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`),
  ].join("\n");
}

function functionMd(doc: ApiFunctionDoc): string {
  const params = doc.params
    ? "\n\n" +
      tableMd(
        ["Param", "Type", "Description"],
        doc.params.map((p) => [p.name, p.type, p.description]),
      )
    : "";
  const badge = doc.badge ? ` ${doc.badge}` : "";
  const example = doc.example ? `\n\n\`\`\`ts\n${doc.example}\n\`\`\`` : "";
  return `### \`${doc.title}\`${badge}\n\n${doc.description}\n\n\`\`\`ts\n${doc.signature}\n\`\`\`${params}\n\n**Returns** \`${doc.returns}\`${example}`;
}

function typeMd(doc: (typeof typeDocs)[number]): string {
  return `### \`${doc.title}\`\n\n\`\`\`ts\n${doc.signature}\n\`\`\`${doc.description ? `\n\n${doc.description}` : ""}`;
}

function recipeMd(doc: ApiRecipeDoc): string {
  return `### ${doc.title}\n\n${doc.description}\n\n\`\`\`ts\n${doc.example}\n\`\`\``;
}

function inlineCode(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} className="font-mono">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

function Hr() {
  return <div className="my-8 border-t border-base/15" />;
}

function Signature({ children }: { children: string }) {
  return <PreBlock className="mb-4">{children}</PreBlock>;
}

function DataTable({
  headers,
  rows,
}: {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full font-mono text-s ring-1 ring-base/15 border-collapse">
        <thead>
          <tr className="ring-0 ring-b-base/15 ring-b-1">
            {headers.map((header) => (
              <th
                key={header}
                className="text-left px-3 py-2 text-base/45 uppercase tracking-wider font-normal"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="ring-0 ring-b-base/10 ring-b-1 last:ring-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 align-top text-base leading-body">
                  {inlineCode(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApiSection({
  id,
  title,
  badge,
  copyMd,
  children,
}: {
  id?: string;
  title: string;
  badge?: string;
  copyMd?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-12" data-md={copyMd}>
      <div className="flex items-center gap-3 mb-1">
        <T as="h3" size="l" mono className="leading-heading">
          {title}
        </T>
        {badge && <Badge>{badge}</Badge>}
        {copyMd && (
          <CopyButton
            content={copyMd}
            label="copy md"
            copiedLabel="copied!"
            className="ml-auto px-2 py-0.5 uppercase tracking-wider"
          />
        )}
      </div>
      {children}
    </section>
  );
}

function FunctionSection({ doc }: { doc: ApiFunctionDoc }) {
  return (
    <ApiSection id={doc.id} title={doc.title} badge={doc.badge} copyMd={functionMd(doc)}>
      <T as="p" size="m" role="dim" className="leading-body mb-4">
        {inlineCode(doc.description)}
      </T>
      <Signature>{doc.signature}</Signature>
      {doc.params && (
        <DataTable
          headers={["Param", "Type", "Description"]}
          rows={doc.params.map((p) => [p.name, p.type, p.description])}
        />
      )}
      <div className="flex items-start gap-2 mb-4">
        <Badge>returns</Badge>
        <span className="font-mono text-s text-base">{doc.returns}</span>
      </div>
      {doc.example && (
        <div>
          <T as="p" size="s" mono role="dim" className="mb-1 uppercase tracking-wider">
            Example
          </T>
          <PreBlock>{doc.example}</PreBlock>
        </div>
      )}
    </ApiSection>
  );
}

function TypeSection({ doc }: { doc: (typeof typeDocs)[number] }) {
  return (
    <ApiSection id={doc.id} title={doc.title} copyMd={typeMd(doc)}>
      {doc.description && (
        <T as="p" size="m" role="dim" className="leading-body mb-4">
          {inlineCode(doc.description)}
        </T>
      )}
      <Signature>{doc.signature}</Signature>
    </ApiSection>
  );
}

function RecipeSection({ doc }: { doc: ApiRecipeDoc }) {
  return (
    <ApiSection id={doc.id} title={doc.title} copyMd={recipeMd(doc)}>
      <T as="p" size="m" role="dim" className="leading-body mb-4">
        {inlineCode(doc.description)}
      </T>
      <PreBlock>{doc.example}</PreBlock>
    </ApiSection>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4">
      <T as="h2" size="l" mono className="leading-heading ring-0 ring-b-base/15 ring-b-1 pb-1 mb-6">
        {children}
      </T>
    </div>
  );
}

export default function ApiDocs() {
  const allMd = [
    ...recipeDocs.map(recipeMd),
    ...functionDocs.map(functionMd),
    ...typeDocs.map(typeMd),
    `### TruncateOptions\n\n${tableMd(["Option", "Type", "Default", "Used by"], optionRows)}`,
    `### CssWidth Resolution\n\n${tableMd(["Unit", "Resolves to", "Notes"], cssWidthRows)}`,
  ].join("\n\n---\n\n");

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <T as="h2" size="l" className="leading-heading">
            API Reference
          </T>
          <span className="flex-1" />
          <CopyButton
            content={allMd}
            label="copy md"
            copiedLabel="copied!"
            className="px-2 py-0.5 uppercase tracking-wider"
          />
        </div>
        <T as="p" size="m" role="dim" className="leading-body">
          Practical recipes plus complete signatures, options, and examples for every export.
        </T>
      </div>

      <SectionHeading>Recipes</SectionHeading>
      {recipeDocs.map((doc) => (
        <div key={doc.id}>
          <RecipeSection doc={doc} />
          <Hr />
        </div>
      ))}

      <SectionHeading>Functions</SectionHeading>
      {functionDocs.map((doc) => (
        <div key={doc.id}>
          <FunctionSection doc={doc} />
          <Hr />
        </div>
      ))}

      <SectionHeading>Types</SectionHeading>
      {typeDocs.map((doc) => (
        <div key={doc.id}>
          <TypeSection doc={doc} />
          <Hr />
        </div>
      ))}

      <ApiSection
        id="options"
        title="Options Reference"
        copyMd={`### TruncateOptions\n\n${tableMd(["Option", "Type", "Default", "Used by"], optionRows)}`}
      >
        <DataTable headers={["Option", "Type", "Default", "Used by"]} rows={optionRows} />
      </ApiSection>

      <Hr />

      <ApiSection
        id="css-width-resolution"
        title="CssWidth Resolution"
        copyMd={`### CssWidth Resolution\n\n${tableMd(["Unit", "Resolves to", "Notes"], cssWidthRows)}`}
      >
        <T as="p" size="m" role="dim" className="leading-body mb-4">
          {inlineCode("String `maxWidth` values are parsed at runtime into pixels.")}
        </T>
        <DataTable headers={["Unit", "Resolves to", "Notes"]} rows={cssWidthRows} />
        <T as="p" size="m" role="dim" className="leading-body">
          {inlineCode("Unsupported units like `%` and `fr` throw a descriptive `TypeError`.")}
        </T>
      </ApiSection>
    </div>
  );
}
