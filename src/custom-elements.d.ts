declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'deck-stage': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          width?: string;
          height?: string;
        },
        HTMLElement
      >;
    }
  }
}
