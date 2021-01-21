import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocTreeComponent } from './doc-tree.component';

describe('DocTreeComponent', () => {
  let component: DocTreeComponent;
  let fixture: ComponentFixture<DocTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
