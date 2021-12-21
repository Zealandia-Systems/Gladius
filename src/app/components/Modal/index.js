import Modal from '@trendmicro/react-modal';
import ModalWrapper from './Modal';
import ModalHeader from './ModalHeader';
import ModalTitle from './ModalTitle';
import ModalBody from './ModalBody';

ModalWrapper.Overlay = Modal.Overlay;
ModalWrapper.Content = Modal.Content;
ModalWrapper.Header = ModalHeader;
ModalWrapper.Title = ModalTitle;
ModalWrapper.Body = ModalBody;
ModalWrapper.Footer = Modal.Footer;

export default ModalWrapper;
