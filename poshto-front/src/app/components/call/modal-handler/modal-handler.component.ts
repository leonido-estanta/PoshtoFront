import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgComponentOutlet, NgForOf, NgStyle } from '@angular/common';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

@Component({
    standalone: true,
    selector: 'app-modal-handler',
    templateUrl: './modal-handler.component.html',
    imports: [
        NgForOf,
        NgComponentOutlet,
        NgStyle,
    ],
    styleUrls: ['./modal-handler.component.css']
})
export class ModalHandlerComponent implements OnInit, AfterViewInit {
    container: HTMLElement;
    listItems: HTMLElement[];
    sortables: any[];
    total: number;
    rowSize: number;

    ngOnInit(): void {
        this.container = document.querySelector('.container') as HTMLElement;
        this.listItems = Array.from(document.querySelectorAll('.list-item')) as HTMLElement[];
        this.sortables = this.listItems.map((item, index) => this.Sortable(item, index));
        this.total = this.sortables.length;

        gsap.to(this.container, { duration: 0.5, autoAlpha: 1 });
    }

    ngAfterViewInit(): void {
        this.calculateRowSize();
        window.addEventListener('resize', this.calculateRowSize.bind(this));
    }

    calculateRowSize(): void {
        const itemHeights = this.listItems.map(item => item.getBoundingClientRect().height);
        console.log(itemHeights)
        this.rowSize = Math.max(...itemHeights) + 10; // Add some margin
        this.sortables.forEach((sortable, index) => gsap.set(sortable.element, { y: index * this.rowSize }));
    }

    changeIndex(item: any, to: number) {
        this.arrayMove(this.sortables, item.index, to);

        if (to === this.total - 1) {
            this.container.appendChild(item.element);
        } else {
            const i = item.index > to ? to : to + 1;
            this.container.insertBefore(item.element, this.container.children[i]);
        }

        this.sortables.forEach((sortable, index) => sortable.setIndex(index));
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

        gsap.set(element, { y: index * this.rowSize });

        return sortable;
    }

    setIndex(sortable: any, index: number) {
        sortable.index = index;

        if (!sortable.dragger.isDragging) this.layout(sortable);
    }

    downAction(sortable: any) {
        sortable.animation.play();
        sortable.dragger.update();
    }

    dragAction(sortable: any) {
        const index = this.clamp(Math.round(sortable.dragger.y / this.rowSize), 0, this.total - 1);

        if (index !== sortable.index) {
            this.changeIndex(sortable, index);
        }
    }

    upAction(sortable: any) {
        sortable.animation.reverse();
        this.layout(sortable);
    }

    layout(sortable: any) {
        gsap.to(sortable.element, { duration: 0.3, y: sortable.index * this.rowSize });
    }

    arrayMove(array: any[], from: number, to: number) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }

    clamp(value: number, a: number, b: number) {
        return value < a ? a : (value > b ? b : value);
    }
}
