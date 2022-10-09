%clearance = 2
G91 G38.2 Z[-probeDistance] F[probeFeedrate]
%wait
%z = mposz

G91 G1 Z5

G91 G1 [axis][axis_value / 2 + clearance] ; move to positive X + clearance
G91 G38.3 Z-7 F200 ; move to top -2mm (probe move to stop coliding)
%wait
G91 G38.2 [axis][-axis_value] F[probeFeedrate] ; probe positive axis
%wait
%x1 = mposx
%y1 = mposy               ; store positions
G91 G1 [axis][clearance]  ; backoff from block
%wait
G91 G1 Z7
%wait                                              ; move to Z clearance height
G91 G1 [axis][(-axis_value - 2 * clearance)]
%wait                              ; move to negative axis -2* clearance
G91 G1 Z-7
%wait
G91 G38.2 [axis][axis_value] F[probeFeedrate]   ; probe negative axis
%wait
%x2 = mposx
%y2 = mposy                                                   ; store positions
G91 G1 [axis][-clearance]                                         ; back off from block
G91 G1 Z7                                                     ; move to Z clearance height
G91 G1 X[(x1 - x2) / 2 + clearance] Y[(y1 - y2) / 2 + clearance]



G90 G10 L20 P[wcs] [axis][0] ; set co-ordernates