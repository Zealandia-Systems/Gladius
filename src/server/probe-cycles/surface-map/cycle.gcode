%xCount = Math.floor(xSize / xStep)
%yCount = Math.floor(ySize / yStep)
%xStart = posx
%yStart = posy
%zStart = posz

%points = []
;z
%i = 0
%x = 0

%while x < xCount
  %y = 0

  %while y < yCount
    G90 G1 X[xStart + x * xStep] Y[yStart + y * yStep]
    %wait

    G91 G38.3 Z[-probeDistance] F[probeFeedrate] ; probe Z without erroring
    %wait

    G90 G1 Z[zStart]

    %points[i] = { x: posx, y: posy, z: posz }

    %y = y + 1
    %i = i + 1
  %end

  %x = x + 1
%end

%export points