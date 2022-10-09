;-----------------------
G91 G38.2 [axis][axis_value] F[probeFeedrate]                     ; probe positive X
%wait
%x1 = mposx;
%y1 = mposy                                                      ; store position
G91 G1 [axis][-axis_value / 2]                                                ; backoff from half expected Number(dia)
%wait
G91 G38.2 [axis][-axis_value] F[probeFeedrate]                    ; probe negative X
%wait;
%x2 = mposx
%y2 = mposy
G91 G1 X[(x1 - x2) / 2] Y[(y1-y2)/2]
%wait

;--------------------------
G90 G10 L20 P[wcs] [axis][0]
