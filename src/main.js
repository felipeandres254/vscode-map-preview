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
            MapPreview.getLocationImages().then((images) => {
                // TODO
            })
        })
    )
}

// This method is called when your extension is deactivated
exports.deactivate = () => {}
