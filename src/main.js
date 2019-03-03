// Module imports
const vscode = require('vscode')
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
                // TODO Create webview
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
