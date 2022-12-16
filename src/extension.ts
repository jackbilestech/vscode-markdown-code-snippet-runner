import * as vscode from "vscode";
import { EXTENSION_NAME, getConfig } from "./config";
import { LinkDefinitionProvider } from "./LinkDefinitionProvider";

let activeRules: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext): void {
	initFromConfig(context);
}

function initFromConfig(context: vscode.ExtensionContext): void {
	const config = getConfig();


	vscode.languages.registerDocumentLinkProvider(
		'*',
		new LinkDefinitionProvider(
			'`{1}[^`].*?`{1}[^`]',
			'',
			''
		)
	);

	for (const rule of activeRules) {
		rule.dispose();
	}
	for (const rule of activeRules) {
		context.subscriptions.push(rule);
	}
}