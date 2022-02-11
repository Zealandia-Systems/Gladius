%clearance = 10
G91 G0 X[x / 2 + clearance]                                  ; move to positive X + clearance
G91 G0 Z[z]                                                  ; move to Z height
G91 G38.2 X[-probeDistance] F[probeFeedrate]                 ; probe positive X
%x1 = posx                                                   ; store position
G91 G0 X[clearance]                                          ; backoff from block
G91 G0 Z[-z]                                                 ; move to Z clearance height
G91 G0 X[-(x + 2 * clearance)]                               ; move to negative X + clearance
G91 G0 Z[z]                                                  ; move to Z height
G91 G38.2 X[probeDistance] F[probeFeedrate]                  ; probe negative X
%x2 = posx                                                   ; store position
G91 G0 X[-clearance]                                         ; back off from block
G91 G0 Z[z]                                                  ; move to Z clearance height
G90 G0 X[x1 - x2]                                            ; move to center of probed X
G91 G0 Y[y / 2 + clearance]                                  ; move to positive Y + clearance
G91 G0 Z[z]                                                  ; move to Z height
G91 G38.2 Y[-probeDistance] F[probeFeedrate]                 ; probe positive Y
%y1 = posy                                                   ; store position
G91 G0 Y[clearance]                                          ; backoff from block
G91 G0 Z[-z]                                                 ; move to Z clearance height
G91 G0 Y[-y + 2 * -clearance]                                ; move to negative Y + clearance
G91 G0 Z[z]                                                  ; move to Z height
G91 G38.2 Y[probeDistance] F[probeFeedrate]                  ; probe negative Y
%y2 = posy                                                   ; store position
G91 G0 Y[-clearance]                                         ; back off from block
G91 G0 Z[-z]                                                 ; move to Z clearance height
G90 G0 Y[y1 - y2]                                            ; move to center of probed Y
G90 G10 L20 P[wcs] X[x1 - x2 + adjustX] Y[y1 - y2 + adjustY] ; apply offset
