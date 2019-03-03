// Module imports
const vscode = require('vscode')
const path   = require('path')
const MapPreview = require('./MapPreview')

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 * @param {vscode.ExtensionContext} context
 */
exports.activate = (context) => {
    context.subscriptions.push(
        vscode.commands.registerCommand('map.previewLocation', () => {
            MapPreview.getLocation(() => {
                const panel = vscode.window.createWebviewPanel(
                    'map-preview', 'Preview location', vscode.ViewColumn.One, {
                        enableScripts: true,
                    }
                )
                panel.webview.html = createWebview(context.extensionPath)
            }).then((location) => {
                MapPreview.getLocationImages(location).then((images) => {
                    // TODO Update webview
                })
            }, (error) => {
                // TODO Dispose webview
                vscode.window.showErrorMessage(error)
            })
        })
    )
}

// This method is called when your extension is deactivated
exports.deactivate = () => {}

/***** WEBVIEW CONTENT *****/
const createWebview = (extensionPath) => {
    const resource = (file) => {
        return vscode.Uri.file(
            path.join(extensionPath, `src/${file}`)
        ).with({scheme: 'vscode-resource'})
    }
    const nonce = (() => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    })()

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}'; style-src vscode-resource:;">
    <title>Preview location</title>
    <link rel="stylesheet" type="text/css" href="${resource('templates/style.css')}">
</head>
<body>
    <div id="loading">
        <img src="${resource('images/loading.svg')}">
        <p>Loading preview...</p>
    </div>
</body>
</html>`
}
