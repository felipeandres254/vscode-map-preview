// Module imports
const vscode  = require('vscode')
const Promise = require('bluebird')
const Jimp    = require('jimp')

class MapLocation {
    constructor(latitude, longitude) {
        this.latitude = parseFloat(latitude.toFixed(6))
        this.longitude = parseFloat(longitude.toFixed(6))
    }

    getTile(zoom) {
        let x = Math.floor((this.longitude+180)*Math.pow(2, zoom)/360)
        let y = Math.floor((1-Math.log(Math.tan(this.latitude*Math.PI/180)
            + 1/Math.cos(this.latitude*Math.PI/180))/Math.PI)*Math.pow(2, zoom-1))
        return new MapTile(x, y, zoom)
    }
}

class MapTile {
    constructor(x, y, zoom) {
        this.x = x
        this.y = y
        this.zoom = zoom
    }

    getUrl() {
        return `https://a.tile.openstreetmap.org/${this.zoom}/${this.x}/${this.y}.png`
    }

    getBounds() {
        let n1 = Math.PI-2*Math.PI*this.y/Math.pow(2, this.zoom);
        let n2 = Math.PI-2*Math.PI*(this.y+1)/Math.pow(2, this.zoom);
        return {
            topLeft: new MapLocation(
                180*Math.atan((Math.exp(n1)-Math.exp(-n1))/2)/Math.PI,
                (360*this.x/Math.pow(2, this.zoom)) - 180
            ),
            bottomRight: new MapLocation(
                180*Math.atan((Math.exp(n2)-Math.exp(-n2))/2)/Math.PI,
                (360*(this.x+1)/Math.pow(2, this.zoom)) - 180
            )
        }
    }
}

module.exports = class MapPreview {
    static getLocationImages(location) {
        return Promise.mapSeries(Array.from(Array(17).keys()).splice(12), (zoom) => {
            let tile = location.getTile(zoom)
            let bounds = tile.getBounds()
            return new Promise((resolve, reject) => {
                try {
                    new Jimp(1280, 1280, '0x00000000', (error, image) => {
                        if (error) reject(error)
                        let xx = (tile.x<2 ? 0 : (tile.x>Math.pow(2, tile.zoom)-2 ? Math.pow(2, tile.zoom)-5 : tile.x-2))
                        let yy = (tile.y<2 ? 0 : (tile.y>Math.pow(2, tile.zoom)-2 ? Math.pow(2, tile.zoom)-5 : tile.y-2))
                        let tiles = []
                        for (let x = xx; x < xx+5; x++) {
                            for (let y = yy; y < yy+5; y++) {
                                let nTile = new MapTile(x, y, tile.zoom)
                                tiles.push(
                                    Jimp.read(nTile.getUrl()).then((nImage) => {
                                        return image.blit(nImage, 256*(x-xx), 256*(y-yy))
                                    }).catch((error) => { reject(error) })
                                )
                            }
                        }
                        resolve(Promise.all(tiles).then(() => {
                            let xpx = 256*(location.longitude-bounds.topLeft.longitude)/(bounds.bottomRight.longitude-bounds.topLeft.longitude)
                            let ypx = 256*(location.latitude-bounds.topLeft.latitude)/(bounds.bottomRight.latitude-bounds.topLeft.latitude)
                            image.crop(512+Math.round(xpx)-320, 512+Math.round(ypx)-240, 640, 480)
                            return image.getBase64Async('image/png')
                        }))
                    })
                } catch (error) { reject(error) }
            })
        })
    }

    static getLocation(callback) {
        return vscode.window.showInputBox({
            prompt: 'Enter the location',
            validateInput: (input) => {
                let values = input.split(',').map((value) => { return parseFloat(value) })
                if (values.length != 2)
                    return 'Please enter the latitude and longitude'
                if (isNaN(values[0]) || values[0]<-90 || values[0]>90)
                    return 'The value of latitude is invalid'
                if (isNaN(values[1]) || values[1]<-180 || values[1]>180)
                    return 'The value of longitude is invalid'
                return undefined
            }
        }).then((value) => {
            callback()    // Create webview
            return new MapLocation(
                parseFloat(value.split(',')[0]),
                parseFloat(value.split(',')[1])
            )
        })
    }
}
