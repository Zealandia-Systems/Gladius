%clearance = 10
%dirx = -1*Math.sign(x)
%diry = -1*Math.sign(y)
%tx = 0.5*dirx*ballDiameter
%ty = 0.5*diry*ballDiameter

G91 G1 X[-x] Y[-0.5*y]   ; move to postion X distance from egde
G91 G38.3 Z[-z] F200  ; move down in Z (probe safety)
G91 G38.2 Y[y] F[probeFeedrate] ;P probe in Y
%wait                ; probe Y
%y1 = posy  ; store y position
%wait
G91 G1  Y[-y] F[5*probeFeedrate] ; move to y position distance from egde
G91 G1 X[0.5*x]
;-----
G91 G38.2 X[x] F[probeFeedrate] ; probe X
%wait      ; probe in x
%x1 = posx ; store x
%y2 = posy
%wait
G91 G1 Z[z]   ; lift up Z
%wait
G90 G10 L20 P[wcs] X[tx + adjustX] Y[y2-y1 + ty + adjustY]  ; set coordinates
;-----
G90 G1 X0 Y0 F[5*probeFeedrate]  ; return to newly found corner



