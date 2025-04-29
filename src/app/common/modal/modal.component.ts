import { Component, EventEmitter, HostBinding, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @HostBinding('style.display') private display = 'none';
  @Output() closeModal = new EventEmitter<boolean>();

  show() {
    this.display = '';
  }

  hide() {
    this.display = 'none';
  }
}
