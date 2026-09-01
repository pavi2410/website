function el(tagName, properties, children = []) {
  return { type: "element", tagName, properties, children };
}

function icon(className, children) {
  return el(
    "svg",
    {
      className: [className],
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    children,
  );
}

export function transformerCopyButton() {
  return {
    name: "transformer-copy-button",
    pre(node) {
      const button = el(
        "button",
        {
          type: "button",
          className: ["code-copy-btn"],
          "aria-label": "Copy code",
          title: "Copy code",
        },
        [
          icon("copy-icon", [
            el("rect", {
              x: "9",
              y: "9",
              width: "13",
              height: "13",
              rx: "2",
              ry: "2",
            }),
            el("path", {
              d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
            }),
          ]),
          icon("copied-icon", [
            el("polyline", { points: "20 6 9 17 4 12" }),
          ]),
        ],
      );

      return el("div", { className: ["code-block"] }, [button, node]);
    },
  };
}
