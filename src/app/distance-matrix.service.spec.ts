import { TestBed } from '@angular/core/testing';

import { DistanceMatrixService } from './distance-matrix.service';

describe('DistanceMatrixService', () => {
  let service: DistanceMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistanceMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
