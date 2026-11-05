/**
 * The 3D board is laid out from the top-view photo of the ThingzKit (1200x1600 px).
 * Board edges in the photo: x 120..1190, y 250..1390. 1 photo pixel = 0.01 3D units.
 */
export const S = 0.01;
export const CX = 655;
export const CY = 820;
export const BOARD_W = 10.7;
export const BOARD_D = 11.4;
export const BOARD_T = 0.12;
export const BOARD_TOP = BOARD_T / 2;

/** photo pixel -> [x, z] in 3D units (board centre = origin, photo top = -z) */
export const px = (x: number, y: number): [number, number] => [(x - CX) * S, (y - CY) * S];
