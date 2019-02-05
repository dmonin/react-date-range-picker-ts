import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface ModalProps {
  left?: number;
  top?: number;
}

export class Modal extends React.Component<ModalProps, {}> {
  el: HTMLDivElement;

  constructor(props: {}) {
    super(props);

    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    this.el.style.left = typeof this.props.left == 'number' ? this.props.left + 'px' : '';
    this.el.style.top = typeof this.props.top == 'number' ? this.props.top + 'px' : '';
    this.el.style.position = 'absolute';

    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
}
