;-----------------------
G91 G38.2 X[diameter] F[probeFeedrate]                     ; probe positive X
%wait
%x1 = mposx;                                                     ; store position
G91 G1 X[-diameter / 2]                                                ; backoff from half expected Number(dia)
%wait
G91 G38.2 X[-diameter] F[probeFeedrate]                    ; probe negative X
%wait;
%x2 = mposx
G91 G1 X[(x1 - x2) / 2]
%wait
;-------------------------------
G91 G38.2 Y[diameter] F[probeFeedrate]                    ; probe positive y
%wait
%y1 = mposy                                                 ; store position
G91 G1 Y[-diameter/2]                                            ; backoff from half expected Number(dia)
%wait
G91 G38.2 Y[-diameter] F[probeFeedrate]                    ; probe negative y
%wait
%y2 = mposy                                                    ; store position
G91 G1 Y[(y1 - y2) / 2]
;--------------------------
G90 G10 L20 P[wcs] X[adjustX] Y[adjustY]
