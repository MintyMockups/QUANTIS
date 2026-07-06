import { Icons } from "../icons.js";

export function createIconButton(iconName, className = "") {

    const button = document.createElement("button");

    button.className = `icon-btn ${className}`;

    const img = document.createElement("img");

    img.className = "icon";

    img.src = Icons[iconName];

    img.alt = iconName;

    button.appendChild(img);

    return button;

}