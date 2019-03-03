// @ts-nocheck
/* eslint-disable no-undef */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        window.addEventListener('message', function(event) {
            if (event.data.type!=='load')
                return
            var loading = document.querySelectorAll('body>div#loading')[0]
            var images = document.querySelectorAll('body>div#images')[0]
            event.data.images.forEach(function(image, index) {
                let img = document.createElement('img')
                img.src = image
                img.style.display = 'none'
                img.setAttribute('id', 'zoom-'+(index+12))
                images.insertBefore(img, images.firstChild)
            })
            loading.style.display = 'none'
            images.setAttribute('data-zoom', 14)
            images.querySelectorAll('img#zoom-14')[0].style.display = 'block'
            images.style.display = 'block'
        })
        document.getElementById('btn-zoom-in').addEventListener('click', function() {
            var images = document.querySelectorAll('body>div#images')[0]
            var zoom = parseInt(images.getAttribute('data-zoom'))
            if (zoom>=12)
                document.getElementById('btn-zoom-out').removeAttribute('disabled')
            if (zoom<16) {
                images.setAttribute('data-zoom', zoom+1)
                images.querySelectorAll('img#zoom-'+(zoom))[0].style.display = 'none'
                images.querySelectorAll('img#zoom-'+(zoom+1))[0].style.display = 'block'
            }
            if (zoom==15) {
                this.setAttribute('disabled', 'disabled')
            }
        })
        document.getElementById('btn-zoom-out').addEventListener('click', function() {
            var images = document.querySelectorAll('body>div#images')[0]
            var zoom = parseInt(images.getAttribute('data-zoom'))
            if (zoom<=16)
                document.getElementById('btn-zoom-in').removeAttribute('disabled')
            if (zoom>12) {
                images.setAttribute('data-zoom', zoom-1)
                images.querySelectorAll('img#zoom-'+(zoom))[0].style.display = 'none'
                images.querySelectorAll('img#zoom-'+(zoom-1))[0].style.display = 'block'
            }
            if (zoom==12) {
                this.setAttribute('disabled', 'disabled')
            }
        })
    })
})()
