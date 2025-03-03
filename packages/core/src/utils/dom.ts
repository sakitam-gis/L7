const docStyle = window.document.documentElement.style;
type ELType = HTMLElement | SVGElement;
export function createRendererContainer(domId: string): HTMLDivElement | null {
  const $wrapper = document.getElementById(domId);

  if ($wrapper) {
    const $container = document.createElement('div');
    $container.style.cssText += `
      position: absolute;
      top: 0;
      z-index:2;
      height: 100%;
      width: 100%;
      pointer-events: none;
    `;
    $container.id = 'l7_canvaslayer';
    $wrapper.appendChild($container);
    return $container;
  }

  return null;
}
