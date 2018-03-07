function onAbout() {
    const shell = require('electron').shell;

    document.getElementById("about-content-wrapper").addEventListener("click", handleClick, false);

    document.getElementById("about-content-wrapper").addEventListener('auxclick', handleClick, false);

    function handleClick(e) {
        var e = window.e || e;
        if (e.target.localName == 'a') {
            e.preventDefault();
            shell.openExternal(e.target.href);
        }
        return
    }
}