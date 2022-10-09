G91 G38.2 X[x] F[probeFeedrate]                     ; probe positive X
%wait
%x1 = mposx

G91 G1 X[-0.5*x]
%wait
G91 G38.2 X[-x] F[probeFeedrate]                    ; probe negative X
%wait
%x2 = mposx
%wait
G91 G1 X[(x1 - x2) / 2]

G91 G38.2 Y[y] F[probeFeedrate]                     ; probe positive X
%wait
%y1 = mposy;
%wait
G91 G1 Y[-0.5*y]
%wait
G91 G38.2 Y[-y] F[probeFeedrate]                    ; probe negative X
%wait
%y2 = mposy
G91 G1 Y[(y1 - y2) / 2]

G90 G10 L20 P[wcs] X[adjustX ] Y[adjustY]
