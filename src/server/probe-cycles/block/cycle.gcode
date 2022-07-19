G91 G38.2 Z[-probeDistance] F[probeFeedrate]
%wait
%z = mposz

G91 G0 Z5

G91 G0 X[x / 2 + clearance]                                  ; move to positive X + clearance
G91 G0 Z-7                                                  ; move to Z height
%wait
G91 G38.2 X[-probeDistance] F[probeFeedrate]                 ; probe positive X
%wait
%x1 = mposx                                                 ; store position
G91 G0 X[clearance]                                          ; backoff from block
G91 G0 Z7                                              ; move to Z clearance height
G91 G0 X-[x + 2 * clearance]                               ; move to negative X + clearance
G91 G0 Z-7 
%wait
G91 G38.2 X[probeDistance] F[probeFeedrate]                  ; probe negative X
%wait
%x2 = mposx                                                   ; store position
G91 G0 X-[clearance]                                         ; back off from block
G91 G0 Z7                                                     ; move to Z clearance height
G91 G0 X[(x1 - x2) / 2 + clearance] Y[y / 2 + clearance]                                             

G91 G0 Z-7                                                  ; move to Z height
%wait
G91 G38.2 Y[-probeDistance] F[probeFeedrate]                 ; probe positive X
%wait
%y1 = mposy                                                 ; store position
G91 G0 Y[clearance]                                          ; backoff from block
G91 G0 Z7                                              ; move to Z clearance height
G91 G0 Y-[y + 2 * clearance]                               ; move to negative X + clearance
G91 G0 Z-7 
%wait
G91 G38.2 Y[probeDistance] F[probeFeedrate]                  ; probe negative X
%wait
%y2 = mposy                                                   ; store position
G91 G0 Y-[clearance]                                         ; back off from block
G91 G0 Z7
G91 G0 Y[(y1 - y2) / 2 + clearance]                                                ; move to Z clearance height

G90 G10 L20 P[wcs] X[adjustX] Y[adjustY] Z[adjustZ]