%clearance = 10
%dirx = -1*Math.sign(x)
%diry = -1*Math.sign(y)
%tx = 0.5*dirx*ballDiameter
%ty = 0.5*diry*ballDiameter

G91 G1 X[-0.5*x] Y[y] F[5*probeFeedrate] ; move to postion in X(y distance from edge)
G91 G38.3 Z[-z] F200  ; move down in Z (probe safety)
G91 G38.2 X[x] F[probeFeedrate] ; probe in X
%wait
%x1 = posx  ; store x position
%wait
;------
G91 G1 Z[z+2] F[5*probeFeedrate]
G91 G1 X[x] Y[-1.5*y] F[5*probeFeedrate]  ; move to y position (distance X from edge)
G91 G38.3 Z[-z-2] F200 ;move down in Z (probe safety)
G91 G38.2 Y[y] F[probeFeedrate]   ; probe in Y
%wait
%x2 = posx ; store x
%y1 = posy ; store y
%wait
;-----
G91 G1 Z[z] F[5*probeFeedrate]   ; Lift up Z
G90 G10 L20 P[wcs] X[x2-x1 + tx + adjustX] Y[ty + adjustY] ; set x, y coordinates
;-----
G90 G1 X0 Y0 F[5*probeFeedrate]  ; return to new found corner
