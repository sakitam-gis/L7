import { mat4 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { ICameraService, IViewport } from './ICameraService';

@injectable()
export default class CameraService implements ICameraService {
  private viewport: IViewport;

  /**
   * 不使用 Viewport 计算的 VP 矩阵，例如偏移坐标系场景
   */
  private overridedViewProjectionMatrix: number[] | undefined;

  /**
   * 抖动后的 VP 矩阵
   */
  private jitteredViewProjectionMatrix: number[] | undefined;

  /**
   * 抖动后的 Projection 矩阵
   */
  private jitteredProjectionMatrix: number[] | undefined;

  public init() {
    //
  }

  /**
   * 同步根据相机参数创建的视口
   */
  public update(viewport: IViewport) {
    this.viewport = viewport;
  }

  public getProjectionMatrix(): number[] {
    // 优先返回抖动后的 ProjectionMatrix
    return this.jitteredProjectionMatrix || this.viewport.getProjectionMatrix();
  }

  public getViewMatrix(): number[] {
    return this.viewport.getViewMatrix();
  }

  public getViewMatrixUncentered(): number[] {
    return this.viewport.getViewMatrixUncentered();
  }

  public getViewProjectionMatrix(): number[] {
    return (
      this.overridedViewProjectionMatrix ||
      this.jitteredViewProjectionMatrix ||
      this.viewport.getViewProjectionMatrix()
    );
  }

  public getZoom(): number {
    return this.viewport.getZoom();
  }

  public getZoomScale(): number {
    return this.viewport.getZoomScale();
  }

  public getCenter(): [number, number] {
    const [lng, lat] = this.viewport.getCenter();
    return [lng, lat];
  }

  public getFocalDistance() {
    return this.viewport.getFocalDistance();
  }

  public projectFlat(
    lngLat: [number, number],
    scale?: number | undefined,
  ): [number, number] {
    return this.viewport.projectFlat(lngLat, scale);
  }

  /**
   * 支持外部计算 VP 矩阵的场景，例如：在偏移坐标系场景中，需要重新计算 VP 矩阵
   */
  public setViewProjectionMatrix(viewProjectionMatrix: number[] | undefined) {
    this.overridedViewProjectionMatrix = viewProjectionMatrix;
  }

  public jitterProjectionMatrix(x: number, y: number) {
    const translation = mat4.fromTranslation(mat4.create(), [x, y, 0]);

    this.jitteredProjectionMatrix = (mat4.multiply(
      mat4.create(),
      translation,
      (this.viewport.getProjectionMatrix() as unknown) as mat4,
    ) as unknown) as number[];

    this.jitteredViewProjectionMatrix = (mat4.multiply(
      mat4.create(),
      (this.jitteredProjectionMatrix as unknown) as mat4,
      (this.viewport.getViewMatrix() as unknown) as mat4,
    ) as unknown) as number[];
  }

  public clearJitterProjectionMatrix() {
    this.jitteredProjectionMatrix = undefined;
    this.jitteredViewProjectionMatrix = undefined;
  }
}
