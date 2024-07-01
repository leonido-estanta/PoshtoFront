import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NgComponentOutlet, NgForOf, NgIf, NgStyle } from '@angular/common';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ModalCallComponent } from "../modal-call/modal-call.component";
import { VoiceService } from "../../../services/voice.service";

gsap.registerPlugin(Draggable);

@Component({
    standalone: true,
    selector: 'app-modal-handler',
    templateUrl: './modal-handler.component.html',
    imports: [
        NgForOf,
        NgComponentOutlet,
        NgStyle,
        ModalCallComponent,
        NgIf,
    ],
    styleUrls: ['./modal-handler.component.css']
})
export class ModalHandlerComponent implements OnInit, AfterViewInit {

    constructor(private voiceService: VoiceService, private cdr: ChangeDetectorRef) {}

    get displayCallModal() {
        return this.voiceService.currentRoomId;
    }

    container: HTMLElement;
    listItems: HTMLElement[];
    sortables: any[];
    total: number;

    ngOnInit(): void {
        this.voiceService.usersObservable.subscribe(() => {
            this.cdr.detectChanges();
            setTimeout(() => {
                this.initDraggableItems();
            });
        });
    }

    ngAfterViewInit(): void {
        this.container = document.querySelector('.container') as HTMLElement;
        this.initDraggableItems();
        gsap.to(this.container, { duration: 0.5, autoAlpha: 1 });
        window.addEventListener('resize', this.updateLayout.bind(this));
    }

    initDraggableItems(): void {
        this.listItems = Array.from(document.querySelectorAll('.list-item')) as HTMLElement[];
        this.sortables = this.listItems.map((item, index) => this.Sortable(item, index));
        this.total = this.sortables.length;
        this.updateLayout();
    }

    updateLayout(): void {
        let currentY = 0;
        this.sortables.forEach((sortable, index) => {
            const height = sortable.element.offsetHeight;
            gsap.set(sortable.element, { y: currentY });
            currentY += height + 10;
        });
    }

    changeIndex(item: any, to: number) {
        const fromIndex = item.index;
        this.arrayMove(this.sortables, fromIndex, to);

        if (to === this.total - 1) {
            this.container.appendChild(item.element);
        } else {
            const i = fromIndex > to ? to : to + 1;
            this.container.insertBefore(item.element, this.container.children[i]);
        }

        this.sortables.forEach((sortable, index) => sortable.setIndex(index));
        this.updateLayout();
    }

    Sortable(element: HTMLElement, index: number) {
        const content = element.querySelector('.item-content') as HTMLElement;
        const order = element.querySelector('.order') as HTMLElement;

        const animation = gsap.to(content, {
            duration: 0.3,
            boxShadow: 'rgba(0,0,0,0.2) 0px 16px 32px 0px',
            force3D: true,
            scale: 1.1,
            paused: true
        });

        const dragger = new Draggable(element, {
            onDragStart: () => this.downAction(sortable),
            onRelease: () => this.upAction(sortable),
            onDrag: () => this.dragAction(sortable),
            cursor: 'inherit',
            type: 'y'
        });

        const sortable = {
            dragger: dragger,
            element: element,
            index: index,
            setIndex: (idx: number) => this.setIndex(sortable, idx),
            animation: animation,
            order: order
        };
        return sortable;
    }

    setIndex(sortable: any, index: number) {
        sortable.index = index;

        if (!sortable.dragger.isDragging) this.updateLayout();
    }

    downAction(sortable: any) {
        sortable.animation.play();
        sortable.dragger.update();
    }

    dragAction(sortable: any) {
        const draggedY = sortable.dragger.y;
        let newIndex = sortable.index;
        for (let i = 0; i < this.sortables.length; i++) {
            if (i !== sortable.index) {
                const itemY = gsap.getProperty(this.sortables[i].element, "y") as number;
                const itemHeight = this.sortables[i].element.offsetHeight;
                if (draggedY < itemY + itemHeight / 2 && draggedY > itemY - itemHeight / 2) {
                    newIndex = i;
                    break;
                }
            }
        }
        if (newIndex !== sortable.index) {
            this.changeIndex(sortable, newIndex);
        }
    }

    upAction(sortable: any) {
        sortable.animation.reverse();
        this.updateLayout();
    }

    arrayMove(array: any[], from: number, to: number) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
}
