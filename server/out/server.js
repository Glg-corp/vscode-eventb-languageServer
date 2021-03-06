"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver_1.TextDocuments();
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
connection.onInitialize((params) => {
    let capabilities = params.capabilities;
    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            // Tell the client that the server supports code completion
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});
connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;
// Cache the settings of all open documents
let documentSettings = new Map();
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.languageServerExample || defaultSettings));
    }
    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});
function validateTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        // // In this simple example we get the settings for every validate run.
        // let settings = await getDocumentSettings(textDocument.uri);
        // // The validator creates diagnostics for all uppercase words length 2 and more
        // let text = textDocument.getText();
        // let pattern = /\b[A-Z]{2,}\b/g;
        // let m: RegExpExecArray | null;
        // let problems = 0;
        // let diagnostics: Diagnostic[] = [];
        // while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
        // 	problems++;
        // 	let diagnostic: Diagnostic = {
        // 		severity: DiagnosticSeverity.Warning,
        // 		range: {
        // 			start: textDocument.positionAt(m.index),
        // 			end: textDocument.positionAt(m.index + m[0].length)
        // 		},
        // 		message: `${m[0]} is all uppercase.`,
        // 		source: 'ex'
        // 	};
        // 	if (hasDiagnosticRelatedInformationCapability) {
        // 		diagnostic.relatedInformation = [
        // 			{
        // 				location: {
        // 					uri: textDocument.uri,
        // 					range: Object.assign({}, diagnostic.range)
        // 				},
        // 				message: 'Spelling matters'
        // 			},
        // 			{
        // 				location: {
        // 					uri: textDocument.uri,
        // 					range: Object.assign({}, diagnostic.range)
        // 				},
        // 				message: 'Particularly for names'
        // 			}
        // 		];
        // 	}
        // 	diagnostics.push(diagnostic);
        // }
        // // Send the computed diagnostics to VSCode.
        // connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    });
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received an file change event');
});
// This handler provides the initial list of the completion items.
connection.onCompletion((_textDocumentPosition) => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
        {
            label: 'machine',
            kind: vscode_languageserver_1.CompletionItemKind.Class,
            data: 1
        },
        {
            label: 'invariants',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 2
        },
        {
            label: 'events',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 3
        },
        {
            label: 'event',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 3
        },
        {
            label: 'variables',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 4
        },
        {
            label: 'where',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 5
        },
        {
            label: 'then',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 6
        },
        {
            label: 'end',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 7
        },
        {
            label: 'any',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 8
        },
        {
            label: 'sets',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 9
        },
        {
            label: 'constants',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 10
        },
        {
            label: 'axioms',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 11
        },
        {
            label: 'refines',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 12
        },
        {
            label: 'sees',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 13
        },
        {
            label: 'with',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 14
        },
        {
            label: 'TRUE',
            kind: vscode_languageserver_1.CompletionItemKind.Value,
            data: 15
        },
        {
            label: 'FALSE',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 16
        },
        {
            label: 'extends',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 17
        },
        {
            label: 'theorem',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 18
        },
        {
            label: 'BOOL',
            kind: vscode_languageserver_1.CompletionItemKind.Keyword,
            data: 19
        },
        {
            label: 'context',
            kind: vscode_languageserver_1.CompletionItemKind.Class,
            data: 20
        }
    ];
});
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
    if (item.data === 1) {
        item.detail = 'TypeScript details';
        item.documentation = 'TypeScript documentation';
    }
    else if (item.data === 2) {
        item.detail = 'JavaScript details';
        item.documentation = 'JavaScript documentation';
    }
    return item;
});
/*
connection.onDidOpenTextDocument((params) => {
    // A text document got opened in VSCode.
    // params.textDocument.uri uniquely identifies the document. For documents store on disk this is a file URI.
    // params.textDocument.text the initial full content of the document.
    connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
    // The content of a text document did change in VSCode.
    // params.textDocument.uri uniquely identifies the document.
    // params.contentChanges describe the content changes to the document.
    connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
    // A text document got closed in VSCode.
    // params.textDocument.uri uniquely identifies the document.
    connection.console.log(`${params.textDocument.uri} closed.`);
});
*/
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map