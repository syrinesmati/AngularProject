import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'lucide-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<lucide-angular
    [name]="name"
    [size]="size"
    [color]="color"
    [strokeWidth]="strokeWidth"
    [class]="class"
  ></lucide-angular>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LucideIconComponent {
  @Input() name: string = 'Circle';
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
  @Input() class: string = '';
}
