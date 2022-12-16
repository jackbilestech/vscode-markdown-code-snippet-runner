import * as vscode from "vscode";
/**
 * Provide links for the given regex and target template.
 */
export class LinkDefinitionProvider implements vscode.DocumentLinkProvider {
  private pattern: string;
  private flags: string;
  private targetTemplate: string;
  private term?: vscode.Terminal;
  private doc?: vscode.TextDocument;
  constructor(pattern: string, flags: string, targetTemplate: string) {
    this.pattern = pattern;
    this.targetTemplate = targetTemplate;
    this.flags = flags;

    if (!this.flags.includes("g")) {
      this.flags += "g";
    }
  }

  resolveDocumentLink(link: vscode.DocumentLink, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink> {

    try {
      if (!this.term) { this.term = vscode.window.activeTerminal; };

      const text = this.doc?.getText(link.range).trim();
      this.doc && text ? this.term?.sendText(text.substring(1, text.length - 1)) : null;
    } catch (error) {

    }
    const c = new vscode.CancellationTokenSource();
    c.token = token;
    c.cancel();
    c.dispose();

    return new vscode.DocumentLink(link.range);
  }

  provideDocumentLinks(
    document: vscode.TextDocument,
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const regEx = new RegExp(this.pattern, this.flags);
    const text = document.getText();
    const links: vscode.DecorationOptions[] = [];
    this.doc = document;

    let match: RegExpExecArray | null;
    while ((match = regEx.exec(text))) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      // Replace:
      // - $0 with match[0]
      // - $1 with match[1]
      // - \$1 with $1 (respect escape character)
      // - ...etc
      const url = this.targetTemplate
        .replace(/(^|[^\\])\$(\d)/g, (indexMatch, nonEscapeChar, index) => {
          return (
            nonEscapeChar +
            ((match as RegExpExecArray)[Number(index)] ?? `$${index}`)
          );
        })
        .replace(/\\\$/g, "$");
      const decoration: vscode.DocumentLink = {
        range,
        tooltip: 'Run in Terminal'
      };
      links.push(decoration);
    }

    return links;
  }
}