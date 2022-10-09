%dir = -1*Math.sign(axis_value)
%pset = 0.5*dir*ballDiameter
%offset = {X:pset, Y:pset, Z:0}
%test = offset[axis]
G91 G38.2 [axis][axis_value] F[probeFeedrate] ; probe axis
%wait
%x1 = mposx
%y1 = mposy
%z1 = mposz
%wait
G90 G10 L20 P[wcs] [axis][test] ; set coordinates
%wait
G90 G1 [axis][-axis_value] ; back off
G90 G1 Z5 ;lift up
G90 G1 [axis][0.1*dir] F[probeFeedrate] ; move to probed zero