export const Icons = {
    send: "assets/icons/send.svg",
    plus: "assets/icons/circle-plus.svg",
    settings: "assets/icons/settings.svg",
    menu: "assets/icons/menu.svg",
    search: "assets/icons/search.svg",

    copy: "assets/icons/copy-plus.svg",
    download: "assets/icons/download.svg",
    check: "assets/icons/circle-check-big.svg",

    chevronUp: "assets/icons/chevron-up.svg",
    chevronDown: "assets/icons/chevron-down.svg",

    refresh: "assets/icons/rotate-cw.svg",

    thumbsUp: "assets/icons/thumbs-up.svg",
    thumbsDown: "assets/icons/thumbs-down.svg",

    trash: "assets/icons/trash-2.svg",
    pencil: "assets/icons/pencil.svg",

    user: "assets/icons/user-round.svg",
    bot: "assets/icons/bot.svg",
    sparkles: "assets/icons/sparkles.svg",

    code: "assets/icons/code.svg",
    fileCode: "assets/icons/file-code.svg",
    terminal: "assets/icons/square-terminal.svg",

    paperclip: "assets/icons/paperclip.svg",
    image: "assets/icons/image.svg",
    mic: "assets/icons/mic.svg",

    moon: "assets/icons/moon.svg",
    sun: "assets/icons/sun.svg",
    monitor: "assets/icons/monitor.svg",

    alert: "assets/icons/circle-alert.svg",
    logout: "assets/icons/log-out.svg",

    sidebarClose: "assets/icons/panel-left-close.svg",
    sidebarOpen: "assets/icons/panel-right-close.svg"
};

export function setIcon(element, icon) {

    element.innerHTML = `<img src="${Icons[icon]}" class="icon" alt="">`;

}