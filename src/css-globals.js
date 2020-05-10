export const resetUL = `
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}`;

export const resetA = `
a {
    color: inherit;
    text-decoration: inherit;
}`;

export const BREAKPOINT_TABLET = 768;
export const BREAKPOINT_MOBILE = "576px";
export const BREAKPOINT_DESKTOP = "1024px";

export const ITEM_BACKGROUND = "#f7f7f7";

export const widgetContainerStyles = `.widget-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
    margin: 5px;

    background-color: ${ITEM_BACKGROUND};
    border-radius: 15px;
}`;
