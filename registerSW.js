if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/navigate-in-maplibre/sw.js', { scope: '/navigate-in-maplibre/' })})}