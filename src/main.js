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
    let current = undefined
    context.subscriptions.push(
        vscode.commands.registerCommand('map.previewLocation', () => {
            MapPreview.getLocation(() => {
                if (current) {
                    current.reveal(vscode.ViewColumn.One)
                } else {
                    current = vscode.window.createWebviewPanel(
                        'map-preview', 'Preview location', vscode.ViewColumn.One, {
                            enableScripts: true,
                        }
                    )
                    current.webview.html = createWebview(context.extensionPath)
                    current.onDidDispose(() => {
                        current = undefined
                    }, null, context.subscriptions)
                }
            }).then((location) => {
                MapPreview.getLocationImages(location).then((images) => {
                    if (!current)
                        return
                    current.webview.postMessage({ type: 'load', images })
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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: data:; script-src 'nonce-${nonce}'; style-src vscode-resource:;">
    <title>Preview location</title>
    <link rel="stylesheet" type="text/css" href="${resource('templates/style.css')}">
    <script type="text/javascript" src="${resource('templates/script.js')}" nonce="${nonce}"></script>
</head>
<body>
    <div id="images">
        <img src="${resource('images/marker.svg')}" id="marker">
    </div>
    <div id="loading">
        <img src="${resource('images/loading.svg')}">
        <p>Loading preview...</p>
    </div>
</body>
</html>`
}
